import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import moment from "moment";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "antd";

const localizer = momentLocalizer(moment);

export default function Booknow({ rooms, reservations, emp_data, empEmail }) {
    const [events, setEvents] = useState([]);
    const [roomId, setRoomId] = useState("");
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [eventType, setEventType] = useState("");
    const [title, setTitle] = useState("");

    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [attendees, setAttendees] = useState([]);
    const [remarks, setRemarks] = useState("");
    const [status, setStatus] = useState("busy");
    const [isRecurring, setIsRecurring] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [actionType, setActionType] = useState("");

    const [newStart, setNewStart] = useState("");
    const [newEnd, setNewEnd] = useState("");

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
                alert("Room already booked!");
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

    const filteredEvents = events.filter((e) => e.room_id === parseInt(roomId));

    return (
        <AuthenticatedLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 text-teal-600">
                    <i className="fa-solid fa-calendar-check"></i> MRRS Calendar
                </h1>

                {/* ROOM */}
                <div className="mb-4">
                    <label className="block text-lg font-medium text-teal-600 mb-1">
                        Room's
                    </label>

                    <select
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="w-1/4 rounded-lg border border-teal-600 bg-white px-3 py-2 text-xl text-teal-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                                {room.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* CALENDAR */}
                <Calendar
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    selectable
                    style={{ height: 550 }}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={(event) => setSelectedEvent(event)}
                />

                {/* MODAL */}
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
                                    onClick={handleSave}
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
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600 font-medium">
                                        ⚠️ This reservation will be canceled
                                        permanently.
                                    </p>
                                    <p className="text-xs text-red-500">
                                        You can no longer use this schedule
                                        unless rebooked.
                                    </p>
                                </div>
                            )}

                            {/* BUTTONS */}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    className={`w-full text-white ${
                                        actionType === "cancel"
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "bg-teal-500 hover:bg-teal-600"
                                    }`}
                                    disabled={!actionType}
                                    onClick={async () => {
                                        // ❌ CANCEL = DELETE
                                        if (actionType === "cancel") {
                                            await axios.delete(
                                                "/reservation-delete",
                                                {
                                                    data: {
                                                        id: selectedEvent.id,
                                                    },
                                                },
                                            );
                                        }

                                        // 🔁 RESCHEDULE = UPDATE
                                        if (actionType === "resched") {
                                            const start = new Date(newStart);
                                            const end = new Date(newEnd);

                                            const conflict = events.some(
                                                (e) =>
                                                    e.room_id ===
                                                        selectedEvent.room_id &&
                                                    e.id !== selectedEvent.id &&
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
                                                    start_date:
                                                        moment(start).format(
                                                            "YYYY-MM-DD",
                                                        ),
                                                    start_time:
                                                        moment(start).format(
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
                                        ? "Cancel Reservation"
                                        : "Confirm Changes"}
                                </Button>

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
            </div>
        </AuthenticatedLayout>
    );
}
