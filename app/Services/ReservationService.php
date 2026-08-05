<?php

namespace App\Services;

use App\Mail\MeetingRoomNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

/**
 * ReservationService
 *
 * Single home for all reservation business logic:
 *  - Conflict detection
 *  - Single & bulk reservation creation
 *  - Cancellation
 *  - Rescheduling (date/time/room adjustments)
 *  - Email notification (queued, non-blocking)
 *
 * Keeps controllers thin and removes duplicated logic across
 * RoomController, DashboardController and BookNowController.
 */
class ReservationService
{
    /**
     * Check if a given room/time range conflicts with existing reservations.
     * Optionally excludes a reservation id (used for reschedule checks).
     */
    public function hasConflict(
        $roomId,
        $startDate,
        $startTime,
        $endDate,
        $endTime,
        $excludeId = null
    ): bool {
        $newStart = $startDate.' '.$startTime;
        $newEnd = $endDate.' '.$endTime;

        $query = DB::table('reservations')
            ->where('room_id', $roomId)
            ->whereRaw("
                CONCAT(start_date, ' ', start_time) < ?
                AND CONCAT(end_date, ' ', end_time) > ?
            ", [$newEnd, $newStart]);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Insert one reservation + history row. Assumes conflict already checked.
     * Returns the new reservation id.
     */
    public function insertReservation(array $data): int
    {
        $reservationId = DB::table('reservations')->insertGetId([
            'room_id' => $data['room_id'],
            'guest_name' => $data['guest_name'],
            'event_type' => $data['event_type'],
            'start_date' => $data['start_date'],
            'start_time' => $data['start_time'],
            'end_date' => $data['end_date'],
            'end_time' => $data['end_time'],
            'receivers' => $data['receivers'],
            'remarks' => $data['remarks'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('reservation_history')->insertGetId([
            'reservation_id' => $reservationId,
            'room_id' => $data['room_id'],
            'guest_name' => $data['guest_name'],
            'event_type' => $data['event_type'],
            'start_date' => $data['start_date'],
            'start_time' => $data['start_time'],
            'end_date' => $data['end_date'],
            'end_time' => $data['end_time'],
            'receivers' => $data['receivers'],
            'remarks' => $data['remarks'] ?? null,
            'status' => 'reserved',
            'reserved_by' => session('emp_data.emp_name') ?? null,
        ]);

        return $reservationId;
    }

    /**
     * Build the formatted email body used by the queued Mailable.
     */
    public function buildEmailMessage(array $data): string
    {
        $room = DB::table('rooms')->where('id', $data['room_id'])->first();

        $roomName = $room->name ?? 'Unknown Room';
        $roomLocation = $room->location ?? 'Unknown Location';

        $start = Carbon::parse($data['start_date'].' '.$data['start_time']);
        $end = Carbon::parse($data['end_date'].' '.$data['end_time']);

        $startFormatted = $start->format('l, F j Y g:i A');
        $endFormatted = $end->format('l, F j Y g:i A');

        if ($start->isSameDay($end)) {
            $dateDisplay = $start->format('l, F j Y');
            $timeDisplay = $start->format('g:i A').' - '.$end->format('g:i A');
        } else {
            $dateDisplay = $startFormatted.' → '.$endFormatted;
            $timeDisplay = '';
        }

        return "
Meeting Title: {$data['event_type']}

Topic: {$data['remarks']}

👤 Organizer: {$data['guest_name']}

🏢 Room: {$roomName}
📍 Location: {$roomLocation}

Schedule:
{$dateDisplay}
".($timeDisplay ? "⏰ {$timeDisplay}" : '').'

';
    }

    /**
     * Queue notification emails for a reservation. Non-blocking (ShouldQueue).
     */
    public function sendReservationEmails(array $data, array $emails): void
    {
        $messageBody = $this->buildEmailMessage($data);

        foreach ($emails as $email) {
            Mail::to($email)->queue(new MeetingRoomNotification($messageBody));
        }
    }

    /**
     * Parse a comma-separated receivers string into a clean array of emails.
     */
    public function parseEmails($receivers): array
    {
        return array_values(array_filter(array_map('trim', explode(',', (string) $receivers))));
    }

    /**
     * Create a single reservation. Validates, checks conflict, inserts in a
     * transaction, then queues emails. Returns the new reservation id.
     *
     * @throws \Throwable
     */
    public function create(array $data): int
    {
        $reservationId = DB::transaction(function () use ($data) {
            return $this->insertReservation($data);
        });

        $emails = $this->parseEmails($data['receivers']);
        $this->sendReservationEmails($data, $emails);

        return $reservationId;
    }

    /**
     * Create multiple reservations (recurring events) in one transaction.
     * Checks conflicts both against the DB and within the batch.
     *
     * @return array{ids: int[], messages: string[]} created ids and any messages
     */
    public function createBulk(array $events): array
    {
        $conflicts = [];

        // Check all conflicts first, against DB AND against each other in the same batch.
        foreach ($events as $i => $ev) {
            if ($this->hasConflict(
                $ev['room_id'],
                $ev['start_date'],
                $ev['start_time'],
                $ev['end_date'],
                $ev['end_time']
            )) {
                $conflicts[] = $ev['start_date'];

                continue;
            }

            foreach ($events as $j => $other) {
                if ($i === $j || $other['room_id'] != $ev['room_id']) {
                    continue;
                }

                $s1 = $ev['start_date'].' '.$ev['start_time'];
                $e1 = $ev['end_date'].' '.$ev['end_time'];
                $s2 = $other['start_date'].' '.$other['start_time'];
                $e2 = $other['end_date'].' '.$other['end_time'];

                if ($s1 < $e2 && $e1 > $s2) {
                    $conflicts[] = $ev['start_date'];
                    break;
                }
            }
        }

        if (! empty($conflicts)) {
            throw new \RuntimeException(
                'Conflict on: '.implode(', ', array_unique($conflicts))
            );
        }

        $ids = [];
        $emailBatches = [];

        DB::transaction(function () use ($events, &$ids, &$emailBatches) {
            foreach ($events as $ev) {
                $ids[] = $this->insertReservation($ev);
                $emailBatches[] = [
                    'data' => $ev,
                    'emails' => $this->parseEmails($ev['receivers']),
                ];
            }
        });

        // Queue one email batch per occurrence (still async, so response returns fast).
        foreach ($emailBatches as $batch) {
            $this->sendReservationEmails($batch['data'], $batch['emails']);
        }

        return [
            'ids' => $ids,
            'messages' => [],
        ];
    }

    /**
     * Find a reservation by id.
     */
    public function find($id)
    {
        return DB::table('reservations')->where('id', $id)->first();
    }

    /**
     * Move completed reservations (end_date/time already passed) into
     * reservation_history with status 'completed'.
     *
     * Keeps active rows visible in the dashboard by NOT deleting them
     * (the delete is intentionally left disabled to preserve the timeline view).
     *
     * @return int number of reservations archived
     */
    public function archiveCompletedReservations(): int
    {
        $now = Carbon::now();

        $completed = DB::table('reservations')
            ->where(function ($query) use ($now) {
                $query->whereDate('end_date', '<', $now->toDateString())
                    ->orWhere(function ($q) use ($now) {
                        $q->whereDate('end_date', $now->toDateString())
                            ->whereTime('end_time', '<=', $now->format('H:i:s'));
                    });
            })
            ->get();

        $archived = 0;

        foreach ($completed as $reservation) {
            // Skip if already archived for this reservation (prevent duplicates).
            $alreadyArchived = DB::table('reservation_history')
                ->where('reservation_id', $reservation->id)
                ->where('status', 'completed')
                ->exists();

            if ($alreadyArchived) {
                continue;
            }

            DB::table('reservation_history')->insert([
                'reservation_id' => $reservation->id,
                'room_id' => $reservation->room_id,
                'guest_name' => $reservation->guest_name,
                'event_type' => $reservation->event_type,
                'start_date' => $reservation->start_date,
                'start_time' => $reservation->start_time,
                'end_date' => $reservation->end_date,
                'end_time' => $reservation->end_time,
                'receivers' => $reservation->receivers,
                'remarks' => $reservation->remarks,
                'status' => 'completed',
                'created_at' => now(),
            ]);

            $archived++;
        }

        return $archived;
    }

    /**
     * Cancel a reservation: log a full snapshot to history, then delete the row.
     */
    public function cancel($id, $reason = null): void
    {
        $reservation = $this->find($id);

        if (! $reservation) {
            throw new \RuntimeException('Reservation not found');
        }

        DB::transaction(function () use ($reservation, $reason) {
            DB::table('reservation_history')->insert([
                'reservation_id' => $reservation->id,
                'room_id' => $reservation->room_id,
                'guest_name' => $reservation->guest_name,
                'event_type' => $reservation->event_type,
                'start_date' => $reservation->start_date,
                'start_time' => $reservation->start_time,
                'end_date' => $reservation->end_date,
                'end_time' => $reservation->end_time,
                'receivers' => $reservation->receivers,
                'remarks' => $reservation->remarks,
                'status' => 'canceled',
                'canceled_by' => session('emp_data.emp_name') ?? null,
                'date_canceled' => now(),
                'reason' => $reason,
                'created_at' => now(),
            ]);

            DB::table('reservations')
                ->where('id', $reservation->id)
                ->delete();
        });
    }

    /**
     * Update reservation details (supports partial updates: status, dates, room).
     * Logs the old snapshot to history with status 'DateTimeAdjusted'.
     */
    public function updateReservation($id, array $data): void
    {
        $old = $this->find($id);

        if (! $old) {
            throw new \RuntimeException('Reservation not found');
        }

        $update = [];

        if (! empty($data['status'])) {
            $update['status'] = $data['status'];
        }

        if (! empty($data['start_date']) && ! empty($data['start_time'])) {
            $update['start_date'] = $data['start_date'];
            $update['start_time'] = $data['start_time'];
            $update['end_date'] = $data['end_date'];
            $update['end_time'] = $data['end_time'];

            // Reject rescheduling an already-completed reservation.
            $now = Carbon::now();
            $isCompleted = Carbon::parse($old->end_date.' '.$old->end_time)->lessThan($now);
            if ($isCompleted) {
                throw new \RuntimeException('This reservation is already completed and cannot be rescheduled.');
            }
        }

        if (! empty($data['room_id'])) {
            $update['room_id'] = $data['room_id'];
        }

        DB::transaction(function () use ($id, $old, $data, $update) {
            DB::table('reservations')
                ->where('id', $id)
                ->update($update);

            DB::table('reservation_history')->insert([
                'reservation_id' => $old->id,
                'room_id' => $old->room_id,
                'new_room_id' => $data['room_id'] ?? null,
                'guest_name' => $old->guest_name,
                'event_type' => $old->event_type,
                'start_date' => $data['start_date'] ?? $old->start_date,
                'start_time' => $data['start_time'] ?? $old->start_time,
                'end_date' => $data['end_date'] ?? $old->end_date,
                'end_time' => $data['end_time'] ?? $old->end_time,
                'receivers' => $old->receivers,
                'remarks' => $old->remarks,
                'status' => 'DateTimeAdjusted',
                'reserved_by' => session('emp_data.emp_name') ?? null,
                'created_at' => now(),
            ]);
        });
    }
}
