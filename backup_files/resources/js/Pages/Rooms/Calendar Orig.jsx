import { useForm } from "@inertiajs/react";

export default function Calendar({ rooms, reservations }) {
    const { data, setData, post, reset } = useForm({
        room_id: "",
        guest_name: "",
        date: "",
        start_time: "",
        end_time: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("reservation.book"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Room Booking</h1>

            {/* ROOM LIST */}
            <div className="mb-6">
                <h2 className="font-semibold">Available Rooms</h2>
                <ul>
                    {rooms.map((room) => (
                        <li key={room.id}>
                            {room.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* BOOKING FORM */}
            <form onSubmit={submit} className="space-y-2">
                <input
                    placeholder="Guest Name"
                    value={data.guest_name}
                    onChange={(e) => setData("guest_name", e.target.value)}
                />

                <select
                    value={data.room_id}
                    onChange={(e) => setData("room_id", e.target.value)}
                >
                    <option value="">Select Room</option>
                    {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                            {room.name}
                        </option>
                    ))}
                </select>

                <input type="date"
                    onChange={(e) => setData("date", e.target.value)}
                />

                <input type="time"
                    onChange={(e) => setData("start_time", e.target.value)}
                />

                <input type="time"
                    onChange={(e) => setData("end_time", e.target.value)}
                />

                <button type="submit">
                    Book Room
                </button>
            </form>
        </div>
    );
}