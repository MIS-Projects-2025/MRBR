import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import Drawer from "@/Components/Drawer";
import { useState } from "react";
import { Select, message, Button } from "antd";


export default function MachineStatus({ tableData, tableFilters, emp_data }) {

    const initialForm = {
        status_code: "",
        sub_code: "",
    };

    const [form, setForm] = useState(initialForm);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(route("machine.status.store"), form, {
            preserveScroll: true,
            onSuccess: () => {
                message.success("Data saved successfully!");
                setShowAddModal(false);
                setForm(initialForm);
                window.location.reload();
            },
            onFinish: () => setProcessing(false),
        });
    };

const handleUpdate = () => {
    router.put(route("machine.status.update", selectedItem.id), {
        ...form,
    }, {
        preserveScroll: true,
        onSuccess: () => {
            alert("✅ Machine Status item updated.");
            setShowEditModal(false);

            // reset form
            setForm({
                status_code: "",
                sub_code: "" }); 
            window.location.reload(); // refresh page
        },
        onError: (errors) => {
            console.log(errors); // optional: show errors inline
        }
    });
};

    const dataWithAction = tableData.data.map((r) => {

        return {
            ...r,
            action: (
                <div className="flex gap-2">
                    <button
                        className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        onClick={() => {
                            setSelectedItem(r);
                            setForm({ status_code: r.status_code, sub_code: r.sub_code });
                            setShowEditModal(true);
                        }}
                    >
                        <i className="fas fa-edit"></i> Edit
                    </button>
                </div>
            ),
        };
    });

    return (
        <AuthenticatedLayout>
            <Head title="Machine Status" />

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-500 hover:text-gray-600">
                    <i className="fa-solid fa-m"></i>achine <i className="fa-solid fa-s"></i>tatus
                </h1>

                    <button
                        className="text-white bg-gray-500 border-gray-900 btn hover:bg-gray-700"
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="fa-solid fa-plus"></i> New Status
                    </button>
            </div>

            <DataTable
                columns={[
                    
                    { key: "status_code", label: "Status Code" },
                    { key: "sub_code", label: "Sub Status" },
                    { key: "action", label: "Action" },
                ]}
                data={dataWithAction}
                meta={{
                    from: tableData.from,
                    to: tableData.to,
                    total: tableData.total,
                    links: tableData.links,
                    currentPage: tableData.current_page,
                    lastPage: tableData.last_page,
                }}
                routeName={route("machine.status.index")}
                filters={tableFilters}
                rowKey="id"
                showExport={false}
            />

            {/* create machine status modal */}
             <Drawer
                show={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    window.location.reload();
                }}
                placement="right"
                size="30%"
                title={<div className="text-xl font-bold text-emerald-600">New Machine Status</div>}
            >
                <form onSubmit={handleSave} className="p-6 space-y-4">

                    <input
                        type="text"
                        name="status_code"
                        placeholder="Status Code"
                        value={form.status_code}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />

                    <input
                        type="text"
                        name="sub_code"
                        placeholder="Sub Status"
                        value={form.sub_code}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />

                    <Button
                        type="primary"
                        style={{ backgroundColor: "#38a700", borderWidth: 2, borderColor: "#389e0d", fontWeight: "bold" }}
                        className="w-full p-4 hover:bg-green-600 flex items-center justify-center gap-2"
                        htmlType="submit"
                        loading={processing}
                        block
                    >
                       <i className="fa-solid fa-floppy-disk"></i> Save
                    </Button>
                </form>
            </Drawer>

            {/* edit machine status modal */}
             <Drawer
                show={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    window.location.reload();
                }}
                placement="right"
                size="30%"
                title={<div className="text-xl font-bold text-blue-600">Update Machine Status</div>}
            >
                <form onSubmit={handleUpdate} className="p-6 space-y-4">

                    <input
                        type="text"
                        name="status_code"
                        placeholder="Status Code"
                        value={form.status_code}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />

                    <input
                        type="text"
                        name="sub_code"
                        placeholder="Sub Status"
                        value={form.sub_code}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />

                    <Button
                        type="primary"
                        style={{ backgroundColor: "#224aff", borderWidth: 2, borderColor: "#0d179e", fontWeight: "bold" }}
                        className="w-full p-4 hover:bg-blue-600 flex items-center justify-center gap-2"
                        htmlType="submit"
                        loading={processing}
                        block
                    >
                       <i className="fa-regular fa-bookmark"></i> Update
                    </Button>
                </form>
            </Drawer>

        </AuthenticatedLayout>
    );
}