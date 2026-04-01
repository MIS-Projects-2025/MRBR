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
            'date' => 'required',
            'start_time' => 'required',
            'end_time' => 'required',
            'receivers' => 'required',
        ]);

        // 🔥 CHECK OVERLAP
        $conflict = DB::table('reservations')
            ->where('room_id', $request->room_id)
            ->where('date', $request->date)
            ->where(function ($q) use ($request) {
                $q->whereBetween('start_time', [$request->start_time, $request->end_time])
                    ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                    ->orWhere(function ($q2) use ($request) {
                        $q2->where('start_time', '<=', $request->start_time)
                            ->where('end_time', '>=', $request->end_time);
                    });
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors([
                'error' => 'Time slot not available'
            ]);
        }

        // 💾 SAVE RESERVATION
        $reservationId = DB::table('reservations')->insertGetId([
            'room_id' => $request->room_id,
            'guest_name' => $request->guest_name,
            'event_type' => $request->event_type,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'remarks' => $request->remarks,
            'created_at' => now(),
            'updated_at' => now(),
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
        // 🔥 GET ROOM DETAILS
        $room = DB::table('rooms')
            ->where('id', $request->room_id)
            ->first();

        $roomDisplay = $room
            ? "{$room->name} - {$room->location}"
            : "Unknown Room";

        // 🔥 FORMAT DATE PROPERLY
        $formattedDate = Carbon::parse($request->date)
            ->format('l, F j Y');

        return "
📅 MEETING INVITATION

Event: {$request->event_type}
Room: {$roomDisplay}
Date: {$formattedDate}
Time: {$request->start_time} - {$request->end_time}

👥 Participants:
" . implode(", ", $participants) . "

Remarks:
{$request->remarks}

This is an automated notification from Meeting Room System.
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
