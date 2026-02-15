"use client";
import { passwordReset } from "@/src/services/auth";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ForgotPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token");
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!resetToken) {
      setError("Invalid reset token.");
      return;
    }

    try {
      const result = await passwordReset(resetToken, newPassword);
      if (result.success) {
        setSuccess("Password has been reset successfully.");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        redirect();
      } else {
        setError(result.message);
      }
    } catch {
      setError("An error occurred while resetting password.");
    }
  };

  const redirect = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    router.push("/auth/login");
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">New Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
