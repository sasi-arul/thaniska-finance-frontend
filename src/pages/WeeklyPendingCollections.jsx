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

export default function WeeklyPendingCollections() {
  const [weeklyLoans, setWeeklyLoans] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [loanRes, collectionRes] = await Promise.all([
        api.get("/loans", { params: { collectionType: "weekly" } }),
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

      setWeeklyLoans(loans);
      setAllCollections(collections);
    } catch (error) {
      console.error("Failed to fetch weekly pending data", error);
      setWeeklyLoans([]);
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

    const weeklyCollectionsByLoan = allCollections
      .filter((entry) => entry.collectionType === "weekly")
      .reduce((acc, entry) => {
        const key = entry.loanNo;
        if (!key) return acc;

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(entry);
        return acc;
      }, {});

    return weeklyLoans
      .map((loan) => {
        const loanDate = toStartOfDay(loan.date);
        const daysSinceLoan = Math.floor((today - loanDate) / DAY_MS);

        // Saturday-to-Saturday weekly cycle (first collection after 1 week).
        const dueInstallments = daysSinceLoan >= 7 ? Math.floor(daysSinceLoan / 7) : 0;

        const loanCollections = weeklyCollectionsByLoan[loan.loanNumber] || [];
        const paidInstallments = loanCollections.length;

        const pendingInstallments = Math.max(dueInstallments - paidInstallments, 0);
        const installmentAmount = Number(loan.installmentAmount || 0);
        const expectedPendingAmount = round2(pendingInstallments * installmentAmount);

        const totalCollected = loanCollections.reduce(
          (sum, entry) => sum + Number(entry.amount || 0),
          0
        );
        const remainingBalance = Math.max(
          Number(loan.totalPayable || 0) - totalCollected,
          0
        );

        return {
          id: loan._id,
          loanNumber: loan.loanNumber,
          partyName: loan.partyName,
          loanDate,
          dueInstallments,
          paidInstallments,
          pendingInstallments,
          installmentAmount: round2(installmentAmount),
          pendingAmount: round2(Math.min(expectedPendingAmount, remainingBalance)),
          nextDueDate: addDays(loanDate, (paidInstallments + 1) * 7),
          remainingBalance: round2(remainingBalance),
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
  }, [weeklyLoans, allCollections]);

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
          <h1 className="text-3xl font-bold text-emerald-400">Weekly Pending Collection</h1>
          <p className="text-slate-300 mt-1">
            Rule: Weekly loans are due every Saturday cycle (8-day count, inclusive).
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
          <p className="text-slate-300 text-sm">Pending Installments</p>
          <h2 className="text-2xl font-bold text-yellow-300">{totals.pendingInstallments}</h2>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-slate-300 text-sm">Pending Amount</p>
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
              <th className="p-3 text-center">Due</th>
              <th className="p-3 text-center">Paid</th>
              <th className="p-3 text-center">Pending</th>
              <th className="p-3 text-center">Installment</th>
              <th className="p-3 text-center">Pending Amount</th>
              <th className="p-3 text-center">Next Due Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="p-6 text-center text-slate-300">
                  Loading...
                </td>
              </tr>
            ) : pendingRows.length > 0 ? (
              pendingRows.map((row) => (
                <tr key={row.id} className="border-t border-white/10">
                  <td className="p-3 font-mono">{row.loanNumber}</td>
                  <td className="p-3">{row.partyName}</td>
                  <td className="p-3 text-center">{formatDate(row.loanDate)}</td>
                  <td className="p-3 text-center">{row.dueInstallments}</td>
                  <td className="p-3 text-center">{row.paidInstallments}</td>
                  <td className="p-3 text-center text-red-300 font-bold">{row.pendingInstallments}</td>
                  <td className="p-3 text-center">Rs {row.installmentAmount}</td>
                  <td className="p-3 text-center text-red-300">Rs {row.pendingAmount}</td>
                  <td className="p-3 text-center">{formatDate(row.nextDueDate)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="p-6 text-center text-slate-300">
                  No pending weekly collections found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
