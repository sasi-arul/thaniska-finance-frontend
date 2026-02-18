
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function LoanList() {
//   const [loans, setLoans] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     loadLoans();
//   }, []);

//   const loadLoans = () => {
//     const storedLoans =
//       JSON.parse(localStorage.getItem("loans")) || [];
//     setLoans(storedLoans);
//   };

//   const handleDelete = (id) => {
//     if (!window.confirm("Delete this loan?")) return;

//     const updatedLoans = loans.filter(
//       (loan) => loan.id !== id
//     );

//     localStorage.setItem(
//       "loans",
//       JSON.stringify(updatedLoans)
//     );

//     setLoans(updatedLoans);
//   };

//   return (
//     <div className="min-h-screen p-8 text-white
//       bg-gradient-to-br from-slate-950 via-slate-900 to-black">

//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-emerald-400">
//           Loan List
//         </h1>

//         <button
//           onClick={() => navigate("/create-loan")}
//           className="px-6 py-2 rounded-lg
//           bg-gradient-to-r from-emerald-500 to-teal-400
//           text-black font-semibold"
//         >
//           ➕ Create Loan
//         </button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto bg-white/10 backdrop-blur-xl
//         border border-white/20 rounded-xl">

//         <table className="w-full text-left">
//           <thead className="bg-white/10">
//             <tr>
//               <th className="p-4">Loan No</th>
//               <th className="p-4">Party Name</th>
//               <th className="p-4">Mobile</th>
//               <th className="p-4">Amount</th>
//               <th className="p-4">Date</th>
//               <th className="p-4 text-center">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loans.map((loan) => (
//               <tr
//                 key={loan.id}
//                 className="border-t border-white/10 hover:bg-white/5"
//               >
//                 <td className="p-4">{loan.loanNumber}</td>
//                 <td className="p-4">{loan.partyName}</td>
//                 <td className="p-4">{loan.mobile}</td>
//                 <td className="p-4 text-emerald-400 font-semibold">
//                   ₹ {loan.amount}
//                 </td>
//                 <td className="p-4">
//                   {loan.date
//                     ? new Date(loan.date).toLocaleDateString()
//                     : "-"}
//                 </td>

//                 {/* Actions */}
//                 <td className="p-4 text-center">
//                   <div className="flex justify-center gap-3">
//                     <button
//                       onClick={() =>
//                         navigate(`/edit-loan/${loan.id}`)
//                       }
//                       className="px-3 py-1 rounded-md
//                       bg-blue-500/20 text-blue-400
//                       hover:bg-blue-500/30"
//                     >
//                       ✏️ Edit
//                     </button>

//                     <button
//                       onClick={() => handleDelete(loan.id)}
//                       className="px-3 py-1 rounded-md
//                       bg-red-500/20 text-red-400
//                       hover:bg-red-500/30"
//                     >
//                       🗑 Delete
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {loans.length === 0 && (
//               <tr>
//                 <td
//                   colSpan="6"
//                   className="p-6 text-center text-slate-400"
//                 >
//                   No loans found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function LoanList() {
  const [loans, setLoans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
  const res = await api.get("/loans");

  // handle BOTH possible response shapes
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
        {/* <button
          onClick={() => navigate("/loans/create")}
          className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold"
        >
          + Create Loan
        </button> */}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-white/10 rounded-xl overflow-hidden">
          <thead className="bg-white/10">
            <tr>
              <th className="p-3 text-left">Loan No</th>
              <th className="p-3 text-left">Party</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Collection Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loans.map((loan) => (
              <tr key={loan._id} className="border-t border-white/10">
                <td className="p-3 font-mono text-white-300">
                {loan.loanNumber}
              </td>
                <td
                  className="p-3 text-emerald-400 cursor-pointer underline"
                  onClick={() => navigate(`/ledger/${loan.partyName}`)}
                >
                  {loan.partyName}
                </td>
                <td className="p-3 text-center">₹{loan.amount}</td>
                <td className="p-3 text-center capitalize">{loan.collectionType || "N/A"}</td>
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
                <td colSpan="6" className="p-6 text-center text-slate-400">
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
