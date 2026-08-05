import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { router, Link } from "@inertiajs/react";
import moment from "moment";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Select } from "antd";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const localizer = momentLocalizer(moment);

export default function Dashboard({ rooms, reservations, emp_data, empEmail }) {
    const requiredRooms = ["Training Room 1", "Training Room 2"];

    const existingNames = rooms.map((r) => r.name);

    const missingRooms = requiredRooms
        .filter((name) => !existingNames.includes(name))
        .map((name, index) => ({
            id: `soon-${index}`,
            name,
            location: "Coming Soon",
            capacity: "-",
            image: "dummyRoom.jpeg",
            isSoon: true,
        }));

    const displayRooms = [...rooms, ...missingRooms];

    const [events, setEvents] = useState([]);
    const [roomId, setRoomId] = useState("");
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [eventType, setEventType] = useState("");
    const [title, setTitle] = useState("");

    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [attendees, setAttendees] = useState([]);
    const [remarks, setRemarks] = useState("");
    const [showGuide, setShowGuide] = useState(true);
    const [status, setStatus] = useState("busy");
    const [isRecurring, setIsRecurring] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [actionType, setActionType] = useState("");

    const [newStart, setNewStart] = useState("");
    const [newEnd, setNewEnd] = useState("");
    const [showTimelineGuide, setShowTimelineGuide] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [showConfirmSave, setShowConfirmSave] = useState(false);
    const [newRoom, setNewRoom] = useState(null);

    useEffect(() => {
        const seen = localStorage.getItem("seenTimelineGuide");

        if (!seen) {
            setShowTimelineGuide(true);
            localStorage.setItem("seenTimelineGuide", "true");
        }
    }, []);

    // 🔥 transform DB → calendar
    const transformReservations = (data) => {
        return data.map((res) => ({
            id: res.id,
            title: `${res.event_type} - ${res.guest_name}`,
            start: new Date(`${res.start_date}T${res.start_time}`),
            end: new Date(`${res.end_date}T${res.end_time}`),
            room_id: res.room_id,
        }));
    };

    // 🔥 init
    useEffect(() => {
        setEvents(transformReservations(reservations));

        if (rooms.length > 0) {
            setRoomId(rooms[0].id);
        }
    }, [rooms, reservations]);

    const handleSelectSlot = (slotInfo) => {
        const now = new Date();

        // ❌ Prevent past time
        // if (slotInfo.start < now) {
        //     alert("❌ Cannot select past time.");
        //     return;
        // }

        // ✅ Check if selected slot conflicts with existing reservations
        const hasConflict = reservations.some((res) => {
            // room check
            if (Number(res.room_id) !== Number(roomId)) {
                return false;
            }

            // reservation start/end
            const reservationStart = new Date(
                `${res.start_date}T${res.start_time}`,
            );

            const reservationEnd = new Date(`${res.end_date}T${res.end_time}`);

            // overlap check
            return (
                slotInfo.start < reservationEnd &&
                slotInfo.end > reservationStart
            );
        });

        if (hasConflict) {
            alert(
                "🚫 Oops! This time slot is already taken! Please choose a different time slot.",
            );
            return;
        }

        // ✅ no conflict
        setSelectedSlot(slotInfo);

        setStartTime(moment(slotInfo.start).format("YYYY-MM-DDTHH:mm"));
        setEndTime(moment(slotInfo.end).format("YYYY-MM-DDTHH:mm"));
    };

    // 🔥 SAVE
    const handleSave = async () => {
        if (!roomId || !startTime || !endTime) return;

        setIsSaving(true);

        const start = new Date(startTime);
        const end = new Date(endTime);

        const now = new Date();

        if (start < now || end < now) {
            alert("❌ Cannot reserve past date/time.");
            setIsSaving(false);
            return;
        }

        let newEvents = [];

        const checkConflict = (s, e) =>
            events.some(
                (event) =>
                    event.room_id === parseInt(roomId) &&
                    s < event.end &&
                    e > event.start,
            );

        // 🔁 RECURRING
        if (isRecurring) {
            let current = new Date(start);

            while (current.getDay() !== 1) {
                current.setDate(current.getDate() + 1);
            }

            for (let i = 0; i < 5; i++) {
                const dayStart = new Date(current);
                dayStart.setDate(current.getDate() + i);

                const dayEnd = new Date(dayStart);

                dayStart.setHours(start.getHours(), start.getMinutes());
                dayEnd.setHours(end.getHours(), end.getMinutes());

                if (checkConflict(dayStart, dayEnd)) {
                    alert("Conflict detected in recurring schedule!");
                    return;
                }

                newEvents.push({
                    guest_name: emp_data?.emp_name,
                    event_type: eventType || "Meeting",
                    reserved_by: emp_data?.emp_name,
                    room_id: roomId,
                    receivers: attendees.join(","),
                    remarks,
                    status,
                    start_date: moment(dayStart).format("YYYY-MM-DD"),
                    start_time: moment(dayStart).format("HH:mm:ss"),
                    end_date: moment(dayEnd).format("YYYY-MM-DD"),
                    end_time: moment(dayEnd).format("HH:mm:ss"),
                });
            }
        } else {
            if (checkConflict(start, end)) {
                alert(
                    "🚫 Oops! This time slot is already taken! Please choose a different time slot.",
                );
                window.location.reload();
                return;
            }

            newEvents.push({
                guest_name: emp_data?.emp_name,
                event_type: eventType || "Meeting",
                reserved_by: emp_data?.emp_name,
                room_id: roomId,
                receivers: attendees.join(","),
                remarks,
                status,
                start_date: moment(start).format("YYYY-MM-DD"),
                start_time: moment(start).format("HH:mm:ss"),
                end_date: moment(end).format("YYYY-MM-DD"),
                end_time: moment(end).format("HH:mm:ss"),
            });
        }

        // 💾 SAVE
        for (let event of newEvents) {
            await axios.post("/reservations-store", event);
        }

        // 🔄 redirect to dashboard
        router.visit("/");
    };

    const isOwnerOrAdmin = (event) => {
        const res = reservations.find((r) => r.id === event.id);

        if (!res) return false;

        return (
            ["superadmin", "admin"].includes(emp_data?.emp_role) ||
            emp_data?.emp_name === res.guest_name
        );
    };

    // ================ OLD ==================

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [activeTab, setActiveTab] = useState("today");
    const [selectedDate, setSelectedDate] = useState(
        moment().format("YYYY-MM-DD"),
    );

    const filteredEvents = events.filter(
        (e) => Number(e.room_id) === Number(selectedRoom?.id),
    );

    const canCancel = (res) => {
        return (
            ["superadmin", "admin"].includes(emp_data?.emp_role) ||
            emp_data?.emp_name === res.guest_name
        );
    };

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

    // TIME SLOTS 7AM - 7AM
    const timeSlots = [];
    for (let h = 7; h <= 31; h++) {
        const hour = h % 24;
        timeSlots.push(moment({ hour }).format("HH:00"));
    }

    const isDone = (res) => {
        const now = moment();

        const end = moment(`${res.end_date} ${res.end_time}`);

        return now.isAfter(end);
    };

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
            return "bg-emerald-400";
        }

        // ONGOING
        if (now.isBetween(start, end)) {
            return "bg-blue-500";
        }

        // reserved / UPCOMING
        return "bg-gray-400";
    };

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen">
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
                            activeTab === "today"
                                ? "bg-teal-600 text-white"
                                : "border border-teal-500 bg-white text-teal-500 hover:bg-teal-500 hover:text-white"
                        }`}
                    >
                        <i className="fa-solid fa-calendar-days"></i> Today
                        Reservations
                    </button>

                    <button
                        onClick={() => setActiveTab("calendar")}
                        className={`px-4 py-2 rounded ${
                            activeTab === "calendar"
                                ? "bg-teal-600 text-white"
                                : "border border-teal-500 bg-white text-teal-500 hover:bg-teal-500 hover:text-white"
                        }`}
                    >
                        <i className="fa-solid fa-hotel"></i> Rooms
                    </button>
                </div>

                {/* =========================
    TAB 1: REAL TIMELINE (GANTT STYLE)
========================== */}
                {activeTab === "today" && (
                    <div className="p-6 overflow-auto">
                        {/* ================= GUIDE BUTTON ================= */}
                        <div className="flex justify-end mb-2">
                            <button
                                onClick={() => setShowTimelineGuide(true)}
                                className="text-sm text-teal-600 underline"
                            >
                                ❓ How to use this view
                            </button>
                        </div>

                        {/* ================= LEGEND ================= */}
                        <div className="flex gap-4 text-xs mb-3">
                            <span className="text-lg flex items-center gap-1">
                                <span className="w-4 h-4 bg-gray-400 inline-block"></span>{" "}
                                Upcoming
                            </span>
                            <span className="text-lg flex items-center gap-1">
                                🟦 Ongoing
                            </span>
                            <span className="text-lg flex items-center gap-1">
                                🟩 Done Meeting Schedule Reservation
                            </span>
                        </div>

                        {/* ================= GUIDE MODAL ================= */}
                        {showTimelineGuide && (
                            <Dialog
                                open={true}
                                onOpenChange={() => setShowTimelineGuide(false)}
                            >
                                <div className="space-y-4 p-4 max-w-md">
                                    <h2 className="text-lg font-bold text-teal-600">
                                        📊 Timeline View Guide
                                    </h2>

                                    {/* General Guide */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                            General Guide
                                        </h3>

                                        <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                                            <li>
                                                Each column represents a meeting
                                                room
                                            </li>
                                            <li>
                                                Time runs from 7:00 AM to
                                                midnight
                                            </li>
                                            <li>
                                                Click a room column to create a
                                                reservation
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Color Guide */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                            🎨 Color Guide
                                        </h3>

                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li className="flex items-center gap-2">
                                                <span className="w-4 h-4 bg-gray-500 rounded-sm"></span>
                                                Gray = Upcoming Meeting
                                            </li>

                                            <li className="flex items-center gap-2">
                                                <span className="w-4 h-4 bg-blue-500 rounded-sm"></span>
                                                Blue = Ongoing Meeting
                                            </li>

                                            <li className="flex items-center gap-2">
                                                <span className="w-4 h-4 bg-emerald-500 rounded-sm"></span>
                                                Green = Completed Meeting
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs text-yellow-700">
                                        ⚠️ Past dates cannot be reserved
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() =>
                                                setShowTimelineGuide(false)
                                            }
                                            className="bg-teal-500 text-white"
                                        >
                                            Got it
                                        </Button>
                                    </div>
                                </div>
                            </Dialog>
                        )}

                        {/* ================= DATE FILTER ================= */}
                        {["superadmin"].includes(emp_data?.emp_role) && (
                            <div className="flex items-center gap-3 mb-4">
                                <label className="font-semibold text-teal-600">
                                    Select Date:
                                </label>

                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) =>
                                        setSelectedDate(e.target.value)
                                    }
                                    className="border-teal-600 px-3 py-2 rounded bg-white text-teal-600"
                                />
                            </div>
                        )}

                        <div className="min-w-[1000px]">
                            {/* ================= HEADER ================= */}
                            <div
                                className="grid"
                                style={{
                                    gridTemplateColumns: `120px repeat(${rooms.length}, 1fr)`,
                                }}
                            >
                                <div className="p-2 font-bold bg-gray-100">
                                    Time
                                </div>

                                {rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="p-2 font-bold text-teal-600 border bg-white"
                                    >
                                        {room.name}
                                    </div>
                                ))}
                            </div>

                            {/* ================= GRID ================= */}
                            {(() => {
                                const START_HOUR = 7;
                                const HOURS = 17;
                                const PX_PER_HOUR = 64;

                                return (
                                    <div
                                        className="grid"
                                        style={{
                                            gridTemplateColumns: `120px repeat(${rooms.length}, 1fr)`,
                                        }}
                                    >
                                        {/* TIME SCALE */}
                                        <div className="border-r bg-gray-50">
                                            {Array.from({ length: HOURS }).map(
                                                (_, i) => {
                                                    const hour = START_HOUR + i;

                                                    return (
                                                        <div
                                                            key={i}
                                                            className="h-16 border-b text-[10px] text-gray-400 px-1"
                                                        >
                                                            {moment()
                                                                .startOf("day")
                                                                .add(
                                                                    hour,
                                                                    "hours",
                                                                )
                                                                .format(
                                                                    "HH:00",
                                                                )}
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>

                                        {/* ROOMS */}
                                        {rooms.map((room) => {
                                            const roomReservations =
                                                reservations.filter((r) => {
                                                    if (r.room_id !== room.id)
                                                        return false;

                                                    const selected =
                                                        moment(selectedDate);
                                                    const start = moment(
                                                        r.start_date,
                                                    );
                                                    const end = moment(
                                                        r.end_date,
                                                    );

                                                    return selected.isBetween(
                                                        start,
                                                        end,
                                                        null,
                                                        "[]",
                                                    );
                                                });

                                            return (
                                                <div
                                                    key={room.id}
                                                    className="relative z-0"
                                                    style={{
                                                        height: `${HOURS * PX_PER_HOUR}px`,
                                                    }}
                                                >
                                                    {/* GRID LINES */}
                                                    {Array.from({
                                                        length: HOURS,
                                                    }).map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className="h-16 border-b"
                                                        />
                                                    ))}

                                                    {/* CLICK AREA */}
                                                    <div
                                                        className="absolute inset-0 cursor-pointer hover:bg-green-50 z-10"
                                                        onClick={(e) => {
                                                            const rect =
                                                                e.currentTarget.getBoundingClientRect();
                                                            const y =
                                                                e.clientY -
                                                                rect.top;

                                                            const minutes =
                                                                (y /
                                                                    PX_PER_HOUR) *
                                                                60;

                                                            const start =
                                                                moment(
                                                                    selectedDate,
                                                                )
                                                                    .startOf(
                                                                        "day",
                                                                    )
                                                                    .add(
                                                                        START_HOUR,
                                                                        "hours",
                                                                    )
                                                                    .add(
                                                                        minutes,
                                                                        "minutes",
                                                                    );

                                                            const end = moment(
                                                                start,
                                                            ).add(1, "hour");

                                                            const hasConflict =
                                                                roomReservations.some(
                                                                    (res) => {
                                                                        const s =
                                                                            moment(
                                                                                `${res.date} ${res.start_time}`,
                                                                            );
                                                                        const e =
                                                                            moment(
                                                                                `${res.date} ${res.end_time}`,
                                                                            );
                                                                        return (
                                                                            start.isBefore(
                                                                                e,
                                                                            ) &&
                                                                            end.isAfter(
                                                                                s,
                                                                            )
                                                                        );
                                                                    },
                                                                );

                                                            if (hasConflict)
                                                                return;

                                                            setSelectedRoom(
                                                                room,
                                                            );
                                                            setActiveTab(
                                                                "calendar",
                                                            );
                                                            setSelectedSlot(
                                                                null,
                                                            );
                                                        }}
                                                    />

                                                    {/* EVENTS */}
                                                    {roomReservations.map(
                                                        (res) => {
                                                            const resStart =
                                                                moment(
                                                                    `${res.start_date} ${res.start_time}`,
                                                                );
                                                            const resEnd =
                                                                moment(
                                                                    `${res.end_date} ${res.end_time}`,
                                                                );

                                                            const dayStart =
                                                                moment(
                                                                    selectedDate,
                                                                )
                                                                    .startOf(
                                                                        "day",
                                                                    )
                                                                    .add(
                                                                        START_HOUR,
                                                                        "hours",
                                                                    );

                                                            const dayEnd =
                                                                moment(
                                                                    selectedDate,
                                                                )
                                                                    .startOf(
                                                                        "day",
                                                                    )
                                                                    .add(
                                                                        START_HOUR +
                                                                            HOURS,
                                                                        "hours",
                                                                    );

                                                            const start =
                                                                moment.max(
                                                                    resStart,
                                                                    dayStart,
                                                                );
                                                            const end =
                                                                moment.min(
                                                                    resEnd,
                                                                    dayEnd,
                                                                );

                                                            if (
                                                                end.isSameOrBefore(
                                                                    start,
                                                                )
                                                            )
                                                                return null;

                                                            const top =
                                                                (start.diff(
                                                                    dayStart,
                                                                    "minutes",
                                                                ) /
                                                                    60) *
                                                                PX_PER_HOUR;

                                                            const height =
                                                                (end.diff(
                                                                    start,
                                                                    "minutes",
                                                                ) /
                                                                    60) *
                                                                PX_PER_HOUR;

                                                            const fontSize =
                                                                height < 40
                                                                    ? 10
                                                                    : height <
                                                                        80
                                                                      ? 12
                                                                      : height <
                                                                          140
                                                                        ? 14
                                                                        : 16;

                                                            return (
                                                                <div
                                                                    key={res.id}
                                                                    className={`absolute left-1 right-1 text-white rounded shadow z-20 flex flex-col items-center justify-center text-center overflow-hidden ${getStatusColor(res)}`}
                                                                    onClick={() => {
                                                                        if (
                                                                            isDone(
                                                                                res,
                                                                            )
                                                                        ) {
                                                                            alert(
                                                                                "Reservation is done.",
                                                                            );
                                                                            return;
                                                                        }

                                                                        if (
                                                                            !canCancel(
                                                                                res,
                                                                            )
                                                                        ) {
                                                                            alert(
                                                                                "❌ You are not allowed to manage this reservation.",
                                                                            );
                                                                            return;
                                                                        }

                                                                        // setSelectedReservation(res);
                                                                        setSelectedEvent(
                                                                            res,
                                                                        );
                                                                    }}
                                                                    style={{
                                                                        top: `${top}px`,
                                                                        height: `${height}px`,
                                                                        fontSize: `${fontSize}px`,
                                                                    }}
                                                                >
                                                                    {height >
                                                                        25 && (
                                                                        <div className="font-bold text-xs">
                                                                            {
                                                                                res.guest_name
                                                                            }
                                                                        </div>
                                                                    )}

                                                                    {height >
                                                                        50 && (
                                                                        <div className="text-xs">
                                                                            {
                                                                                res.event_type
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        },
                                                    )}
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
                                {displayRooms.map((room) => (
                                    <button
                                        key={room.id}
                                        disabled={room.isSoon}
                                        onClick={() => {
                                            if (room.isSoon) return;

                                            setSelectedRoom(room);
                                            setRoomId(room.id);

                                            const seen = localStorage.getItem(
                                                "seenReservationGuide",
                                            );

                                            if (!seen) {
                                                setShowGuide(true);
                                                localStorage.setItem(
                                                    "seenReservationGuide",
                                                    "true",
                                                );
                                            }
                                        }}
                                        className={`shadow rounded-xl overflow-hidden ${
                                            room.isSoon
                                                ? "bg-gray-100 cursor-not-allowed opacity-70"
                                                : "bg-white"
                                        }`}
                                    >
                                        <img
                                            src={`/rooms/${room.image}`}
                                            className="h-40 w-full object-cover"
                                        />

                                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                                            <div className="font-semibold text-teal-700">
                                                {room.name}
                                            </div>

                                            {room.isSoon ? (
                                                <div className="text-gray-500 font-bold">
                                                    SOON
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-gray-600">
                                                        📍 {room.location}
                                                    </div>
                                                    <div className="text-gray-600">
                                                        👥 {room.capacity}{" "}
                                                        capacity
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedRoom && (
                            <>
                                {/* ✅ GUIDE MODAL */}
                                {showGuide && (
                                    <Dialog
                                        open={true}
                                        onOpenChange={() => setShowGuide(false)}
                                    >
                                        <div className="space-y-4 p-2 max-w-md">
                                            <h2 className="text-lg font-bold text-teal-600">
                                                📌 How to Reserve a Room
                                            </h2>

                                            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                                                <li>
                                                    <li>
                                                        Click empty space to
                                                        create a reservation
                                                    </li>{" "}
                                                    or drag to choose a time
                                                    slot
                                                </li>
                                                <li>Fill in meeting details</li>
                                                <li>
                                                    Select recipient (required)
                                                </li>
                                                <li>
                                                    Click{" "}
                                                    <b className="text-white bg-teal-500 p-1 rounded">
                                                        <i className="fa-solid fa-floppy-disk"></i>{" "}
                                                        Save
                                                    </b>{" "}
                                                    to confirm reservation
                                                </li>
                                                <li className="text-red-600 font-semibold">
                                                    ⚠️ Avoid overlapping
                                                    reservations. If conflict
                                                    occurs, try a different time
                                                    or room.
                                                </li>
                                            </ul>

                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={() =>
                                                        setShowGuide(false)
                                                    }
                                                    className="bg-teal-500 text-white hover:bg-teal-600"
                                                >
                                                    Got it
                                                </Button>
                                            </div>
                                        </div>
                                    </Dialog>
                                )}

                                {/* ✅ ROOM CONTENT */}
                                <div className="p-6 text-gray-600">
                                    <div className="flex justify-between mb-3">
                                        <h2 className="text-xl font-bold text-teal-600">
                                            {selectedRoom.name}
                                        </h2>

                                        <button
                                            onClick={resetAll}
                                            className="text-teal-600"
                                        >
                                            Back
                                        </button>
                                    </div>

                                    <Calendar
                                        localizer={localizer}
                                        events={filteredEvents}
                                        startAccessor="start"
                                        endAccessor="end"
                                        selectable
                                        defaultView="week"
                                        style={{ height: 550 }}
                                        onSelectSlot={handleSelectSlot}
                                        onSelectEvent={(event) => {
                                            if (!isOwnerOrAdmin(event)) {
                                                alert(
                                                    "❌ You are not allowed to manage this reservation.",
                                                );
                                                return;
                                            }

                                            setSelectedEvent(event);
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}

                {selectedSlot && (
                    <Dialog
                        open={true}
                        onOpenChange={() => setSelectedSlot(null)}
                    >
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-teal-600">
                                {" "}
                                <i className="fa-solid fa-calendar-check"></i>{" "}
                                New Meeting Reservation
                            </h2>

                            {/* RESERVED BY */}
                            <div className="border p-2 bg-gray-100 rounded">
                                <p className="text-xs text-gray-500">
                                    Reserved By
                                </p>
                                <p className="font-semibold">
                                    {emp_data?.emp_name || "Unknown User"}
                                </p>
                            </div>

                            {/* MEETING TYPE */}
                            <div>
                                <label>Meeting Type</label>
                                <Select
                                    showSearch
                                    placeholder="Select meeting type"
                                    style={{ width: "100%" }}
                                    value={eventType}
                                    onChange={(value) => setEventType(value)}
                                    options={[
                                        {
                                            label: "CORE OFFICE EVENTS",
                                            options: [
                                                {
                                                    value: "Meeting",
                                                    label: "Meeting",
                                                },
                                                {
                                                    value: "Team Meeting",
                                                    label: "Team Meeting",
                                                },
                                                {
                                                    value: "Department Meeting",
                                                    label: "Department Meeting",
                                                },
                                                {
                                                    value: "Management Meeting",
                                                    label: "Management Meeting",
                                                },
                                                {
                                                    value: "Client Meeting",
                                                    label: "Client Meeting",
                                                },
                                                {
                                                    value: "Board Meeting",
                                                    label: "Board Meeting",
                                                },
                                                {
                                                    value: "Corporate Meeting",
                                                    label: "Corporate Meeting",
                                                },
                                            ],
                                        },
                                        {
                                            label: "TRAINING / LEARNING",
                                            options: [
                                                {
                                                    value: "Training",
                                                    label: "Training",
                                                },
                                                {
                                                    value: "Workshop",
                                                    label: "Workshop",
                                                },
                                                {
                                                    value: "Seminar",
                                                    label: "Seminar",
                                                },
                                                {
                                                    value: "Webinar",
                                                    label: "Webinar",
                                                },
                                                {
                                                    value: "Orientation",
                                                    label: "Orientation",
                                                },
                                                {
                                                    value: "Onboarding Session",
                                                    label: "Onboarding Session",
                                                },
                                            ],
                                        },
                                        {
                                            label: "BUSINESS EVENTS",
                                            options: [
                                                {
                                                    value: "Presentation",
                                                    label: "Presentation",
                                                },
                                                {
                                                    value: "Project Kickoff",
                                                    label: "Project Kickoff",
                                                },
                                                {
                                                    value: "Project Review",
                                                    label: "Project Review",
                                                },
                                                {
                                                    value: "Strategy Planning",
                                                    label: "Strategy Planning",
                                                },
                                                {
                                                    value: "Budget Meeting",
                                                    label: "Budget Meeting",
                                                },
                                                {
                                                    value: "Quarterly Review",
                                                    label: "Quarterly Review",
                                                },
                                            ],
                                        },
                                        {
                                            label: "HR / ADMIN",
                                            options: [
                                                {
                                                    value: "Interview",
                                                    label: "Interview",
                                                },
                                                {
                                                    value: "Performance Review",
                                                    label: "Performance Review",
                                                },
                                                {
                                                    value: "Disciplinary Meeting",
                                                    label: "Disciplinary Meeting",
                                                },
                                                {
                                                    value: "Policy Discussion",
                                                    label: "Policy Discussion",
                                                },
                                            ],
                                        },
                                        {
                                            label: "TECH / OPS",
                                            options: [
                                                {
                                                    value: "System Demo",
                                                    label: "System Demo",
                                                },
                                                {
                                                    value: "IT Support Session",
                                                    label: "IT Support Session",
                                                },
                                                {
                                                    value: "System Maintenance Meeting",
                                                    label: "System Maintenance Meeting",
                                                },
                                                {
                                                    value: "Incident Review",
                                                    label: "Incident Review",
                                                },
                                                {
                                                    value: "Dev Sprint Planning",
                                                    label: "Dev Sprint Planning",
                                                },
                                                {
                                                    value: "Retrospective",
                                                    label: "Retrospective",
                                                },
                                            ],
                                        },
                                        {
                                            label: "EVENTS / OTHERS",
                                            options: [
                                                {
                                                    value: "Company Announcement",
                                                    label: "Company Announcement",
                                                },
                                                {
                                                    value: "Town Hall Meeting",
                                                    label: "Town Hall Meeting",
                                                },
                                                {
                                                    value: "General Assembly",
                                                    label: "General Assembly",
                                                },
                                                {
                                                    value: "Brainstorming Session",
                                                    label: "Brainstorming Session",
                                                },
                                                {
                                                    value: "Networking",
                                                    label: "Networking",
                                                },
                                                {
                                                    value: "Other",
                                                    label: "Other",
                                                },
                                            ],
                                        },
                                    ]}
                                />
                            </div>

                            {/* ROOM */}
                            <select
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="border-gray-300 p-2 w-full rounded-md "
                            >
                                {rooms.map((room) => (
                                    <option key={room.id} value={room.id}>
                                        {room.name}
                                    </option>
                                ))}
                            </select>

                            {/* TIME */}
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label>Start:</label>
                                    <input
                                        type="datetime-local"
                                        value={startTime}
                                        min={moment().format(
                                            "YYYY-MM-DDTHH:mm",
                                        )}
                                        onChange={(e) =>
                                            setStartTime(e.target.value)
                                        }
                                        className="border-gray-300 p-2 w-full rounded-md "
                                    />
                                </div>
                                <div>
                                    <label>End:</label>
                                    <input
                                        type="datetime-local"
                                        value={endTime}
                                        min={moment().format(
                                            "YYYY-MM-DDTHH:mm",
                                        )}
                                        onChange={(e) =>
                                            setEndTime(e.target.value)
                                        }
                                        className="border-gray-300 p-2 w-full rounded-md "
                                    />
                                </div>
                            </div>

                            {/* ATTENDEES */}
                            <div>
                                <label>Recipient:</label>

                                <Select
                                    mode="tags"
                                    showSearch
                                    allowClear
                                    placeholder="Type or select recipients"
                                    style={{ width: "100%" }}
                                    value={attendees}
                                    onChange={(value) => setAttendees(value)}
                                    options={(empEmail || []).map((email) => ({
                                        value: email,
                                        label: email,
                                    }))}
                                    className="border-gray-300 p-2"
                                />
                            </div>

                            {/* RECURRING */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isRecurring}
                                    onChange={(e) =>
                                        setIsRecurring(e.target.checked)
                                    }
                                />
                                <label>Recurring (Mon–Fri only)</label>
                            </div>

                            {/* REMARKS */}
                            <textarea
                                placeholder="Remarks / Description"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="border-gray-300 p-2 w-full rounded-md"
                            />

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setShowConfirmSave(true)}
                                    disabled={isSaving}
                                    className="bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-60"
                                >
                                    {isSaving ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-floppy-disk mr-2"></i>
                                            Save
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedSlot(null)}
                                    disabled={isSaving}
                                    className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                                >
                                    <i className="fa-solid fa-xmark mr-2"></i>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                )}

                {selectedEvent && (
                    <Dialog
                        open={true}
                        onOpenChange={() => setSelectedEvent(null)}
                    >
                        <div className="w-full max-w-md space-y-5 p-2">
                            {/* HEADER */}
                            <div className="border-b pb-3">
                                <h2 className="text-lg font-bold text-teal-600 flex items-center gap-2">
                                    <i className="fa-solid fa-calendar-check"></i>
                                    Manage Reservation
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Review or modify this booking
                                </p>
                            </div>

                            {/* EVENT CARD */}
                            <div className="bg-gray-50 border rounded-lg p-3 space-y-1">
                                <p className="font-semibold text-gray-800">
                                    {selectedEvent.title}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {moment(selectedEvent.start).format(
                                        "MMM DD, YYYY • hh:mm A",
                                    )}{" "}
                                    -{" "}
                                    {moment(selectedEvent.end).format(
                                        "hh:mm A",
                                    )}
                                </p>
                            </div>

                            {/* ACTION SELECT */}
                            <div>
                                <label className="text-sm font-medium text-gray-600">
                                    Action
                                </label>

                                <Select
                                    style={{ width: "100%" }}
                                    placeholder="Choose what to do"
                                    value={actionType}
                                    onChange={(value) => setActionType(value)}
                                    options={[
                                        {
                                            value: "resched",
                                            label: "🔁 Reschedule Reservation",
                                        },
                                        {
                                            value: "cancel",
                                            label: "❌ Cancel Reservation",
                                        },
                                    ]}
                                />
                            </div>

                            {/* RESCHEDULE FIELDS */}
                            {actionType === "resched" && (
                                <div className="space-y-3 p-3 border rounded-lg bg-blue-50">
                                    <p className="text-sm font-semibold text-blue-600">
                                        New Schedule
                                    </p>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">
                                            Select Room
                                        </label>

                                        <Select
                                            style={{ width: "100%" }}
                                            placeholder="Choose room"
                                            value={newRoom}
                                            onChange={(value) =>
                                                setNewRoom(value)
                                            }
                                            options={rooms.map((room) => ({
                                                value: room.id,
                                                label: room.name,
                                            }))}
                                        />
                                    </div>

                                    <input
                                        type="datetime-local"
                                        value={newStart}
                                        onChange={(e) =>
                                            setNewStart(e.target.value)
                                        }
                                        className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-400"
                                    />

                                    <input
                                        type="datetime-local"
                                        value={newEnd}
                                        onChange={(e) =>
                                            setNewEnd(e.target.value)
                                        }
                                        className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-400"
                                    />

                                    <p className="text-xs text-gray-500">
                                        ⚠️ Make sure selected time slot is
                                        available
                                    </p>
                                </div>
                            )}

                            {/* CANCEL WARNING */}
                            {actionType === "cancel" && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-3">
                                    <p className="text-sm text-red-600 font-medium">
                                        ⚠️ This reservation will be canceled
                                        permanently.
                                    </p>

                                    <textarea
                                        placeholder="Enter reason for cancellation..."
                                        value={cancelReason}
                                        onChange={(e) =>
                                            setCancelReason(
                                                e.target.value.replace(
                                                    /^\s+/,
                                                    "",
                                                ),
                                            )
                                        }
                                        className="w-full border p-2 rounded-md text-sm"
                                    />
                                </div>
                            )}

                            {/* BUTTONS */}
                            <div className="flex gap-2 pt-2">
                                {actionType !== "cancel" ||
                                cancelReason.trim().length > 0 ? (
                                    <Button
                                        className={`w-full text-white ${
                                            actionType === "cancel"
                                                ? "bg-red-500 hover:bg-red-600"
                                                : "bg-teal-500 hover:bg-teal-600"
                                        }`}
                                        disabled={
                                            !actionType ||
                                            (actionType === "resched" &&
                                                (!newRoom ||
                                                    !newStart ||
                                                    !newEnd))
                                        }
                                        onClick={async () => {
                                            if (
                                                !isOwnerOrAdmin(selectedEvent)
                                            ) {
                                                alert(
                                                    "❌ Unauthorized action.",
                                                );
                                                return;
                                            }

                                            if (actionType === "cancel") {
                                                await axios.delete(
                                                    "/reservation-delete",
                                                    {
                                                        data: {
                                                            id: selectedEvent.id,
                                                            reason: cancelReason.trim(),
                                                        },
                                                    },
                                                );
                                            }

                                            if (actionType === "resched") {
                                                const start = new Date(
                                                    newStart,
                                                );
                                                const end = new Date(newEnd);

                                                const conflict = events.some(
                                                    (e) =>
                                                        e.room_id ===
                                                            (newRoom ||
                                                                selectedEvent.room_id) &&
                                                        e.id !==
                                                            selectedEvent.id &&
                                                        start < e.end &&
                                                        end > e.start,
                                                );

                                                if (conflict) {
                                                    alert(
                                                        "❌ Selected time is not available",
                                                    );
                                                    return;
                                                }

                                                await axios.post(
                                                    "/reservation-update",
                                                    {
                                                        id: selectedEvent.id,
                                                        room_id: newRoom,
                                                        start_date:
                                                            moment(
                                                                start,
                                                            ).format(
                                                                "YYYY-MM-DD",
                                                            ),
                                                        start_time:
                                                            moment(
                                                                start,
                                                            ).format(
                                                                "HH:mm:ss",
                                                            ),
                                                        end_date:
                                                            moment(end).format(
                                                                "YYYY-MM-DD",
                                                            ),
                                                        end_time:
                                                            moment(end).format(
                                                                "HH:mm:ss",
                                                            ),
                                                    },
                                                );
                                            }

                                            router.visit("/");
                                        }}
                                    >
                                        {actionType === "cancel"
                                            ? "yes, Cancel Reservation"
                                            : "Confirm Changes"}
                                    </Button>
                                ) : null}

                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedEvent(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                )}

                {showConfirmSave && (
                    <Dialog
                        open={true}
                        onOpenChange={() => setShowConfirmSave(false)}
                    >
                        <div className="w-full max-w-lg p-4 space-y-4">
                            <h2 className="text-lg font-bold text-teal-600">
                                📌 Confirm Reservation
                            </h2>

                            <p className="text-sm text-gray-600">
                                Please review and agree to the meeting etiquette
                                before saving.
                            </p>

                            {/* ETIQUETTE */}
                            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                                <li>⏰ Be on time</li>
                                <li>🎯 Be prepared</li>
                                <li>🤝 Respect others’ time</li>
                                <li>🔇 Keep devices on silent</li>
                                <li>📍 Use assigned room only</li>
                                <li>👥 Invite necessary participants only</li>
                                <li>📝 Stay on topic</li>
                                <li>📩 Cancel if not needed</li>
                                <li>🧼 Maintain cleanliness</li>
                                <li>⚠️ Follow company policies</li>
                            </ol>

                            {/* AGREE */}
                            <label className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) =>
                                        setAgreed(e.target.checked)
                                    }
                                />
                                <span className="text-sm">
                                    I agree to the Meeting Etiquette and
                                    Guidelines
                                </span>
                            </label>

                            {/* BUTTONS */}
                            <div className="flex gap-2 pt-3">
                                {agreed ? (
                                    <Button
                                        onClick={handleSave}
                                        disabled={!agreed || isSaving}
                                        className={`w-full text-white ${
                                            !agreed || isSaving
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-teal-500 hover:bg-teal-600"
                                        }`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-floppy-disk mr-2"></i>
                                                confirm & Save
                                            </>
                                        )}
                                    </Button>
                                ) : null}
                                <Button
                                    variant="outline"
                                    onClick={() => setShowConfirmSave(false)}
                                    className="bg-red-500 text-white hover:bg-red-600"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
