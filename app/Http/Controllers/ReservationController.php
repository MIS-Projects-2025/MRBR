<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    /**
     * 📝 BOOK ROOM (NO LOGIN REQUIRED)
     */
    public function store(Request $request)
    {
        $request->validate([
            'room_id' => 'required|integer',
            'guest_name' => 'required|string',
            'event_type' => 'required|string',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'remarks' => 'nullable|string',
        ]);

        /**
         * 🚫 CHECK TIME CONFLICT
         */
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
                'error' => 'This time slot is already booked.'
            ]);
        }

        DB::table('reservations')->insert([
            'room_id' => $request->room_id,
            'guest_name' => $request->guest_name,
            'event_type' => $request->event_type,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'remarks' => $request->remarks,
            'created_at' => now(),
        ]);

        return back()->with('success', 'Reservation successful!');
    }

    /**
     * 📅 CHECK EXISTING RESERVATIONS (OPTIONAL API)
     */
    public function check(Request $request)
    {
        $reservations = DB::table('reservations')
            ->where('room_id', $request->room_id)
            ->where('date', $request->date)
            ->get();

        return response()->json($reservations);
    }

    public function cancel(Request $request)
    {
        DB::table('reservation_history')->insert([
            'reservation_id' => $request->reservation_id,
            'room_id' => $request->room_id,
            'guest_name' => $request->guest_name,
            'event_type' => $request->event_type,
            'start_date' => $request->start_date,
            'start_time' => $request->start_time,
            'end_date' => $request->end_date,
            'end_time' => $request->end_time,
            'receivers' => $request->receivers,

            'canceled_by' => $request->canceled_by,
            'reason' => $request->reason,
            'status' => 'canceled',

            'created_at' => now(),
        ]);

        DB::table('reservations')
            ->where('id', $request->reservation_id)
            ->delete();

        return back()->with('success', 'Reservation canceled successfully.');
    }

    public function updateDate(Request $request, $id)
    {
        $request->validate([
            'start_date' => 'required|date',
            'start_time' => 'required',
            'end_date' => 'required|date',
            'end_time' => 'required',
        ]);

        // 🔥 GET EXISTING RESERVATION
        $reservation = DB::table('reservations')->where('id', $id)->first();

        if (!$reservation) {
            return response()->json(['message' => 'Reservation not found'], 404);
        }

        // 🔥 UPDATE MAIN TABLE
        DB::table('reservations')
            ->where('id', $id)
            ->update([
                'start_date' => $request->start_date,
                'start_time' => $request->start_time,
                'end_date' => $request->end_date,
                'end_time' => $request->end_time,
            ]);

        // 🔥 INSERT HISTORY (NEW STATE ONLY)
        DB::table('reservation_history')->insert([
            'reservation_id' => $id,
            'room_id' => $reservation->room_id,
            'guest_name' => $reservation->guest_name,
            'event_type' => $reservation->event_type,

            'start_date' => $request->start_date,
            'start_time' => $request->start_time,
            'end_date' => $request->end_date,
            'end_time' => $request->end_time,

            'receivers' => $reservation->receivers,
            'remarks' => $reservation->remarks,
            'status' => 'Date Time Adjusted',

            'reserved_by' => session('emp_data.emp_name') ?? null,
        ]);

        return back()->with('success', 'Reservation updated successfully.');
    }
}
