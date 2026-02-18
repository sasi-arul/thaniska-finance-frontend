import { useState, useEffect } from "react";
import api from "../utils/api";

export default function Expense() {
  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("office");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editId, setEditId] = useState(null);

  // ✅ Fetch expenses
  const fetchExpenses = async () => {
    const res = await api.get("/expenses");
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ✅ Submit expense
  const handleSubmit = async () => {
    if (!title || !amount) return alert("Enter required fields");

    const data = { title, amount, category, date, note };

    if (editId) {
      await api.put(`/expenses/${editId}`, data);
      setEditId(null);
    } else {
      await api.post("/expenses", data);
    }

    resetForm();
    fetchExpenses();
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setTitle(item.title);
    setAmount(item.amount);
    setCategory(item.category);
    setDate(item.date?.split("T")[0]);
    setNote(item.note);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    await api.delete(`/expenses/${id}`);
    fetchExpenses();
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("office");
    setDate(today);
    setNote("");
  };

  // ✅ Filter Logic
  const filteredExpenses =
    filter === "all"
      ? expenses
      : expenses.filter((e) => e.category === filter);

  const totalExpense = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071b2f] to-[#020c18] text-white p-6">
      <h1 className="text-3xl font-bold text-red-400 mb-6">
        Expense Management
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        {/* FORM */}
        <div className="bg-[#0f2236] p-6 rounded-2xl border border-gray-700 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-300">
            {editId ? "Edit Expense" : "Add Expense"}
          </h2>

          <div className="space-y-3">

            <input
              type="text"
              placeholder="Expense title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#081521] border border-gray-600"
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#081521] border border-gray-600"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#081521] border border-gray-600"
            >
              <option value="office">Office</option>
              <option value="salary">Salary</option>
              <option value="travel">Travel</option>
              <option value="utilities">Utilities</option>
              <option value="legal">Legal</option>
              <option value="misc">Misc</option>
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#081521] border border-gray-600"
            />

            <input
              placeholder="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#081521] border border-gray-600"
            />

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-red-500 hover:bg-red-400 rounded-lg font-semibold text-black"
            >
              {editId ? "Update Expense" : "Save Expense"}
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="bg-[#0f2236] p-6 rounded-2xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-red-300">
              Expense History
            </h2>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#081521] border border-gray-600 p-2 rounded"
            >
              <option value="all">All</option>
              <option value="office">Office</option>
              <option value="salary">Salary</option>
              <option value="travel">Travel</option>
              <option value="utilities">Utilities</option>
              <option value="legal">Legal</option>
              <option value="misc">Misc</option>
            </select>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {filteredExpenses.map((item) => (
              <div
                key={item._id}
                className="bg-[#081521] p-4 rounded-lg border border-gray-700"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-red-400 font-semibold">
                      ₹{item.amount}
                    </p>

                    <p className="text-sm text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </p>

                    {/* CATEGORY BADGE */}
                    <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">
                      {item.category}
                    </span>

                    <p className="text-gray-400 text-sm mt-1">
                      {item.title}
                    </p>

                    {item.note && (
                      <p className="text-gray-500 text-xs">
                        {item.note}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 bg-blue-500 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-3 py-1 bg-red-600 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="mt-4 text-right font-semibold text-lg text-red-400">
            Total: ₹{totalExpense}
          </div>
        </div>
      </div>
    </div>
  );
}
