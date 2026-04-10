import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import { useState } from "react";
import { Drawer, Button, Input, message } from "antd";

export default function ReservationHistory({ tableData, tableFilters, emp_data }) {

    // =====================
    // STATE
    // =====================
    const [viewOpen, setViewOpen] = useState(false);
    const [restoreOpen, setRestoreOpen] = useState(false);

    const [selectedRow, setSelectedRow] = useState(null);
    const [restoreReason, setRestoreReason] = useState("");
    const [historyLog, setHistoryLog] = useState([]);

    // =====================
    // ACTIONS
    // =====================

const openView = async (row) => {
    setSelectedRow(row);

    const res = await fetch(route("reservation.history.log", row.reservation_id));
    const data = await res.json();

    console.log("history log:", data); // debug

    setHistoryLog(Array.isArray(data) ? data : []);
    setViewOpen(true);
};

const filteredHistoryLog = historyLog.filter((log) =>
    log.start_date === selectedRow?.start_date &&
    log.start_time === selectedRow?.start_time &&
    log.end_date === selectedRow?.end_date &&
    log.end_time === selectedRow?.end_time
);

    const openRestore = (row) => {
        setSelectedRow(row);
        setRestoreOpen(true);
    };

    const handleRestore = () => {
        if (!restoreReason) {
            message.error("Please provide a reason for restore");
            return;
        }

        router.post(route("reservation.restore"), {
            reservation_id: selectedRow.reservation_id,
            room_id: selectedRow.room_id,
            guest_name: selectedRow.guest_name,
            event_type: selectedRow.event_type,
            start_date: selectedRow.start_date,
            start_time: selectedRow.start_time,
            end_date: selectedRow.end_date,
            end_time: selectedRow.end_time,
            receivers: selectedRow.receivers,
            remarks: selectedRow.remarks,
            restore_reason: restoreReason,
        }, {
            onSuccess: () => {
                message.success("Successfully restored reservation");
                setRestoreOpen(false);
                setRestoreReason("");
            }
        });
    };

const canRestore = (start_date, start_time) => {
    const now = new Date();

    const [y, m, d] = start_date.split("-").map(Number);
    const [h, i, s = 0] = start_time.split(":").map(Number);

    const start = new Date(y, m - 1, d, h, i, s);

    return start.getTime() >= now.getTime();
};

    // =====================
    // ADD ACTION BUTTONS
    // =====================
    const HistoryActions = tableData.data.map((row) => ({
        ...row,
        actions: (
            <div className="flex gap-2">
                <button
                    onClick={() => openView(row)}
                    className="px-3 py-1 text-white bg-sky-600 rounded hover:bg-sky-700"
                >
                    <i className="fa-solid fa-eye"></i> View
                </button>
            {canRestore(row.start_date, row.start_time) && (
                <button
                    onClick={() => openRestore(row)}
                    className="px-3 py-1 text-white bg-teal-600 rounded hover:bg-teal-700"
                >
                    <i className="fa-solid fa-arrow-rotate-left"></i> Restore
                </button>
            )}
            </div>
        ),
    }));

    const statusColor = {
    created: "bg-green-100 text-green-700 border border-green-200",
    canceled: "bg-red-100 text-red-700 border border-red-200",
    restored: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    updated: "bg-blue-100 text-blue-700 border border-blue-200",
};

const dotColor = {
    created: "bg-green-500",
    canceled: "bg-red-500",
    restored: "bg-indigo-500",
    updated: "bg-blue-500",
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
    });
};

