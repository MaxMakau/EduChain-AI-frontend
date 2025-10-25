import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { MapPin, CheckCircle, XCircle } from "lucide-react";
import logo from "../assets/logo.png";
import useThemeColor from "../hooks/useThemeColor";

const SUBCOUNTIES = [
  "Westlands", "Langata", "Embakasi East", "Embakasi West", "Embakasi South",
  "Embakasi Central", "Embakasi North", "Dagoretti North", "Dagoretti South",
  "Kasarani", "Roysambu", "Mathare", "Starehe", "Kamukunji", "Makadara"
];

const colors = {
  oceanBlue: "#2772A0",
  softBeige: "#F7EEC9",
  aquaBlue: "#A3E2E4",
  white: "#FFFFFF",
  textDark: "#1E293B"
};

const RegisterSchoolPage = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    code: "",
    subcounty: "",
    latitude: "",
    longitude: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle', 'pending', 'success', 'error'

  useEffect(() => {
    // ✅ Change status bar color dynamically
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", colors.oceanBlue);
    else {
      const newMeta = document.createElement("meta");
      newMeta.name = "theme-color";
      newMeta.content = colors.oceanBlue;
      document.head.appendChild(newMeta);
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLocationStatus('error');
      return;
    }
    setLocationStatus('pending');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({
          ...form,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setLocationStatus('success');
      },
      (err) => {
        setError("Failed to get location: " + err.message);
        setLocationStatus('error');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        name: form.name,
        code: form.code,
        subcounty: form.subcounty,
        ...(form.latitude && form.longitude && {
          latitude: form.latitude,
          longitude: form.longitude
        })
      };

      const res = await axiosInstance.post("/schools/register/", payload);
      setSuccess("School registered successfully!");
      updateUser({ school: res.data });
      setTimeout(() => navigate("/dashboard/headteacher", { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.code || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 py-8"
      style={{
        background: `linear-gradient(135deg, ${colors.softBeige}, ${colors.aquaBlue})`,
      }}
    >
      {/* Glassmorphic Card */}
      <div
        className="w-full max-w-lg bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8 sm:p-10 mx-4 border border-white/40"
        style={{
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)"
        }}
      >
        {/* Logo + Heading */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="EduChainAI Logo" className="w-14 h-14 mb-2" />
          <h1 className="text-xl font-bold" style={{ color: colors.oceanBlue }}>
            EduChainAI
          </h1>
        </div>

        <h2
          className="text-xl sm:text-2xl font-semibold mb-6 text-center"
          style={{ color: colors.textDark }}
        >
          Register Your School
        </h2>

        {/* Form */}
        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          {/* School Name */}
          <div>
            <label className="block text-sm font-medium mb-1">School Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={255}
              className="w-full rounded-lg px-3 py-2 bg-white/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2772A0]"
            />
          </div>

          {/* School Code */}
          <div>
            <label className="block text-sm font-medium mb-1">School Code</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              maxLength={20}
              className="w-full rounded-lg px-3 py-2 bg-white/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2772A0]"
            />
          </div>

          {/* Subcounty */}
          <div>
            <label className="block text-sm font-medium mb-1">Subcounty</label>
            <select
              name="subcounty"
              value={form.subcounty}
              onChange={handleChange}
              required
              className="w-full rounded-lg px-3 py-2 bg-white/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2772A0]"
            >
              <option value="">Select Subcounty</option>
              {SUBCOUNTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Location (optional)</label>
            <p className="text-xs text-gray-500 mb-2">Please ensure you are physically at the school's location when setting this for accurate registration.</p>
            <div className="flex gap-2 flex-wrap">
              
              <button
                type="button"
                onClick={getLocation}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-white transition w-full"
                style={{
                  backgroundColor: colors.oceanBlue,
                }}
              >
                <MapPin size={16} /> Set School Location
              </button>
            </div>
          {locationStatus === 'pending' && (
            <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1">
              <MapPin size={16} className="animate-pulse"/> Getting location...
            </p>
          )}
          {locationStatus === 'success' && (
            <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
              <CheckCircle size={16} /> Location set successfully!
            </p>
          )}
          {locationStatus === 'error' && (
            <p className="text-sm text-red-600 mt-2 flex items-center justify-center gap-1">
              <XCircle size={16} /> Failed to get location.
            </p>
          )}
          </div>

          {/* Messages */}
          {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center mt-2">{success}</div>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg text-white font-semibold py-2 mt-4 transition shadow-md hover:shadow-lg"
            style={{
              backgroundColor: colors.oceanBlue,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Registering..." : "Register School"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-sm text-gray-700 mt-6 text-center">
        © {new Date().getFullYear()} EduChainAI. Empowering ECDE with Trust & Technology.
      </p>
    </div>
  );
};

export default RegisterSchoolPage;
