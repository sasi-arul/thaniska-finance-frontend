// import React, { useState,useEffect} from "react";
// import axios from "axios";
// import api from "../utils/api";
// import "./CollectionReport.css"; // optional if you separate CSS

// const CollectionReport = () => {
//   const [date, setDate] = useState("");
//   const [collections, setCollections] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loanNo, setLoanNo] = useState("");

// const loadAllCollections = async () => {
//     try {
//       const res = await api.get("/collections");
//       setCollections(res.data.collections);
//     } catch (err) {
//       console.error("Error loading collections", err);
//     }
//   };

//  useEffect(() => {
//     loadAllCollections();
//   }, []);

//   // const fetchReport = async () => {
//   //   if (!date) {
//   //     alert("Please select date");
//   //     return;
//   //   }

//   //   try {
//   //     const res = await axios.get(
//   //       `http://localhost:5000/api/collections/report?date=${date}`
//   //     );

//   //     setCollections(res.data.collections || []);
//   //     setTotal(res.data.total || 0);

//   //   } catch (error) {
//   //     console.error("Report error", error);
//   //   }
//   // };
// const fetchReport = async () => {
//   if (!date && !loanNo) {
//     alert("Enter date or loan number");
//     return;
//   }

//   try {
//     const res = await axios.get(
//       `http://localhost:5000/api/collections/report`,
//       {
//         params: { date, loanNo }
//       }
//     );

//     setCollections(res.data.collections || []);
//     setTotal(res.data.total || 0);

//   } catch (error) {
//     console.error("Report error", error);
//   }
// };

//   return (
//     <div className="report-container">
//       <h2>Collection Report</h2>

//       {/* Controls */}
//       <div className="report-controls">
//         <input
//           type="date"
//           value={date}
//           onChange={(e) => {
//             console.log("Selected:", e.target.value);
//             setDate(e.target.value)}}
//         />
//         <input
//           type="text"
//           placeholder="Enter Loan No"
//           value={loanNo}
//           onChange={(e) => setLoanNo(e.target.value)}
//         />
//         <button onClick={fetchReport}>Get Report</button>
//       </div>

//       {/* Total Card */}
//       <div className="total-card">
//         <p>Total Collection</p>
//         <h1>₹{total}</h1>
//       </div>

//       {/* Table */}
//       <div className="table-card">
//         <table>
//           <thead>
//             <tr>
//               <th>Loan No</th>
//               <th>Party Name</th>
//               <th>Collection Type</th>
//               <th>Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {collections && collections.length > 0 ? (

//               collections.map((item) => (
//                 <tr key={item._id}>
//                   <td>{item.loanNo}</td>
//                   <td>{item.partyName}</td>
//                   <td>{item.collectionType}</td>
//                   <td>₹{item.amount}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="4" style={{ textAlign: "center" }}>
//                   No collections found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default CollectionReport;
import React, { useState, useEffect } from "react";
import api from "../utils/api";
import "./CollectionReport.css";

const CollectionReport = () => {
  const [date, setDate] = useState("");
  const [collections, setCollections] = useState([]);
  const [total, setTotal] = useState(0);
  const [loanNo, setLoanNo] = useState("");

  // ✅ Load all collections on page load
  const loadAllCollections = async () => {
    try {
      const res = await api.get("/collections");

      setCollections(res.data.collections || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Error loading collections", err);
    }
  };

  useEffect(() => {
    loadAllCollections();
  }, []);

  // ✅ Fetch filtered report
  const fetchReport = async () => {
    // if no filter → load all again
    if (!date && !loanNo) {
      return loadAllCollections();
    }

    try {
      const res = await api.get("/collections/report", {
        params: { date, loanNo },
      });

      setCollections(res.data.collections || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error("Report error", error);
    }
  };

  return (
    <div className="report-container">
      <h2>Collection Report</h2>

      {/* Controls */}
      <div className="report-controls">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Loan No"
          value={loanNo}
          onChange={(e) => setLoanNo(e.target.value)}
        />

        <button onClick={fetchReport}>Get Report</button>

        {/* ✅ Reset Button */}
        <button
          onClick={() => {
            setDate("");
            setLoanNo("");
            loadAllCollections();
          }}
        >
          Reset
        </button>
      </div>

      {/* Total Card */}
      <div className="total-card">
        <p>Total Collection</p>
        <h1>₹{total}</h1>
      </div>

      {/* Table */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Loan No</th>
              <th>Date</th>
              <th>Party Name</th>
              <th>Collection Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {collections.length > 0 ? (
              collections.map((item) => (
                <tr key={item._id}>
                  <td>{item.loanNo}</td>
                  <td>{new Date(item.date).toLocaleDateString("en-IN")}</td>
                  <td>{item.partyName}</td>
                  <td>{item.collectionType}</td>
                  <td>₹{item.amount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No collections found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollectionReport;
