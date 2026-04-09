import { useEffect, useMemo, useState } from "react";
import Calendar from "@/Components/Calendar";
import { router, Link } from "@inertiajs/react";

export default function Index({ rooms, reservations }) {

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [processing, setProcessing] = useState(false);

    const initialForm = {
        room_id: "",
        guest_name: "",
        event_type: "",
        date: "",
        start_time: "",
        end_time: "",
        remarks: "",
    };

    const [data, setData] = useState(initialForm);

    const reservationsByDate = useMemo(() => {
        if (!selectedDate || !selectedRoom) return [];

        return reservations.filter(r =>
            r.room_id === selectedRoom.id &&
            r.date === selectedDate
        );
    }, [reservations, selectedRoom, selectedDate]);

    useEffect(() => {
        if (selectedRoom && selectedDate) {
            setData(prev => ({
                ...prev,
                room_id: selectedRoom.id,
                date: selectedDate,
            }));
        }
    }, [selectedRoom, selectedDate]);

    const resetAll = () => {
        setSelectedRoom(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setData(initialForm);
        setErrors({});
        setSuccess("");
    };

const generateTimeSlots = () => {
    const slots = [];

    for (let hour = 0; hour < 24; hour++) {
        const start = `${String(hour).padStart(2, "0")}:00`;
        const end = `${String((hour + 1) % 24).padStart(2, "0")}:00`;

        slots.push({ start, end });
    }

    return slots;
};

    const timeSlots = generateTimeSlots();

    const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

const isSlotReserved = (slot) => {
    return reservationsByDate.find(r => {
        const slotStart = toMinutes(slot.start);
        const slotEnd = toMinutes(slot.end);
        const resStart = toMinutes(r.start_time);
        const resEnd = toMinutes(r.end_time);

        return slotStart < resEnd && slotEnd > resStart;
    });
};

    // 👉 hanapin next reservation after start_time
const getNextReservation = () => {
    if (!data.start_time) return null;

    const sorted = [...reservationsByDate].sort(
        (a, b) => a.start_time.localeCompare(b.start_time)
    );

    return sorted.find(r => r.start_time > data.start_time);
};

// 👉 generate valid end times
const generateEndTimes = () => {
    if (!data.start_time) return [];

    const nextReservation = getNextReservation();
    const maxEnd = nextReservation ? nextReservation.start_time : "23:59";

    const slots = [];
    let hour = parseInt(data.start_time.split(":")[0]);

    for (let h = hour + 1; h <= 23; h++) {
        const time = `${String(h).padStart(2, "0")}:00`;

        if (time > maxEnd) break;

        slots.push(time);
    }

    return slots;
};

const endTimeOptions = generateEndTimes();

    const submit = (e) => {
        e.preventDefault();

        console.log(data);

        router.post("/reservations-store", data, {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                setSuccess("Reservation successful!");
                setTimeout(() => resetAll(), 1200);
            },
            onError: (err) => setErrors(err),
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 via-white to-gray-200">

            {/* NAV */}
            <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b px-6 py-4 flex justify-between items-center">
                <div className="text-teal-600 font-extrabold text-lg flex gap-2">
                    
                    MRBR
                </div>

                <Link
                    href="/login"
                    className=" text-teal-600 rounded-xl transition hover:text-teal-teal-700 hover:font-underline"
                >
                   <i className="fa-solid fa-user"></i> Login
                </Link>
            </nav>

            {/* HEADER */}
            <header className="px-6 py-6">
                <h1 className="text-3xl font-extrabold text-teal-600">
                   <i className="fa-solid fa-calendar-check"></i> Meeting Room Booking Reservation
                </h1>
                <p className="text-gray-500 text-sm">
                    Simple, fast, and organized reservations
                </p>
            </header>

            {/* ROOMS */}
            {!selectedRoom && (
                <section className="px-6 pb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {rooms.map(room => (
                        <button
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className="group bg-white rounded-2xl overflow-hidden shadow hover:shadow-2xl transition"
                        >
                            <div className="h-52 overflow-hidden">
                                <img
                                    src={`/rooms/${room.image}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition"
                                />
                            </div>
                            <div className="p-4 text-left text-teal-600">
                                <h3 className="font-semibold group-hover:text-teal-600">
                                    {room.name}
                                </h3>
                            </div>
                        </button>
                    ))}
                </section>
            )}

            {/* CALENDAR */}
            {selectedRoom && !selectedDate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white/80 backdrop-blur-xl w-[95%] max-w-4xl p-6 rounded-2xl shadow-2xl">
                    
                        <div className="flex justify-between mb-4">
                            
                            <h2 className="font-bold text-teal-600 text-2xl">
                                <i className="fa-solid fa-people-roof mr-2"></i>
                                {selectedRoom.name}
                            </h2>
                            <button onClick={resetAll}><i className="fa-solid fa-xmark text-teal-600 text-semibold"></i></button>
                        </div>

                        <Calendar
                            reservations={reservations.filter(r => r.room_id === selectedRoom.id)}
                            onSelectDate={setSelectedDate}
                        />
                    </div>
                </div>
            )}

            {/* TIME SLOTS - CALENDAR STYLE */}
{selectedDate && !selectedTime && (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

        <div className="bg-white/95 backdrop-blur-xl w-[95%] max-w-2xl p-6 rounded-2xl shadow-2xl">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">

                <h2 className="text-xl font-bold text-teal-600 flex items-center gap-2">
                    <i className="fa-solid fa-clock"></i> Select Time
                </h2>

                <button
                    onClick={() => setSelectedDate(null)}
                    className="text-gray-500 hover:text-red-500"
                >
                    <i className="fa-solid fa-xmark text-teal-600"></i>
                </button>

            </div>

            {/* DATE */}
            <p className="text-2xl text-teal-600 font-bold mb-4 text-center">
                {new Date(selectedDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
            </p>

            {/* CALENDAR GRID */}
            <div className="h-[500px] overflow-y-auto border rounded-xl">

                {timeSlots.map((slot, i) => {
                    const reserved = isSlotReserved(slot);

                    return (
                        <div
                            key={i}
                            className="grid grid-cols-[80px_1fr] border-b h-[60px]"
                        >

                            {/* TIME LABEL */}
                            <div className="text-xs text-gray-500 flex items-center justify-center border-r">
                                {slot.start}
                            </div>

                            {/* SLOT AREA */}
                            <div
                                onClick={() => {
                                    if (!reserved) {
                                        setSelectedTime(slot.start);
                                        setData({
                                            ...data,
                                            start_time: slot.start,
                                            end_time: slot.end
                                        });
                                    }
                                }}
                                className={`relative transition
                                    ${reserved
                                        ? "bg-red-200 cursor-not-allowed"
                                        : "bg-white hover:bg-green-100 cursor-pointer"}
                                `}
                            >

                                {/* RESERVED BLOCK */}
                                {reserved && (
                                    <div className="absolute inset-1 bg-red-400 text-white rounded-lg p-2 text-xs shadow flex flex-col justify-center">
                                        <div className="font-bold">
                                            {reserved.event_type}
                                        </div>
                                        <div className="opacity-90">
                                           <label>Reserved By:</label> {reserved.guest_name}
                                        </div>
                                    </div>
                                )}

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    </div>
)}

            {/* FORM */}
            {selectedTime && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

                    <div className="bg-white/90 backdrop-blur-xl w-[95%] max-w-md p-6 rounded-2xl shadow-2xl">

                        <div className="flex justify-between items-center mb-3">
                         <h2 className="font-bold text-teal-600">
                              <i className="fa-solid fa-calendar-plus mr-1"></i> New Reservation
                         </h2>
                         <button
                             onClick={() => setSelectedTime(null)}
                                className="text-sm text-gray-500 hover:text-red-500"
                         >
                            <i className="fa-solid fa-xmark text-teal-600"></i>
                         </button>
                          </div>
                          {/* DATE */}
    <p className="text-teal-600 text-center font-bold text-2xl">
        {new Date(selectedDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).replace(",", "")}
    </p>

    {errors.error && (
    <div className="bg-red-100 text-red-600 p-2 rounded">
        {errors.error}
    </div>
)}
                        {success && (
                            <div className="bg-green-100 text-green-700 p-2 mb-2 rounded-lg">
                                {success}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-3">

                            <input
                                className="input mt-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium"
                                placeholder="Full Name"
                                value={data.guest_name}
                                onChange={(e) => setData({ ...data, guest_name: e.target.value })}
                            />

                            <select
                               className="input mt-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium"
                                value={data.event_type}
                                onChange={(e) => setData({ ...data, event_type: e.target.value })}
                            >
                                <option value="">Event Type</option>
                                <option>Meeting</option>
                                <option>Training</option>
                                <option>Seminar</option>
                            </select>

                            <div className="space-y-2">

    

    {/* TIME SELECT */}
    <div className="grid grid-cols-2 gap-2">

        {/* START TIME (LOCKED) */}

        <div>
            <label className="text-teal-600">Start Time</label>
            <input type="text"  className="input bg-gray-200 text-gray-600 font-medium" value={data.start_time} readOnly/>
        </div>

        {/* END TIME (SELECTABLE) */}
        <div>
            <label className="text-teal-600">End Time</label>
        <select
            className="input bg-white text-gray-600"
            value={data.end_time}
            onChange={(e) =>
                setData({ ...data, end_time: e.target.value })
            }
        >
            <option value="">End Time</option>

            {endTimeOptions.map((time, i) => (
                <option key={i} value={time}>
                    {time}
                </option>
            ))}
        </select>
        </div>

    </div>

    {/* WARNING */}
    {endTimeOptions.length === 0 && (
        <p className="text-xs text-red-500">
            No available extension. Next slot is already reserved.
        </p>
    )}

</div>

                            <textarea
                               className="input mt-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium resize-none h-32 p-2"
                                placeholder="Remarks"
                                onChange={(e) => setData({ ...data, remarks: e.target.value })}
                            />

                            <button
                                disabled={processing || !data.end_time}
                                className="w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
                            >
                                {processing ? "Saving..." : "Confirm Reservation"}
                            </button>
                        </form>

                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="fixed bottom-0 left-0 w-full text-center text-sm text-gray-500 py-2 border-t bg-teal-50">
                <div className="text-md font-semibold text-teal-500">© {new Date().getFullYear()} MRRS</div>
                <div className="text-xs text-teal-500">
                    Developed by: Dharwines
                </div>
            </footer>

            <style>{`
                .input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 12px;
                    outline: none;
                }
                .input:focus {
                    border-color: #14b8a6;
                    box-shadow: 0 0 0 2px rgba(20,184,166,0.2);
                }
            `}</style>
        </div>
    );
}