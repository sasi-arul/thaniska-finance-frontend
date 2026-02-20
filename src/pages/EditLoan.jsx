import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function EditLoan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [captureField, setCaptureField] = useState("photo");
  const [captureError, setCaptureError] = useState("");
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const calculateAgeFromDob = (dobValue) => {
    if (!dobValue) return "";

    const dob = new Date(dobValue);
    if (Number.isNaN(dob.getTime())) return "";

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age -= 1;
    }

    return age >= 0 ? String(age) : "";
  };

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

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return "";
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
      const origin = new URL(apiBase, window.location.origin).origin;
      const normalizedPath = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
      return `${origin}${normalizedPath}`;
    } catch {
      return fileUrl;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsVideoReady(false);
    setIsCameraOpen(false);
  };

  const attachStreamToVideo = async () => {
    const videoEl = await waitForVideoElement();
    if (!videoEl || !streamRef.current) {
      setCaptureError("Camera preview element not ready.");
      return;
    }

    videoEl.srcObject = streamRef.current;
    await videoEl.play().catch(() => {});

    let attempts = 0;
    const waitUntilReady = setInterval(() => {
      attempts += 1;
      if (videoEl.readyState >= 2 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        setIsVideoReady(true);
        clearInterval(waitUntilReady);
        return;
      }

      if (attempts >= 25) {
        clearInterval(waitUntilReady);
        setCaptureError("Camera preview not available. Try closing other camera apps and reopen.");
      }
    }, 120);
  };

  const waitForVideoElement = async () => {
    for (let i = 0; i < 20; i += 1) {
      if (videoRef.current) return videoRef.current;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return null;
  };

  const getCameraStream = async () => {
    const options = [
      { video: { facingMode: { ideal: "environment" } }, audio: false },
      { video: { facingMode: "user" }, audio: false },
      { video: true, audio: false },
    ];

    let lastError = null;
    for (const constraints of options) {
      try {
        // Try progressively broader constraints for desktop webcam compatibility.
        // eslint-disable-next-line no-await-in-loop
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Unable to access camera");
  };

  const startCamera = async (targetField) => {
    try {
      setCaptureError("");
      setCaptureField(targetField);
      setIsVideoReady(false);
      const stream = await getCameraStream();
      streamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        attachStreamToVideo();
      }, 0);
    } catch (error) {
      console.error("Camera error:", error);
      setCaptureError("Camera preview failed. Close other camera apps and try again.");
    }
  };

  const captureFromCamera = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    if (!isVideoReady || video.videoWidth === 0 || video.videoHeight === 0) {
      setCaptureError("Camera is not ready yet. Please wait 1 second and capture again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `${captureField}-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setForm((prev) => ({
          ...prev,
          [captureField]: file,
        }));

        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  useEffect(() => {
    api
      .get(`/loans/${id}`)
      .then((res) => {
        const data = res.data;
        setForm({
          loanNumber: data.loanNumber || "",
          partyName: data.partyName || "",
          fatherName: data.fatherName || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
          age: data.age || "",
          occupation: data.occupation || "",
          address: data.address || "",
          mobile: data.mobile || "",
          aadhar: data.aadhar || "",
          witnessMobile: data.witnessMobile || "",
          photo: null,
          proof: null,
          photoUrl: data.photoUrl || "",
          proofUrl: data.proofUrl || "",
          amount: data.amount || "",
          date: data.date ? data.date.split("T")[0] : "",
          collectionType: data.collectionType || "daily",
          duration: data.duration || "",
          interestRate: data.interestRate || "",
          advanceInterest: data.advanceInterest || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load loan");
        navigate("/loans");
      });
  }, [id, navigate]);

  useEffect(() => {
    if (isCameraOpen && streamRef.current) {
      attachStreamToVideo();
    }
  }, [isCameraOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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

    if (name === "dateOfBirth") {
      setForm((prev) => ({
        ...prev,
        dateOfBirth: value,
        age: calculateAgeFromDob(value),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files && files[0] ? files[0] : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        loanNumber: form.loanNumber || "",
        partyName: form.partyName || "",
        fatherName: form.fatherName || "",
        age: Number(form.age || 0),
        dateOfBirth: form.dateOfBirth || "",
        occupation: form.occupation || "",
        address: form.address || "",
        mobile: form.mobile || "",
        aadhar: form.aadhar || "",
        witnessMobile: form.witnessMobile || "",
        amount: Number(form.amount || 0),
        advanceInterest: Number(form.advanceInterest || 0),
        date: form.date || "",
        collectionType: form.collectionType || "daily",
        duration: Number(form.duration || 0),
        interestRate: Number(form.interestRate || 0),
      };

      const hasFiles = Boolean(form.photo || form.proof);

      if (hasFiles) {
        const formData = new FormData();
        formData.append("loanNumber", payload.loanNumber);
        formData.append("partyName", payload.partyName);
        formData.append("fatherName", payload.fatherName);
        formData.append("age", String(payload.age));
        formData.append("dateOfBirth", payload.dateOfBirth);
        formData.append("occupation", payload.occupation);
        formData.append("address", payload.address);
        formData.append("mobile", payload.mobile);
        formData.append("aadhar", payload.aadhar);
        formData.append("witnessMobile", payload.witnessMobile);
        formData.append("amount", String(payload.amount));
        formData.append("advanceInterest", String(payload.advanceInterest));
        formData.append("date", payload.date);
        formData.append("collectionType", payload.collectionType);
        formData.append("duration", String(payload.duration));
        formData.append("interestRate", String(payload.interestRate));

        if (form.photo) {
          formData.append("photo", form.photo);
        }
        if (form.proof) {
          formData.append("proof", form.proof);
        }

        await api.put(`/loans/${id}`, formData);
      } else {
        await api.put(`/loans/${id}`, payload);
      }

      alert("Loan Updated Successfully");
      navigate("/loans");
    } catch (error) {
      console.error("Full error:", error.response?.data || error.message);
      alert("Failed to update loan");
    }
  };

  if (loading || !form) {
    return <div className="text-white p-6">Loading...</div>;
  }

  const autoEndDate = getAutoEndDate(form.date, form.collectionType);

  return (
    <div
      className="min-h-screen w-full
      bg-gradient-to-br from-slate-950 via-emerald-950 to-black text-white
      flex justify-center overflow-y-auto p-6"
    >
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
        <h2 className="text-3xl font-bold text-emerald-400 mb-8">Edit Loan</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Loan Number" name="loanNumber" value={form.loanNumber} onChange={handleChange} />
          <Input label="Party Name" name="partyName" value={form.partyName} onChange={handleChange} />
          <Input label="Father Name" name="fatherName" value={form.fatherName} onChange={handleChange} />
          <Input label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
          <Input label="Age" name="age" type="number" value={form.age} onChange={handleChange} readOnly />
          <Input label="Occupation" name="occupation" value={form.occupation} onChange={handleChange} />
          <Input label="Mobile Number" name="mobile" value={form.mobile} onChange={handleChange} />
          <Input label="Aadhar Number" name="aadhar" value={form.aadhar} onChange={handleChange} />
          <Input label="Witness Cell Number" name="witnessMobile" value={form.witnessMobile} onChange={handleChange} />

          <div>
            <label className="text-sm text-slate-300">Photo Upload</label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="
                w-full mt-1 px-4 py-3 rounded-lg
                bg-black/40 border border-white/20 text-white
                focus:outline-none focus:ring-2 focus:ring-emerald-400
              "
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => startCamera("photo")}
                className="px-3 py-1 text-sm rounded bg-blue-500 text-white"
              >
                Capture Photo
              </button>
              {form.photo && <span className="text-xs text-emerald-300 truncate">{form.photo.name}</span>}
            </div>
            {form.photoUrl && (
              <a
                href={getFileUrl(form.photoUrl)}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-1 text-xs text-emerald-300 underline"
              >
                View current photo
              </a>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-300">Proof Upload (Image/PDF)</label>
            <input
              type="file"
              name="proof"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="
                w-full mt-1 px-4 py-3 rounded-lg
                bg-black/40 border border-white/20 text-white
                focus:outline-none focus:ring-2 focus:ring-emerald-400
              "
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => startCamera("proof")}
                className="px-3 py-1 text-sm rounded bg-blue-500 text-white"
              >
                Capture Proof
              </button>
              {form.proof && <span className="text-xs text-emerald-300 truncate">{form.proof.name}</span>}
            </div>
            {form.proofUrl && (
              <a
                href={getFileUrl(form.proofUrl)}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-1 text-xs text-emerald-300 underline"
              >
                View current proof
              </a>
            )}
          </div>

          <Input label="Loan Amount (Rs)" name="amount" type="number" value={form.amount} onChange={handleChange} />
          <Input label="Interest Rate (%)" name="interestRate" type="number" value={form.interestRate} onChange={handleChange} />
          <Input
            label="Advance Interest Deduction (Rs)"
            name="advanceInterest"
            type="number"
            value={form.advanceInterest}
            onChange={handleChange}
          />
          <Input
            label="Duration (Days / Weeks)"
            name="duration"
            type="number"
            value={form.duration}
            onChange={handleChange}
            readOnly={form.collectionType === "daily" || form.collectionType === "weekly"}
          />

          <div>
            <label className="text-sm text-slate-300">Collection Type</label>
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

      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-white/20 rounded-xl p-4">
            <p className="text-emerald-300 mb-3">Capture {captureField === "photo" ? "Photo" : "Proof"}</p>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={() => setIsVideoReady(true)}
              onCanPlay={() => setIsVideoReady(true)}
              className="w-full min-h-[260px] rounded-lg bg-black object-cover"
            />
            <div className="mt-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded bg-slate-700 text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureFromCamera}
                disabled={!isVideoReady}
                className="px-4 py-2 rounded bg-emerald-500 text-black font-semibold"
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {captureError && (
        <div className="fixed bottom-5 right-5 z-50 bg-red-600 text-white text-sm px-4 py-2 rounded">
          {captureError}
        </div>
      )}
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
        value={value || ""}
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
