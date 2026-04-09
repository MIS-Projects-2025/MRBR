<?php

namespace App\Http\Controllers\RoomList;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;


class RoomListController extends Controller
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
            'rooms',
            [
                'conditions' => function ($query) {
                    return $query
                        ->whereNotNull('image')
                        ->where('image', '!=', '')
                        ->orderBy('name', 'asc');
                },

                'searchColumns' => ['name', 'description'],
            ]
        );

        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('RoomList/RoomList', [
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

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // 🔥 CHECK IF EXISTING NAME
        $exists = DB::connection('mysql')
            ->table('rooms')
            ->where('name', $request->name)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'name' => 'Room name already exists.',
            ]);
        }

        $filename = null;

        if ($request->hasFile('image')) {

            $file = $request->file('image');

            // 🔥 unique filename
            $filename = time() . '_' . $file->getClientOriginalName();

            // 🔥 SAVE DIRECTLY TO public/rooms
            $file->move(public_path('rooms'), $filename);
        }

        DB::connection('mysql')->table('rooms')->insert([
            'name' => $request->name,
            'description' => $request->description,
            'image' => $filename,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Room created successfully');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $room = DB::connection('mysql')
            ->table('rooms')
            ->where('id', $id)
            ->first();

        $filename = $room->image;

        if ($request->hasFile('image')) {

            // 🔥 DELETE OLD FILE (public/rooms)
            if ($room->image && file_exists(public_path('rooms/' . $room->image))) {
                unlink(public_path('rooms/' . $room->image));
            }

            // 🔥 SAVE NEW FILE
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();

            $file->move(public_path('rooms'), $filename);
        }

        DB::connection('mysql')
            ->table('rooms')
            ->where('id', $id)
            ->update([
                'name' => $request->name,
                'description' => $request->description,
                'image' => $filename,
                'updated_at' => now(),
            ]);

        return back()->with('success', 'Room updated successfully');
    }


    public function destroy($id)
    {
        $room = DB::connection('mysql')->table('rooms')->where('id', $id)->first();

        if (!$room) {
            abort(404);
        }

        // DELETE IMAGE FILE
        if ($room->image && File::exists(public_path("rooms/" . $room->image))) {
            File::delete(public_path("rooms/" . $room->image));
        }

        // DELETE DATABASE RECORD
        DB::connection('mysql')
            ->table('rooms')
            ->where('id', $id)
            ->delete();

        return redirect()->back()->with('success', 'Room deleted successfully.');
    }

    public function cancel(Request $request)
    {
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

            'canceled_by' => $request->canceled_by,
            'reason' => $request->reason,

            'created_at' => now(),
        ]);

        DB::table('reservations')
            ->where('id', $request->reservation_id)
            ->update([
                'status' => 'canceled'
            ]);

        return back()->with('success', 'Reservation canceled successfully.');
    }
}
