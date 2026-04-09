<?php

namespace App\Http\Controllers\RoomList;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ScheduleListController extends Controller
{
    protected $datatable;
    protected $datatable1;

    public function __construct(DataTableService $datatable)
    {
        $this->datatable = $datatable;
    }


    public function index(Request $request)
    {

        $roomList = DB::connection('mysql')->table('rooms')->get();

        $result = $this->datatable->handle(
            $request,
            'mysql',
            'reservations',
            [
                'conditions' => function ($query) {
                    return $query

                        ->orderBy('created_at', 'desc');
                },

                'searchColumns' => ['room_id', 'guest_name', 'event_type', 'start_date', 'start_time', 'end_date', 'end_time', 'remarks'],
            ]
        );

        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('RoomList/ScheduleList', [
            'tableData' => $result['data'],
            'roomList' => $roomList,
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

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'guest_name' => 'required|string|max:255',
            'event_type' => 'required|string|max:255',
            'room_id' => 'required|exists:rooms,id',
            'start_date' => 'required|date',
            'start_time' => 'required',
            'end_date' => 'required|date',
            'end_time' => 'required',
            'remarks' => 'nullable|string',
        ]);

        DB::table('reservations')
            ->where('id', $id)
            ->update([
                'guest_name' => $validated['guest_name'],
                'event_type' => $validated['event_type'],
                'room_id' => $validated['room_id'],
                'start_date' => $validated['start_date'],
                'start_time' => $validated['start_time'],
                'end_date' => $validated['end_date'],
                'end_time' => $validated['end_time'],
                'remarks' => $validated['remarks'],
                'updated_at' => now(),
            ]);

        return redirect()->back()->with('success', 'Reservation updated successfully.');
    }

    public function destroy($id)
    {
        DB::table('reservations')->where('id', $id)->delete();

        return redirect()->back()->with('success', 'Reservation deleted successfully.');
    }
}
