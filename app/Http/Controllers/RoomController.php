<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Mail\MeetingRoomNotification;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = DB::table('rooms')->get();
        $reservations = DB::table('reservations')->get();

        if ($rooms->isEmpty()) {
            $rooms = collect([
                (object)['id' => 1, 'name' => 'Dasmariñas Room', 'image' => 'room1.jpg'],
                (object)['id' => 2, 'name' => 'Silang Room', 'image' => 'room2.jpg'],
                (object)['id' => 3, 'name' => 'Tagaytay Room', 'image' => 'room3.jpg'],
            ]);
        }

        return Inertia::render('Rooms/Index', [
            'rooms' => $rooms,
            'reservations' => $reservations
        ]);
    }

    public function show($id)
    {
        $room = DB::table('rooms')->where('id', $id)->first();

        if (!$room) {
            $room = (object)[
                'id' => $id,
                'name' => 'Sample Room',
                'image' => 'room1.jpg'
            ];
        }

        $reservations = DB::table('reservations')->where('room_id', $id)->get();

        return Inertia::render('Rooms/Show', [
            'room' => $room,
            'reservations' => $reservations
        ]);
    }

    /**
     * Check if a given room/time range conflicts with existing reservations.
     * Excludes a specific reservation id (used for reschedule checks).
     */
    private function hasConflict($roomId, $startDate, $startTime, $endDate, $endTime, $excludeId = null)
    {
        $newStart = $startDate . ' ' . $startTime;
        $newEnd   = $endDate . ' ' . $endTime;

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
    private function insertReservation(array $data)
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
     * Queue notification emails for a reservation. Non-blocking (ShouldQueue).
     */
    private function sendReservationEmails(Request $request, array $emails)
    {
        $messageBody = $this->buildEmailMessage($request, $emails);

        foreach ($emails as $email) {
            Mail::to($email)->queue(new MeetingRoomNotification($messageBody));
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'room_id' => 'required',
            'guest_name' => 'required',
            'event_type' => 'required',
            'start_date' => 'required',
            'start_time' => 'required',
            'end_date' => 'required',
            'end_time' => 'required',
            'receivers' => 'required',
        ]);

        if ($this->hasConflict($request->room_id, $request->start_date, $request->start_time, $request->end_date, $request->end_time)) {
            return back()->withErrors(['error' => 'slot not available']);
        }

        DB::transaction(function () use ($request) {
            $this->insertReservation($request->all());
        });

        $emails = array_filter(array_map('trim', explode(',', $request->receivers)));
        $this->sendReservationEmails($request, $emails);

        return back()->with('success', 'Reservation saved and emails sent!');
    }

    /**
     * Bulk store — used by the frontend for recurring reservations.
     * Accepts: { events: [ {room_id, guest_name, event_type, start_date, start_time, end_date, end_time, receivers, remarks}, ... ] }
     */
    public function storeBulk(Request $request)
    {
        $request->validate([
            'events' => 'required|array|min:1',
            'events.*.room_id' => 'required',
            'events.*.guest_name' => 'required',
            'events.*.event_type' => 'required',
            'events.*.start_date' => 'required',
            'events.*.start_time' => 'required',
            'events.*.end_date' => 'required',
            'events.*.end_time' => 'required',
            'events.*.receivers' => 'required',
        ]);

        $events = $request->input('events');
        $conflicts = [];

        // Check all conflicts first, against DB AND against each other in the same batch
        foreach ($events as $i => $ev) {
            if ($this->hasConflict($ev['room_id'], $ev['start_date'], $ev['start_time'], $ev['end_date'], $ev['end_time'])) {
                $conflicts[] = $ev['start_date'];
                continue;
            }
            foreach ($events as $j => $other) {
                if ($i === $j || $other['room_id'] != $ev['room_id']) continue;
                $s1 = $ev['start_date'] . ' ' . $ev['start_time'];
                $e1 = $ev['end_date'] . ' ' . $ev['end_time'];
                $s2 = $other['start_date'] . ' ' . $other['start_time'];
                $e2 = $other['end_date'] . ' ' . $other['end_time'];
                if ($s1 < $e2 && $e1 > $s2) {
                    $conflicts[] = $ev['start_date'];
                    break;
                }
            }
        }

        if (!empty($conflicts)) {
            return back()->withErrors([
                'error' => 'Conflict on: ' . implode(', ', array_unique($conflicts))
            ]);
        }

        $allEmails = [];

        DB::transaction(function () use ($events, &$allEmails) {
            foreach ($events as $ev) {
                $this->insertReservation($ev);
                $emails = array_filter(array_map('trim', explode(',', $ev['receivers'])));
                $allEmails[] = ['data' => $ev, 'emails' => $emails];
            }
        });

        // Queue one email batch per occurrence (still async, so response returns fast)
        foreach ($allEmails as $item) {
            $fakeRequest = new Request($item['data']);
            $this->sendReservationEmails($fakeRequest, $item['emails']);
        }

        return back()->with('success', count($events) . ' reservation(s) saved and emails queued!');
    }

    private function buildEmailMessage($request, $participants)
    {
        $room = DB::table('rooms')->where('id', $request->room_id)->first();

        $roomName = $room->name ?? "Unknown Room";
        $roomLocation = $room->location ?? "Unknown Location";

        $start = Carbon::parse($request->start_date . ' ' . $request->start_time);
        $end   = Carbon::parse($request->end_date . ' ' . $request->end_time);

        $startFormatted = $start->format('l, F j Y g:i A');
        $endFormatted   = $end->format('l, F j Y g:i A');

        if ($start->isSameDay($end)) {
            $dateDisplay = $start->format('l, F j Y');
            $timeDisplay = $start->format('g:i A') . ' - ' . $end->format('g:i A');
        } else {
            $dateDisplay = $startFormatted . ' → ' . $endFormatted;
            $timeDisplay = '';
        }

        return "
Meeting Title: {$request->event_type}

Topic: {$request->remarks}

👤 Organizer: {$request->guest_name}

🏢 Room: {$roomName}
📍 Location: {$roomLocation}

Schedule:
{$dateDisplay}
" . ($timeDisplay ? "⏰ {$timeDisplay}" : "") . "

";
    }

    public function destroy($id)
    {
        $reservation = DB::table('reservations')->where('id', $id)->first();

        if (!$reservation) {
            return back()->withErrors(['error' => 'Reservation not found.']);
        }

        try {
            DB::table('reservations')->where('id', $id)->delete();
            return back()->with('success', 'Reservation canceled successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to cancel reservation.']);
        }
    }
}
