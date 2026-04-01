import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import { useState } from "react";

export default function ScheduleList({
    tableData,
    tableFilters,
    roomList = [],
}) {

    // ======================
    // STATES
    // ======================
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [selectedRow, setSelectedRow] = useState(null);

    const [editForm, setEditForm] = useState({
        guest_name: "",
        event_type: "",
        room_id: "",
        date: "",
        start_time: "",
        end_time: "",
        remarks: "",
    });

    // ======================
    // HELPERS
    // ======================
    const dateFormat = (date) => {
        if (!date) return "";
        return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
        });
    };

    const roomMap = Object.fromEntries(
        (roomList ?? []).map((room) => [room.id, room.name])
    );

    const roomName = roomMap[selectedRow?.room_id] ?? "Unknown Room";

    // ======================
    // HANDLERS
    // ======================
    const openView = (row) => {
        setSelectedRow(row);
        setViewOpen(true);
    };

    const openEdit = (row) => {
        setSelectedRow(row);

        setEditForm({
            guest_name: row.guest_name,
            event_type: row.event_type,
            room_id: row.room_id,
            date: row.date?.split("T")[0] ?? row.date,
            start_time: row.start_time,
            end_time: row.end_time,
            remarks: row.remarks,
        });

        setEditOpen(true);
    };

    const openDelete = (row) => {
        setSelectedRow(row);
        setDeleteOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditSubmit = () => {
        router.put(route("schedule.list.update", selectedRow.id), editForm, {
            onSuccess: () => {
                setEditOpen(false);
                setSelectedRow(null);
            },
        });
    };

    const handleDelete = () => {
        router.delete(route("schedule.list.destroy", selectedRow.id), {
            onSuccess: () => {
                setDeleteOpen(false);
                setSelectedRow(null);
            },
        });
    };

    // ======================
    // FORMAT TABLE DATA
    // ======================
    const tableDatasWithActions = tableData.data.map((row) => ({
        ...row,
        room_id: roomMap[row.room_id] ?? "Unknown Room",
        date: dateFormat(row.date),

        actions: (
            <div className="flex gap-2">
                <button
                    onClick={() => openView(row)}
                    className="px-3 py-1 text-white bg-gray-600 rounded hover:bg-gray-700"
                >
                    <i className="fa-solid fa-eye"></i>
                </button>

                <button
                    onClick={() => openEdit(row)}
                    className="px-3 py-1 text-white bg-teal-600 rounded hover:bg-teal-700"
                >
                    <i className="fa-solid fa-pen"></i>
                </button>

                <button
                    onClick={() => openDelete(row)}
                    className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700"
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
            </div>
        ),
    }));

    // ======================
    // UI
    // ======================
    return (
        <AuthenticatedLayout>
            <Head title="Schedule List" />

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-teal-600 hover:text-teal-700">
                    <i className="fa-solid fa-calendar-check"></i> Reservations
                </h1>
            </div>

            <DataTable
                columns={[
                    { key: "room_id", label: "Room" },
                    { key: "guest_name", label: "Name" },
                    { key: "event_type", label: "Event" },
                    { key: "date", label: "Date" },
                    { key: "start_time", label: "Time Start" },
                    { key: "end_time", label: "Time End" },
                    { key: "remarks", label: "Remarks" },
                    { key: "actions", label: "Action" },
                ]}
                data={tableDatasWithActions}
                meta={tableData}
                routeName={route("schedule.list.index")}
                filters={tableFilters}
                rowKey="id"
                showExport={false}
            />

            {/* ================= VIEW MODAL ================= */}
            {viewOpen && selectedRow && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white w-[420px] rounded-xl shadow-2xl overflow-hidden">

                        <div className="bg-teal-700 text-white px-4 py-3 flex items-center gap-2">
                            <i className="fa-solid fa-eye"></i>
                            <h2 className="font-semibold">Reservation Details</h2>
                        </div>

                        <div className="p-5 text-sm space-y-3">
                            <p><b>Name:</b> {selectedRow.guest_name}</p>
                            <p><b>Room:</b> {roomName}</p>
                            <p><b>Date:</b> {dateFormat(selectedRow.date)}</p>
                            <p><b>Time:</b> {selectedRow.start_time} - {selectedRow.end_time}</p>
                            <p><b>Remarks:</b> {selectedRow.remarks}</p>
                        </div>

                        <div className="px-4 py-3 bg-gray-100">
                            <button
                                onClick={() => setViewOpen(false)}
                                className="w-full bg-red-500 text-white py-2 rounded-lg"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* ================= EDIT MODAL ================= */}
            {editOpen && selectedRow && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white w-[450px] rounded-xl shadow-2xl overflow-hidden">

                        <div className="bg-teal-600 text-white px-4 py-3 flex items-center gap-2">
                            <i className="fa-solid fa-pen-to-square"></i>
                            <h2 className="font-semibold">Edit Reservation</h2>
                        </div>

                        <div className="p-5 space-y-4 text-sm">

                            <input name="event_type" value={editForm.event_type} onChange={handleEditChange} className="border rounded-lg p-2 w-full" />

                            <input name="guest_name" value={editForm.guest_name} onChange={handleEditChange} className="border rounded-lg p-2 w-full" />

                            <select name="room_id" value={editForm.room_id} onChange={handleEditChange} className="border rounded-lg p-2 w-full">
                                {roomList.map((room) => (
                                    <option key={room.id} value={room.id}>{room.name}</option>
                                ))}
                            </select>

                            <input type="date" name="date" value={editForm.date} onChange={handleEditChange} className="border rounded-lg p-2 w-full" />

                            <input type="time" name="start_time" value={editForm.start_time} onChange={handleEditChange} className="border rounded-lg p-2 w-full" />

                            <input type="time" name="end_time" value={editForm.end_time} onChange={handleEditChange} className="border rounded-lg p-2 w-full" />

                            <textarea name="remarks" value={editForm.remarks} onChange={handleEditChange} className="border rounded-lg p-2 w-full" />

                            <button onClick={handleEditSubmit} className="w-full bg-teal-600 text-white py-2 rounded-lg">
                                Save Changes
                            </button>
                        </div>

                        <div className="px-4 py-3 bg-teal-50">
                            <button onClick={() => setEditOpen(false)} className="w-full bg-red-500 text-white py-2 rounded-lg">
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* ================= DELETE MODAL ================= */}
            {deleteOpen && selectedRow && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white w-[420px] rounded-xl shadow-2xl overflow-hidden">

                        <div className="bg-red-600 text-white px-4 py-3">
                           <i className="fa-solid fa-triangle-exclamation"></i> Confirm Delete
                        </div>

                        <div className="p-5 text-center">
                            Are you sure you want to Delete This Event?
                            <p className="mt-2 font-semibold text-lg">{selectedRow.event_type}</p>
                        </div>

                        <div className="p-4 flex gap-2">
                            <button onClick={handleDelete} className="w-full bg-red-600 text-white py-2 rounded">
                               <i className="fa-solid fa-trash"></i> Delete
                            </button>

                            <button onClick={() => setDeleteOpen(false)} className="w-full bg-gray-500 text-white py-2 rounded">
                               <i className="fa-solid fa-xmark"></i> Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}