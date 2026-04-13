import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import moment from "moment";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard() {

    const {
        stats,
        todayReservations = [],
        bookingsPerDate = []
    } = usePage().props;

    // SAFE CHART DATA
    const chartData = {
    labels: bookingsPerDate.map(item => {
        const date = new Date(item.date);

        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    }),
    datasets: [
        {
            label: "Bookings per Day",
            data: bookingsPerDate.map(item => item.total),
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.3
        }
    ]
};

    const options = {
        responsive: true,
         maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
            title: {
                display: true,
                text: "Reservations per Date"
            }
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="p-6 space-y-6">

                {/* HEADER */}
                <h1 className="text-2xl font-bold text-teal-600">
                   <i className="fa-regular fa-calendar-check"></i> MRRS Dashboard
                </h1>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-4">

                    <div className="p-4 bg-white shadow rounded">
                        <p className="text-green-500">Available Rooms</p>
                        <p className="text-2xl font-bold text-green-600">
                            {stats.availableRooms}
                        </p>
                    </div>

                    <div className="p-4 bg-white shadow rounded">
                        <p className="text-blue-500">Bookings Today</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {stats.bookingsToday}
                        </p>
                    </div>

                    <div className="p-4 bg-white shadow rounded">
                        <p className="text-red-500">Ongoing</p>
                        <p className="text-2xl font-bold text-red-600">
                            {stats.ongoing}
                        </p>
                    </div>

                </div>

                {/* CHART */}
                <div className="bg-white p-4 shadow rounded h-72">
                    <h2 className="text-xl font-semibold mb-4 text-teal-600">
                       <i className="fa-solid fa-chart-line"></i> Bookings Trend
                    </h2>

                    <div className="h-56">
                        <Line data={chartData} options={options}/>
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white shadow rounded p-4">

                    <h2 className="text-xl font-semibold mb-4 text-teal-600">
                       <i className="fa-solid fa-calendar-check"></i> Today's Reservations
                    </h2>

                    <table className="w-full border">

                        <thead className="bg-teal-100 text-teal-600">
                            <tr>
                                <th className="p-2">Room</th>
                                <th className="p-2">Guest</th>
                                <th className="p-2">Event</th>
                                <th className="p-2">Date</th>
                                <th className="p-2">Time</th>
                                <th className="p-2">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {todayReservations.map((res, i) => {

                                const start = new Date(`${res.date}T${res.start_time}`);
                                const end = new Date(`${res.date}T${res.end_time}`);
                                const now = new Date();

                                let status = "pending";

                                if (now > end) {
                                    status = "done";
                                } else if (now >= start && now <= end) {
                                    status = "ongoing";
                                }

                                return (
                                    <tr key={i} className="text-center border-t text-teal-600">

                                        <td className="p-2">{res.room_name}</td>
                                        <td className="p-2">{res.guest_name}</td>
                                        <td className="p-2">{res.event_type}</td>
                                        <td className="p-2">
    {moment(res.date).format("MMMM D YYYY")}
</td>

<td className="p-2">
    {moment(res.start_time, "HH:mm").format("h:mm A")} -{" "}
    {moment(res.end_time, "HH:mm").format("h:mm A")}
</td>

                                        <td className="p-2">
                                            <span className={
                                                status === "ongoing"
                                                    ? "text-red-500 font-bold"
                                                    : status === "done"
                                                    ? "text-gray-500"
                                                    : "text-green-500"
                                            }>
                                                {status}
                                            </span>
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>

                    </table>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}