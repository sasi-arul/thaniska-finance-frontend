import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Preloader from "./components/Preloader";
import Dashboard from "./pages/Dashboard";
import CreateLoan from "./pages/CreateLoan";
import PageTransition from "./components/PageTransition";
import LoanList from "./pages/LoanList";
import EditLoan from "./pages/EditLoan";
import PartyLedger from "./pages/PartyLedger";
import Status from "./pages/Status";
import CollectionReport from "./pages/CollectionReport";
import Investment from "./pages/Investment";
import Expense from "./pages/Expense";
import WeeklyPendingCollections from "./pages/WeeklyPendingCollections";
import MonthlyPendingCollections from "./pages/MonthlyPendingCollections";
import FirePendingCollections from "./pages/FirePendingCollections";


export default function App() {
  // ✅ ALL hooks at the top
  const [entered, setEntered] = useState(false);

  // ✅ Conditional rendering AFTER hooks
  if (!entered) {
    return <Preloader onFinish={() => setEntered(true)} />;
  }

  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/status" element={<Status />} />
        <Route path="/loans/create-loan" element={<CreateLoan />} />
        <Route path="/loans" element={<LoanList />} />
        <Route path="/loans/edit/:id" element={<EditLoan />} />
        <Route path="/ledger/:partyName" element={<PartyLedger />} />
        <Route path="/collection-report" element={<CollectionReport />} />
        <Route path="/weekly-pending-collections" element={<WeeklyPendingCollections />} />
        <Route path="/monthly-pending-collections" element={<MonthlyPendingCollections />} />
        <Route path="/fire-pending-collections" element={<FirePendingCollections />} />
        <Route path="/investment" element={<Investment />} />
        <Route path="/expenses" element={<Expense />} />
      </Routes>
    </PageTransition>
  );
}
