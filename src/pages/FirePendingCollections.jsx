import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

const DAY_MS = 24 * 60 * 60 * 1000;

const toStartOfDay = (value) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const addDays = (value, days) => {
  const date = toStartOfDay(value);
  date.setDate(date.getDate() + days);
  return date;
};

const formatDate = (value) => toStartOfDay(value).toLocaleDateString("en-IN");
const round2 = (value) => Math.round(value * 100) / 100;

export default function FirePendingCollections() {
  const [fireLoans, setFireLoans] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [loanRes, collectionRes] = await Promise.all([
        api.get("/loans", { params: { collectionType: "fire" } }),
        api.get("/collections"),
      ]);

      const loans = Array.isArray(loanRes.data)
        ? loanRes.data
        : Array.isArray(loanRes.data.loans)
          ? loanRes.data.loans
          : [];

      const collections = Array.isArray(collectionRes.data?.collections)
        ? collectionRes.data.collections
        : [];

      setFireLoans(loans);
      setAllCollections(collections);
    } catch (error) {
      console.error("Failed to fetch fire pending data", error);
      setFireLoans([]);
      setAllCollections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingRows = useMemo(() => {
    const today = toStartOfDay(new Date());

    const fireCollectionsByLoan = allCollections
      .filter((entry) => entry.collectionType === "fire")
      .reduce((acc, entry) => {
        const key = entry.loanNo;
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push(entry);
        return acc;
      }, {});

    return fireLoans
      .map((loan) => {
        const loanDate = toStartOfDay(loan.date);
        const daysSinceLoan = Math.floor((today - loanDate) / DAY_MS);
        const cycleDays = Math.max(Number(loan.duration || 0), 1);
        const dueInstallments = daysSinceLoan >= cycleDays ? Math.floor(daysSinceLoan / cycleDays) : 0;

        const loanCollections = fireCollectionsByLoan[loan.loanNumber] || [];
        const paidInstallments = loanCollections.filter(
          (entry) => Number(entry.principalPaid || 0) === 0
        ).length;

        const pendingInstallments = Math.max(dueInstallments - paidInstallments, 0);
        const fireInterestPerCycle = round2(
          (Number(loan.amount || 0) * Number(loan.interestRate || 0)) / 100
        );
        const pendingAmount = round2(pendingInstallments * fireInterestPerCycle);

        return {
          id: loan._id,
          loanNumber: loan.loanNumber,
          partyName: loan.partyName,
          loanDate,
          cycleDays,
          dueInstallments,
          paidInstallments,
          pendingInstallments,
          fireInterestPerCycle,
          pendingAmount,
          nextDueDate: addDays(loanDate, (paidInstallments + 1) * cycleDays),
          status: loan.status || "active",
        };
      })
      .filter((item) => item.pendingInstallments > 0 && item.status !== "closed")
      .sort((a, b) => {
        if (b.pendingInstallments !== a.pendingInstallments) {
          return b.pendingInstallments - a.pendingInstallments;
        }
        return a.nextDueDate - b.nextDueDate;
      });
  }, [fireLoans, allCollections]);

  const totals = useMemo(() => {
    return pendingRows.reduce(
      (acc, row) => {
        acc.pendingLoans += 1;
        acc.pendingInstallments += row.pendingInstallments;
        acc.pendingAmount += row.pendingAmount;
        return acc;
      },
      { pendingLoans: 0, pendingInstallments: 0, pendingAmount: 0 }
    );
  }, [pendingRows]);

  return (
    <div className="min-h-screen p-6 bg-slate-950 text-white">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400">Fire Pending Collection</h1>
          <p className="text-slate-300 mt-1">
            Rule: Fire interest due every configured cycle days (for example every 10 days).
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-slate-300 text-sm">Pending Loans</p>
          <h2 className="text-2xl font-bold text-emerald-300">{totals.pendingLoans}</h2>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-slate-300 text-sm">Pending Cycles</p>
          <h2 className="text-2xl font-bold text-yellow-300">{totals.pendingInstallments}</h2>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-slate-300 text-sm">Pending Interest</p>
          <h2 className="text-2xl font-bold text-red-300">Rs {round2(totals.pendingAmount)}</h2>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full">
          <thead className="bg-white/10">
            <tr>
              <th className="p-3 text-left">Loan No</th>
              <th className="p-3 text-left">Party Name</th>
              <th className="p-3 text-center">Loan Date</th>
              <th className="p-3 text-center">Cycle Days</th>
              <th className="p-3 text-center">Due</th>
              <th className="p-3 text-center">Paid</th>
              <th className="p-3 text-center">Pending</th>
              <th className="p-3 text-center">Interest/Cycle</th>
              <th className="p-3 text-center">Pending Interest</th>
              <th className="p-3 text-center">Next Due Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="p-6 text-center text-slate-300">
                  Loading...
                </td>
              </tr>
            ) : pendingRows.length > 0 ? (
              pendingRows.map((row) => (
                <tr key={row.id} className="border-t border-white/10">
                  <td className="p-3 font-mono">{row.loanNumber}</td>
                  <td className="p-3">{row.partyName}</td>
                  <td className="p-3 text-center">{formatDate(row.loanDate)}</td>
                  <td className="p-3 text-center">{row.cycleDays}</td>
                  <td className="p-3 text-center">{row.dueInstallments}</td>
                  <td className="p-3 text-center">{row.paidInstallments}</td>
                  <td className="p-3 text-center text-red-300 font-bold">{row.pendingInstallments}</td>
                  <td className="p-3 text-center">Rs {row.fireInterestPerCycle}</td>
                  <td className="p-3 text-center text-red-300">Rs {row.pendingAmount}</td>
                  <td className="p-3 text-center">{formatDate(row.nextDueDate)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="p-6 text-center text-slate-300">
                  No pending fire collections found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
