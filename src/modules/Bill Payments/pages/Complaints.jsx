// src/modules/Bill Payments/pages/Complaints.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User, Mail, Phone, Hash, FileText, ChevronLeft,
  CheckCircle2, AlertTriangle, Loader2,
} from "lucide-react";

// MyAccount lo unna pattern ne follow chesa: dev lo proxy, prod lo full URL
const API_BASE_URL = import.meta.env.DEV ? "" : "https://api.bobros.co.in";

const DISPOSITIONS = ["Payment Failed", "Transaction Pending", "Refund Not Received"];
const SOURCES = ["Bobros Web", "Bobros App"];

const Complaints = () => {
  const navigate = useNavigate();

  // Login ayyi unte localStorage nundi prefill.
  // Email key project lo veru kavachu (uemail / umail / email) — anni cover chesa.
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const u = storedUser?.user || storedUser || {};
  const uname = u.uname || u.name || "";
  const uemail = u.uemail || u.umail || u.email || "";
  const umob = u.umob || u.mobile || u.umobile || "";

  const [form, setForm] = useState({
    name: uname,
    email: uemail,
    mobile: umob,
    transactionId: "",
    disposition: "",
    applicationSource: "",   // default empty -> "Select application source" chupisthundi
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Anni fields mandatory
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.email.trim()) e.email = "Email required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.mobile.trim()) e.mobile = "Mobile required";
    else if (!/^[0-9]{10}$/.test(form.mobile)) e.mobile = "Invalid mobile";
    if (!form.transactionId.trim()) e.transactionId = "Transaction ID required";
    if (!form.disposition) e.disposition = "Select disposition";
    if (!form.applicationSource) e.applicationSource = "Select application source";
    if (!form.description.trim()) e.description = "Enter description";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        userName: form.name,
        userEmail: form.email,
        userMobile: form.mobile,
        b_connect_transactionId: form.transactionId,
        disposition: form.disposition,
        complaintSource: form.applicationSource,
        description: form.description,
      };

      // Express server route (proxied in dev via vite, same-origin in prod)
      const res = await axios.post(`${API_BASE_URL}/bill/complaint`, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 20000,
      });

      if (res.data?.success) {
        setSuccess(true);
      } else {
        setApiError(res.data?.message || "Unable to submit complaint. Please try again.");
      }
    } catch (err) {
      console.error("Complaint submit failed:", err);
      setApiError(
        err.response?.data?.message ||
        "Unable to submit complaint right now. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: uname,
      email: uemail,
      mobile: umob,
      transactionId: "",
      disposition: "",
      applicationSource: "",
      description: "",
    });
    setErrors({});
    setApiError("");
    setSuccess(false);
  };

  const inputBase =
    "w-full h-12 pl-11 pr-4 rounded-xl border bg-gray-50 text-sm text-gray-800 outline-none transition-all focus:bg-white focus:border-[#fd561e] focus:ring-2 focus:ring-[#fd561e]/20";

  const selectBase =
    "w-full h-12 px-4 rounded-xl border bg-gray-50 text-sm text-gray-800 outline-none transition-all focus:bg-white focus:border-[#fd561e] focus:ring-2 focus:ring-[#fd561e]/20";

  // ===== SUCCESS SCREEN (same as before, now vertically centered) =====
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Complaint Submitted</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Thank you for reaching out to BOBROS Bill Payment Support. We have successfully
              received your complaint and our support team will review it within 24–48 hours
              and get back to you with a resolution.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl bg-[#fd561e] cursor-pointer text-white text-sm font-semibold hover:bg-[#e04d19] transition-colors"
              >
                Raise Another
              </button>
              <button
                onClick={() => navigate("/BillHomePage")}
                className="px-5 py-2.5 rounded-xl border cursor-pointer border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Bill Payments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== FORM =====
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/BillHomePage")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#fd561e] mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Bill Payments
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Raise Complaint</h1>
            <p className="text-sm text-gray-500">
              Submit your issue and our team will respond shortly.
            </p>
          </div>

          {/* API error */}
          {apiError && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#fd561e]" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={`${inputBase} ${errors.name ? "border-red-400" : "border-gray-200"}`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#fd561e]" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`${inputBase} ${errors.email ? "border-red-400" : "border-gray-200"}`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#fd561e]" />
                  <input
                    type="text"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="10-digit mobile"
                    className={`${inputBase} ${errors.mobile ? "border-red-400" : "border-gray-200"}`}
                  />
                </div>
                {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>}
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Transaction ID</label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#fd561e]" />
                  <input
                    type="text"
                    name="transactionId"
                    value={form.transactionId}
                    onChange={handleChange}
                    placeholder="Enter transaction id"
                    className={`${inputBase} ${errors.transactionId ? "border-red-400" : "border-gray-200"}`}
                  />
                </div>
                {errors.transactionId && <p className="mt-1 text-xs text-red-600">{errors.transactionId}</p>}
              </div>

              {/* Disposition */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Disposition</label>
                <select
                  name="disposition"
                  value={form.disposition}
                  onChange={handleChange}
                  className={`${selectBase} ${errors.disposition ? "border-red-400" : "border-gray-200"}`}
                >
                  <option value="">Select disposition</option>
                  {DISPOSITIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {errors.disposition && <p className="mt-1 text-xs text-red-600">{errors.disposition}</p>}
              </div>

              {/* Application Source */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Application Source</label>
                <select
                  name="applicationSource"
                  value={form.applicationSource}
                  onChange={handleChange}
                  className={`${selectBase} ${errors.applicationSource ? "border-red-400" : "border-gray-200"}`}
                >
                  <option value="">Select application source</option>
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.applicationSource && <p className="mt-1 text-xs text-red-600">{errors.applicationSource}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Complaint Description</label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-4 top-4 text-[#fd561e]" />
                  <textarea
                    name="description"
                    rows={4}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your issue..."
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-gray-50 text-sm text-gray-800 outline-none transition-all resize-none focus:bg-white focus:border-[#fd561e] focus:ring-2 focus:ring-[#fd561e]/20 ${
                      errors.description ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                </div>
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end mt-7">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-7 py-3 cursor-pointer rounded-xl bg-[#fd561e] text-white text-sm font-semibold hover:bg-[#e04d19] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin " />}
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Complaints;