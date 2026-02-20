import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function LoanList() {
  const [loans, setLoans] = useState([]);
  const navigate = useNavigate();

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return "";
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
      const origin = new URL(apiBase, window.location.origin).origin;
      const normalizedPath = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
      return `${origin}${normalizedPath}`;
    } catch {
      return fileUrl;
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    const res = await api.get("/loans");

    const data = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data.loans)
        ? res.data.loans
        : [];

    setLoans(data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this loan?")) return;
    await api.delete(`/loans/${id}`);
    fetchLoans();
  };

  return (
    <div className="min-h-screen p-6 bg-slate-950 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-emerald-400">Loans</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-white/10 rounded-xl overflow-hidden">
          <thead className="bg-white/10">
            <tr>
              <th className="p-3 text-left">Photo</th>
              <th className="p-3 text-left">Loan No</th>
              <th className="p-3 text-left">Party</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Collection Type</th>
              <th className="p-3">Proof</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loans.map((loan) => (
              <tr key={loan._id} className="border-t border-white/10">
                <td className="p-3">
                  {loan.photoUrl ? (
                    <img
                      src={getFileUrl(loan.photoUrl)}
                      alt={`${loan.partyName || "Party"} photo`}
                      className="h-12 w-12 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs text-slate-300">
                      N/A
                    </div>
                  )}
                </td>
                <td className="p-3 font-mono">{loan.loanNumber}</td>
                <td
                  className="p-3 text-emerald-400 cursor-pointer underline"
                  onClick={() => navigate(`/ledger/${loan.partyName}`)}
                >
                  {loan.partyName}
                </td>
                <td className="p-3 text-center">Rs {loan.amount}</td>
                <td className="p-3 text-center capitalize">{loan.collectionType || "N/A"}</td>
                <td className="p-3 text-center">
                  {loan.proofUrl ? (
                    <a
                      href={getFileUrl(loan.proofUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-300 underline"
                    >
                      Open
                    </a>
                  ) : (
                    <span className="text-slate-400">N/A</span>
                  )}
                </td>
                <td
                  className={`p-3 text-center capitalize font-semibold ${
                    loan.status === "closed" ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {loan.status || "active"}
                </td>
                <td className="p-3 flex gap-2 justify-center">
                  <button
                    onClick={() => navigate(`/loans/edit/${loan._id}`)}
                    className="px-4 py-2 rounded-lg bg-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(loan._id)}
                    className="px-4 py-2 rounded-lg bg-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-slate-400">
                  No loans found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
