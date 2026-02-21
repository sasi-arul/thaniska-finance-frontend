import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import jsPDF from "jspdf";

export default function CreateLoan() {
  const navigate = useNavigate();

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

  const [form, setForm] = useState({
    loanNumber: "",
    partyName: "",
    fatherName: "",
    dateOfBirth: "",
    age: "",
    occupation: "",
    address: "",
    mobile: "",
    aadhar: "",
    witnessMobile: "",
    photo: null,
    proof: null,
    amount: "",
    date: "",
    collectionType: "daily",
    duration: "100",
    interestRate: "",
    advanceInterest: "",
  });

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [captureField, setCaptureField] = useState("photo");
  const [captureError, setCaptureError] = useState("");
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [lastCreatedLoan, setLastCreatedLoan] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);

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

  const getCameraErrorMessage = (error) => {
    if (!error) return "Camera preview failed. Close other camera apps and try again.";
    const name = error.name || "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      return "Camera permission blocked. Allow camera access in the browser and try again.";
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return "No camera device found. Connect a camera and try again.";
    }
    if (name === "NotReadableError" || name === "TrackStartError") {
      return "Camera is busy or already in use by another app. Close other camera apps and try again.";
    }
    if (name === "OverconstrainedError") {
      return "Camera constraints not supported. Try again or use a different camera.";
    }
    return "Camera preview failed. Close other camera apps and try again.";
  };

  const startCamera = async (targetField) => {
    try {
      setCaptureError("");
      setCaptureField(targetField);
      setIsVideoReady(false);
      if (!window.isSecureContext && window.location.hostname !== "localhost") {
        setCaptureError("Camera needs HTTPS. Use https:// or run on localhost.");
        return;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCaptureError("Camera not supported in this browser.");
        return;
      }
      if (streamRef.current) {
        stopCamera();
      }
      const stream = await getCameraStream();

      streamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        attachStreamToVideo();
      }, 0);
    } catch (error) {
      console.error("Camera error:", error);
      setCaptureError(getCameraErrorMessage(error));
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
    if (isCameraOpen && streamRef.current) {
      attachStreamToVideo();
    }
  }, [isCameraOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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

  const getComputedEndDate = (loanDate, collectionType, durationValue) => {
    if (!loanDate) return "";

    if (collectionType === "daily") {
      return getAutoEndDate(loanDate, "daily");
    }
    if (collectionType === "weekly") {
      return getAutoEndDate(loanDate, "weekly");
    }

    const days = Number(durationValue || 0);
    if (!days) return "";
    const start = new Date(loanDate);
    if (Number.isNaN(start.getTime())) return "";
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    return end.toISOString().split("T")[0];
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const getAbsoluteFileUrl = (fileUrl) => {
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

  const fileToDataUrl = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });

  const blobToDataUrl = (blob) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });

  const getPhotoDataUrl = async (loanData) => {
    if (form.photo) {
      return fileToDataUrl(form.photo);
    }

    const url = getAbsoluteFileUrl(loanData?.photoUrl || "");
    if (!url) return "";

    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) return "";
      const blob = await res.blob();
      return blobToDataUrl(blob);
    } catch {
      return "";
    }
  };

  const printLoanApplication = (loanData, payloadData) => {
    const startDate = payloadData.date || "";
    const endDate = getComputedEndDate(
      payloadData.date,
      payloadData.collectionType,
      payloadData.duration
    );

    const photoSrc = form.photo
      ? URL.createObjectURL(form.photo)
      : getAbsoluteFileUrl(loanData?.photoUrl || "");

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const html = `
      <!doctype html>
      <html>
      <head>
        <title>Loan Application</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          h1 { margin: 0 0 14px; font-size: 24px; }
          .header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
          .photo { width: 130px; height: 160px; border: 1px solid #333; object-fit: cover; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; margin-top: 16px; }
          .field { border-bottom: 1px dashed #aaa; padding-bottom: 4px; min-height: 20px; }
          .label { font-size: 12px; color: #555; display: block; margin-bottom: 2px; }
          .full { grid-column: 1 / -1; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Loan Application Form</h1>
          ${
            photoSrc
              ? `<img class="photo" src="${escapeHtml(photoSrc)}" alt="Party Photo" />`
              : `<div class="photo" style="display:flex;align-items:center;justify-content:center;">No Photo</div>`
          }
        </div>
        <div class="grid">
          <div class="field"><span class="label">Loan Number</span>${escapeHtml(
            loanData?.loanNumber || payloadData.loanNumber
          )}</div>
          <div class="field"><span class="label">Name</span>${escapeHtml(
            payloadData.partyName
          )}</div>
          <div class="field"><span class="label">Father Name</span>${escapeHtml(
            payloadData.fatherName
          )}</div>
          <div class="field"><span class="label">Place</span>${escapeHtml(
            payloadData.address
          )}</div>
          <div class="field"><span class="label">Phone Number</span>${escapeHtml(
            payloadData.mobile
          )}</div>
          <div class="field"><span class="label">Aadhar Number</span>${escapeHtml(
            payloadData.aadhar
          )}</div>
          <div class="field"><span class="label">Age</span>${escapeHtml(
            payloadData.age
          )}</div>
          <div class="field"><span class="label">Occupation</span>${escapeHtml(
            payloadData.occupation
          )}</div>
          <div class="field"><span class="label">Loan Amount</span>Rs ${escapeHtml(
            payloadData.amount
          )}</div>
          <div class="field"><span class="label">Collection Type</span>${escapeHtml(
            payloadData.collectionType
          )}</div>
          <div class="field"><span class="label">Loan Start Date</span>${escapeHtml(
            startDate
          )}</div>
          <div class="field"><span class="label">Loan End Date</span>${escapeHtml(
            endDate
          )}</div>
        </div>
        <script>
          window.onload = function () { window.print(); };
          window.onafterprint = function () { window.close(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    if (form.photo) {
      setTimeout(() => URL.revokeObjectURL(photoSrc), 30000);
    }
  };

  const downloadLoanPdf = async (loanData, payloadData) => {
    const startDate = payloadData.date || "";
    const endDate = getComputedEndDate(
      payloadData.date,
      payloadData.collectionType,
      payloadData.duration
    );

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Loan Application Form", 14, 16);

    const photoDataUrl = await getPhotoDataUrl(loanData);
    if (photoDataUrl) {
      try {
        doc.addImage(photoDataUrl, "JPEG", 150, 20, 40, 50);
      } catch {
        // Ignore photo if embed fails.
      }
    }

    doc.setFontSize(11);
    const rows = [
      ["Loan Number", loanData?.loanNumber || payloadData.loanNumber || ""],
      ["Name", payloadData.partyName || ""],
      ["Father Name", payloadData.fatherName || ""],
      ["Place", payloadData.address || ""],
      ["Phone Number", payloadData.mobile || ""],
      ["Aadhar Number", payloadData.aadhar || ""],
      ["Age", String(payloadData.age || "")],
      ["Occupation", payloadData.occupation || ""],
      ["Loan Amount", `Rs ${payloadData.amount || ""}`],
      ["Collection Type", payloadData.collectionType || ""],
      ["Loan Start Date", startDate],
      ["Loan End Date", endDate],
    ];

    let y = 30;
    rows.forEach(([label, value]) => {
      doc.text(`${label}:`, 14, y);
      doc.text(String(value), 60, y);
      y += 7;
    });

    const filename = `loan-${payloadData.loanNumber || loanData?.loanNumber || "application"}.pdf`;
    doc.save(filename);
  };

  const autoEndDate = getAutoEndDate(form.date, form.collectionType);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "collectionType") {
      const defaultDurationByType = {
        daily: "100",
        weekly: "10",
        monthly: "30",
        fire: "10",
      };
      const defaultInterestRateByType = {
        daily: "0.000001",
        weekly: "20",
        monthly: "10",
        fire: "10",
      };
      setForm((prev) => ({
        ...prev,
        collectionType: value,
        duration: defaultDurationByType[value] ?? prev.duration,
        interestRate: defaultInterestRateByType[value] ?? prev.interestRate,
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
      const hasFiles = Boolean(form.photo || form.proof);
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
      let createdLoan = null;

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

        const res = await api.post("/loans", formData);
        createdLoan = res.data;
      } else {
        const res = await api.post("/loans", payload);
        createdLoan = res.data;
      }

      setLastCreatedLoan(createdLoan);
      setLastPayload(payload);
      setShowPrintOptions(true);
      alert("Loan Created Successfully");
    } catch (error) {
      console.error("Full error:", error.response?.data || error.message);
      alert("Failed to create loan");
    }
  };

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
        <h2 className="text-3xl font-bold text-emerald-400 mb-8">Create Loan</h2>

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
          </div>

          <Input label="Loan Amount (Rs)" name="amount" type="number" value={form.amount} onChange={handleChange} />

          <Input
            label="Advance Interest Deduction (Rs)"
            name="advanceInterest"
            type="number"
            value={form.advanceInterest}
            onChange={handleChange}
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

          <Input
            label="Duration (Days / Weeks)"
            name="duration"
            type="number"
            value={form.duration}
            onChange={handleChange}
            readOnly={form.collectionType === "daily" || form.collectionType === "weekly"}
          />
          <Input label="Interest Rate (%)" name="interestRate" type="number" value={form.interestRate} onChange={handleChange} />

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

      {showPrintOptions && lastPayload && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/20 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold text-emerald-300 mb-4">Loan saved</h3>
            <p className="text-sm text-slate-300 mb-5">
              Choose to print or save the application as PDF.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => printLoanApplication(lastCreatedLoan, lastPayload)}
                className="w-full py-2 rounded bg-blue-500 text-white"
              >
                Print
              </button>
              <button
                type="button"
                onClick={() => downloadLoanPdf(lastCreatedLoan, lastPayload)}
                className="w-full py-2 rounded bg-emerald-500 text-black font-semibold"
              >
                Save as PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPrintOptions(false);
                  navigate("/loans");
                }}
                className="w-full py-2 rounded bg-white/10 border border-white/20"
              >
                Close
              </button>
            </div>
          </div>
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
