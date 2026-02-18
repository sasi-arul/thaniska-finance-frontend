import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      alert("Password changed successfully");
      navigate("/", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-black text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 shadow-2xl shadow-emerald-500/20"
      >
        <h1 className="text-3xl font-bold text-emerald-400 mb-2">Change Password</h1>
        <p className="text-slate-300 mb-6">Update your login password</p>

        <div className="space-y-4">
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            placeholder="Current password"
            required
            className="w-full p-3 rounded-lg bg-black/40 border border-white/20"
          />
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="New password"
            required
            minLength={6}
            className="w-full p-3 rounded-lg bg-black/40 border border-white/20"
          />
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            required
            minLength={6}
            className="w-full p-3 rounded-lg bg-black/40 border border-white/20"
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              type="submit"
              disabled={loading}
              className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold disabled:opacity-60"
            >
              {loading ? "Saving..." : "Update"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="py-3 rounded-xl bg-white/10 border border-white/20"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
