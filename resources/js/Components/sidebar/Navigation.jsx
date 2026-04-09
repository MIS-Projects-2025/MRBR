import Dropdown from "@/Components/sidebar/Dropdown";
import SidebarLink from "@/Components/sidebar/SidebarLink";
import { usePage } from "@inertiajs/react";

export default function NavLinks() {
    const { emp_data } = usePage().props;
    return (
        <nav
            className="flex flex-col flex-grow space-y-1 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
        >
            <SidebarLink
                href={route("dashboard")}
                label="Dashboard"
                icon={<i className="fa-solid fa-dashboard"></i>}
            />

            <SidebarLink
                href={route("rooms.index")}
                label="Reservation Schedule"
                icon={<i className="fa-solid fa-people-roof"></i>}
            />

         {["superadmin", "admin"].includes(emp_data?.emp_role) && (
            <div>
            <SidebarLink
                href={route("schedule.list.index")}
                label="Reservations"
                icon={<i className="fa-solid fa-book"></i>}
            />

            <SidebarLink
                href={route("room.list.index")}
                label="Room List"
                icon={<i className="fa-solid fa-people-roof"></i>}
            />
            </div>
            )}
            
            

            
            
            {/* {["superadmin"].includes(emp_data?.emp_role) && (
                <div>
                    <Dropdown
                        label="Maintenance"
                        icon={<i className="fa-solid fa-wrench"></i>}
                        links={[
                            { href: route("machine.status.index"), label: "Machine Status" },
                            { href: route("helper.index"), label: "Machine Helper" },
                        ]}
                    />
                </div>
            )} */}

            {["superadmin", "admin"].includes(emp_data?.emp_role) && (
                <div>
                    <SidebarLink
                        href={route("admin")}
                        label="Administrators"
                        icon={<i className="fa-solid fa-users"></i>}
                        // notifications={5}
                    />
                </div>
            )}
        </nav>
    );
}
