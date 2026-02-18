import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import CollectionBox from "../components/CollectionBox";

export default function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("authUser") || "admin";

  const handleAddCollection = async (data) => {
    try {
      await api.post("/collections", data);
      alert("Collection saved");
    } catch (err) {
      alert("Failed to save collection");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/login");
  };

  const navButtons = [
    { label: "Add Investment", path: "/investment" },
    { label: "Add Expense", path: "/expenses" },
    { label: "Create Loan", path: "/loans/create-loan" },
    { label: "View Loans", path: "/loans" },
    { label: "Status", path: "/status" },
    { label: "Collection Report", path: "/collection-report" },
    { label: "Weekly Pending List", path: "/weekly-pending-collections" },
    { label: "Monthly Pending List", path: "/monthly-pending-collections" },
    { label: "Fire Pending List", path: "/fire-pending-collections" },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-6 lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-72 lg:shrink-0">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 lg:sticky lg:top-6">
            <h1 className="text-3xl font-bold text-emerald-400">Dashboard</h1>
            <p className="mt-2 text-slate-400">Welcome {username}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/change-password")}
                className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg bg-red-500/80 text-sm font-semibold"
              >
                Logout
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {navButtons.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-all text-left"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-6">
            {[
              { type: "daily", label: "Daily Collection" },
              { type: "weekly", label: "Weekly Collection" },
              { type: "monthly", label: "Monthly Collection" },
              { type: "fire", label: "Fire Interest" },
            ].map((box) => (
              <CollectionBox
                key={box.type}
                title={box.label}
                type={box.type}
                onAdd={handleAddCollection}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
