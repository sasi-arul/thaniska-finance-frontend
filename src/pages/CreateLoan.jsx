
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreateLoan() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
  loanNumber:"",
  partyName: "",
  fatherName: "",
  age: "",
  occupation: "",
  address: "",
  mobile: "",
  aadhar: "",
  witnessMobile: "",
  amount: "",
  date: "",
  collectionType: "daily",
  duration: "100",
  interestRate: "",
  advanceInterest: "" 
});

  const getAutoEndDate = (loanDate, collectionType) => {
    if (!loanDate || (collectionType !== "daily" && collectionType !== "weekly")) return "";

    const start = new Date(loanDate);
    if (Number.isNaN(start.getTime())) return "";

    const end = new Date(start);
    if (collectionType === "daily") {
      end.setDate(end.getDate() + 100);
    } else if (collectionType === "weekly") {
      end.setDate(end.getDate() + 70);
    }
    return end.toISOString().split("T")[0];
  };

  const autoEndDate = getAutoEndDate(form.date, form.collectionType);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "collectionType") {
      setForm((prev) => ({
        ...prev,
        collectionType: value,
        duration: value === "daily" ? "100" : value === "weekly" ? "10" : prev.duration,
      }));
      return;
    }

    setForm({
      ...form,
      [name]: value
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //   //    const formattedData = {
  //   //   ...form,
  //   //   amount: Number(form.amount),
  //   //   duration: Number(form.duration),
  //   //   interestRate: Number(form.interestRate),
  //   //   age: Number(form.age),
  //   // };
  //     await axios.post("http://localhost:5000/api/loans", form);
  //     alert("Loan Created Successfully");
  //     navigate("/loans");
  //   } catch (error) {
  //     console.error(error);
  //     alert("Failed to create loan");
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
const principal = Number(form.amount);
    const duration = Number(form.duration);
    const interestRate = Number(form.interestRate);
    const advance = Number(form.advanceInterest || 0);

    // 🔹 If interestRate is percentage
    const totalInterest = (principal * interestRate) / 100;

    // 🔹 Actual money given to party
    const disbursedAmount = principal - advance;

    // 🔹 Total amount party will repay
    const totalPayable = principal + totalInterest;

    // 🔹 Real profit
    const realProfit = totalPayable - disbursedAmount;

    const formattedData = {
      ...form,
      amount: Number(form.amount),
      duration: Number(form.duration),
      interestRate: Number(form.interestRate),
      age: Number(form.age),
      date: new Date(form.date)
    };

    await axios.post(`${API_URL}/loans`, formattedData);

    alert("Loan Created Successfully");
    navigate("/loans");
  } catch (error) {
    console.error("Full error:", error.response?.data || error.message);
    alert("Failed to create loan");
  }
};

  return (
    <div className="min-h-screen w-full
      bg-gradient-to-br from-slate-950 via-emerald-950 to-black text-white
      flex justify-center overflow-y-auto p-6">

      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-3xl max-h-[85vh] overflow-y-auto
          bg-white/10 backdrop-blur-2xl
          border border-white/20
          rounded-2xl p-8
          shadow-2xl shadow-emerald-500/20
        "
      >
        <h2 className="text-3xl font-bold text-emerald-400 mb-8">
          Create Loan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Loan Number" name="loanNumber" value={form.loanNumber} onChange={handleChange} />
          <Input label="Party Name" name="partyName" value={form.partyName} onChange={handleChange} />
          <Input label="Father Name" name="fatherName" value={form.fatherName} onChange={handleChange} />
          <Input label="Age" name="age" type="number" value={form.age} onChange={handleChange} />
          <Input label="Occupation" name="occupation" value={form.occupation} onChange={handleChange} />
          <Input label="Mobile Number" name="mobile" value={form.mobile} onChange={handleChange} />
          <Input label="Aadhar Number" name="aadhar" value={form.aadhar} onChange={handleChange} />
          <Input label="Witness Cell Number" name="witnessMobile" value={form.witnessMobile} onChange={handleChange} />
          <Input label="Loan Amount (₹)" name="amount" type="number" value={form.amount} onChange={handleChange} />
          <Input label="Interest Rate (%)" name="interestRate" type="number" value={form.interestRate} onChange={handleChange} />
          <Input label="Advance Interest Deduction (₹)" name="advanceInterest" type="number" value={form.advanceInterest} onChange={handleChange}/>
          <Input
            label="Duration (Days / Weeks)"
            name="duration"
            type="number"
            value={form.duration}
            onChange={handleChange}
            readOnly={form.collectionType === "daily" || form.collectionType === "weekly"}
          />
          

  <div>
  <label className="text-sm text-slate-300">
    Collection Type
  </label>

  <select
    name="collectionType"
    value={form.collectionType}
    onChange={handleChange}
    className="
      w-full mt-1 px-4 py-3 rounded-lg
      bg-black/40 border border-white/20 text-white
      focus:outline-none focus:ring-2 focus:ring-emerald-400
    "
  >
    <option value="daily">Daily Collection</option>
    <option value="weekly">Weekly Collection</option>
    <option value="monthly">Monthly Collection</option>
    <option value="fire">Fire Interest</option>
  </select>
</div>

          <Input label="Date" name="date" type="date" value={form.date} onChange={handleChange} />
          {(form.collectionType === "daily" || form.collectionType === "weekly") && (
            <div>
              <label className="text-sm text-slate-300">
                {form.collectionType === "daily"
                  ? "End Date (Loan Date + 100 Days)"
                  : "End Date (Loan Date + 10 Weeks)"}
              </label>
              <input
                type="date"
                value={autoEndDate}
                readOnly
                className="
                  w-full mt-1 px-4 py-3 rounded-lg
                  bg-black/40 border border-white/20 text-white
                  focus:outline-none
                "
              />
            </div>
          )}
        </div>

        <div className="mt-5">
          <label className="text-sm text-slate-300">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows="3"
            required
            className="
              w-full mt-1 px-4 py-3 rounded-lg
              bg-black/40 border border-white/20
              focus:outline-none focus:ring-2 focus:ring-emerald-400
            "
          />
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="
              flex-1 py-3 rounded-xl
              bg-gradient-to-r from-emerald-500 to-teal-400
              text-black font-bold text-lg
              hover:scale-105 transition-all
            "
          >
            Save Loan
          </button>

          <button
            type="button"
            onClick={() => navigate("/loans")}
            className="
              flex-1 py-3 rounded-xl
              bg-white/10 border border-white/20
              hover:bg-white/20 transition-all
            "
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", readOnly = false }) {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        required
        className="
          w-full mt-1 px-4 py-3 rounded-lg
          bg-black/40 border border-white/20
          focus:outline-none focus:ring-2 focus:ring-emerald-400
        "
      />
    </div>
  );
}
