import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Preloader from "./components/Preloader";
import ProtectedRoute from "./components/ProtectedRoute";
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
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";


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
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/status"
          element={
            <ProtectedRoute>
              <Status />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans/create-loan"
          element={
            <ProtectedRoute>
              <CreateLoan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <LoanList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans/edit/:id"
          element={
            <ProtectedRoute>
              <EditLoan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ledger/:partyName"
          element={
            <ProtectedRoute>
              <PartyLedger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collection-report"
          element={
            <ProtectedRoute>
              <CollectionReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weekly-pending-collections"
          element={
            <ProtectedRoute>
              <WeeklyPendingCollections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monthly-pending-collections"
          element={
            <ProtectedRoute>
              <MonthlyPendingCollections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fire-pending-collections"
          element={
            <ProtectedRoute>
              <FirePendingCollections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investment"
          element={
            <ProtectedRoute>
              <Investment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expense />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
      </Routes>
    </PageTransition>
  );
}
