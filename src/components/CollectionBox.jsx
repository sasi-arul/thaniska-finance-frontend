import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

function CollectionBox({ title, type, onAdd }) {
  const [loanNo, setLoanNo] = useState("");
  const [partyName, setPartyName] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingParty, setLoadingParty] = useState(false);
  const [loanDetails, setLoanDetails] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMode, setPaymentMode] = useState("regular");

  const supportsCloseMode =
    type === "monthly" || type === "weekly" || type === "daily" || type === "fire";

  useEffect(() => {
    setPaymentMode("regular");
  }, [type]);

  useEffect(() => {
    if (!loanNo) {
      setPartyName("");
      setLoanDetails(null);
      return;
    }

    const fetchLoan = async () => {
      try {
        setLoadingParty(true);
        const res = await api.get(`/loans/by-loan-no/${loanNo}`);
        setLoanDetails(res.data || null);
        setPartyName(res.data?.partyName || "");
      } catch (err) {
        setLoanDetails(null);
        setPartyName("");
      } finally {
        setLoadingParty(false);
      }
    };

    fetchLoan();
  }, [loanNo]);

  const monthlyMetrics = useMemo(() => {
    if (!loanDetails) {
      return {
        monthlyInterest: 0,
        dailyInstallment: 0,
        weeklyInstallment: 0,
        fireCycleInterest: 0,
        fireCycleDays: 0,
        remainingPrincipal: 0,
      };
    }

    const principalBase = Number(loanDetails.amount || 0);
    const alreadyPaidPrincipal = Number(loanDetails.principalPaid || 0);
    const remainingPrincipal = Math.max(principalBase - alreadyPaidPrincipal, 0);
    const rate = Number(loanDetails.interestRate || 0);
    const monthlyInterest = (principalBase * rate) / 100;
    const dailyInstallment = Number(loanDetails.installmentAmount || 0);
    const weeklyInstallment = Number(loanDetails.installmentAmount || 0);
    const fireCycleInterest = (principalBase * rate) / 100;
    const fireCycleDays = Number(loanDetails.duration || 0);

    return {
      monthlyInterest: Math.round(monthlyInterest * 100) / 100,
      dailyInstallment: Math.round(dailyInstallment * 100) / 100,
      weeklyInstallment: Math.round(weeklyInstallment * 100) / 100,
      fireCycleInterest: Math.round(fireCycleInterest * 100) / 100,
      fireCycleDays,
      remainingPrincipal: Math.round(remainingPrincipal * 100) / 100,
    };
  }, [loanDetails]);

  useEffect(() => {
    if (!loanDetails) return;

    if (paymentMode === "close") {
      setAmount(String(monthlyMetrics.remainingPrincipal || ""));
    } else if (type === "monthly") {
      setAmount(String(monthlyMetrics.monthlyInterest || ""));
    } else if (type === "daily") {
      setAmount(String(monthlyMetrics.dailyInstallment || ""));
    } else if (type === "weekly") {
      setAmount(String(monthlyMetrics.weeklyInstallment || ""));
    } else if (type === "fire") {
      setAmount(String(monthlyMetrics.fireCycleInterest || ""));
    }
  }, [
    type,
    paymentMode,
    loanDetails,
    monthlyMetrics.monthlyInterest,
    monthlyMetrics.dailyInstallment,
    monthlyMetrics.weeklyInstallment,
    monthlyMetrics.fireCycleInterest,
    monthlyMetrics.remainingPrincipal,
  ]);

  const splitPreview = useMemo(() => {
    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0 || !loanDetails) {
      return { principalPaid: 0, interestPaid: 0 };
    }

    const principalBase = Number(loanDetails.amount || loanDetails.loanAmount || 0);
    const alreadyPaidPrincipal = Number(loanDetails.principalPaid || 0);
    const remainingPrincipal = Math.max(principalBase - alreadyPaidPrincipal, 0);
    const rate = Number(loanDetails.interestRate || 0);
    const ratio = 1 + rate / 100;
    const round2 = (value) => Math.round(value * 100) / 100;

    let principalPaid = paymentAmount;
    let interestPaid = 0;

    if (supportsCloseMode && paymentMode === "close") {
      principalPaid = Math.min(paymentAmount, remainingPrincipal);
      interestPaid = paymentAmount - principalPaid;
    } else if (type === "monthly" || type === "fire") {
      principalPaid = 0;
      interestPaid = paymentAmount;
    } else if (ratio > 0) {
      principalPaid = paymentAmount / ratio;
      interestPaid = paymentAmount - principalPaid;
    }

    principalPaid = Math.min(principalPaid, remainingPrincipal);
    interestPaid = paymentAmount - principalPaid;

    return {
      principalPaid: round2(principalPaid),
      interestPaid: round2(interestPaid),
    };
  }, [amount, loanDetails, paymentMode, supportsCloseMode, type]);

  const handleSubmit = () => {
    const paymentAmount = Number(amount);

    if (!loanNo || !partyName || !Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      alert("Enter valid Loan Number and Amount");
      return;
    }

    if (supportsCloseMode && paymentMode === "close" && paymentAmount < monthlyMetrics.remainingPrincipal) {
      alert(`Closing amount must be at least Rs ${monthlyMetrics.remainingPrincipal}`);
      return;
    }

    onAdd({
      type,
      paymentMode: supportsCloseMode ? paymentMode : undefined,
      loanNo,
      partyName,
      amount: paymentAmount,
      date,
      principalPaid: splitPreview.principalPaid,
      interestPaid: splitPreview.interestPaid,
    });

    if (type === "monthly" && paymentMode === "regular") {
      setAmount(String(monthlyMetrics.monthlyInterest || ""));
    } else if (type === "daily" && paymentMode === "regular") {
      setAmount(String(monthlyMetrics.dailyInstallment || ""));
    } else if (type === "weekly" && paymentMode === "regular") {
      setAmount(String(monthlyMetrics.weeklyInstallment || ""));
    } else if (type === "fire" && paymentMode === "regular") {
      setAmount(String(monthlyMetrics.fireCycleInterest || ""));
    } else {
      setAmount("");
    }
  };

  return (
    <div
      className="
      bg-white/10 backdrop-blur-xl
      border border-white/20
      rounded-2xl p-6
      shadow-lg
    "
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold text-emerald-400">{title || type}</h2>
        {/* <span className="text-l text-yellow-300 uppercase tracking-wider">{type}</span> */}
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 rounded-lg bg-black/40 border border-white/20 text-white outline-none"
        />

        <input
          value={loanNo}
          onChange={(e) => setLoanNo(e.target.value)}
          placeholder="Loan Number"
          className="px-4 py-2 rounded-lg bg-black/40 border border-white/20 text-white outline-none"
        />

        <input
          value={partyName}
          readOnly
          placeholder={loadingParty ? "Fetching party..." : "Party name auto-filled"}
          className="px-4 py-2 rounded-lg bg-black/40 border border-white/20 text-white outline-none cursor-not-allowed"
        />

        {supportsCloseMode && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMode("regular")}
              className={`px-3 py-2 rounded-lg border ${
                paymentMode === "regular"
                  ? "bg-emerald-500 text-black border-emerald-500"
                  : "bg-black/30 text-white border-white/20"
              }`}
            >
              {type === "monthly"
                ? "Monthly Interest"
                : type === "daily"
                  ? "Daily Installment"
                  : type === "weekly"
                    ? "Weekly Installment"
                    : "Fire Interest"}
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode("close")}
              className={`px-3 py-2 rounded-lg border ${
                paymentMode === "close"
                  ? "bg-red-400 text-black border-red-400"
                  : "bg-black/30 text-white border-white/20"
              }`}
            >
              Close Loan
            </button>
          </div>
        )}

        {type === "monthly" && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-yellow-300">
              Monthly Interest: {monthlyMetrics.monthlyInterest}
            </div>
            <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-red-300">
              Remaining Principal: {monthlyMetrics.remainingPrincipal}
            </div>
          </div>
        )}

        {type === "weekly" && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-yellow-300">
              Weekly Installment: {monthlyMetrics.weeklyInstallment}
            </div>
            <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-red-300">
              Remaining Principal: {monthlyMetrics.remainingPrincipal}
            </div>
          </div>
        )}

        {type === "daily" && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-yellow-300">
              Daily Installment: {monthlyMetrics.dailyInstallment}
            </div>
            <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-red-300">
              Remaining Principal: {monthlyMetrics.remainingPrincipal}
            </div>
          </div>
        )}

        {type === "fire" && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-yellow-300">
              Fire Interest ({monthlyMetrics.fireCycleDays || 0} Days): {monthlyMetrics.fireCycleInterest}
            </div>
            <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-red-300">
              Remaining Principal: {monthlyMetrics.remainingPrincipal}
            </div>
          </div>
        )}

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={
            type === "monthly" && paymentMode === "regular"
              ? "Monthly Interest Amount"
              : type === "daily" && paymentMode === "regular"
                ? "Daily Installment Amount"
              : type === "weekly" && paymentMode === "regular"
                ? "Weekly Installment Amount"
                : type === "fire" && paymentMode === "regular"
                  ? "Fire Interest Amount"
                : "Collection Amount"
          }
          className="px-4 py-2 rounded-lg bg-black/40 border border-white/20 text-white outline-none"
        />

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-emerald-300">
            Principal: {splitPreview.principalPaid}
          </div>
          <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-yellow-300">
            Interest: {splitPreview.interestPaid}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-2 py-2 rounded-lg
            bg-gradient-to-r from-emerald-500 to-teal-400
            text-black font-bold hover:scale-105 transition"
        >
          Entry
        </button>
      </div>
    </div>
  );
}

export default CollectionBox;
