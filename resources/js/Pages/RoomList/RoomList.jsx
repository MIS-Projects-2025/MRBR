import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import Modal from "@/Components/Modal";

export default function RoomList({ tableData, tableFilters }) {
    const [showModal, setShowModal] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const [selectedRow, setSelectedRow] = useState(null);

    const [form, setForm] = useState({
        id: null,
        name: "",
        location: "",
        description: "",
        image: null,
        preview: null,
    });

    // CREATE / UPDATE HANDLERS
    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
            [e.target.location]: e.target.value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        setForm((prev) => ({
            ...prev,
            image: file,
            preview: file ? URL.createObjectURL(file) : null,
        }));
    };

    // CREATE
const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("location", form.location);
    formData.append("description", form.description);
    if (form.image) formData.append("image", form.image);

    router.post(route("room.list.store"), formData, {
        forceFormData: true,

        onSuccess: () => {
            setShowModal(false);
            setForm({ name: "", description: "", image: null, preview: null });

            alert("✅ Room created successfully!");
        },

        onError: (errors) => {
            alert("❌ Failed to create room. Please check inputs.");
            console.log(errors);
        },
    });
};

const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    router.delete(route("room.list.destroy", id), {
        preserveScroll: true,

        onSuccess: () => {
            alert("🗑️ Room deleted successfully!");
        },

        onError: () => {
            alert("❌ Failed to delete room.");
        },
    });
};

    // OPEN VIEW
    const openView = (row) => {
        setSelectedRow(row);
        setViewOpen(true);
    };

    // OPEN EDIT
    const openEdit = (row) => {
        setForm({
            id: row.id,
            name: row.name,
            location: row.location,
            description: row.description,
            image: null,
            preview: null,
        });

        setEditOpen(true);
    };

    const tableDatasWithActions = tableData.data.map((row) => ({
        ...row,
        actions: (
            <div className="flex gap-2">
                <button
                    onClick={() => openView(row)}
                    className="px-3 py-1 text-white bg-gray-600 rounded hover:bg-gray-700"
                >
                    <i className="fa-solid fa-eye"></i>
                </button>

                <button
                    onClick={() => openEdit(row)}
                    className="px-3 py-1 text-white bg-teal-600 rounded hover:bg-teal-700"
                >
                    <i className="fa-solid fa-pen"></i>
                </button>

                 {/* DELETE BUTTON */}
            <button
                onClick={() => handleDelete(row.id)}
                className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700"
            >
                <i className="fa-solid fa-trash"></i>
            </button>
            </div>
        ),
    }));

    return (
        <AuthenticatedLayout>
            <Head title="Room List" />

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-teal-600">
                    <i className="fa-solid fa-people-roof"></i> Room List
                </h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 text-white bg-teal-600 rounded-lg shadow hover:bg-teal-700"
                >
                    + New Room
                </button>
            </div>

            {/* TABLE */}
            <DataTable
                columns={[
                    { key: "name", label: "Room Name" },
                    { key: "location", label: "Location" },
                    { key: "description", label: "Description" },
                    { key: "actions", label: "Actions" },
                ]}
                data={tableDatasWithActions}
                meta={{
                    from: tableData.from,
                    to: tableData.to,
                    total: tableData.total,
                    links: tableData.links,
                    currentPage: tableData.current_page,
                    lastPage: tableData.last_page,
                }}
                routeName={route("room.list.index")}
                filters={tableFilters}
                rowKey="id"
                showExport={false}
            />

            {/* ================= CREATE MODAL ================= */}
{showModal && (
    <Modal
    show={showModal}
    title="New Room"
    size="md"
    onClose={() => setShowModal(false)}
>
        <form onSubmit={handleSubmit} className="space-y-5">

            {/* ROOM NAME */}
            <div>
                <label className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-600">
                    <i className="fa-solid fa-door-open text-teal-600"></i>
                    Room Name
                </label>

                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter room name"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
            </div>

            {/* Lcoation */}
            <div>
                <label className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-600">
                    <i className="fa-solid fa-location-dot text-teal-600"></i>
                    Location
                </label>

                <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Enter Location"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
            </div>

            {/* IMAGE */}
            <div>
                <label className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-600">
                    <i className="fa-solid fa-image text-teal-600"></i>
                    Room Image
                </label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded-lg"
                />
            </div>

            {/* PREVIEW */}
            {form.preview && (
                <div className="p-2 border rounded-lg bg-gray-50">
                    <img
                        src={form.preview}
                        className="object-cover w-full rounded-lg h-52"
                    />
                    <p className="mt-2 text-xs text-gray-500">Image Preview</p>
                </div>
            )}

            {/* DESCRIPTION */}
            <div>
                <label className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-600">
                    <i className="fa-solid fa-align-left text-teal-600"></i>
                    Description
                </label>

                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter room description"
                    rows="4"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
            </div>

            {/* BUTTON */}
            <button className="flex items-center justify-center w-full gap-2 py-3 text-white transition bg-teal-600 rounded-lg hover:bg-teal-700">
                <i className="fa-solid fa-floppy-disk"></i>
                Save Room
            </button>
        </form>
    </Modal>
)}

            {/* ================= VIEW MODAL ================= */}
{viewOpen && selectedRow && (
    <Modal
    show={viewOpen}
    title="Room Details"
    size="lg"
    onClose={() => setViewOpen(false)}
>
        
        {/* IMAGE CARD */}
        <div className="overflow-hidden border rounded-xl">
 <img
    src={`/rooms/${selectedRow.image}`}
    className="object-contain w-full h-84 bg-gray-100"
/>
        </div>

        {/* CONTENT */}
        <div className="mt-4 space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
                <i className="mr-2 text-teal-600 fa-solid fa-door-open"></i>
                {selectedRow.name}
            </h2>

            <h2 className="text-1xl font-bold text-gray-800">
                <i className="mr-2 text-teal-600 fa-solid fa-location-dot"></i>
                {selectedRow.location}
            </h2>

            <p className="text-sm leading-relaxed text-gray-600">
                {selectedRow.description}
            </p>
        </div>
    </Modal>
)}

            {/* ================= EDIT MODAL ================= */}
{editOpen && (
   <Modal
    show={editOpen}
    title="Update Room"
    size="lg"
    onClose={() => setEditOpen(false)}
>
        <form
            onSubmit={(e) => {
                e.preventDefault();

                const formData = new FormData();
                formData.append("name", form.name);
                formData.append("location", form.location);
                formData.append("description", form.description);

                if (form.image) {
                    formData.append("image", form.image);
                }

                router.post(
                    route("room.list.update", form.id),
                    formData,
                    { forceFormData: true }
                );

                setEditOpen(false);
            }}
            className="space-y-5"
        >

            {/* NAME */}
            <div>
                <label className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-600">
                    <i className="fa-solid fa-pen text-teal-600"></i>
                    Room Name
                </label>

                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
            </div>

            {/* Location */}
            <div>
                <label className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-600">
                    <i className="fa-solid fa-location-dot text-teal-600"></i>
                    Location
                </label>

                <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
            </div>

            {/* IMAGE UPLOAD */}
            <div>
                <label className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-600">
                    <i className="fa-solid fa-image text-teal-600"></i>
                    Change Image
                </label>

                <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded-lg"
                />
            </div>

            {/* IMAGE PREVIEW */}
            <div className="border rounded-lg bg-gray-50">
                <img
                    src={
                        form.preview
                            ? form.preview
                            : selectedRow?.image
                            ? `/rooms/${selectedRow.image}`
                            : "/placeholder.png"
                    }
                    className="object-contain w-full h-72 rounded-lg"
                />
                <p className="p-2 text-xs text-gray-500">
                    Current / New Image Preview
                </p>
            </div>

            {/* DESCRIPTION */}
            <div>
                <label className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-600">
                    <i className="fa-solid fa-align-left text-teal-600"></i>
                    Description
                </label>

                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
            </div>

            {/* BUTTON */}
            <button className="flex items-center justify-center w-full gap-2 py-3 text-white bg-teal-600 rounded-lg hover:bg-teal-700">
                <i className="fa-solid fa-rotate"></i>
                Update Room
            </button>
        </form>
    </Modal>
)}
        </AuthenticatedLayout>
    );
}

/* SIMPLE MODAL COMPONENT */
// function Modal({ title, children, onClose }) {
//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//             <div className="w-full max-w-md p-5 bg-white rounded-lg shadow-lg">
//                 <div className="flex justify-between mb-3">
//                     <h2 className="text-lg font-bold text-teal-600">
//                         {title}
//                     </h2>

//                     <button onClick={onClose}><i className="fa-solid fa-xmark text-teal-600 hover:text-teal-700"></i></button>
//                 </div>

//                 {children}
//             </div>
//         </div>
//     );
// }