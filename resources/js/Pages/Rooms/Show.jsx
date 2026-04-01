import { useForm } from "@inertiajs/react";

export default function Show({ room, reservations }) {
    const { data, setData, post, reset } = useForm({
        room_id: room.id,
        guest_name: "",
        event_type: "",
        date: "",
        start_time: "",
        end_time: "",
        remarks: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("reservations.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="p-6 min-h-screen bg-gray-100">
            {/* ROOM HEADER */}
            <div className="bg-white p-4 rounded shadow mb-4">
                <h1 className="text-xl font-bold">{room.name}</h1>

                <img
                    src={`/rooms/${room.image}`}
                    onError={(e) =>
                        (e.target.src =
                            "https://via.placeholder.com/600x300")
                    }
                    className="h-100 md:h-120 w-full object-cover p-4"
                />
            </div>

            {/* FORM */}
            <form
                onSubmit={submit}
                className="bg-white p-4 rounded shadow space-y-2"
            >
                <input
                    className="border p-2 w-full"
                    placeholder="Name"
                    onChange={(e) =>
                        setData("guest_name", e.target.value)
                    }
                />

                <select
                    className="border p-2 w-full"
                    onChange={(e) =>
                        setData("event_type", e.target.value)
                    }
                >
                    <option value="">Event Type</option>
                    <option>Meeting</option>
                    <option>Training</option>
                    <option>Seminar</option>
                </select>

                <input
                    type="date"
                    className="border p-2 w-full"
                    onChange={(e) => setData("date", e.target.value)}
                />

                <input
                    type="time"
                    className="border p-2 w-full"
                    onChange={(e) =>
                        setData("start_time", e.target.value)
                    }
                />

                <input
                    type="time"
                    className="border p-2 w-full"
                    onChange={(e) =>
                        setData("end_time", e.target.value)
                    }
                />

                <textarea
                    className="border p-2 w-full"
                    placeholder="Remarks"
                    onChange={(e) =>
                        setData("remarks", e.target.value)
                    }
                />

                <button className="bg-blue-600 text-white px-4 py-2">
                    Reserve
                </button>
            </form>

            {/* RESERVATIONS */}
            <div className="mt-4">
                <h2 className="font-bold mb-2">Booked</h2>

                {reservations?.map((r) => (
                    <div
                        key={r.id}
                        className="bg-white p-2 mb-2 rounded shadow"
                    >
                        {r.date} | {r.start_time} - {r.end_time}
                    </div>
                ))}
            </div>
        </div>
    );
}