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

        // 🔄 UPDATE STATUS FIRST (IMPORTANT)
        DB::connection('mysql')->table('reservations')
            ->update(['status' => 'pending']); // reset all first

        // ✅ DONE (past reservations)
        DB::connection('mysql')->table('reservations')
            ->whereRaw("CONCAT(date, ' ', end_time) < ?", [$now])
            ->update(['status' => 'done']);

        // 🔴 ONGOING (current time)
        DB::connection('mysql')->table('reservations')
            ->whereRaw("CONCAT(date, ' ', start_time) <= ?", [$now])
            ->whereRaw("CONCAT(date, ' ', end_time) >= ?", [$now])
            ->update(['status' => 'ongoing']);

        // 🟢 PENDING (future)
        DB::connection('mysql')->table('reservations')
            ->whereRaw("CONCAT(date, ' ', start_time) > ?", [$now])
            ->update(['status' => 'pending']);

        // =========================
        // DASHBOARD DATA AFTER UPDATE
        // =========================

        $bookingsToday = DB::connection('mysql')->table('reservations')
            ->whereDate('date', $today)
            ->count();

        $ongoing = DB::connection('mysql')->table('reservations')
            ->where('status', 'ongoing')
            ->count();

        $availableRooms = DB::connection('mysql')->table('rooms')

            ->count();

        $todayReservations = DB::connection('mysql')->table('reservations')
            ->join('rooms', 'rooms.id', '=', 'reservations.room_id')
            ->whereDate('reservations.date', $today)
            ->select(
                'rooms.name as room_name',
                'rooms.image',
                'reservations.*'
            )
            ->orderBy('reservations.start_time')
            ->get();

        $bookingsPerDate = DB::connection('mysql')->table('reservations')
            ->select('date', DB::raw('COUNT(*) as total'))
            ->groupBy('date')
            ->orderBy('date')
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
