<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;


class BookNowController extends Controller
{
    public function index()
    {
        // dd($empData, $empRole);

        $rooms = DB::table('rooms')->get();

        $reservations = DB::table('reservations')->get();

        $empEmail = DB::connection('masterlist')
            ->table('employee_masterlist')
            ->whereNotNull('EMAIL')
            ->whereNotIn('EMAIL', ['na', 'n/a', ''])
            ->where('ACCSTATUS', 1)
            ->distinct()
            ->pluck('EMAIL');

        if ($rooms->isEmpty()) {
            $rooms = collect([
                (object)['id' => 1, 'name' => 'Dasmariñas Room', 'image' => 'room1.jpg'],
                (object)['id' => 2, 'name' => 'Silang Room', 'image' => 'room2.jpg'],
                (object)['id' => 3, 'name' => 'Tagaytay Room', 'image' => 'room3.jpg'],
            ]);
        }

        return Inertia::render('Rooms/Booknow', [
            'rooms' => $rooms,
            'reservations' => $reservations,
            'empEmail' => $empEmail
        ]);
    }

    public function updateReservation(Request $request)
    {
        $id = $request->id;

        // 🔥 GET OLD DATA (IMPORTANT FOR HISTORY)
        $old = DB::table('reservations')->where('id', $id)->first();

        if (!$old) {
            return response()->json(['error' => 'Reservation not found'], 404);
        }

        $data = [];

        if ($request->status) {
            $data['status'] = $request->status;
        }

        if ($request->start_date && $request->start_time) {
            $data['start_date'] = $request->start_date;
            $data['start_time'] = $request->start_time;
            $data['end_date'] = $request->end_date;
            $data['end_time'] = $request->end_time;
        }

        if ($request->room_id) {
            $data['room_id'] = $request->room_id;
        }

        // 🔥 UPDATE MAIN TABLE
        DB::table('reservations')
            ->where('id', $id)
            ->update($data);

        // 🔥 HISTORY LOG (USE OLD DATA = TRUE SNAPSHOT)
        DB::table('reservation_history')->insert([
            'reservation_id' => $old->id,
            'room_id' => $old->room_id,
            'new_room_id' => $request->room_id,
            'guest_name' => $old->guest_name,
            'event_type' => $old->event_type,

            'start_date' => $request->start_date,
            'start_time' => $request->start_time,
            'end_date' => $request->end_date,
            'end_time' => $request->end_time,

            'receivers' => $old->receivers,
            'remarks' => $old->remarks,

            'status' => 'DateTimeAdjusted',
            'reserved_by' => session('emp_data.emp_name') ?? null,

            'created_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request)
    {
        $id = $request->id; // 👈 FIX HERE

        $reservation = DB::table('reservations')
            ->where('id', $id)
            ->first();

        if (!$reservation) {
            return response()->json(['error' => 'Reservation not found'], 404);
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

            'status' => 'canceled',
            'canceled_by' => session('emp_data.emp_name') ?? null,
            'date_canceled' => now(),
            'reason' => $request->reason ?? null,

            'created_at' => now(),
        ]);

        DB::table('reservations')
            ->where('id', $id)
            ->delete();

        return response()->json(['success' => true]);
    }
}
