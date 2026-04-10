<?php

namespace App\Http\Controllers\RoomList;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReservationHistoryController extends Controller
{
    protected $datatable;
    protected $datatable1;

    public function __construct(DataTableService $datatable)
    {
        $this->datatable = $datatable;
    }


    public function index(Request $request)
    {
        $result = $this->datatable->handle(
            $request,
            'mysql',
            'reservation_history',
            [
                'conditions' => function ($query) {

                    return $query
                        // ✅ DISTINCT PER RESERVATION ID
                        ->select(
                            'reservation_history.reservation_id',
                            'reservation_history.room_id',
                            'rooms.name as room_name',
                            'reservation_history.guest_name',
                            'reservation_history.event_type',
                            'reservation_history.start_date',
                            'reservation_history.start_time',
                            'reservation_history.end_date',
                            'reservation_history.end_time'
                        )
                        ->join('rooms', 'rooms.id', '=', 'reservation_history.room_id')

                        // ✅ GROUP SAME RESERVATION (important)
                        ->groupBy(
                            'reservation_history.reservation_id',
                            'reservation_history.room_id',
                            'rooms.name',
                            'reservation_history.guest_name',
                            'reservation_history.event_type',
                            'reservation_history.start_date',
                            'reservation_history.start_time',
                            'reservation_history.end_date',
                            'reservation_history.end_time'
                        )

                        ->orderBy('reservation_history.reservation_id', 'desc');
                },

                'searchColumns' => [
                    'reservation_id',
                    'rooms.name',
                    'guest_name',
                    'event_type',
                    'start_date',
                    'start_time',
                    'end_date',
                    'end_time'
                ],
            ]
        );

        // ✅ FORMAT DATE & TIME
        foreach ($result['data'] as $row) {

            $row->start_date = Carbon::parse($row->start_date)->format('F d, Y');
            $row->end_date   = Carbon::parse($row->end_date)->format('F d, Y');

            $row->start_time = Carbon::parse($row->start_time)->format('h:i A');
            $row->end_time   = Carbon::parse($row->end_time)->format('h:i A');
        }

        // EXPORT CHECK
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('RoomList/ReservationHistory', [
            'tableData' => $result['data'],
            'tableFilters' => $request->only([
                'search',
                'perPage',
                'sortBy',
                'sortDirection',
                'start',
                'end',
                'dropdownSearchValue',
                'dropdownFields',
            ]),
        ]);
    }

    public function viewHistoryLog($reservation_id)
    {
        return response()->json(
            DB::table('reservation_history')
                ->where('reservation_id', $reservation_id)
                ->select(
                    'reservation_id',
                    'room_id',
                    'guest_name',
                    'event_type',
                    'start_date',
                    'start_time',
                    'end_date',
                    'end_time',
                    'receivers',
                    'remarks',
                    'status',
                    'canceled_by',
                    'reason',
                    'created_at'
                )
                ->distinct('reservation_id')
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    public function restore(Request $request)
    {
        DB::table('reservations')->insert([
            'id' => $request->reservation_id,
            'room_id' => $request->room_id,
            'guest_name' => $request->guest_name,
            'event_type' => $request->event_type,
            'start_date' => $request->start_date,
            'start_time' => $request->start_time,
            'end_date' => $request->end_date,
            'end_time' => $request->end_time,
            'receivers' => $request->receivers,
            'remarks' => $request->remarks,
        ]);

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
            'canceled_by' => null,
            'reason' => null,
            'status' => 'restored',
        ]);

        return back()->with('success', 'Reservation restored successfully');
    }
}
