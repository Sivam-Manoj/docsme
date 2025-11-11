"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 1500, // Faster on mobile
        style: {
          background: "#fff",
          color: "#333",
          border: "1px solid #e5e7eb",
          padding: "12px 16px",
          borderRadius: "12px",
          fontSize: "14px",
          maxWidth: "90vw",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        },
        success: {
          duration: 1500, // Quick success messages
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
          },
        },
        error: {
          duration: 2000, // Slightly longer for errors
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
        loading: {
          duration: Infinity, // Loading stays until dismissed
        },
      }}
      containerStyle={{
        top: 80, // Below navbar
      }}
    />
  );
}
