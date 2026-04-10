import React from "react";
import { motion } from "framer-motion";

export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 text-white">
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-3xl p-[2px] max-w-md w-full overflow-hidden"
      >
        {/* Rotating Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 animate-spin-slow" />

        {/* Card Content */}
        <div className="relative bg-gray-900/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 text-center">

          {/* Illustration */}
          <motion.img
            src="/maintenance.svg"
            alt="Maintenance Illustration"
            className="w-40 mx-auto mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Title */}
          <h1 className="text-3xl font-semibold mb-2 tracking-wide text-red-400 animate-pulse">
            Sorry, This Page is Under Maintenance...
          </h1>

          {/* Subtitle */}
          <p className="text-gray-300 mb-6 text-sm leading-relaxed text-red-300 animate-pulse">
            We are currently performing maintenance.<br />
            Our services will be restored shortly.
          </p>

          {/* Loading Bar */}
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-blue-300 rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            {/* <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-white text-black rounded-xl font-medium hover:opacity-90 transition"
            >
              Refresh
            </button> */}

            <button
              onClick={() => (window.location.href = "/")}
              className="px-5 py-2 border-2 border-teal-500 text-teal-500 rounded-xl font-medium hover:bg-teal-500 hover:text-white transition"
            >
             <i className="fa-solid fa-home"></i> Return Home
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-sky-300 mt-6">
            Thank you for your patience. We apologize for any inconvenience caused.
          </p>

        </div>
      </motion.div>
    </div>
  );
}