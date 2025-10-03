import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Home, Users, BookOpen, School, ClipboardList, TrendingUp, Menu, X } from 'lucide-react';
import axiosInstance from '../api/axiosInstance'; // Use your real axios setup

const OfficerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile menu

    const MAX_RETRIES = 3;

    // --- Live Data Fetching with Exponential Backoff and Enhanced Error Logging ---
    const fetchDashboardData = async () => {
        setIsLoading(true);
        const apiUrl = '/reports/dashboard/county/'; 

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                // Use the cleaner axiosInstance interface
                const responseData = await axiosInstance.get(apiUrl);
                setDashboardData(responseData.data); // Axios returns { data: ... }
                setIsLoading(false);
                return; // Success
            } catch (error) {
                // The error message comes directly from the axiosInstance mock now.
                // If the error originated from a 401/403, the axiosInstance interceptor 
                // (if implemented correctly on the backend) would have handled it first.
                const logMessage = error.message;

                console.error(`Attempt ${attempt + 1} failed (API URL: ${apiUrl}): ${logMessage}`);
                
                if (attempt === MAX_RETRIES - 1) {
                    // Final attempt failed
                    console.error('All attempts to fetch dashboard data failed. Displaying user error.');
                    setDashboardData(null); 
                    setIsLoading(false);
                } else {
                    // Calculate delay for exponential backoff (1s, 2s, 4s)
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
    };

    useEffect(() => {
        // NOTE: For this to work, a valid 'access_token' must be present in localStorage.
        fetchDashboardData();
    }, []);

    // --- Data transformations for Charts (Memoized to run only when data changes) ---

    // Assessment Data for Bar Chart
    const assessmentChartData = useMemo(() => {
        if (!dashboardData || !dashboardData.assessments) return [];
        return Object.keys(dashboardData.assessments).map(subject => ({
            name: subject,
            // Uses optional chaining on dashboardData.assessments[subject] for safety
            'Avg Score (%)': dashboardData.assessments[subject]?.avg_percentage || 0,
        }));
    }, [dashboardData]);

    // Student Demographics Data for Pie Chart
    const genderPieData = useMemo(() => {
        if (!dashboardData || !dashboardData.students || !dashboardData.students.by_gender) return [];
        const data = dashboardData.students.by_gender;
        const total = (data.MALE || 0) + (data.FEMALE || 0) + (data.OTHER || 0);
        return [
            { name: 'Male', value: data.MALE || 0, percentage: total > 0 ? ((data.MALE || 0) / total) * 100 : 0 },
            { name: 'Female', value: data.FEMALE || 0, percentage: total > 0 ? ((data.FEMALE || 0) / total) * 100 : 0 },
            { name: 'Other', value: data.OTHER || 0, percentage: total > 0 ? ((data.OTHER || 0) / total) * 100 : 0 },
        ].filter(item => item.value > 0); // Only show segments with data
    }, [dashboardData]);
    
    // Subcounty Data for Area Chart
    const subcountyChartData = useMemo(() => {
        if (!dashboardData || !dashboardData.schools_per_subcounty) return [];
        return Object.keys(dashboardData.schools_per_subcounty).map(subcounty => ({
            name: subcounty,
            Schools: dashboardData.schools_per_subcounty[subcounty] || 0,
        }));
    }, [dashboardData]);

    // Pie chart colors
    const PIE_COLORS = ['#3B82F6', '#EF4444', '#10B981']; 

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-2xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-blue-500 border-opacity-50"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-700">Loading County Dashboard Data...</p>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="p-8 text-center text-red-500 font-bold bg-white rounded-xl shadow-md m-4">
                Error loading dashboard data. Please check the API status and network connection.
                <p className="mt-2 text-sm text-gray-600">
                    If this error persists, ensure you have a valid 'access_token' in localStorage, as required by the application's authentication setup.
                </p>
            </div>
        );
    }
    
    // --- Helper Component: Clickable Stat Card ---
    const StatCard = ({ title, value, icon: Icon, colorClass = 'text-blue-500', onClick, subText = null }) => (
        <div 
            onClick={onClick} 
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer border-t-4 border-blue-500 transform hover:scale-[1.02] active:scale-[0.98] h-full"
        >
            <div className="flex items-center justify-between">
                <Icon className={`w-8 h-8 ${colorClass}`} />
                <div className="text-3xl font-extrabold text-gray-900 leading-none">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
            </div>
            <div className="mt-3 text-lg font-medium text-gray-500">{title}</div>
            {subText && <p className="mt-1 text-sm text-gray-400">{subText}</p>}
        </div>
    );
    
    // --- Helper Component: Sidebar Nav Item ---
    const NavItem = ({ icon: Icon, label }) => (
        <a 
            href="#" 
            className="flex items-center p-3 text-sm font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-600 transition duration-150 mb-2"
            onClick={(e) => { e.preventDefault(); console.log(`Navigating to ${label}`); if (isSidebarOpen) setIsSidebarOpen(false); }}
        >
            <Icon className="w-5 h-5 mr-3" />
            {label}
        </a>
    );

    // --- Custom Tooltip for Recharts Pie Chart (to show percentage) ---
    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="p-3 bg-white border border-gray-200 shadow-lg rounded-lg">
                    <p className="text-sm font-semibold text-gray-800">{data.name}</p>
                    <p className="text-xs text-gray-600">Students: {data.value.toLocaleString()}</p>
                    <p className="text-xs font-bold text-blue-600">Share: {data.percentage.toFixed(1)}%</p>
                </div>
            );
        }
        return null;
    };


    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile Menu Button */}
            <button 
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-blue-600 text-white shadow-lg"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Sidebar (County Navigation/Filter Panel) */}
            <div 
                className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-300 ease-in-out w-64 bg-gray-800 p-6 z-40 lg:flex flex-col shadow-2xl`}
            >
                <h1 className="text-2xl font-extrabold text-white mb-6 border-b border-gray-700 pb-3">
                    County Officer
                </h1>
                <nav className="flex flex-col space-y-2">
                    <NavItem icon={Home} label="Overview" />
                    <NavItem icon={School} label="Schools List" />
                    <NavItem icon={Users} label="Student Data" />
                    <NavItem icon={BookOpen} label="Assessments" />
                    <NavItem icon={ClipboardList} label="Resource Mgmt" />
                </nav>

                {/* Subcounty Filters (Renders based on API data) */}
                <div className="mt-8 pt-4 border-t border-gray-700">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Filter by Subcounty</h3>
                    {dashboardData?.schools_per_subcounty && Object.keys(dashboardData.schools_per_subcounty).map(subcounty => (
                        <div key={subcounty} className="flex items-center mb-2">
                            <input type="checkbox" id={subcounty} name={subcounty} className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500" />
                            <label htmlFor={subcounty} className="ml-2 text-sm text-gray-300">{subcounty}</label>
                        </div>
                    ))}
                    {!dashboardData?.schools_per_subcounty && (
                        <p className="text-gray-500 text-xs">No subcounty data available.</p>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">County-Wide Summary</h1>
                    <p className="text-gray-500 mt-1">Data aggregated across all schools for {dashboardData?.attendance?.date || 'Today'}</p>
                </header>
                
                {/* --- 1. Key Metrics Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard 
                        title="Total Students" 
                        value={dashboardData?.students?.total || 0} 
                        icon={Users} 
                        colorClass="text-indigo-500" 
                        onClick={() => console.log('Go to Student Data Page')}
                    />
                    <StatCard 
                        title="Active Teachers" 
                        value={dashboardData?.teachers || 0} 
                        icon={Users} 
                        colorClass="text-teal-500" 
                        onClick={() => console.log('Go to Teacher Data Page')}
                    />
                    <StatCard 
                        title="Schools Managed" 
                        value={dashboardData?.schools || 0} 
                        icon={School} 
                        colorClass="text-purple-500" 
                        onClick={() => console.log('Go to School List Page')}
                    />
                    <StatCard 
                        title="Attendance Rate" 
                        value={`${dashboardData?.attendance?.attendance_percentage || 0}%`} 
                        icon={TrendingUp} 
                        colorClass="text-green-500" 
                        subText={`Present: ${dashboardData?.attendance?.present?.toLocaleString() || 0}`}
                        onClick={() => console.log('Go to Attendance Report')}
                    />
                </div>

                {/* --- 2. Charts and High-Impact Cards --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    
                    {/* Student Demographics (Gender) */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Student Gender Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={genderPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {genderPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Average Assessment Scores by Subject */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Average Assessment Performance (%)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={assessmentChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis domain={[0, 100]} stroke="#6b7280" />
                                <Tooltip />
                                <Bar dataKey="Avg Score (%)" fill="#4C51BF" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- 3. Resource Management & School Distribution --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Pending Resource Requests Card */}
                    <div 
                        className="bg-red-50 p-6 rounded-xl shadow-lg border-l-8 border-red-500 hover:shadow-xl transition duration-300 cursor-pointer flex justify-between items-center"
                        onClick={() => console.log('Go to Pending Resource Requests Page')}
                    >
                        <div>
                            <p className="text-2xl font-extrabold text-red-600 leading-none">
                                {dashboardData?.resource_requests?.pending?.toLocaleString() || 0}
                            </p>
                            <p className="mt-1 text-lg font-medium text-red-700">Pending Resource Requests</p>
                        </div>
                        <ClipboardList className="w-10 h-10 text-red-500" />
                    </div>

                    {/* Schools per Subcounty Area Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Schools per Subcounty</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={subcountyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSchools" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis allowDecimals={false} stroke="#6b7280" />
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <Tooltip />
                                <Area type="monotone" dataKey="Schools" stroke="#8884d8" fillOpacity={1} fill="url(#colorSchools)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* PWD Students Card */}
                <div className="mt-6 p-6 bg-yellow-50 rounded-xl shadow-lg border-l-4 border-yellow-500">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Students with Disabilities (PWD) Overview</h3>
                    <p className="text-gray-600">
                        Total PWD Students: <span className="font-bold text-yellow-700">{dashboardData?.students?.pwd?.yes?.toLocaleString() || 0}</span>. 
                        Top disability types: 
                        {dashboardData?.students?.by_disability_type && Object.keys(dashboardData.students.by_disability_type).length > 0 ? (
                            Object.entries(dashboardData.students.by_disability_type).map(([type, count]) => (
                                <span key={type} className="ml-3 inline-block bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {type}: {count || 0}
                                </span>
                            ))
                        ) : (
                            <span className="ml-3 text-gray-500">None reported.</span>
                        )}
                        <a href="#" className="ml-4 text-blue-500 hover:underline">View Detailed Report</a>
                    </p>
                </div>
            </main>
        </div>
    );
};

// Exporting as default, assuming this is used in the main App routing
export default OfficerDashboard;
