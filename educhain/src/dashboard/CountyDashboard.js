// src/dashboard/CountyDashboard.js
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Home,
  Users,
  BookOpen,
  School,
  ClipboardList,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  LogOut,
  Search,
  MapPin,
  ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import CountyOverview from "./CountyOverview";
import logo from "../assets/logo.png";
import AIAnalytics from "./AIAnalytics";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup as LeafletPopup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const tabs = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "schools", label: "Schools", icon: School },
  { id: "resources", label: "Resources", icon: ClipboardList },
  { id: "ai-analytics", label: "AI Analytics", icon: TrendingUp },
];

const endpoints = {
  overview: "/reports/dashboard/county/",
  schools: "/schools/all/",
  resources: "/schools/resources/",
  ai_analytics: "/reports/analytics/",
};

const Shimmer = ({ className = "h-20" }) => (
  <div className={`animate-pulse bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`} />
);

export default function CountyDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({});
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState([]); // New state for expanded rows
  const [isMapView, setIsMapView] = useState(false); // New state for toggling map view
  const [showSchoolDetailsPopup, setShowSchoolDetailsPopup] = useState(false);
  const [selectedSchoolDetails, setSelectedSchoolDetails] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [subcountyFilter, setSubcountyFilter] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    }
    if (isSidebarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  const fetchTabData = async (tab) => {
    setLoading(true);
    setError("");
    const endpoint = endpoints[tab];
    if (!endpoint) return;
    try {
      const res = await axiosInstance.get(endpoint, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setData((prev) => ({ ...prev, [tab]: res.data }));
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
      } else {
        setError(err?.response?.data?.detail || err.message || "Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Sync tab with URL and fetch data
  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const currentTab = pathSegments[pathSegments.length - 1];

    if (location.pathname === "/dashboard/officer" && activeTab !== "overview") {
      setActiveTab("overview");
    } else if (tabs.some((tab) => tab.id === currentTab) && currentTab !== activeTab) {
      setActiveTab(currentTab);
    } else if (!tabs.some((tab) => tab.id === currentTab) && activeTab !== "overview") {
      setActiveTab("overview");
    }

    // If AI analytics, component may fetch itself; still call fetch for others
    if (activeTab === "ai-analytics") {
      setLoading(false);
      return;
    }
    fetchTabData(activeTab);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, location.pathname]);

  const schoolsRows = data.schools?.results || data.schools || [];
  const resourcesRows = data.resources?.results || data.resources || [];

  const toggleRowExpansion = (rowId) => {
    setExpandedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const handleResourceAction = async (resourceId, status) => {
    try {
      setLoading(true);
      setError("");
      await axiosInstance.patch(
        `/schools/resources/${resourceId}/`,
        { status },
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
      );
      await fetchTabData("resources");
    } catch (err) {
      console.error("Failed to update resource status:", err);
      setError(err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await axiosInstance.post("/users/logout/", { refresh: refreshToken });
      }
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login");
    }
  };

  const handleViewDetails = async (schoolCode) => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`/schools/${schoolCode}/`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setSelectedSchoolDetails(res.data);
      setShowSchoolDetailsPopup(true);
    } catch (err) {
      console.error("Failed to fetch school details:", err);
      setError(err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Derived & memoized lists
  const uniqueSubcounties = useMemo(() => {
    const all = schoolsRows || [];
    return [...new Set(all.map((s) => s.subcounty).filter(Boolean))].sort();
  }, [schoolsRows]);

  const filteredAndSortedSchools = useMemo(() => {
    let list = [...(schoolsRows || [])];

    if (subcountyFilter) {
      list = list.filter((s) => s.subcounty === subcountyFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(q) ||
          (s.code || "").toLowerCase().includes(q) ||
          (s.subcounty || "").toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const aCode = a.code || "";
      const bCode = b.code || "";
      return sortOrder === "asc" ? aCode.localeCompare(bCode) : bCode.localeCompare(aCode);
    });

    return list;
  }, [schoolsRows, subcountyFilter, search, sortOrder]);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* School Details Popup */}
      {showSchoolDetailsPopup && selectedSchoolDetails && (
        <SchoolDetailsPopup
          school={selectedSchoolDetails}
          onClose={() => setShowSchoolDetailsPopup(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 p-4 flex flex-col transform transition-transform duration-300 ease-in-out 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EduChain" className="w-10 h-10 rounded-md" />
            <div>
              <div className="text-[#2772A0] font-bold">EduChain</div>
              <div className="text-xs text-gray-500">County Officer</div>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 rounded hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-auto">
          <ul className="space-y-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      setActiveTab(t.id);
                      setIsSidebarOpen(false);
                      navigate(t.id === "overview" ? "/dashboard/officer" : `/dashboard/officer/${t.id}`);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition ${
                      active ? "bg-[#2772A0] text-white shadow-md" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{t.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#2772A0] text-white font-semibold hover:bg-[#1f5b80]"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 md:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 rounded hover:bg-gray-100" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={20} className="text-[#2772A0]" />
              </button>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-[#1E293B]">County Officer Dashboard</h2>
                <p className="text-sm text-gray-500">Data-driven decisions for your county.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1">
                <Search size={16} className="text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search schools, students, assessments..."
                  className="outline-none text-sm"
                />
              </div>

              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Shimmer className="h-24" />
                <Shimmer className="h-24" />
                <Shimmer className="h-24" />
                <Shimmer className="h-24" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 font-semibold">{error}</div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.section
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <CountyOverview data={data.overview ?? {}} />
                </motion.section>
              )}

              {activeTab === "schools" && (
                <motion.section
                  key="schools"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#2772A0]">Schools</h3>
                    <button
                      className="px-3 py-2 rounded-md bg-[#2772A0] text-white hover:bg-[#1f5b80]"
                      onClick={() => setIsMapView(!isMapView)}
                    >
                      <MapPin size={16} className="inline-block mr-2" /> {isMapView ? "List View" : "Map View"}
                    </button>
                  </div>

                  {!isMapView && (
                    <>
                      <div className="flex flex-wrap gap-3 mb-4 items-center">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Filter Subcounty:</label>
                          <select
                            value={subcountyFilter}
                            onChange={(e) => setSubcountyFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                          >
                            <option value="">All</option>
                            {uniqueSubcounties.map((sub) => (
                              <option key={sub} value={sub}>
                                {sub}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            className="flex items-center gap-1 px-3 py-1 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
                          >
                            <ArrowUpDown size={14} /> Sort by Code ({sortOrder})
                          </button>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="text-xs bg-gray-50 text-gray-500">
                            <tr>
                              <th className="py-2 px-4 text-left">Code</th>
                              <th className="py-2 px-4 text-left">Name</th>
                              <th className="py-2 px-4 text-left">Subcounty</th>
                              <th className="py-2 px-4 text-left">Headteacher</th>
                              <th className="py-2 px-4 text-left">Teachers</th>
                              <th className="py-2 px-4 text-left">Students</th>
                              <th className="py-2 px-4 text-left">Avg. Assessment</th>
                              <th className="py-2 px-4 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAndSortedSchools.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="py-6 text-center text-gray-500">
                                  No schools found
                                </td>
                              </tr>
                            ) : (
                              filteredAndSortedSchools.map((s) => (
                                <tr key={s.code} className="border-t hover:bg-gray-50">
                                  <td className="py-2 px-4">{s.code}</td>
                                  <td className="py-2 px-4">{s.name}</td>
                                  <td className="py-2 px-4">{s.subcounty}</td>
                                  <td className="py-2 px-4">{s.headteacher || "N/A"}</td>
                                  <td className="py-2 px-4">{s.total_teachers ?? "—"}</td>
                                  <td className="py-2 px-4">{s.total_students ?? "—"}</td>
                                  <td className="py-2 px-4">{s.assessment_average ?? "—"}</td>
                                  <td className="py-2 px-4">
                                    <button
                                      onClick={() => handleViewDetails(s.code)}
                                      className="px-3 py-1 text-xs rounded-md bg-[#2772A0] text-white hover:bg-[#1f5b80]"
                                    >
                                      View
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {isMapView && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-[#2772A0] mb-4">Schools Map View</h3>
                      <MapView schools={filteredAndSortedSchools} handleMarkerClick={handleViewDetails} />
                    </div>
                  )}
                </motion.section>
              )}

              {activeTab === "resources" && (
                <motion.section
                  key="resources"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h3 className="text-lg font-semibold text-[#2772A0] mb-4">Resources</h3>
                  <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
                    {resourcesRows.length === 0 ? (
                      <div className="text-gray-500">No resource requests found.</div>
                    ) : (
                      <div className="space-y-3">
                        {resourcesRows.map((r) => (
                          <div key={r.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold">{r.school || r.school_name || "Unknown School"}</div>
                              <div className="text-xs text-gray-600">{r.resource_type} • {r.quantity}</div>
                              <div className="text-xs text-gray-500 mt-1">{r.description}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded ${r.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : r.status === "APPROVED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {r.status}
                              </span>
                              {r.status === "PENDING" && (
                                <>
                                  <button onClick={() => handleResourceAction(r.id, "APPROVED")} className="px-3 py-1 text-sm rounded bg-green-500 text-white">Approve</button>
                                  <button onClick={() => handleResourceAction(r.id, "REJECTED")} className="px-3 py-1 text-sm rounded bg-red-500 text-white">Reject</button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.section>
              )}

              {activeTab === "ai-analytics" && (
                <motion.section key="ai-analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <AIAnalytics />
                </motion.section>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}

// SchoolDetailsPopup Component (keeps your original look)
const SchoolDetailsPopup = ({ school, onClose }) => {
  if (!school) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[999] p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-[#2772A0] mb-4">School Details</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Name:</strong> {school.name}</p>
          <p><strong>Code:</strong> {school.code}</p>
          <p><strong>Subcounty:</strong> {school.subcounty}</p>
          <p><strong>Location:</strong> {school.location || "N/A"}</p>
          <p><strong>Registered On:</strong> {school.created_at ? new Date(school.created_at).toLocaleDateString() : "N/A"}</p>
          {school.headteacher && (
            <div className="pt-2 border-t mt-2">
              <p className="font-semibold">Headteacher:</p>
              <p><strong>Name:</strong> {school.headteacher.first_name} {school.headteacher.last_name}</p>
              <p><strong>Email:</strong> {school.headteacher.email}</p>
              <p><strong>Phone:</strong> {school.headteacher.phone_number}</p>
            </div>
          )}
          <p className="pt-2 border-t mt-2"><strong>Total Students:</strong> {school.total_students}</p>
        </div>
      </div>
    </div>
  );
};

// MapView component (renders markers)
const MapView = ({ schools, handleMarkerClick }) => {
  const defaultCenter = [-1.286389, 36.817223]; // Nairobi coordinates

  const parseLocation = (locationString) => {
    if (!locationString) return null;
    const pointMatch = locationString.match(/POINT \(([^ ]+) ([^ ]+)\)/);
    if (pointMatch && pointMatch.length === 3) {
      const longitude = parseFloat(pointMatch[1]);
      const latitude = parseFloat(pointMatch[2]);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        return { latitude, longitude };
      }
    }
    return null;
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      <MapContainer
        center={defaultCenter}
        zoom={11} // ✅ More zoomed-in view of Nairobi County
        scrollWheelZoom={true}
        className="h-[600px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {schools.map((school) => {
          const parsed = parseLocation(school.location);
          if (!parsed) return null;
          return (
            <Marker
              key={school.code}
              position={[parsed.latitude, parsed.longitude]}
              eventHandlers={{
                click: () => handleMarkerClick(school.code),
              }}
            >
              <LeafletPopup>
                <div className="text-sm">
                  <div className="font-semibold text-[#2772A0]">{school.name}</div>
                  <div className="text-xs text-gray-600">Code: {school.code}</div>
                  <div className="text-xs text-gray-600">Subcounty: {school.subcounty}</div>
                </div>
              </LeafletPopup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
