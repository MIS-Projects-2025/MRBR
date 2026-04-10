<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;


class RoomController extends Controller
{
    public function index()
    {



        // dd($empData, $empRole);



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

        $reservations = DB::table('reservations')
            ->where('room_id', $id)
            ->get();

        return Inertia::render('Rooms/Show', [
            'room' => $room,
            'reservations' => $reservations
        ]);
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

        // 🔥 CHECK OVERLAP
        $conflict = DB::table('reservations')
            ->where('room_id', $request->room_id)
            ->where(function ($q) use ($request) {

                $newStart = $request->start_date . ' ' . $request->start_time;
                $newEnd   = $request->end_date . ' ' . $request->end_time;

                $q->whereRaw("
            CONCAT(start_date, ' ', start_time) < ?
            AND CONCAT(end_date, ' ', end_time) > ?
        ", [$newEnd, $newStart]);
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors([
                'error' => 'slot not available'
            ]);
        }

        // 💾 SAVE RESERVATION
        $reservationId = DB::table('reservations')->insertGetId([
            'room_id' => $request->room_id,
            'guest_name' => $request->guest_name,
            'event_type' => $request->event_type,
            'start_date' => $request->start_date,
            'start_time' => $request->start_time,
            'end_date' => $request->end_date,
            'end_time' => $request->end_time,
            'receivers' => $request->receivers,
            'remarks' => $request->remarks,
            'created_at' => now(),
            'updated_at' => now(),
        ]);


        // 💾 SAVE RESERVATION HISTORY
        DB::table('reservation_history')->insertGetId([
            'reservation_id' => $reservationId,
            'room_id' => $request->room_id,
            'guest_name' => $request->guest_name,
            'event_type' => $request->event_type,
            'start_date' => $request->start_date,
            'start_time' => $request->start_time,
            'end_date' => $request->end_date,
            'end_time' => $request->end_time,
            'receivers' => $request->receivers,
            'remarks' => $request->remarks,
            'status' => 'created',
            'reserved_by' => session('emp_data.emp_name') ?? NULL,
        ]);

        // 📧 EMAIL SENDING
        $emails = array_filter(array_map('trim', explode(',', $request->receivers)));

        foreach ($emails as $email) {
            Mail::raw($this->buildEmailMessage($request, $emails), function ($message) use ($email) {
                $message->to($email)
                    ->subject('📅 Meeting Invitation');
            });
        }

        return back()->with('success', 'Reservation saved and emails sent!');
    }


    private function buildEmailMessage($request, $participants)
    {
        $room = DB::table('rooms')
            ->where('id', $request->room_id)
            ->first();

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
📅 {$request->event_type}

👤 Organizer: {$request->guest_name}

🏢 Room: {$roomName}
📍 Location: {$roomLocation}

📆 Schedule:
{$dateDisplay}
" . ($timeDisplay ? "⏰ {$timeDisplay}" : "") . "

👥 Participants:
" . implode(', ', $participants) . "

📝 Remarks:
{$request->remarks}

— Meeting Room Reservation System
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

            return back()->with('success', 'Reservation cancelled successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to cancel reservation.']);
        }
    }
}
