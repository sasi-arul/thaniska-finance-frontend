import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditLoan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/loans/${id}`)
      .then((res) => {
        const data = res.data;
        setForm({
          ...data,
          date: data.date ? data.date.split("T")[0] : "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load loan");
        navigate("/loans");
      });
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${API_URL}/loans/${id}`, form);
      alert("Loan Updated Successfully");
      navigate("/loans");
    } catch (error) {
      console.error(error);
      alert("Failed to update loan");
    }
  };

  if (loading) {
    return <div className="text-white p-6">Loading...</div>;
  }

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
          Edit Loan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* <Input label="Loan Number" name="loanNumber" value={form.loanNumber} onChange={handleChange} />
          <Input label="Party Name" name="partyName" value={form.partyName} onChange={handleChange} />
          <Input label="Father Name" name="fatherName" value={form.fatherName} onChange={handleChange} />
          <Input label="Age" name="age" type="number" value={form.age} onChange={handleChange} />
          <Input label="Occupation" name="occupation" value={form.occupation} onChange={handleChange} />
          <Input label="Mobile Number" name="mobile" value={form.mobile} onChange={handleChange} />
          <Input label="Aadhar Number" name="aadhar" value={form.aadhar} onChange={handleChange} />
          <Input label="Witness Cell Number" name="witnessMobile" value={form.witnessMobile} onChange={handleChange} />
          <Input label="Loan Amount (₹)" name="amount" type="number" value={form.amount} onChange={handleChange} />
          <Input label="Date" name="date" type="date" value={form.date} onChange={handleChange} /> */}

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
          <Input label="Duration (Days / Weeks)" name="duration" type="number" value={form.duration} onChange={handleChange} />

          {/* Collection Type */}
          <div>
            <label className="text-sm text-slate-300">Collection Type</label>
            <select
              name="collectionType"
              value={form.collectionType}
              onChange={handleChange}
              className="
                w-full mt-1 px-4 py-3 rounded-lg
                bg-black/40 border border-white/20
                focus:outline-none focus:ring-2 focus:ring-emerald-400
              "
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="fire">Fire Interest</option>
            </select>
          </div>

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
            Update Loan
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

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
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
