import { useState, useEffect } from "react";
import api from "../utils/api";

export default function ProfitAllocation() {
  const [profit, setProfit] = useState(0);
  const [reinvest, setReinvest] = useState("");
  const [expense, setExpense] = useState("");

  useEffect(() => {
    const loadProfit = async () => {
      const res = await api.get("/stats");
      setProfit(res.data.availableProfit);
    };
    loadProfit();
  }, []);

  const submitAllocation = async () => {
    try {
      await api.post("/profit/allocate", {
        reinvestAmount: reinvest,
        expenseAmount: expense
      });

      alert("Allocation saved");
      setReinvest("");
      setExpense("");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-emerald-400 mb-6 text-center">
          Profit Allocation
        </h2>

        <div className="mb-4 text-center">
          <p className="text-slate-400">Available Profit</p>
          <h1 className="text-3xl font-bold text-emerald-400">
            ₹{profit}
          </h1>
        </div>

        <input
          type="number"
          placeholder="Reinvest Amount"
          value={reinvest}
          onChange={(e) => setReinvest(e.target.value)}
          className="w-full p-3 mb-3 rounded bg-slate-800 border border-slate-700"
        />

        <input
          type="number"
          placeholder="Expense Amount"
          value={expense}
          onChange={(e) => setExpense(e.target.value)}
          className="w-full p-3 mb-5 rounded bg-slate-800 border border-slate-700"
        />

        <button
          onClick={submitAllocation}
          className="w-full bg-emerald-500 hover:bg-emerald-600 p-3 rounded font-semibold"
        >
          Allocate Profit
        </button>
      </div>
    </div>
  );
}
