import { useForm, Head, Link } from "@inertiajs/react";
import { useState } from "react";
import InputError from "@/Components/InputError";

export default function Login({ redirect }) {
    const { data, setData, post, processing, errors } = useForm({
        employeeID: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 via-white to-gray-200 p-4">

                {/* CARD */}
                <div className="w-full max-w-md backdrop-blur-lg bg-white/80 border border-white/40 shadow-2xl rounded-3xl overflow-hidden">

                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-6 text-center">
                        <div className="flex justify-center mb-2">
                            <div className="bg-white/20 p-3 rounded-full">
                                <i className="fa-solid fa-calendar-check text-2xl"></i>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold">
                            Welcome Back 👋
                        </h1>

                        <p className="text-sm text-white/80 mt-1">
                            Meeting Room Reservation System
                        </p>
                    </div>

                    {/* FORM */}
                    <div className="p-6 space-y-5">

                        {/* GENERAL ERROR */}
                        {errors.general && (
                            <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg text-center">
                                {errors.general}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">

                            <input type="hidden" name="redirect" value={redirect} />

                            {/* Employee ID */}
                            <div className="relative">
                                <label className="text-xs text-gray-500">
                                    Employee ID
                                </label>

                                <div className="relative">
                                    <i className="fa-solid fa-id-card absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

                                    <input
                                        type="text"
                                        value={data.employeeID}
                                        onChange={(e) =>
                                            setData("employeeID", e.target.value)
                                        }
                                        className="w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-teal-700 outline-none transition"
                                        placeholder="Enter your ID"
                                    />
                                </div>

                                <InputError message={errors.employeeID} />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <label className="text-xs text-gray-500">
                                    Password
                                </label>

                                <div className="relative">
                                    <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        className="w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-teal-700 outline-none transition"
                                        placeholder="Enter your password"
                                    />

                                    {/* TOGGLE */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600"
                                    >
                                        <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                    </button>
                                </div>

                                <InputError message={errors.password} />
                            </div>

                            {/* BUTTON */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200 active:scale-95 disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <i className="fa-solid fa-spinner animate-spin"></i>
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-right-to-bracket"></i>
                                        Login
                                    </>
                                )}
                            </button>
                        </form>

                        {/* FOOTER */}
                        {/* <div className="text-center text-sm text-gray-500">
                            <Link
                                href="/rooms/list"
                                className="hover:text-teal-600 transition"
                            >
                                ← Go to Meeting Schedule
                            </Link>
                        </div> */}
                    </div>
                </div>
            </div>
        </>
    );
}