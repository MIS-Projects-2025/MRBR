import { useState } from "react";

function Calendar({ reservations = [], roomId, onSelectDate }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    const formatDate = (day) =>
        `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // ✅ FIX: filter by room_id + date
   const getDayReservations = (day) => {
    return reservations.filter(r => {
        const d = new Date(r.date);
        return (
            d.getFullYear() === year &&
            d.getMonth() === month &&
            d.getDate() === day
        );
    });
};

    const isReserved = (day) => getDayReservations(day).length > 0;

    const formatTooltip = (list) => {
        return list
            .map(r => `• ${r.start_time} - ${r.end_time}`)
            .join("\n");
    };

    return (
        <div className="p-8 w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-lg">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">

                <button
                    className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                >
                    ⬅
                </button>

                <h2 className="text-2xl font-bold text-gray-700">
                    {currentDate.toLocaleString("default", { month: "long" })} {year}
                </h2>

                <button
                    className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                >
                    ➡
                </button>

            </div>

            {/* DAYS */}
            <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 mb-2">
                <div>Sun</div><div>Mon</div><div>Tue</div>
                <div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-7 gap-3">

                {days.map((day, i) => {

                    if (!day) return <div key={i}></div>;

                    const list = getDayReservations(day);
                    const reserved = list.length > 0;

                    return (
                        <button
                            key={i}
                            onClick={() => onSelectDate(formatDate(day))}
                            title={
                                reserved
                                    ? formatTooltip(list)
                                    : "No reservation"
                            }
                            className={`
                                h-[80px] rounded-xl border p-3 text-left
                                transition hover:shadow-md
                                ${reserved
                                    ? "bg-red-50 border-red-300"
                                    : "bg-white border-gray-200 hover:bg-gray-50"}
                            `}
                        >

                            <div className={`
                                font-bold text-lg
                                ${reserved ? "text-red-600" : "text-gray-700"}
                            `}>
                                {day}
                            </div>

                            {reserved && (
                                <div className="mt-1 text-xs text-red-500 font-semibold">
                                    ● Reserved ({list.length})
                                </div>
                            )}

                        </button>
                    );
                })}

            </div>

        </div>
    );
}

export default Calendar;