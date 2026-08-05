<?php

namespace App\Http\Controllers;

use App\Services\ReservationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RoomController extends Controller
{
    protected $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }

    public function index()
    {
        $rooms = DB::table('rooms')->get();
        $reservations = DB::table('reservations')->get();

        if ($rooms->isEmpty()) {
            $rooms = collect([
                (object) ['id' => 1, 'name' => 'Dasmariñas Room', 'image' => 'room1.jpg'],
                (object) ['id' => 2, 'name' => 'Silang Room', 'image' => 'room2.jpg'],
                (object) ['id' => 3, 'name' => 'Tagaytay Room', 'image' => 'room3.jpg'],
            ]);
        }

        return Inertia::render('Rooms/Index', [
            'rooms' => $rooms,
            'reservations' => $reservations,
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

        $reservations = DB::table('reservations')->where('room_id', $id)->get();

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

        if ($this->reservationService->hasConflict(
            $request->room_id,
            $request->start_date,
            $request->start_time,
            $request->end_date,
            $request->end_time
        )) {
            return back()->withErrors(['error' => 'slot not available']);
        }

        $this->reservationService->create($request->all());

        return back()->with('success', 'Reservation saved and emails sent!');
    }

    /**
     * Bulk store — used by the frontend for recurring reservations.
     * Accepts: { events: [ {room_id, guest_name, event_type, start_date, start_time, end_date, end_time, receivers, remarks}, ... ] }
     */
    public function storeBulk(Request $request)
    {
        $request->validate([
            'events' => 'required|array|min:1',
            'events.*.room_id' => 'required',
            'events.*.guest_name' => 'required',
            'events.*.event_type' => 'required',
            'events.*.start_date' => 'required',
            'events.*.start_time' => 'required',
            'events.*.end_date' => 'required',
            'events.*.end_time' => 'required',
            'events.*.receivers' => 'required',
        ]);

        $events = $request->input('events');

        try {
            $result = $this->reservationService->createBulk($events);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return back()->with('success', count($events).' reservation(s) saved and emails queued!');
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
