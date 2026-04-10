import { useForm, Head } from "@inertiajs/react";
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

            <div className="min-h-screen flex bg-gray-100">

                {/* LEFT SIDE - GIF */}
                <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden
    bg-gradient-to-br from-teal-500 via-gray-50 to-gray-50">

    {/* SOFT GLOW EFFECT */}
    <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl top-[-100px] left-[-100px]"></div>
    <div className="absolute w-[400px] h-[400px] bg-emerald-300/10 rounded-full blur-3xl bottom-[-100px] right-[-100px]"></div>

    {/* CONTENT */}
    <img
        src="/calendar.svg"
        alt="Calendar"
        className="w-5/6 h-5/8 max-w-md drop-shadow-2xl z-10"
    />

    {/* TEXT */}
    <div className="absolute bottom-20 text-center text-teal-700 px-6 z-10">
        <h2 className="text-3xl font-bold font-Georgia mb-2">
            Meeting Room Reservation System
        </h2>
        <p className="text-xl text-teal-700 font-Georgia">
            Manage your meetings efficiently
        </p>
    </div>
</div>

                {/* RIGHT SIDE - FORM */}
                <div className="flex w-full md:w-3/4 items-center justify-center p-6">

                    <div className="relative w-full max-w-lg p-[2px] rounded-3xl overflow-hidden">
    
    {/* Rotating Border */}
    <div className="absolute inset-0 bg-gradient-to-r from-teal-300 via-sky-300 to-teal-300 animate-spin-slow" />

    {/* Card Content */}
    <div className="relative bg-teal-100/90 backdrop-blur-xl shadow-2xl rounded-3xl p-10 border-2 border-teal-100">

    {/* HEADER */}
    <div className="mb-8 text-center space-y-1">
        <h2 className="text-4xl font-extrabold text-teal-700 tracking-wide">
           MRRS
        </h2>

        <h1 className="text-3xl font-bold text-teal-800">
            Welcome Back 👋
        </h1>

        <p className="text-base text-teal-600 font-medium">
            Login to your account
        </p>
    </div>

    {/* ERROR */}
    {errors.general && (
        <div className="mb-5 p-3 text-sm text-red-600 bg-red-100 rounded-lg text-center">
            {errors.general}
        </div>
    )}

    <form onSubmit={submit} className="space-y-5">

        <input type="hidden" name="redirect" value={redirect} />

        {/* Employee ID */}
        <div>
            <label className="text-sm text-gray-500">
                Employee ID
            </label>

            <div className="relative mt-2">
                <i className="fa-solid fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>

                <input
                    type="text"
                    value={data.employeeID}
                    onChange={(e) =>
                        setData("employeeID", e.target.value)
                    }
                    className="w-full pl-11 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-teal-700"
                    placeholder="Enter your ID Number"
                />
            </div>

            <InputError message={errors.employeeID} />
        </div>

        {/* Password */}
        <div>
            <label className="text-sm text-gray-500">
                Password
            </label>

            <div className="relative mt-2">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>

                <input
                    type={showPassword ? "text" : "password"}
                    value={data.password}
                    onChange={(e) =>
                        setData("password", e.target.value)
                    }
                    className="w-full pl-11 pr-11 py-3.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-teal-700"
                    placeholder="Enter your password"
                />

                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600"
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
            className="w-full bg-teal-600 text-white py-3.5 rounded-xl text-lg font-semibold hover:bg-teal-700 transition active:scale-95 disabled:opacity-50"
        >
            <i className="fa-solid fa-sign-in-alt mr-2"></i>
            {processing ? "Logging in..." : "Login"}
        </button>
    </form>
        </div>

</div>
                </div>
            </div>
        </>
    );
}