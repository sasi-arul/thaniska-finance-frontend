import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./CollectionReport.css";

const CollectionReport = () => {
  const [date, setDate] = useState("");
  const [loanNo, setLoanNo] = useState("");
  const [collections, setCollections] = useState([]);
  const [total, setTotal] = useState(0);

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

  const fetchReport = async () => {
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

  const refreshCurrentView = async () => {
    if (date || loanNo) {
      return fetchReport();
    }
    return loadAllCollections();
  };

  const handleEditCollection = async (item) => {
    const newAmount = window.prompt("Enter new amount", item.amount);
    if (newAmount === null) return;

    const numericAmount = Number(newAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    const defaultDate = item.date ? new Date(item.date).toISOString().split("T")[0] : "";
    const newDate = window.prompt("Enter new date (YYYY-MM-DD)", defaultDate);
    if (newDate === null) return;

    try {
      await api.put(`/collections/${item._id}`, {
        amount: numericAmount,
        date: newDate,
      });
      await refreshCurrentView();
    } catch (error) {
      console.error("Failed to update collection", error.response?.data || error.message);
      alert("Failed to update collection");
    }
  };

  const handleDeleteCollection = async (id) => {
    if (!window.confirm("Delete this collection?")) return;

    try {
      await api.delete(`/collections/${id}`);
      await refreshCurrentView();
    } catch (error) {
      console.error("Failed to delete collection", error.response?.data || error.message);
      alert("Failed to delete collection");
    }
  };

  return (
    <div className="report-container">
      <h2>Collection Report</h2>

      <div className="report-controls">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <input
          type="text"
          placeholder="Enter Loan No"
          value={loanNo}
          onChange={(e) => setLoanNo(e.target.value)}
        />

        <button onClick={fetchReport}>Get Report</button>
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

      <div className="total-card">
        <p>Total Collection</p>
        <h1>Rs {total}</h1>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Loan No</th>
              <th>Date</th>
              <th>Party Name</th>
              <th>Collection Type</th>
              <th>Amount</th>
              <th>Actions</th>
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
                  <td>Rs {item.amount}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="action-btn edit-btn"
                        onClick={() => handleEditCollection(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteCollection(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
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
