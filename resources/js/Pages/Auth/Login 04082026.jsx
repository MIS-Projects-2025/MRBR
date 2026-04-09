import { useForm, Head, Link } from "@inertiajs/react";
import InputError from "@/Components/InputError";

export default function Login({ redirect }) {
    const { data, setData, post, processing, errors } = useForm({
        employeeID: "",
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <>
            <Head title="Admin Login" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-4">

                {/* LOGIN CARD */}
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                    {/* HEADER */}
                    <div className="bg-teal-600 text-white p-6 text-center">
                        <i className="fa-solid fa-user-shield text-3xl mb-2"></i>
                        <h1 className="text-2xl font-bold">Admin Login</h1>
                        <p className="text-white/80 text-sm">
                            Meeting Room Reservation System
                        </p>
                    </div>

                    {/* FORM */}
                    <div className="p-6 space-y-5">

                        <InputError
                            message={errors.general}
                            className="p-2 text-center bg-red-100 text-red-600 rounded"
                        />

                        <form onSubmit={submit} className="space-y-4">

                            <input
                                type="hidden"
                                name="redirect"
                                value={redirect}
                            />

                            {/* Employee ID */}
                            <div>
                                <label className="text-sm text-gray-600">
                                   <i className="fa-solid fa-id-card mr-1"></i> Employee ID
                                </label>
                                <input
                                    type="text"
                                    value={data.employeeID}
                                    onChange={(e) =>
                                        setData("employeeID", e.target.value)
                                    }
                                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-gray-600"
                                    placeholder="Enter Employee ID"
                                />
                                <InputError message={errors.employeeID} />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-sm text-gray-600">
                                   <i className="fa-solid fa-lock mr-1"></i> Password
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-gray-600"
                                    placeholder="Enter Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* LOGIN BUTTON */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
                            >
                                <i className="fa-solid fa-right-to-bracket mr-2"></i>
                                {processing ? "Logging in..." : "Login"}
                            </button>

                        </form>

                        {/* BACK BUTTON */}
                        <Link
                            href="/rooms/list"
                            className="block text-center mt-4 text-sm text-gray-500 hover:text-teal-600 transition"
                        >
                            ← Schedule Meeting
                        </Link>

                    </div>
                </div>
            </div>
        </>
    );
}