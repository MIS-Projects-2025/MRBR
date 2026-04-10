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
        emp_data,
        stats,
        todayReservations = [],
        bookingsPerDate = [],
        myReservations = []
    } = usePage().props;

    // =========================
    // FIXED ROLE CHECK
    // =========================
    const isAdmin = emp_data?.emp_role === 'admin' || emp_data?.emp_role === 'superadmin';

    // =========================
    // CHART DATA (ADMIN)
    // =========================
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

                <h1 className="text-2xl font-bold text-teal-600">
                   <i className="fab fa-pied-piper-alt text-4xl"></i> MRRS Dashboard
                </h1>

                {/* =========================
                    ADMIN
                ========================= */}
                {isAdmin ? (
                    <>
                        {/* STATS */}
                        <div className="grid grid-cols-3 gap-4">

                            <div className="p-4 bg-white shadow rounded">
                                <p className="text-green-500">Available Rooms</p>
                                <p>{stats?.availableRooms}</p>
                            </div>

                            <div className="p-4 bg-white shadow rounded">
                                <p className="text-blue-500">Bookings Today</p>
                                <p>{stats?.bookingsToday}</p>
                            </div>

                            <div className="p-4 bg-white shadow rounded">
                                <p className="text-red-500">Ongoing</p>
                                <p>{stats?.ongoing}</p>
                            </div>

                        </div>

                        {/* CHART */}
                        <div className="bg-white p-4 shadow rounded h-72">
                            <div className="h-56">
                                <Line data={chartData} options={options} />
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="bg-white shadow rounded p-4">
                            <table className="w-full border">
                                <tbody>
                                    {todayReservations.map((res, i) => (
                                        <tr key={i}>
                                            <td>{res.room_name}</td>
                                            <td>{res.guest_name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    /* =========================
                        USER
                    ========================= */
                    <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">

    {/* HEADER */}
    <div className="flex items-center justify-center mb-5">
        <h2 className="text-xl font-bold text-teal-600 flex items-center gap-2 mr-2">
            📅 My Reservations
        </h2>

        <span className="text-xs font-semibold text-gray-700 bg-white/70 backdrop-blur px-3 py-1 rounded-full shadow-sm border">
            Total: {myReservations.length}
        </span>
    </div>

    {/* TABLE WRAPPER */}
    <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-sm text-left">

            {/* TABLE HEAD */}
            <thead>
                <tr className="bg-teal-50 text-teal-700 uppercase text-xs tracking-wider">
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Date/Time Start</th>
                    <th className="px-4 py-3">Date/Time End</th>
                    <th className="px-4 py-3">Status</th>
                </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
    {myReservations.map((res, i) => {

        const status = res.status ?? "pending";

        return (
            <tr
                key={i}
                className="border-b hover:bg-gray-50 transition duration-200"
            >

                {/* ROOM */}
                <td className="px-4 py-3 font-semibold text-gray-800">
                    🏢 {res.room_name}
                </td>

                {/* START */}
                <td className="px-4 py-3 text-gray-600">
                    {moment(res.start_date).format("MMMM DD YYYY")} @ {moment(res.start_time, "HH:mm").format("h:mm A")}
                </td>

                {/* END */}
                <td className="px-4 py-3 text-gray-600">
                    {moment(res.end_date).format("MMMM DD YYYY")} @ {moment(res.end_time, "HH:mm").format("h:mm A")}
                </td>

                {/* STATUS */}
                <td className="px-4 py-3">
                    <span className={`
                        px-3 py-1 rounded-full text-xs font-semibold uppercase
                        ${
                            status === "ongoing"
                                ? "bg-blue-100 text-blue-600"
                                : status === "done"
                                ? "bg-green-100 text-green-600"
                                : status === "pending"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-100 text-gray-600"
                        }
                    `}>
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
                )}

            </div>
        </AuthenticatedLayout>
    );
}