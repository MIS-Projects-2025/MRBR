import React, { useState } from "react";
import axios from "axios";

export default function RawDataUpload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

   const handleImport = async () => {
    if (!selectedFile) {
        alert("Please select a file first.");
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsLoading(true);
    setAlertMessage(null);

    try {
        const response = await axios.post("/raw-data/import", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
            },
        });

        if (response.data.success) {
            setAlertType("success");
            setAlertMessage(response.data.message);
            setSelectedFile(null);
        }

    } catch (error) {
        console.error(error); // 🔹 log full error

        // fallback message if response undefined
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to import file.";

        setAlertType("error");
        setAlertMessage(message);
    } finally {
        setIsLoading(false);
    }
};

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4">Upload Excel/CSV File</h2>

            {alertMessage && (
                <div
                    className={`mb-4 p-3 rounded ${
                        alertType === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    {alertMessage}
                </div>
            )}

            <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={isLoading}
                className="mb-4"
            />

            {selectedFile && (
                <p className="mb-2">Selected file: {selectedFile.name}</p>
            )}

            <button
                onClick={handleImport}
                disabled={!selectedFile || isLoading}
                className={`px-4 py-2 rounded text-white ${
                    isLoading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                }`}
            >
                {isLoading ? "Importing..." : "Upload & Import"}
            </button>
        </div>
    );
}