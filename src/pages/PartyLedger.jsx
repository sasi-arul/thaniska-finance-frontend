// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../utils/api";

// export default function Ledger() {
//   const { partyName } = useParams();
//   const [collections, setCollections] = useState([]);

//   useEffect(() => {
//      api
//     .get(`/collections/ledger/${partyName}`)
//     .then(res => setLedger(res.data));
//   }, [partyName]);

//   const fetchLedger = async () => {
//     try {
//       const res = await api.get(`/ledger/${partyName}`);
//       setCollections(res.data || []);
//     } catch (err) {
//       console.error("Failed to fetch ledger", err);
//     }
//   };

//   return (
//     <div className="min-h-screen p-6 bg-slate-950 text-white">
//       {/* Heading */}
//       <h1 className="text-3xl font-bold text-emerald-400 mb-6">
//         Ledger – {partyName}
//       </h1>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-white/10 rounded-xl overflow-hidden">
//           <thead className="bg-white/10">
//             <tr>
//               <th className="p-3 text-left w-20">S.No</th>
//               <th className="p-3 text-left">Date</th>
//               <th className="p-3 text-right">Amount (₹)</th>
//             </tr>
//           </thead>

//           <tbody>
//             {collections.map((item, index) => (
//               <tr
//                 key={item._id}
//                 className="border-t border-white/10 hover:bg-white/5"
//               >
//                 <td className="p-3">{index + 1}</td>
//                 <td className="p-3">
//                   {new Date(item.date).toLocaleDateString()}
//                 </td>
//                 <td className="p-3 text-right font-semibold text-emerald-400">
//                   ₹{item.amount}
//                 </td>
//               </tr>
//             ))}

//             {collections.length === 0 && (
//               <tr>
//                 <td colSpan="3" className="p-6 text-center text-slate-400">
//                   No collections found
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
import { useParams } from "react-router-dom";
import api from "../utils/api";

export default function Ledger() {
  const { partyName } = useParams();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);


  useEffect(() => {
    if (!partyName) return;
    const fetchLedger = async () => {
      try {
        const normalizedParty = partyName.trim().toLowerCase();

        const res = await api.get(
          `/collections/ledger/${normalizedParty}`
        );

        setCollections(res.data.collections || []);
        setSummary(res.data.summary || null);
      } catch (err) {
        console.error("Failed to fetch ledger", err);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [partyName]);

  return (
    <div className="min-h-screen p-6 bg-slate-950 text-white">
      <h1 className="text-3xl text-center font-bold text-emerald-400 mb-6">
        Ledger – {partyName}
      </h1>

      
            
      {/* {summary && (
  <div className="mt-8 bg-[#0f172a]/80 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-xl p-6"> */}
{summary && (
  <div className="mt-10 flex justify-center">
    <div className="w-full max-w-4xl bg-[#0f172a]/80 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-xl p-8">

    <h3 className="text-xl font-semibold text-yellow-400 mb-6 text-center">
      Loan Summary
    </h3>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">

      <div>
        <p className="text-slate-400 text-sm">Disbursed Amount</p>
        <h4 className="text-lg font-semibold text-white">
          ₹{summary.loanAmount}
        </h4>
      </div>

      <div>
        <p className="text-slate-400 text-sm">Total Payable</p>
        <h4 className="text-lg font-semibold text-white">
          ₹{summary.totalPayable}
        </h4>
      </div>

      <div>
        <p className="text-slate-400 text-sm">Total Paid</p>
        <h4 className="text-lg font-semibold text-emerald-400">
          ₹{summary.totalPaid}
        </h4>
      </div>

      <div>
        <p className="text-slate-400 text-sm">Remaining Balance</p>
        <h4 className="text-lg font-semibold text-red-400">
          ₹{summary.remainingBalance}
        </h4>
      </div>

      <div>
        <p className="text-slate-400 text-sm">Collection Type</p>
        <h4 className="text-lg font-semibold text-white capitalize">
          {summary.collectionType}
        </h4>
      </div>

      <div>
        <p className="text-slate-400 text-sm">Installment</p>
        <h4 className="text-lg font-semibold text-white">
          ₹{summary.installmentAmount}
        </h4>
      </div>

    </div>
  </div>
  </div>
)}<br></br>
<div className="overflow-x-auto">
        <table className="w-full border border-white/10 rounded-xl overflow-hidden">
          <thead className="bg-white/10">
            <tr>
              <th className="p-3 text-left w-20">S.No</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-right">Amount (₹)</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="3" className="p-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}

{!loading &&
              collections.map((item, index) => (
                <tr
                  key={item._id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right font-semibold text-emerald-400">
                    ₹{item.amount}
                  </td>
                </tr>
              ))}

            {!loading && collections.length === 0 && (
              <tr>
                <td colSpan="3" className="p-6 text-center text-slate-400">
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