const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":");

    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

    // =====================
    // UI
    // =====================
    return (
        <AuthenticatedLayout>
            <Head title="Manage History" />

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-teal-500">
                    <i className="fa-solid fa-book-open"></i> Reservation History
                </h1>
            </div>

            {/* TABLE */}
            <DataTable
                columns={[
                    { key: "reservation_id", label: "ID" },
                    { key: "room_name", label: "Room" },
                    { key: "guest_name", label: "Organizer" },
                    { key: "event_type", label: "Event Type" },
                    { key: "start_date", label: "Start Date" },
                    { key: "start_time", label: "Start Time" },
                    { key: "end_date", label: "End Date" },
                    { key: "end_time", label: "End Time" },
                    { key: "actions", label: "Actions" },
                ]}
                data={HistoryActions}
                meta={{
                    from: tableData.from,
                    to: tableData.to,
                    total: tableData.total,
                    links: tableData.links,
                    currentPage: tableData.current_page,
                    lastPage: tableData.last_page,
                }}
                routeName={route("reservation.history.index")}
                filters={tableFilters}
                rowKey="reservation_id"
                showExport={false}
            />

            {/* ===================== */}
            {/* VIEW DRAWER */}
            {/* ===================== */}
<Drawer
    title="Reservation History Log"
    open={viewOpen}
    onClose={() => setViewOpen(false)}
    width={520}
>
    {selectedRow && (
        <div className="space-y-4">

            {/* HEADER */}
            <div className="p-3 bg-teal-100 rounded-lg text-sm space-y-1">
                <p><b>Room:</b> {selectedRow.room_name}</p>
                <p><b>Guest:</b> {selectedRow.guest_name}</p>
                <p><b>Event:</b> {selectedRow.event_type}</p>
            </div>

            {/* TIMELINE */}
            <div className="border-l-2 border-teal-500 pl-4 space-y-6">

              {historyLog.length > 0 ? (
    historyLog.map((log, index) => {

        const statusColor = {
            created: "bg-green-100 text-green-700",
            updated: "bg-blue-100 text-blue-700",
            canceled: "bg-red-100 text-red-700",
            restored: "bg-teal-100 text-teal-700",
        };

        const dotColor = {
            created: "bg-green-500",
            updated: "bg-blue-500",
            canceled: "bg-red-500",
            restored: "bg-teal-500",
        };

        return (
            <div key={index} className="relative">

                <div className={`absolute -left-[9px] top-1 w-3 h-3 rounded-full ${dotColor[log.status] || "bg-gray-400"}`}></div>

                <div className="text-sm space-y-1">

                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusColor[log.status] || "bg-gray-100"}`}>
                        {log.status || "unknown"}
                    </span>

                    <p><b>Reservation ID:</b> {log.reservation_id}</p>
                    <p className="text-gray-600">
    {formatDate(log.start_date)} {formatTime(log.start_time)}
    {" → "}
    {formatDate(log.end_date)} {formatTime(log.end_time)}
</p>

                    <p className="text-xs text-gray-400">
                        Logged at: {log.created_at}
                    </p>

                </div>
            </div>
        );
    })
) : (
    <p className="text-gray-400 text-sm">No history available</p>
)}

            </div>

        </div>
    )}
</Drawer>

            {/* ===================== */}
            {/* RESTORE DRAWER */}
            {/* ===================== */}
            {/* <Drawer
                title="Restore Reservation"
                open={restoreOpen}
                onClose={() => setRestoreOpen(false)}
                width={420}
               
            >
                {selectedRow && (
                    <div className="space-y-4">

                        <div className="p-3 bg-gray-100 rounded-lg text-sm">
                            <p><b>Room:</b> {selectedRow.room_name}</p>
                            <p><b>Guest:</b> {selectedRow.guest_name}</p>
                            <p><b>Event:</b> {selectedRow.event_type}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium">
                                Reason for Restore
                            </label>

                            <Input.TextArea
                                rows={4}
                                value={restoreReason}
                                onChange={(e) => setRestoreReason(e.target.value)}
                                placeholder="Enter reason..."
                            />
                        </div>

                        <div>
                            <button
                                onClick={handleRestore}
                                className="px-4 py-2 text-white bg-teal-600 rounded hover:bg-teal-700"
                            >
                                 <i className="fa-solid fa-rotate-left"></i> Restore
                            </button>
                            <p className="mt-2 text-sm text-red-600"><i className="fa-solid fa-triangle-exclamation"></i> Note: Restoring will set the reservation back to active status and notify the organizer.</p>
                        </div>

                    </div>
                )}
            </Drawer> */}

        </AuthenticatedLayout>
    );
}