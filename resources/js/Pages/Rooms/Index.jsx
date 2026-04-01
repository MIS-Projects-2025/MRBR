import { useState } from "react";
import Calendar from "@/Components/Calendar";
import { router, Link } from "@inertiajs/react";
import moment from "moment";

export default function Index({ rooms, reservations }) {

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [data, setData] = useState({
        room_id: "",
        guest_name: "",
        event_type: "",
        date: "",
        start_time: "",
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
            date: "",
            start_time: "",
            end_time: "",
            remarks: "",
            receivers: "",
        });
        setSuccess("");
    };

    // 👉 SELECT SLOT (DRAG / CLICK)
    const handleSelectSlot = (slot) => {

        setSelectedSlot(slot);

        setData({
            ...data,
            room_id: selectedRoom.id,
            date: moment(slot.start).format("YYYY-MM-DD"),
            start_time: moment(slot.start).format("HH:mm"),
            end_time: moment(slot.end).format("HH:mm"),
        });
    };

    // 👉 DRAG EVENT (RESCHEDULE)
    const handleEventDrop = ({ event, start, end }) => {

        const conflict = reservations.some(r => {
            if (r.id === event.id || r.room_id !== selectedRoom.id) return false;

            return (
                new Date(`${r.date}T${r.start_time}`) < end &&
                new Date(`${r.date}T${r.end_time}`) > start
            );
        });

        if (conflict) {
            alert("Time conflict!");
            return;
        }

        router.post(`/reservations-update/${event.id}`, {
            date: moment(start).format("YYYY-MM-DD"),
            start_time: moment(start).format("HH:mm"),
            end_time: moment(end).format("HH:mm"),
        });
    };

    // 👉 CREATE RESERVATION
    const submit = (e) => {
        e.preventDefault();

        router.post("/reservations-store", data, {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                setSuccess("Reservation successful!");
                setTimeout(() => setSelectedSlot(null), 3000);
                window.location.reload();
            },
        });
    };

    const handleDeleteEvent = (event) => {
    router.delete(`/reservations-delete/${event.id}`);
};

    const filteredReservations = selectedRoom
        ? reservations.filter(r => r.room_id === selectedRoom.id)
        : [];

    return (
        <div className="min-h-screen bg-gray-100">

            {/* NAV */}
            <nav className="bg-teal-600 px-4 py-4 flex justify-between">
                <div className="font-bold text-white text-2xl"><i className="fa-solid fa-people-roof"></i> Meeting Room Reservation System</div>
                <Link href="/login" className="font-bold text-white"><i className="fa-solid fa-arrow-right-from-bracket"></i> Login</Link>
            </nav>

            {/* ROOM SELECTION */}
            {!selectedRoom && (
                <div className="p-6 grid grid-cols-3 gap-4">
                    {rooms.map(room => (
                        <button
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className="bg-white shadow rounded-xl overflow-hidden"
                        >
                            <img src={`/rooms/${room.image}`} className="h-40 w-full object-cover" />
                            <div className="p-3 text-teal-600 font-semibold">
                                {room.name} - {room.location}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* CALENDAR */}
            {selectedRoom && (
                <div className="p-6 text-gray-600">

                    <div className="flex justify-between mb-3">
                        <h2 className="text-xl font-bold text-teal-600">
                           <i className="fa-brands fa-houzz mr-1"></i> {selectedRoom.name}
                        </h2>

                        <button onClick={resetAll} className="text-teal-600 hover:text-teal-700 flex items-center">
                           <i className="fa-solid fa-arrow-left mr-1"></i> Back
                        </button>
                    </div>

                    <Calendar
                        reservations={filteredReservations}
                        onSelectSlot={handleSelectSlot}
                        onEventDrop={handleEventDrop}
                        onDeleteEvent={handleDeleteEvent}
                    />
                </div>
            )}

            {/* MODAL (NAME + EVENT ONLY) */}
            {selectedSlot && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

                    <div className="bg-white p-6 rounded-xl w-full max-w-md">

                        <h2 className="font-bold text-teal-600 mb-3">
                           <i className="fa-solid fa-calendar-plus mr-1"></i> New Reservation
                        </h2>

                        <p className="text-sm mb-3 text-gray-500">
                            {moment(data.date).format("MMMM D, YYYY")} {" | "}
                            {moment(data.start_time, "HH:mm").format("h:mm A")} -{" "}
                            {moment(data.end_time, "HH:mm").format("h:mm A")}
                        </p>

                        {success && (
                            <div className="bg-green-100 text-green-600 p-2 mb-2 rounded">
                                {success}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-3">

                            <input
                                placeholder="Your Name"
                                className="input"
                                onChange={(e) =>
                                    setData({ ...data, guest_name: e.target.value })
                                }
                            />

                            <select
                                className="input"
                                onChange={(e) =>
                                    setData({ ...data, event_type: e.target.value })
                                }
                            >
                                <option value="">Event Type</option>
                                <option>Meeting</option>
                                <option>Training</option>
                                <option>Seminar</option>
                            </select>

                            <input
                                placeholder="Receiver Emails (comma separated)"
                                className="input"
                                onChange={(e) =>
                                setData({ ...data, receivers: e.target.value })
                                }
                            />

                            <textarea
                                className="input resize-none h-24"
                                placeholder="Remarks"
                                onChange={(e) =>
                                    setData({ ...data, remarks: e.target.value })
                                }
                            />

                            <button
                                className="w-full bg-teal-600 text-white py-2 rounded"
                                disabled={processing}
                            >
                               <i className="fa-solid fa-check mr-1"></i> {processing ? "Saving..." : "Confirm"}
                            </button>
                        </form>

                        <button
                            onClick={() => setSelectedSlot(null)}
                            className="mt-3 text-sm text-white bg-red-500 hover:bg-red-600 py-2 px-3 rounded"
                        >
                        <i className="fa-solid fa-xmark mr-1"></i> Cancel
                        </button>

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

        </div>
    );
}