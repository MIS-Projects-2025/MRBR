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
}
