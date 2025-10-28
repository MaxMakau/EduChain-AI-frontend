import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Filter, RefreshCw } from 'lucide-react'; // Small icons

const AIAnalytics = ({ user }) => {
  const [insights, setInsights] = useState([]);
  const [rules, setRules] = useState({});
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const [errorInsights, setErrorInsights] = useState(null);
  const [errorRules, setErrorRules] = useState(null);
  const [sortBy, setSortBy] = useState('generated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ACTIVE');
  const [isFetchingLatest, setIsFetchingLatest] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const token = localStorage.getItem("access_token");

  const fetchInsights = useCallback(async () => {
    try {
      setIsLoadingInsights(true);
      const response = await axiosInstance.get('/reports/analytics/?status=ACTIVE');
      setInsights(response.data);
    } catch (err) {
      setErrorInsights(err);
    } finally {
      setIsLoadingInsights(false);
      setIsFetchingLatest(false);
    }
  }, []);

  useEffect(() => {
    const fetchRules = async () => {
      if (user?.role === "HEADTEACHER") {
        setIsLoadingRules(false);
        setRules({});
        return;
      }
      try {
        setIsLoadingRules(true);
        const response = await axiosInstance.get('/analytics/rules/');
        setRules(response.data);
      } catch (err) {
        setErrorRules(err);
      } finally {
        setIsLoadingRules(false);
      }
    };
    fetchInsights();
    fetchRules();
  }, [fetchInsights, user]);

  useEffect(() => {
    let timer;
    if (isTimerActive && timerSeconds > 0) {
      timer = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (isTimerActive && timerSeconds === 0) {
      setIsTimerActive(false);
      fetchInsights();
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timerSeconds, fetchInsights]);

  const handleGetLatestInsights = async () => {
    if (isTimerActive) return;
    setIsFetchingLatest(true);
    setErrorInsights(null);
    try {
      await axiosInstance.post('/analytics/run/', {}, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setIsTimerActive(true);
      setTimerSeconds(75); // 1 minute 15 seconds
    } catch (err) {
      setErrorInsights(err);
      setIsFetchingLatest(false);
    }
  };

  const filteredAndSortedInsights = [...insights]
    .filter(i => 
      (filterSeverity === 'ALL' || i.severity === filterSeverity) &&
      (filterStatus === 'ALL' || i.status === filterStatus)
    )
    .sort((a, b) => {
      let compare = 0;
      if (sortBy === 'severity') {
        const order = { CRITICAL: 3, WARNING: 2, INFO: 1 };
        compare = order[a.severity] - order[b.severity];
      } else if (sortBy === 'status') compare = a.status.localeCompare(b.status);
      else if (sortBy === 'generated_at') compare = new Date(a.generated_at) - new Date(b.generated_at);
      return sortOrder === 'asc' ? compare : -compare;
    });

  const getSeverityColor = s =>
    s === 'CRITICAL' ? 'text-red-700 bg-red-100' :
    s === 'WARNING' ? 'text-yellow-700 bg-yellow-100' :
    s === 'INFO' ? 'text-blue-700 bg-blue-100' : 'text-gray-700 bg-gray-100';

  const getStatusColor = s =>
    s === 'ACTIVE' ? 'text-green-700 bg-green-100' :
    s === 'RESOLVED' ? 'text-indigo-700 bg-indigo-100' :
    s === 'ARCHIVED' ? 'text-gray-700 bg-gray-100' : 'text-gray-700 bg-gray-100';

  if (isLoadingInsights || isLoadingRules)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-blue-400 border-t-transparent rounded-full"></div>
      </div>
    );

  if (errorInsights || errorRules)
    return (
      <div className="p-8 text-center text-red-500 font-bold bg-white rounded-xl shadow-md">
        Error loading data: {errorInsights?.message || errorRules?.message}
      </div>
    );

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Filter size={20} /> AI Analytics & Insights
        </h2>
        <button
          onClick={handleGetLatestInsights}
          disabled={isFetchingLatest || isTimerActive}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={isFetchingLatest ? 'animate-spin' : ''} size={18} />
          {isTimerActive
            ? `${timerSeconds}s`
            : isFetchingLatest
            ? 'Fetching...'
            : 'Get Latest Insights'}
        </button>
      </div>

      {/* Compact Filters */}
      <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-3 rounded-lg mb-6">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="generated_at">Sort: Date</option>
          <option value="severity">Sort: Severity</option>
          <option value="status">Sort: Status</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="ALL">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="WARNING">Warning</option>
          <option value="INFO">Info</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="RESOLVED">Resolved</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Insights */}
      <h3 className="text-xl font-semibold text-gray-700 mb-3">
        Latest Insights ({filteredAndSortedInsights.length})
      </h3>
      {filteredAndSortedInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedInsights.map((insight) => (
            <div
              key={insight.id}
              className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <h4 className="text-lg font-semibold text-gray-800">
                {insight.rule_name}
              </h4>
              <p className="text-sm text-gray-700">School: {insight.school_name}</p>
              <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                  {insight.severity}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(insight.status)}`}>
                  {insight.status}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(insight.generated_at).toLocaleDateString()}
                </span>
              </div>
              {insight.context_data && Object.keys(insight.context_data).length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  <p className="font-semibold mb-1">Context:</p>
                  <ul className="list-disc list-inside ml-2">
                    {Object.entries(insight.context_data).map(([key, value]) => (
                      <li key={key}>
                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                        {String(value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No AI insights available based on current filters.</p>
      )}
    </div>
  );
};

export default AIAnalytics;
