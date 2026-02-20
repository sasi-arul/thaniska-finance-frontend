import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

export default function Ledger() {
  const { partyName } = useParams();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const fetchLedger = async () => {
    try {
      const normalizedParty = (partyName || "").trim().toLowerCase();
      const res = await api.get(`/collections/ledger/${normalizedParty}`);
      setCollections(res.data.collections || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      console.error("Failed to fetch ledger", err);
      setCollections([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!partyName) return;
    fetchLedger();
  }, [partyName]);

  const handleEditCollection = async (item) => {
    const newAmount = window.prompt("Enter new amount", item.amount);
    if (newAmount === null) return;

    const newDate = window.prompt(
      "Enter new date (YYYY-MM-DD)",
      item.date ? new Date(item.date).toISOString().split("T")[0] : ""
    );
    if (newDate === null) return;

    try {
      await api.put(`/collections/${item._id}`, {
        amount: Number(newAmount),
        date: newDate,
      });
      fetchLedger();
    } catch (error) {
      console.error("Failed to update collection", error.response?.data || error.message);
      alert("Failed to update collection");
    }
  };

  const handleDeleteCollection = async (id) => {
    if (!window.confirm("Delete this collection?")) return;
    try {
      await api.delete(`/collections/${id}`);
      fetchLedger();
    } catch (error) {
      console.error("Failed to delete collection", error.response?.data || error.message);
      alert("Failed to delete collection");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-slate-950 text-white">
      <h1 className="text-3xl text-center font-bold text-emerald-400 mb-6">
        Ledger - {partyName}
      </h1>

      {summary && (
        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-4xl bg-[#0f172a]/80 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-yellow-400 mb-6 text-center">Loan Summary</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-slate-400 text-sm">Disbursed Amount</p>
                <h4 className="text-lg font-semibold text-white">Rs {summary.loanAmount}</h4>
              </div>

              <div>
                <p className="text-slate-400 text-sm">Total Payable</p>
                <h4 className="text-lg font-semibold text-white">Rs {summary.totalPayable}</h4>
              </div>

              <div>
                <p className="text-slate-400 text-sm">Total Paid</p>
                <h4 className="text-lg font-semibold text-emerald-400">Rs {summary.totalPaid}</h4>
              </div>

              <div>
                <p className="text-slate-400 text-sm">Remaining Balance</p>
                <h4 className="text-lg font-semibold text-red-400">Rs {summary.remainingBalance}</h4>
              </div>

              <div>
                <p className="text-slate-400 text-sm">Collection Type</p>
                <h4 className="text-lg font-semibold text-white capitalize">{summary.collectionType}</h4>
              </div>

              <div>
                <p className="text-slate-400 text-sm">Installment</p>
                <h4 className="text-lg font-semibold text-white">Rs {summary.installmentAmount}</h4>
              </div>
            </div>
          </div>
        </div>
      )}

      <br />

      <div className="overflow-x-auto">
        <table className="w-full border border-white/10 rounded-xl overflow-hidden">
          <thead className="bg-white/10">
            <tr>
              <th className="p-3 text-left w-20">S.No</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-right">Amount (Rs)</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              collections.map((item, index) => (
                <tr key={item._id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="p-3 text-right font-semibold text-emerald-400">Rs {item.amount}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      {/* <button
                        onClick={() => handleEditCollection(item)}
                        className="px-3 py-1 rounded bg-blue-500 text-sm"
                      >
                        Edit
                      </button> */}
                      <button
                        onClick={() => handleDeleteCollection(item._id)}
                        className="px-3 py-1 rounded bg-red-500 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && collections.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-slate-400">
                  No collections found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
