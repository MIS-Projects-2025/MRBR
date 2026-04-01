import { router, usePage } from "@inertiajs/react";

export default function NavBar() {
    const { emp_data } = usePage().props;

    // Logout function
   const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
window.location.reload();
    router.post(route('logout')); // POST request to Laravel
};

    // Greeting function
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <nav className="">
            <div className="px-4 mx-auto sm:px-6 lg:px-8 bg-teal-600">
                <div className="flex justify-end h-[50px]">
                    <div className="items-center hidden mr-5 space-x-1 font-semibold md:flex">
                        <div className="dropdown dropdown-end">
                            <div
                                tabIndex={0}
                                role="button"
                                className="flex items-center m-1 space-x-2 cursor-pointer select-none text-white"
                            >
                                {/* <img
                                    src={`http://192.168.3.201/Training/uploads/CerfificationPicture/${emp_data?.emp_id}.jpg`}
                                    alt="profile"
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                     e.target.src = "/default-avatar.png"; // fallback image
                                    }}
                                /> */}
                                <span className="mt-[3px]">
                                    Hello {getGreeting()}, {emp_data?.emp_firstname || "User"}
                                </span>
                                <i className="fa-solid fa-caret-down text-2xl"></i>
                            </div>

                            <ul
                                tabIndex={0}
                                className="p-2 shadow-md dropdown-content menu rounded-box w-52 bg-teal-600 z-10"
                            >
                                <li className="text-white">
                                    <a href={route("profile.index")} className="flex items-center space-x-2">
                                        <i className="fa-regular fa-id-card"></i>
                                        <span className="mt-[3px]">Profile</span>
                                    </a>
                                </li>
                                <li className="text-white">
                                    <button onClick={logout} className="flex items-center space-x-2 w-full text-left">
                                        <i className="fa-regular fa-share-from-square"></i>
                                        <span className="mt-[3px]">Log out</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
