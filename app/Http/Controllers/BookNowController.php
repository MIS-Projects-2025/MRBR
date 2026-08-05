<?php

namespace App\Http\Controllers;

use App\Services\ReservationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookNowController extends Controller
{
    protected $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }

    public function index()
    {
        // dd($empData, $empRole);

        $rooms = DB::table('rooms')->get();

        $reservations = DB::table('reservations')->get();

$empEmail = Cache::remember('emp_emails', 3600, function () {
            return DB::connection('masterlist')
                ->table('employee_masterlist')
                ->whereNotNull('EMAIL')
                ->whereNotIn('EMAIL', ['na', 'n/a', ''])
                ->where('ACCSTATUS', 1)
                ->distinct()
                ->pluck('EMAIL');
        });

        if ($rooms->isEmpty()) {
            $rooms = collect([
                (object) ['id' => 1, 'name' => 'Dasmariñas Room', 'image' => 'room1.jpg'],
                (object) ['id' => 2, 'name' => 'Silang Room', 'image' => 'room2.jpg'],
                (object) ['id' => 3, 'name' => 'Tagaytay Room', 'image' => 'room3.jpg'],
            ]);
        }

        return Inertia::render('Rooms/Booknow', [
            'rooms' => $rooms,
            'reservations' => $reservations,
            'empEmail' => $empEmail,
        ]);
    }

    public function updateReservation(Request $request)
    {
        $id = $request->id;

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

        try {
            $this->reservationService->updateReservation($id, $data);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request)
    {
        $id = $request->id; // 👈 FIX HERE

        try {
            $this->reservationService->cancel($id, $request->reason ?? null);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }

        return response()->json(['success' => true]);
    }
}
