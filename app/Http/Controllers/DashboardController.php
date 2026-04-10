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

        DB::table('reservations')->update([
            'status' => DB::raw("
                CASE
                    WHEN CONCAT(end_date, ' ', end_time) < '" . Carbon::now() . "' THEN 'done'
                    WHEN CONCAT(start_date, ' ', start_time) <= '" . Carbon::now() . "'
                         AND CONCAT(end_date, ' ', end_time) >= '" . Carbon::now() . "' THEN 'ongoing'
                    ELSE 'pending'
                END
            ")
        ]);


        $now = Carbon::now();
        $today = Carbon::today();

        // =========================
        // EMP DATA FROM SESSION
        // =========================
        $emp_data = session('emp_data') ?? null;

        // fallback if session is empty
        if (!$emp_data) {
            $emp_data = [
                'emp_role' => session('emp_data.emp_role')
            ];
        }

        // =========================
        // NON-ADMIN DASHBOARD
        // =========================
        if ($emp_data['emp_role'] !== 'admin' && $emp_data['emp_role'] !== 'superadmin') {

            $myReservations = DB::table('reservations')
                ->join('rooms', 'rooms.id', '=', 'reservations.room_id')
                ->where('reservations.guest_name', $emp_data['emp_name'])
                ->select(
                    'rooms.name as room_name',
                    'reservations.start_date',
                    'reservations.end_date',
                    'reservations.start_time',
                    'reservations.end_time',
                    'reservations.status'
                )
                ->orderBy('reservations.start_date', 'desc')
                ->get();

            return Inertia::render('Dashboard', [
                'emp_data' => $emp_data,
                'myReservations' => $myReservations
            ]);
        }

        // =========================
        // UPDATE STATUS (ADMIN)
        // =========================
        DB::table('reservations')->update([
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
        // ADMIN DATA
        // =========================
        $bookingsToday = DB::table('reservations')
            ->whereDate('start_date', $today)
            ->count();

        $ongoing = DB::table('reservations')
            ->where('status', 'ongoing')
            ->count();

        $availableRooms = DB::table('rooms')->count();

        $todayReservations = DB::table('reservations')
            ->join('rooms', 'rooms.id', '=', 'reservations.room_id')
            ->whereDate('reservations.start_date', $today)
            ->select('rooms.name as room_name', 'reservations.*')
            ->orderBy('reservations.start_time')
            ->get();

        $bookingsPerDate = DB::table('reservations')
            ->select('start_date as date', DB::raw('COUNT(*) as total'))
            ->groupBy('start_date')
            ->orderBy('start_date')
            ->get();

        return Inertia::render('Dashboard', [
            'emp_data' => $emp_data,
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
