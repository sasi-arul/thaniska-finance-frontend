import { useState, useEffect } from "react";
import api from "../utils/api";

export default function Investment() {
  const today = new Date().toISOString().split("T")[0];

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [source, setSource] = useState("owner");
  const [date, setDate] = useState(today);
  const [history, setHistory] = useState([]);
  const [editId, setEditId] = useState(null);

  const fetchInvestments = async () => {
    const res = await api.get("/investments");
    setHistory(res.data);
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleSubmit = async () => {
    if (!amount) return alert("Enter amount");

    if (editId) {
      await api.put(`/investments/${editId}`, {
        amount,
        note,
        source,
        date,
      });
      setEditId(null);
    } else {
      await api.post("/investments", {
        amount,
        note,
        source,
        date,
        
      });
    }

    setAmount("");
    setNote("");
    setSource("owner");
    fetchInvestments();
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setAmount(item.amount);
    setNote(item.note);
    setSource(item.source || item.type || "owner");
    setDate(item.date?.split("T")[0]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this investment?")) return;
    await api.delete(`/investments/${id}`);
    fetchInvestments();
  };

  const resetForm = () => {
    setAmount("");
    setNote("");
    setSource("owner");
    setDate(today);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071b2f] to-[#020c18] text-white p-6">

      <h1 className="text-3xl font-bold text-emerald-400 mb-6">
        Investment Management
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Form */}
        <div className="bg-[#0f2236] rounded-2xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-emerald-300">
            {editId ? "Edit Investment" : "Add Investment"}
          </h2>

          <div className="space-y-4">

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="investment-date-input w-full p-3 rounded-lg bg-[#081521] border border-gray-600"
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#081521] border border-gray-600"
            />

            <input
              placeholder="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#081521] border border-gray-600"
            />

            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#081521] border border-gray-600"
            >
              <option value="owner">Owner</option>
              <option value="reinvest_profit">Reinvest Profit</option>
              <option value="reinvest_collection_principal">
                Reinvest Collection Principal
              </option>
              <option value="reinvest_collection_interest">
                Reinvest Collection Interest
              </option>
            </select>

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 rounded-lg font-semibold text-black"
            >
              {editId ? "Update Investment" : "Save Investment"}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="bg-[#0f2236] rounded-2xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-emerald-300">
            Investment History
          </h2>

          <div className="space-y-3 max-h-[450px] overflow-y-auto">
            {history.map((item) => {
  const currentSource = (item.source || item.type || "owner").trim().toLowerCase();
  const sourceLabelMap = {
    owner: "Owner",
    reinvest: "Reinvest Profit",
    reinvest_profit: "Reinvest Profit",
    reinvest_collection_principal: "Reinvest Collection Principal",
    reinvest_collection_interest: "Reinvest Collection Interest",
  };
  const sourceLabel = sourceLabelMap[currentSource] || "Owner";
  const isOwner = currentSource === "owner";

  return (

              <div
                key={item._id}
                className="bg-[#081521] p-4 rounded-lg border border-gray-700"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-emerald-400 font-semibold">
                      ₹{item.amount}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                        isOwner
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {sourceLabel}
                    </span>
                    <p className="text-gray-400 text-sm">{item.note}</p>
                  </div>

                  <div className="flex gap-2">
                    {/* <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 bg-blue-500 rounded text-sm"
                    >
                      Edit
                    </button> */}
                    <button
  onClick={() => {
    setAmount(item.amount);
    setNote(item.note);
    setSource(item.source || item.type || "owner");
    setEditId(item._id);
  }}
  className="bg-blue-500 px-3 py-1 rounded"
>
  Edit
</button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-3 py-1 bg-red-500 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
             );
})}
          </div>

        </div>
      </div>
    </div>
  );
}
