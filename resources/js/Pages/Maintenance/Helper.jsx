import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import Drawer from "@/Components/Drawer";
import { useState } from "react";
import { Select, message, Button } from "antd";


export default function Helper({ 
    tableData, 
    tableFilters, 
    emp_data, 
    machines = [], 
    machineModel = [],
    machinePlatform = [],
    packages = [] }) {

    const machineOptions = (machines ?? [])
    .filter(mc => mc.machine_num)
    .map(mc => ({
        label: mc.machine_num,
        value: mc.machine_num,
    }));

    

    const packageOptions = (packages ?? [])
    .filter(p => p.package_type)
    .map(p => ({
        label: p.package_type,
        value: p.package_type,
    }));
    

    const factoryOptions = [
    { value: "F1", label: "F1" },
    { value: "F2", label: "F2" },
    { value: "F3", label: "F3" },
    ];

    const modelOptions = [...new Set((machines ?? [])
    .map(m => m.model)
    .filter(Boolean))].map(model => ({
        label: model,
        value: model
    }));

    const productlineOptions = [
    { value: "PL1", label: "PL1" },
    { value: "PL2", label: "PL2" },
    { value: "PL3", label: "PL3" },
    { value: "PL4", label: "PL4" },
    { value: "PL6", label: "PL6" },
    ];

    const platformOptions = [...new Set((machines ?? [])
    .map(pf => pf.platform)
    .filter(Boolean))].map(platform => ({
        label: platform,
        value: platform
    }));

    const initialForm = {
        machine: "",
        package: "",
        factory: "",
        model: "",
        productline: "",
        platform: "",
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

        router.post(route("helper.store"), form, {
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
    router.put(route("helper.update", selectedItem.id), {
        ...form,
    }, {
        preserveScroll: true,
        onSuccess: () => {
            alert("✅ Helper item updated.");
            setShowEditModal(false);

            // reset form
            setForm({
                machine: "",
                package: "",
                factory: "",
                model: "",
                productline: "",
                platform: ""
            });
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
                            setForm({ machine: r.machine, package: r.package, factory: r.factory, model: r.model, productline: r.productline, platform: r.platform });
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
                   <i className="fa-brands fa-yelp"></i> Machine Helper
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
                    
                    { key: "machine", label: "Equipment" },
                    { key: "package", label: "Sub Status" },
                    { key: "factory", label: "Factory" },
                    { key: "model", label: "Model" },
                    { key: "productline", label: "Product Line" },
                    { key: "platform", label: "Platform" },
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
                routeName={route("helper.index")}
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
                title={<div className="text-xl font-bold text-emerald-600">New Machine Helper</div>}
            >
                <form onSubmit={handleSave} className="p-6 space-y-4">

                <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Machine</label>
                    <Select
                        placeholder="Select Machine"
                        options={machineOptions}
                        value={form.machine}
                        onChange={(value) =>
                        setForm({ ...form, machine: value })
                        }
                        className="w-full p-2 border rounded-md border-gray-500"
                        showSearch
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Package Type</label>
                    <Select
                        placeholder="Select Package"
                        options={packageOptions}
                        value={form.package}
                        onChange={(value) =>
                        setForm({ ...form, package: value })
                        }
                        className="w-full p-2 border rounded-md border-gray-500"
                        showSearch
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Factory</label>
                    <Select
                        placeholder="Select Factory"
                        options={factoryOptions}
                        value={form.factory}
                        onChange={(value) =>
                        setForm({ ...form, factory: value })
                        }
                        className="w-full p-2 border rounded-md border-gray-500"
                        showSearch
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Model</label>
                    <Select
                        placeholder="Select Model"
                        options={modelOptions}
                        value={form.model}
                        onChange={(value) =>
                        setForm({ ...form, model: value })
                        }
                        className="w-full p-2 border rounded-md border-gray-500"
                        showSearch
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Product Line</label>
                    <Select
                        placeholder="Select Product Line"
                        options={productlineOptions}
                        value={form.productline}
                        onChange={(value) =>
                        setForm({ ...form, productline: value })
                        }
                        className="w-full p-2 border rounded-md border-gray-500"
                        showSearch
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Platform</label>
                    <Select
                        placeholder="Select Product Line"
                        options={platformOptions}   
                        value={form.platform}
                        onChange={(value) =>
                        setForm({ ...form, platform: value })
                        }
                        className="w-full p-2 border rounded-md border-gray-500"
                        showSearch
                    />
                </div>

                    

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

                    <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Machine</label>
                    <Select
                        placeholder="Select Machine"
                        options={machineOptions}
                        value={form.machine}
                        onChange={(value) =>
                        setForm({ ...form, machine: value })
                        }
                        className="w-full p-2 border rounded-md border-gray-500"
                        showSearch
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Package Type</label>
                    <Select
                        placeholder="Select Package"
                        options={packageOptions}
                        value={form.package}
                        onChange={(value) =>
                        setForm({ ...form, package: value })
                        }
                        className="w-full p-2 border rounded-md border-gray-500"
                        showSearch
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Factory</label>
                    <Select
                        placeholder="Select Factory"
                        options={factoryOptions}
                        value={form.factory}
                        onChange={(value) =>
                        setForm({ ...form, factory: value })
                        }
                        className="w-full p-2 border rounded-md border-gray-500"
                        showSearch
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Model</label>
                    <Select
                        placeholder="Select Model"
                        options={modelOptions}
                        value={form.model}
                        onChange={(value) =>
                        setForm({ ...form, model: value })
                        }
                        className="w-full p-2 border rounded-md border-gray-500"
                        showSearch
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Product Line</label>
                    <Select
                        placeholder="Select Product Line"
                        options={productlineOptions}
                        value={form.productline}
                        onChange={(value) =>
                        setForm({ ...form, productline: value })
                        }
                        className="w-full p-2 border rounded-md border-gray-500"
                        showSearch
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Platform</label>
                    <Select
                        placeholder="Select Product Line"
                        options={platformOptions}   
                        value={form.platform}
                        onChange={(value) =>
                        setForm({ ...form, platform: value })
                        }
                        className="w-full p-2 border rounded-md border-gray-500"
                        showSearch
                    />
                </div>

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