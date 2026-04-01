import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Key } from "lucide-react";

export default function Profile({ profile, emp_data }) {
    const { props } = usePage();
    const { errors, flash } = props;
    const successMessage = flash?.success;

    const [password, setPassword] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    const [passwordForm, setPasswordForm] = useState(false);

    const handleChangePassword = () => {
        router.post(route("changePassword"), password, {
            preserveScroll: true,
            onSuccess: () => {
                router.get(route("logout"), {}, {
                    onFinish: () => {
                        window.location.href = route("login");
                    },
                });
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="My Profile" />

            <div className="max-w-5xl mx-auto p-6 space-y-8">
                {/* HEADER */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-500 via-neutral-500 to-gray-500 p-8 text-white shadow-xl">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                             <img
                                    src={`http://192.168.3.201/Training/uploads/CerfificationPicture/${emp_data?.emp_id}.jpg`}
                                    alt="profile"
                                    className="w-24 h-24 rounded-full object-cover"
                                    onError={(e) => {
                                     e.target.src = "/default-avatar.png"; // fallback image
                                    }}
                                />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {profile?.EMPNAME}
                            </h1>
                            <p className="text-white/80">
                                {profile?.JOB_TITLE} • {profile?.DEPARTMENT}
                            </p>
                        </div>
                    </div>
                </div>

                {/* INFO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoCard label="Production Line" value={profile?.PRODLINE} />
                    <InfoCard label="Station" value={profile?.STATION} />
                    <InfoCard label="Email Address" value={profile?.EMAIL} />
                </div>

                {/* SECURITY */}
                <div className="rounded-3xl bg-white shadow-xl border p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">🔐 Security</h2>
                        <button
                            onClick={() => setPasswordForm(!passwordForm)}
                            className={`px-4 py-2 rounded-lg font-semibold ${
                                passwordForm
                                    ? "bg-red-500 text-white"
                                    : "bg-indigo-500 text-white"
                            }`}
                        >
                            {passwordForm ? "Cancel" : "Change Password"}
                        </button>
                    </div>

                    {passwordForm && (
                        <div className="space-y-5">
                            <PasswordInput
                                label="Current Password"
                                value={password.current_password}
                                onChange={(v) =>
                                    setPassword({ ...password, current_password: v })
                                }
                                error={errors.current_password}
                            />

                            <PasswordInput
                                label="New Password"
                                value={password.new_password}
                                onChange={(v) =>
                                    setPassword({ ...password, new_password: v })
                                }
                                error={errors.new_password}
                            />

                            <PasswordInput
                                label="Confirm New Password"
                                value={password.new_password_confirmation}
                                onChange={(v) =>
                                    setPassword({
                                        ...password,
                                        new_password_confirmation: v,
                                    })
                                }
                                error={errors.new_password_confirmation}
                            />

                            <button
                                onClick={handleChangePassword}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold flex items-center justify-center gap-2"
                            >
                                <Key size={20} />
                                Update Password
                            </button>

                            {successMessage && (
                                <div className="p-3 rounded-xl bg-green-100 text-green-800 font-semibold">
                                    ✅ {successMessage}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/* ================== SMALL REUSABLE COMPONENTS ================== */

function InfoCard({ label, value }) {
    return (
        <div className="p-4 rounded-2xl bg-white shadow border">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="font-semibold text-gray-800">{value || "—"}</div>
        </div>
    );
}

function PasswordInput({ label, value, onChange, error }) {
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <input
                type="password"
                className="w-full mt-1 border rounded-lg p-2"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {error && (
                <div className="text-sm text-red-600 mt-1">{error}</div>
            )}
        </div>
    );
}