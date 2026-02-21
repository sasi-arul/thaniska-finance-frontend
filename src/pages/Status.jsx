import React from "react";
import api from "../utils/api";
import { useState,useEffect} from "react";
import StatCard from "../components/StatCard";
import { DollarSign, CreditCard, Activity,Wallet,TrendingDown,TrendingUp,Banknote } from "lucide-react";

const Status = () => {

  const [stats, setStats] = useState({
    dailyInterest: 0,
    totalInterest: 0,
    activeLoans: 0,
    pendingAmount: 0,
    totalDisbursed: 0, 
    totalInvestment: 0,
    totalCollection: 0,
    totalCollectionPrincipal: 0,
    totalCollectionInterest: 0,
    totalAdvanceInterest: 0,
  });

  const fetchStats = async () => {
    try {
      const res = await api.get("/stats");
      console.log("Stats:", res.data);
      setStats((prev) => ({ ...prev, ...res.data }));
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  
  return (
    <div className="p-6 min-h-screen bg-gradient-to-r from-[#0f172a] via-[#0f2a3f] to-[#000000]">

      <h1 className="text-3xl font-bold text-green-400 mb-8">
        Financial Status Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* <StatCard
  title="Daily Interest"
  value={stats.dailyInterest}
  icon={DollarSign}
  iconColor="text-emerald-400"
  glowColor="emerald"
/> */}

{/* <StatCard
  title="Total Interest"
  value={stats.totalInterest}
  icon={DollarSign}
  iconColor="text-emerald-400"
  glowColor="emerald"
/> */}

<StatCard
  title="Active Loans"
  value={stats.activeLoans}
  icon={CreditCard}
  iconColor="text-emerald-400"
  glowColor="emerald"
/>

<StatCard
  title="Loan Amount"
  value={stats.pendingAmount}
  icon={Activity}
  iconColor="text-emerald-400"
  glowColor="emerald"
/>
<StatCard
  title="Total Disbursed"
  value={stats.totalDisbursed}
  icon={DollarSign}
  iconColor="text-emerald-400"
  glowColor="emerald"
/>
<StatCard
  title="Advance Interest Deduction"
  value={stats.totalAdvanceInterest}
  icon={DollarSign}
  iconColor="text-emerald-400"
  glowColor="emerald"
/>
<StatCard
  title="Total Investment"
  value={stats.totalInvestment}
  icon={DollarSign}
  iconColor="text-emerald-400"
  glowColor="emerald"
/>
<StatCard
  title="Collection Principal"
  value={stats.totalCollectionPrincipal}
  icon={Wallet}
  iconColor="text-emerald-400"
  glowColor="emerald"
/>
<StatCard
  title="Collection Interest"
  value={stats.totalCollectionInterest}
  icon={Wallet}
  iconColor="text-emerald-400"
  glowColor="emerald"
/>
<StatCard 
  title="Expenses" 
  value={stats.totalExpense} 
  icon={TrendingDown} 
  glowColor="emerald"
/>
<StatCard 
  title="Profit" 
  value={stats.netProfit} 
  icon={TrendingUp}
  glowColor="emerald" 
/>
<StatCard 
  title="Cash Balance"
  value={stats.cashBalance} 
  icon={Banknote}
  glowColor="emerald" 
/>
      </div>
    </div>
  );
};

export default Status;
