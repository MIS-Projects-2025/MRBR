import { useState } from "react";
import Calendar from "@/Components/Calendar";
import { router, Link } from "@inertiajs/react";
import moment from "moment";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Select } from "antd";


export default function Index({ rooms, reservations, emp_data }) {

    const { Option } = Select;

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [activeTab, setActiveTab] = useState("today");
    const [selectedDate, setSelectedDate] = useState(
        moment().format("YYYY-MM-DD")
    );

    const [cancelModal, setCancelModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);

    const [cancelData, setCancelData] = useState({
        canceled_by: emp_data?.emp_name || "",
        reason: "",
    });

    const canCancel = (res) => {
    return (
        ["superadmin", "admin"].includes(emp_data?.emp_role) ||
        emp_data?.emp_name === res.guest_name
    );
};

const openCancelModal = (res) => {
    if (!canCancel(res)) {
        alert("You are not allowed to cancel this reservation.");
        return;
    }

    setSelectedReservation(res);
    setCancelModal(true);
};

const handleEventDelete = (event) => {
    const res = reservations.find(r => r.id === event.id);

    if (!canCancel(res)) {
        alert("Not allowed to cancel this reservation.");
        return;
    }

    openCancelModal(res);
};

const submitCancel = () => {
    if (!selectedReservation) return;

    router.post("/reservations-cancel", {
        reservation_id: selectedReservation.id,

        room_id: selectedReservation.room_id,
        guest_name: selectedReservation.guest_name,
        event_type: selectedReservation.event_type,
        start_date: selectedReservation.start_date,
        start_time: selectedReservation.start_time,
        end_date: selectedReservation.end_date,
        end_time: selectedReservation.end_time,
        receivers: selectedReservation.receivers,

        canceled_by: cancelData.canceled_by,
        reason: cancelData.reason,
    }, {
        onSuccess: () => {
            setCancelModal(false);
            setSelectedReservation(null);
            setCancelData({
                canceled_by: emp_data?.emp_name || "",
                reason: "",
            });
        }
    });
};

// ✅ ADDED: safe cancel status checker
const isCancelable = (res) => {
    if (!res) return false;

   

    return (
       ["superadmin", "admin"].includes(emp_data?.emp_role) ||
        emp_data?.emp_name === res.guest_name

        
    );
};

// ✅ ADDED: unified cancel trigger (optional cleaner usage)
const triggerCancel = (event) => {
    const res = reservations.find(r => r.id === event.id);

    if (!isCancelable(res)) {
        alert("Not allowed to cancel this reservation.");
        return;
    }

    setSelectedReservation(res);
    setCancelModal(true);
};

// ✅ ADDED: safe reset cancel state
const resetCancelState = () => {
    setCancelModal(false);
    setSelectedReservation(null);
    setCancelData({
        canceled_by: emp_data?.emp_name || "",
        reason: "",
    });
};

   const [data, setData] = useState({
    room_id: "",
    guest_name: emp_data?.emp_name || "",
    event_type: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    remarks: "",
    receivers: "",
});

    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState("");

    const resetAll = () => {
        setSelectedRoom(null);
        setSelectedSlot(null);
        setData({
    room_id: "",
    guest_name: "",
    event_type: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    remarks: "",
    receivers: "",
});
        setSuccess("");
    };

    // TODAY FILTER
    const today = moment().format("YYYY-MM-DD");

    const todayReservations = reservations.filter(r => r.date === today);

    // TIME SLOTS 7AM - 7AM
    const timeSlots = [];
    for (let h = 7; h <= 31; h++) {
        const hour = h % 24;
        timeSlots.push(moment({ hour }).format("HH:00"));
    }

const handleSelectSlot = ({ start, end }) => {

    const startMoment = moment(start);
    const endMoment = moment(end);

    // 🔥 FIX: allow multi-day but limit to 7 days max
    const diffDays = endMoment.diff(startMoment, "days", true);

    if (diffDays > 7) {
        alert("Maximum reservation is 7 days only!");
        return;
    }

    if (diffDays <= 0) {
        alert("Invalid time selection!");
        return;
    }

    setSelectedSlot({ start: startMoment, end: endMoment });

    setData(prev => ({
    ...prev,
    room_id: selectedRoom.id,
    start_date: startMoment.format("YYYY-MM-DD"),
    start_time: startMoment.format("HH:mm"),
    end_date: endMoment.format("YYYY-MM-DD"),
    end_time: endMoment.format("HH:mm"),
}));
};

const handleEventDrop = ({ id, start, end }) => {

    const current = reservations.find(r => r.id == id);
    if (!current) return;

    const now = moment();
    const resStart = moment(`${current.start_date} ${current.start_time}`);
    const resEnd = moment(`${current.end_date} ${current.end_time}`);

    // 🔥 BLOCK DONE
    if (now.isAfter(resEnd)) {
        alert("Cannot modify completed reservation.");
        return;
    }

    // 🔥 BLOCK ONGOING
    if (now.isBetween(resStart, resEnd)) {
        alert("Cannot modify ongoing reservation.");
        return;
    }

    // 🔥 CONFLICT CHECK
    const conflict = reservations.some(r => {
        if (r.id == id || r.room_id !== current.room_id) return false;

        const rStart = new Date(`${r.start_date}T${r.start_time}`);
        const rEnd = new Date(`${r.end_date}T${r.end_time}`);

        return rStart < end && rEnd > start;
    });

    if (conflict) {
        alert("Time conflict!");
        return;
    }

    // ✅ SAVE
    router.post(`/reservations-update/${id}`, {
        start_date: moment(start).format("YYYY-MM-DD"),
        start_time: moment(start).format("HH:mm"),
        end_date: moment(end).format("YYYY-MM-DD"),
        end_time: moment(end).format("HH:mm"),
    });
};

        const handleDeleteEvent = (event) => {
        router.delete(`/reservations-delete/${event.id}`);
    };

   const submit = (e) => {
    e.preventDefault();

    // 🔥 VALIDATION FIRST (1 week max)
    const diffDays = moment(data.end_date).diff(
        moment(data.start_date),
        "days"
    );

    if (diffDays > 7) {
        alert("Maximum 1 week reservation only!");
        return;
    }

    console.log("Submitting reservation:", data);

    router.post("/reservations-store", data, {
        onStart: () => setProcessing(true),

        onFinish: () => setProcessing(false),

        onSuccess: () => {
            setSuccess("Reservation successful!");

            // close modal
            setSelectedSlot(null);

            // reset form
            setData({
                room_id: "",
                guest_name: "",
                event_type: "",
                date: "",
                start_time: "",
                end_time: "",
                remarks: "",
                receivers: "",
            });

            setSelectedRoom(null);
            window.location.reload();

            // ❌ NO reload (important for Inertia/React)
        },
    });
};



    const filteredReservations = selectedRoom
        ? reservations.filter(r => r.room_id === selectedRoom.id)
        : [];

        const getStatusColor = (res) => {
    const now = moment();

    const start = moment(`${res.start_date} ${res.start_time}`);
    const end = moment(`${res.end_date} ${res.end_time}`);

    // canceled
    if (res.status === "canceled") {
        return "bg-red-500";
    }

    // DONE
    if (now.isAfter(end)) {
        return "bg-green-500";
    }

    // ONGOING
    if (now.isBetween(start, end)) {
        return "bg-blue-500";
    }

    // PENDING / UPCOMING
    return "bg-yellow-500";
};



    return (
         <AuthenticatedLayout>
            <div className="min-h-screen bg-teal-50">

            {/* NAV */}
            {/* <nav className="bg-teal-600 px-4 py-4 flex justify-between">
                <div className="font-bold text-white text-2xl">
                    <i className="fab fa-pied-piper-alt text-3xl"></i> Meeting Room Reservation System
                </div>
                <Link href="/login" className="font-bold text-white">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Login
                </Link>
            </nav> */}

            {/* TABS */}
            <div className="p-4 flex gap-2 overflow-x-auto justify-between max-w-2xl mx-auto">
                <button
                    onClick={() => setActiveTab("today")}
                    className={`px-4 py-2 rounded ${
                        activeTab === "today" ? "bg-teal-600 text-white" : "border border-teal-500 bg-white text-teal-500 hover:bg-teal-500 hover:text-white"
                    }`}
                >
                   <i className="fa-solid fa-calendar-days"></i> Today Reservations
                </button>

                <button
                    onClick={() => setActiveTab("calendar")}
                    className={`px-4 py-2 rounded ${
                        activeTab === "calendar" ? "bg-teal-600 text-white" : "border border-teal-500 bg-white text-teal-500 hover:bg-teal-500 hover:text-white"
                    }`}
                >
                    <i className="fa-solid fa-calendar"></i> Calendar View
                </button>
            </div>

{/* =========================
    TAB 1: REAL TIMELINE (GANTT STYLE)
========================== */}
{activeTab === "today" && (
    <div className="p-6 overflow-auto">

        {/* DATE FILTER */}
        {/* <div className="flex items-center gap-3 mb-4">
            <label className="font-semibold text-teal-600">
                Select Date:
            </label>

            <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-teal-600 px-3 py-2 rounded bg-white text-teal-600"
            />
        </div> */}

        <div className="min-w-[1000px]">

            {/* HEADER */}
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `120px repeat(${rooms.length}, 1fr)`
                }}
            >
                <div className="p-2 font-bold bg-gray-100">
                    Time
                </div>

                {rooms.map(room => (
                    <div
                        key={room.id}
                        className="p-2 font-bold text-teal-600 border bg-white"
                    >
                        {room.name}
                    </div>
                ))}
            </div>

            {/* CONFIG */}
            {(() => {
                const START_HOUR = 7;
                const HOURS = 17;
                const PX_PER_HOUR = 64;

                return (
                    <div
                        className="grid"
                        style={{
                            gridTemplateColumns: `120px repeat(${rooms.length}, 1fr)`
                        }}
                    >

                        {/* TIME SCALE */}
                        <div className="border-r bg-gray-50">
                            {Array.from({ length: HOURS }).map((_, i) => {
                                const hour = START_HOUR + i;

                                return (
                                    <div
                                        key={i}
                                        className="h-16 border-b text-[10px] text-gray-400 px-1"
                                    >
                                        {moment()
                                            .startOf("day")
                                            .add(hour, "hours")
                                            .format("HH:00")}
                                    </div>
                                );
                            })}
                        </div>

                        {/* ROOMS */}
                        {rooms.map(room => {

                            const roomReservations = reservations.filter(r => {
    if (r.room_id !== room.id) return false;

    const selected = moment(selectedDate);

    const start = moment(r.start_date);
    const end = moment(r.end_date);

    return selected.isBetween(start, end, null, "[]"); // 🔥 inclusive
});

                            return (
                                <div
                                    key={room.id}
                                    className="relative z-0"
                                    style={{ height: `${HOURS * PX_PER_HOUR}px` }}
                                >

                                    {/* GRID */}
                                    {Array.from({ length: HOURS }).map((_, i) => (
                                        <div key={i} className="h-16 border-b" />
                                    ))}

                                    {/* CLICK SLOT */}
                                    <div
                                         className="absolute inset-0 cursor-pointer hover:bg-green-50 z-10"
                                        onClick={(e) => {

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const minutes = (y / PX_PER_HOUR) * 60;

    const start = moment(selectedDate)
        .startOf("day")
        .add(START_HOUR, "hours")
        .add(minutes, "minutes");

    const end = moment(start).add(1, "hour");

    const hasConflict = roomReservations.some(res => {
        const s = moment(`${res.date} ${res.start_time}`);
        const e = moment(`${res.date} ${res.end_time}`);
        return start.isBefore(e) && end.isAfter(s);
    });

    if (hasConflict) return;

    setSelectedRoom(room);
    setActiveTab("calendar");

    // ❌ NO MODAL HERE
    setSelectedSlot(null);
}}
                                    />

                                    {/* EVENTS */}
                                    {roomReservations.map(res => {

    const selected = moment(selectedDate);

    const resStart = moment(`${res.start_date} ${res.start_time}`);
    const resEnd = moment(`${res.end_date} ${res.end_time}`);

    const dayStart = moment(selectedDate)
        .startOf("day")
        .add(START_HOUR, "hours");

    const dayEnd = moment(selectedDate)
        .startOf("day")
        .add(START_HOUR + HOURS, "hours");

    // 🔥 CUT START/END based on current day
    const start = moment.max(resStart, dayStart);
    const end = moment.min(resEnd, dayEnd);

    // ❌ skip if not visible
    if (end.isSameOrBefore(start)) return null;

    const top =
        (start.diff(dayStart, "minutes") / 60) * PX_PER_HOUR;

    const height =
        (end.diff(start, "minutes") / 60) * PX_PER_HOUR;

    const fontSize =
    height < 40 ? 10 :
    height < 80 ? 12 :
    height < 140 ? 14 :
    16;

return (
    <div
        key={res.id}
        className={`absolute left-1 right-1 text-white rounded shadow z-20 flex flex-col items-center justify-center text-center overflow-hidden ${getStatusColor(res)}`}
        onClick={() => {
    if (!canCancel(res)) {

        alert("You are not allowed to click this reservation.");
        return;
    }

                    // ❌ BLOCK DONE
                    if (res.status === "done") {
                        alert("Cannot cancel completed reservation.");
                        return;
                    }

                    // ❌ BLOCK canceled
                    if (res.status === "canceled") {
                        alert("Already canceled.");
                        return;
                    }

                     // ❌ BLOCK ONGOING
                    if (res.status === "ongoing") {
                        alert("Cannot cancel ongoing reservation.");
                        return;
                    }

    setSelectedReservation(res);
    setCancelModal(true);
}}
        style={{
            top: `${top}px`,
            height: `${height}px`,
            fontSize: `${fontSize}px`,
            padding: height < 40 ? "2px" : "6px"
        }}
    >
        {height > 25 && (
            <div className="leading-tight">
                Reserved by: <label className="font-bold">{res.guest_name}</label>
            </div>
        )}

        {height > 50 && (
            <div className="leading-tight">
                Event: <label className="font-bold ">{res.event_type}</label>
            </div>
        )}

        {height > 50 && (
            <div className="leading-tight">
                <label className={`font-bold uppercase ${getStatusColor(res)}`}>{res.status}</label>
            </div>
        )}
    </div>
);
})}

                                </div>
                            );
                        })}

                    </div>
                );
            })()}
        </div>
    </div>
)}
            {/* =========================
    TAB 2: CALENDAR VIEW
========================== */}
{activeTab === "calendar" && (
    <>
        {!selectedRoom && (
            <div className="p-6 grid grid-cols-3 gap-4">
                {rooms.map(room => (
                    <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className="bg-white shadow rounded-xl overflow-hidden"
                    >
                        <img
                            src={`/rooms/${room.image}`}
                            className="h-40 w-full object-cover"
                        />
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
  <div className="font-semibold text-teal-700">{room.name}</div>
  <div className="text-gray-600">📍 {room.location}</div>
  <div className="text-gray-600">👥 {room.capacity} attendees</div>
</div>
                    </button>
                ))}
            </div>
        )}

        {selectedRoom && (
            <div className="p-6 text-gray-600">

                <div className="flex justify-between mb-3">
                    <h2 className="text-xl font-bold text-teal-600">
                        <i className="fa-brands fa-houzz mr-1"></i>{" "}
                        {selectedRoom.name}
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                            <div className="text-gray-600">📍 {selectedRoom.location}</div>
                            <div className="text-gray-600">👥 {selectedRoom.capacity} attendees</div>
                        </div>
                    </h2>

                    <button onClick={resetAll} className="text-teal-600">
                        <i className="fa-solid fa-arrow-left mr-1"></i> Back
                    </button>
                </div>

                <Calendar
    reservations={filteredReservations}
     onDeleteEvent={openCancelModal}
    onSelectSlot={handleSelectSlot}
    onEventDrop={handleEventDrop}
    modalOpen={!!selectedSlot}   // 🔥 IMPORTANT
    emp_data={emp_data}

/>
            </div>
        )}
    </>
)}

            {/* MODAL */}
            {selectedSlot && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

                    <div className="bg-white p-6 rounded-xl w-full max-w-md">

                        <h2 className="font-bold text-teal-600 mb-3">
                           <i className="fa-solid fa-calendar-plus"></i> New Reservation
                        </h2>

    <p className="text-sm mb-3 text-gray-500">
    {moment(data.start_date).format("MMM D, YYYY")} {moment(data.start_time, "HH:mm").format("h:mm A")}
    {" → "}
    {moment(data.end_date).format("MMM D, YYYY")} {moment(data.end_time, "HH:mm").format("h:mm A")}
</p>

                        {success && (
                            <div className="bg-green-100 text-green-600 p-2 mb-2 rounded">
                                {success}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-3">

                            <input
                                placeholder="Your Name"
                                className="input cursor-not-allowed bg-gray-100"
                                value={data.guest_name}
                                onChange={(e) =>
                                    setData({ ...data, guest_name: e.target.value })
                                }
                                readOnly
                            />

<Select
    showSearch
    placeholder="Select Event Type"
    value={data.event_type || undefined}
    onChange={(value) =>
        setData({ ...data, event_type: value })
    }
    optionFilterProp="children"
    filterOption={(input, option) =>
        (option?.children ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
    }
    className="w-full"
>
    {/* CORE OFFICE EVENTS */}
    <Option value="Meeting">Meeting</Option>
    <Option value="Team Meeting">Team Meeting</Option>
    <Option value="Department Meeting">Department Meeting</Option>
    <Option value="Management Meeting">Management Meeting</Option>
    <Option value="Client Meeting">Client Meeting</Option>
    <Option value="Board Meeting">Board Meeting</Option>
    <Option value="Corporate Meeting">Corporate Meeting</Option>

    {/* TRAINING / LEARNING */}
    <Option value="Training">Training</Option>
    <Option value="Workshop">Workshop</Option>
    <Option value="Seminar">Seminar</Option>
    <Option value="Webinar">Webinar</Option>
    <Option value="Orientation">Orientation</Option>
    <Option value="Onboarding Session">Onboarding Session</Option>

    {/* BUSINESS EVENTS */}
    <Option value="Presentation">Presentation</Option>
    <Option value="Project Kickoff">Project Kickoff</Option>
    <Option value="Project Review">Project Review</Option>
    <Option value="Strategy Planning">Strategy Planning</Option>
    <Option value="Budget Meeting">Budget Meeting</Option>
    <Option value="Quarterly Review">Quarterly Review</Option>

    {/* HR / ADMIN */}
    <Option value="Interview">Interview</Option>
    <Option value="Performance Review">Performance Review</Option>
    <Option value="Disciplinary Meeting">Disciplinary Meeting</Option>
    <Option value="Policy Discussion">Policy Discussion</Option>

    {/* TECH / OPS */}
    <Option value="System Demo">System Demo</Option>
    <Option value="IT Support Session">IT Support Session</Option>
    <Option value="System Maintenance Meeting">System Maintenance Meeting</Option>
    <Option value="Incident Review">Incident Review</Option>
    <Option value="Dev Sprint Planning">Dev Sprint Planning</Option>
    <Option value="Retrospective">Retrospective</Option>

    {/* EVENTS / OTHERS */}
    <Option value="Company Announcement">Company Announcement</Option>
    <Option value="Town Hall Meeting">Town Hall Meeting</Option>
    <Option value="General Assembly">General Assembly</Option>
    <Option value="Brainstorming Session">Brainstorming Session</Option>
    <Option value="Networking">Networking</Option>
    <Option value="Other">Other</Option>
</Select>

                            <input
    placeholder="Receiver Emails (e.g. user1@mail.com, user2@mail.com)"
    className="input"
    value={data.receivers}
    onChange={(e) => {
        // normalize: remove extra spaces, keep comma-separated clean
        const value = e.target.value;

        setData({
            ...data,
            receivers: value
                .split(",")
                .map(email => email.trim())
                .filter(Boolean)
                .join(", ")
        });
    }}
/>

                            <textarea
                                className="input h-24"
                                placeholder="Remarks"
                                onChange={(e) =>
                                    setData({ ...data, remarks: e.target.value })
                                }
                            />

                            <button
                                className="w-full bg-teal-600 text-white py-2 rounded"
                                disabled={processing}
                            >
                               <i className="fa-solid fa-save"></i> {processing ? "Saving..." : "Confirm"}
                            </button>
                        </form>

                        <button
                            onClick={() => setSelectedSlot(null)}
                            className="mt-3 text-sm text-white bg-red-500 py-2 px-3 rounded"
                        >
                           <i className="fa-solid fa-xmark"></i> Cancel
                        </button>

                    </div>
                </div>
            )}

            {cancelModal && (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

        <div className="bg-white w-full max-w-md p-6 rounded-xl space-y-3">

            <h2 className="text-lg font-bold text-red-600">
               <i className="fa-solid fa-cancel"></i> Cancel Reservation
            </h2>

            {/* DETAILS */}
            <div className="text-sm bg-gray-50 p-3 rounded space-y-1">
                <p><b>Room:</b> {rooms.find(r => r.id === selectedReservation?.room_id)?.name || "N/A"}</p>
                <p><b>Organizer:</b> {selectedReservation.guest_name}</p>
                <p><b>Event:</b> {selectedReservation.event_type}</p>
                <p>
  <b>Schedule:</b>{" "}
  {moment(selectedReservation.start_date).format("MMM D, YYYY")}{" "}
  {moment(selectedReservation.start_time, "HH:mm").format("h:mm A")}
  {" → "}
  {moment(selectedReservation.end_date).format("MMM D, YYYY")}{" "}
  {moment(selectedReservation.end_time, "HH:mm").format("h:mm A")}
</p>
            </div>

            <div className="text-sm bg-gray-50 p-3 rounded space-y-1">
                <div className="space-y-2">
            {/* CANCELED BY */}
            <label>Canceled by:</label>
            <input
                className="input cursor-not-allowed bg-gray-100"
                value={cancelData.canceled_by}
                onChange={(e) =>
                    setCancelData({ ...cancelData, canceled_by: e.target.value })
                }
                placeholder="Canceled by"
                readOnly
            />
                </div>
                <div className="space-y-2 mt-2">
                    {/* REASON */}
            <label>Reason:</label>
            <textarea
                className="input h-24"
                placeholder="Reason"
                value={cancelData.reason}
                onChange={(e) =>
                    setCancelData({ ...cancelData, reason: e.target.value })
                }
            />
                    </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
                <button
                    onClick={submitCancel}
                    className="flex-1 bg-teal-600 text-white py-2 rounded"
                >
                   <i className="fa-solid fa-trash"></i> Confirm Cancel
                </button>

                <button
                    onClick={() => setCancelModal(false)}
                    className="flex-1 bg-red-500 text-white hover:bg-red-600 py-2 rounded"
                >
                   <i className="fa-solid fa-xmark"></i> Close
                </button>
            </div>

        </div>
    </div>
)}

            <style>{`
                .input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
            `}</style>

            {/* <footer className="fixed bottom-0 left-0 w-full text-center text-sm text-gray-500 py-2 border-t bg-teal-50">
                <div className="text-md font-semibold text-teal-500">© {new Date().getFullYear()} MRRS</div>
                <div className="text-xs text-teal-500">
                    Developed by: Dharwines
                </div>
            </footer> */}

        </div>
        </AuthenticatedLayout>
    );
    
}