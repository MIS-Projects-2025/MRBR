<?php

namespace App\Http\Controllers;

use App\Services\ReservationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }

    public function index()
    {
        /*
    |--------------------------------------------------------------------------
    | Move completed reservations to history
    |--------------------------------------------------------------------------
    */
        $this->reservationService->archiveCompletedReservations();

        /*
    |--------------------------------------------------------------------------
    | Active reservations only
    |--------------------------------------------------------------------------
    */

        $reservations = DB::table('reservations')->get();

        $rooms = DB::table('rooms')->get();

// Cache the employee email list to avoid a full HR masterlist scan on every render.
        // TTL is 1 hour. The cache is refreshed automatically when it expires.
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
                (object) [
                    'id' => 1,
                    'name' => 'Dasmariñas Room',
                    'image' => 'room1.jpg',
                ],
                (object) [
                    'id' => 2,
                    'name' => 'Silang Room',
                    'image' => 'room2.jpg',
                ],
                (object) [
                    'id' => 3,
                    'name' => 'Tagaytay Room',
                    'image' => 'room3.jpg',
                ],
            ]);
        }

        return Inertia::render('Dashboard', [
            'rooms' => $rooms,
            'reservations' => $reservations,
            'empEmail' => $empEmail,
        ]);
    }

    public function show($id)
    {
        $room = DB::table('rooms')->where('id', $id)->first();

        if (! $room) {
            $room = (object) [
                'id' => $id,
                'name' => 'Sample Room',
                'image' => 'room1.jpg',
            ];
        }

        $reservations = DB::table('reservations')
            ->where('room_id', $id)
            ->get();

        return Inertia::render('Rooms/Show', [
            'room' => $room,
            'reservations' => $reservations,
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
        if ($this->reservationService->hasConflict(
            $request->room_id,
            $request->start_date,
            $request->start_time,
            $request->end_date,
            $request->end_time
        )) {
            return back()->withErrors([
                'error' => 'slot not available',
            ]);
        }

        // 💾 SAVE RESERVATION + HISTORY + QUEUE EMAILS (all in the service)
        $this->reservationService->create($request->all());

        return back()->with('success', 'Reservation saved and emails sent!');
    }

    public function destroy($id)
    {
        $reservation = $this->reservationService->find($id);

        if (! $reservation) {
            return back()->withErrors(['error' => 'Reservation not found.']);
        }

        try {
            $this->reservationService->cancel($id);

            return back()->with('success', 'Reservation canceled successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to cancel reservation.']);
        }
    }
}
