<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $now = Carbon::now();
        $today = Carbon::today();

        // =========================
        // UPDATE STATUS (FIXED)
        // =========================

        DB::connection('mysql')->table('reservations')
            ->update([
                'status' => DB::raw("
                CASE
                    WHEN CONCAT(end_date, ' ', end_time) < '{$now}' THEN 'done'
                    WHEN CONCAT(start_date, ' ', start_time) <= '{$now}'
                         AND CONCAT(end_date, ' ', end_time) >= '{$now}' THEN 'ongoing'
                    ELSE 'pending'
                END
            ")
            ]);

        // =========================
        // DASHBOARD DATA
        // =========================

        $bookingsToday = DB::connection('mysql')->table('reservations')
            ->whereDate('start_date', $today)
            ->count();

        $ongoing = DB::connection('mysql')->table('reservations')
            ->where('status', 'ongoing')
            ->count();

        $availableRooms = DB::connection('mysql')->table('rooms')->count();

        $todayReservations = DB::connection('mysql')->table('reservations')
            ->join('rooms', 'rooms.id', '=', 'reservations.room_id')
            ->whereDate('reservations.start_date', $today)
            ->select(
                'rooms.name as room_name',
                'rooms.image',
                'reservations.*'
            )
            ->orderBy('reservations.start_time')
            ->get();

        $bookingsPerDate = DB::connection('mysql')->table('reservations')
            ->select('start_date as date', DB::raw('COUNT(*) as total'))
            ->groupBy('start_date')
            ->orderBy('start_date')
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'bookingsToday' => $bookingsToday,
                'ongoing' => $ongoing,
                'availableRooms' => $availableRooms,
            ],
            'todayReservations' => $todayReservations,
            'bookingsPerDate' => $bookingsPerDate
        ]);
    }
}
