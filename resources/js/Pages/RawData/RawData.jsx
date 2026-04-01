import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import { useState } from "react";
import { Eye, Pencil, FileSpreadsheet } from "lucide-react";

export default function RawData({ tableData, tableFilters, emp_data }) {

const [file, setFile] = useState(null);
const [showModal, setShowModal] = useState(false);
const [loading, setLoading] = useState(false);

const [selectedRow, setSelectedRow] = useState(null);
const [viewOpen, setViewOpen] = useState(false);
const [editOpen, setEditOpen] = useState(false);

const [formData, setFormData] = useState({});
const [saving, setSaving] = useState(false);

    const downloadTemplate = () => {
        window.open(route("raw_data.template"), "_blank");
    };


// fields config
const fields = [
{label:"WW", key:"ww"},
{label:"Date", key:"date"},
{label:"Factory", key:"factory"},
{label:"Product Line", key:"productline"},
{label:"Platform", key:"platform"},
{label:"Model", key:"model"},
{label:"Package", key:"package"},
{label:"Status Code", key:"status_code"},
{label:"Equipment ID", key:"machine"},
{label:"Sub Code", key:"sub_code"},
{label:"Percentage", key:"percentage"},
{label:"Hours", key:"hours"},
{label:"OCC", key:"occ"},
{label:"WW %", key:"ww_percentage"},
{label:"Target EA", key:"target_ea"},
{label:"Actual EA", key:"actual_ea"},
];

let uploadMusic = new Audio("/images/uploading.mp3");

// 🔊 Uploading Voice
const speakUploading = () => {

  const msg = new SpeechSynthesisUtterance(
    "Please wait. Your data is being uploaded."
  );

  msg.rate = 1;
  msg.pitch = 1;
  msg.volume = 1;

  // kapag tapos magsalita AI
  msg.onend = () => {
    uploadMusic.loop = true;
    uploadMusic.play();
  };

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
};

const stopUploadingMusic = () => {
  uploadMusic.pause();
  uploadMusic.currentTime = 0;
};

// ✅ Success Voice
const speakSuccess = () => {

  const msg = new SpeechSynthesisUtterance(
    "Upload completed successfully."
  );

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
};


// ❌ Error Voice
const speakError = () => {

  const msg = new SpeechSynthesisUtterance(
    "Upload failed. Please check your file and try again."
  );

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
};


// IMPORT CSV
const handleImport = () => {

  const form = new FormData();
  form.append("file", file);

  setLoading(true);

  // speakUploading();

  router.post(route("raw_data.import"), form, {

    forceFormData: true,

    onSuccess: () => {

      // stopUploadingMusic();
      // speakSuccess();

      alert("✅ Upload completed successfully.");

      setShowModal(false);
      setLoading(false);

      window.location.reload();
    },

    onError: () => {

      // stopUploadingMusic();
      // speakError();

      alert("❌ Upload failed. Please check your file and try again.");

      setLoading(false);
    }

  });

};


// OPEN EDIT
const openEdit = (row) => {
setSelectedRow(row);
setFormData(row);
setEditOpen(true);
};


// SAVE EDIT
const handleSave = () => {

setSaving(true);

router.put(route("raw_data.update", selectedRow.id), formData, {

onSuccess: () => {
alert("✅ Updated Successfully");
setEditOpen(false);
setSaving(false);
window.location.reload();
},

onError: () => {
alert("❌ Update Failed");
setSaving(false);
}

});

};


// ACTION BUTTONS
const rawDatasWithActions = tableData.data.map((row) => ({
...row,
actions: (

<div className="flex gap-2">

<button
onClick={() => {
setSelectedRow(row);
setViewOpen(true);
}}
className="bg-gray-500 px-3 py-1 rounded hover:bg-gray-600 text-white"
>
<i className="fa-solid fa-eye"></i> View
</button>

<button
onClick={() => openEdit(row)}
className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 text-white"
>
<i className="fa-solid fa-edit"></i> Edit
</button>

</div>

),
}));




return (

<AuthenticatedLayout>

<Head title="Raw Data" />

<div className="flex items-center justify-between mb-4">

<h1 className="text-2xl font-bold text-gray-500">
<i className="fa-solid fa-file-half-dashed"></i> Raw Data
</h1>

{["admin"].includes(emp_data?.emp_role) &&(

<button
onClick={() => setShowModal(true)}
className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
>
<i className="fa-solid fa-download"></i> Upload Data
</button>

)}

</div>


<DataTable
columns={[
{ key: "ww", label: "WW" },
{ key: "date", label: "Date" },
{ key: "factory", label: "Factory" },
{ key: "productline", label: "PL" },
{ key: "platform", label: "Platform" },
{ key: "model", label: "Model" },
{ key: "package", label: "Package" },
{ key: "status_code", label: "Status Code" },
{ key: "machine", label: "Eqpt. ID" },
{ key: "sub_code", label: "Sub Code" },
{ key: "percentage", label: "Percent" },
{ key: "hours", label: "Hrs" },
{ key: "occ", label: "OCC" },
{ key: "ww_percentage", label: "WW %" },
{ key: "actual_ea", label: "Actual EA" },
{ key: "target_ea", label: "Target EA" },
{ key: "actions", label: "Actions" },
]}

data={rawDatasWithActions}

meta={{
from: tableData.from,
to: tableData.to,
total: tableData.total,
links: tableData.links,
currentPage: tableData.current_page,
lastPage: tableData.last_page,
}}

routeName={route("raw_data.index")}
filters={tableFilters}
rowKey="id"
showExport={false}
/>

{showModal && (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

<div className="bg-white rounded-xl shadow-xl w-[640px] p-6 animate-fadeIn">

{/* Header */}
<div className="flex items-center gap-2 mb-4">
<i className="fas fa-file-upload text-green-600 text-xl"></i>
<h2 className="text-lg font-semibold text-gray-700">
Upload Raw Data
</h2>
</div>

{/* File Input */}
<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-3 hover:border-green-500 transition">

<i className="fas fa-file-csv text-3xl text-green-500 mb-2"></i>

<p className="text-sm text-gray-600 mb-2">
Select a CSV file to import raw data
</p>

<input
type="file"
accept=".csv"
disabled={loading}
onChange={(e) => setFile(e.target.files[0])}
className="block w-full text-sm text-gray-600
file:mr-3 file:py-2 file:px-4
file:rounded-md file:border-0
file:bg-green-600 file:text-white
hover:file:bg-green-700"
/>

                  </div>
                  {/* Download Template */}
                    <div className="flex justify-start vb/ v.ghjgvv'hVjflgim-4">
                        <button
                            className="btn btn-outline btn-sm"
                            disabled={loading}
                            onClick={downloadTemplate}
                        >
                            <FileSpreadsheet size={18} /> Download Template
                        </button>
                    </div>

{/* Note */}
<p className="text-xs text-red-600 mb-4 flex items-center gap-2">
<i className="fas fa-info-circle text-red-600"></i>Note: Only <span className="font-semibold"><i className="fas fa-file-csv"></i> CSV files</span> are allowed !
</p>

{/* Buttons */}
<div className="flex justify-end gap-3">

<button
onClick={() => setShowModal(false)}
disabled={loading}
className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
>
<i className="fas fa-times"></i>
Cancel
</button>

<button
onClick={handleImport}
disabled={loading || !file}
className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
>
{loading ? (
<>
<i className="fas fa-spinner fa-spin"></i>
Uploading...
</>
) : (
<>
<i className="fas fa-cloud-upload-alt"></i>
Import Data
</>
)}
</button>

</div>

</div>
</div>
)}




{/* VIEW DRAWER */}
{viewOpen && (
  <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">

    <div className="w-[640px] h-full bg-white shadow-2xl flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">

        <div className="flex items-center gap-3">

          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            <Eye size={18} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              View Details
            </h2>
            <p className="text-xs text-slate-500">
              Record information preview
            </p>
          </div>

        </div>

        <button
          onClick={() => setViewOpen(false)}
          className="text-red-500 hover:text-red-600 text-lg"
        >
         <i className="fa-solid fa-xmark"></i>
        </button>

      </div>


      {/* Content */}
      <div className="p-6 grid grid-cols-2 gap-x-6 gap-y-5 text-sm flex-1 overflow-y-auto">

        {fields.map((f) => (
          <div key={f.key} className="space-y-1">

            <p className="text-xs text-slate-400 uppercase tracking-wide">
              {f.label}
            </p>

            <p className="font-medium text-slate-800 bg-slate-50 px-3 py-2 rounded">
              {selectedRow?.[f.key] || "-"}
            </p>

          </div>
        ))}

      </div>

      <div className="p-5 border-t flex justify-end">
        <button
          onClick={() => setViewOpen(false)}
          className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
        >
          <i className="fas fa-times"></i> Close
        </button>
      </div>

    </div>
  </div>
)}



{/* EDIT DRAWER */}
{editOpen && (
  <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">

    <div className="w-[640px] h-full bg-white shadow-2xl flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-blue-50">

        <div className="flex items-center gap-3">

          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            <Pencil size={18} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Edit Data
            </h2>
            <p className="text-xs text-slate-500">
              Update record information
            </p>
          </div>

        </div>

        <button
          onClick={() => setEditOpen(false)}
          className="text-red-500 hover:text-red-600 text-lg"
        >
          <i className="fas fa-times"></i>
        </button>

      </div>


      {/* Form */}
      <div className="p-6 grid grid-cols-2 gap-x-6 gap-y-5 flex-1 overflow-y-auto">

        {fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1">

            <label className="text-xs text-slate-500 uppercase tracking-wide">
              {f.label}
            </label>

            <input
              className={`
                border border-slate-300
                rounded-md
                px-3 py-2
                text-sm
                focus:ring-2 focus:ring-blue-500
                focus:border-blue-500
                outline-none
                ${["ww", "date", "status_code", "platform", "model", "sub_code", "percentage", "hours", "occ", "ww_percentage"].includes(f.key) ? "bg-gray-100" : "bg-white"}
              `}
              value={formData?.[f.key] || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [f.key]: e.target.value,
               })
             }
             readOnly={["ww", "date", "status_code", "platform", "model", "sub_code", "percentage", "hours", "occ", "ww_percentage"].includes(f.key)}
            />

          </div>
        ))}

      </div>


      <div className="px-6 py-4 border-t flex justify-end gap-3">

        <button
          onClick={() => setEditOpen(false)}
          className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
        >
         <i className="fa-solid fa-times"></i> Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="
            px-4 py-2
            rounded-md
            bg-green-600
            text-white
            hover:bg-green-700
            disabled:opacity-50
            transition
            disabled:cursor-not-allowed
          "
        >
          <i className="fa-solid fa-floppy-disk"></i> {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </div>
  </div>
)}

</AuthenticatedLayout>

);
}