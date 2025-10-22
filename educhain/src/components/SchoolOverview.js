import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Users, UserCheck, BookOpen, Package } from "lucide-react";
import styled from "styled-components";

const folderColors = {
  startBlue: "#4DA2FF", // bright top-blue tone from your image
  endBlue: "#2772A0", // deeper royal blue
  highlight: "#60B4FF", // light accent highlight
};

const FolderCard = styled.div`
  position: relative;
  background: linear-gradient(145deg, ${folderColors.startBlue}, ${folderColors.endBlue});
  border-radius: 14px;
  box-shadow: 0 6px 12px rgba(39, 114, 160, 0.25);
  padding: 1.4rem 1rem 1rem;
  color: #ffffff;
  text-align: center;
  cursor: pointer;
  transition: all 0.35s ease;
  transform-style: preserve-3d;
  overflow: visible;
  min-width: 150px;
  max-width: 200px;
  margin: 0 auto;

  /* Folder tab (top section) */
  &:before {
    content: "";
    position: absolute;
    top: -10px;
    left: 0;
    width: 60%;
    height: 18px;
    border-top-left-radius: 8px;
    border-top-right-radius: 6px;
    background: linear-gradient(
      145deg,
      ${folderColors.highlight} 0%,
      ${folderColors.startBlue} 40%,
      ${folderColors.endBlue} 100%
    );
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.25),
      0 2px 4px rgba(0, 0, 0, 0.12);
    transform-origin: bottom left;
    transition: transform 0.35s ease, box-shadow 0.35s ease;
  }

  &:hover {
    transform: translateY(-6px) scale(1.03);
    box-shadow: 0 10px 20px rgba(39, 114, 160, 0.3);
  }

  &:hover:before {
    transform: rotateX(18deg) translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  svg {
    opacity: 0.95;
    margin-bottom: 0.3rem;
    color: #ffffff;
  }

  h4 {
    font-size: 0.85rem;
    margin-top: 0.3rem;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 500;
    white-space: nowrap;
  }

  .value {
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 1;
  }

  @media (max-width: 768px) {
    padding: 1.2rem 0.8rem;
    .value {
      font-size: 1.3rem;
    }
    h4 {
      font-size: 0.8rem;
    }
  }
`;

const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;

  h2 {
    font-size: 1.9rem;
    font-weight: 800;
    color: #1e293b;
  }

  p {
    color: #64748b;
    margin-top: 0.25rem;
  }
`;

const FolderGrid = styled.div`
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));

  @media (max-width: 600px) {
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
`;

const Card = styled.div`
  background: #ffffff;
  padding: 1.2rem;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const SchoolOverview = ({ overview }) => {
  if (!overview)
    return (
      <div className="text-center text-gray-500 py-10">
        No school overview data available.
      </div>
    );

  const { school, students, teachers, attendance, assessments, resource_requests } = overview;

  const genderData = Object.entries(students.by_gender).map(([gender, count]) => ({
    gender: gender.charAt(0).toUpperCase() + gender.slice(1),
    count,
  }));

  const disabilityData = Object.entries(students.by_disability_type).map(([type, count]) => ({
    name: type,
    students: Math.round(count),
  }));

  const assessmentData = Object.entries(assessments).map(([subject, stats]) => ({
    subject,
    avg: stats.avg_percentage ?? 0,
  }));

  return (
    <OverviewContainer>
      <div>
        <h2>School Overview</h2>
        <p>
          <strong>{school.name}</strong> ({school.code}) —{" "}
          <span className="font-medium">{school.subcounty}</span>
        </p>
      </div>

      {/* Folder-style stats */}
      <FolderGrid>
        <FolderCard>
          <Users size={26} />
          <div className="value">{students.total}</div>
          <h4>Total Students</h4>
        </FolderCard>

        <FolderCard>
          <UserCheck size={26} />
          <div className="value">{teachers}</div>
          <h4>Total Teachers</h4>
        </FolderCard>

        <FolderCard>
          <BookOpen size={26} />
          <div className="value">{attendance.attendance_percentage ?? "--"}%</div>
          <h4>Attendance Today</h4>
        </FolderCard>

        <FolderCard>
          <Package size={26} />
          <div className="value">{resource_requests.pending}</div>
          <h4>Pending Resources</h4>
        </FolderCard>
      </FolderGrid>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Students by Gender</h3>
          <div style={{ height: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gender" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill={folderColors.endBlue} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Students by Disability Type
          </h3>
          {disabilityData.length ? (
            <div style={{ height: "250px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={disabilityData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorDisability" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={folderColors.startBlue} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={folderColors.endBlue} stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#475569" }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [`${value} students`, "Count"]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#fff",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="students"
                    fill="url(#colorDisability)"
                    radius={[6, 6, 0, 0]}
                    barSize={36}
                  >
                    {disabilityData.map((_, i) => (
                      <Cell key={i} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500">No disability data available</p>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Assessment Averages by Subject
        </h3>
        {assessmentData.length ? (
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assessmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg" fill={folderColors.endBlue} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500">No assessment data available</p>
        )}
      </Card>
    </OverviewContainer>
  );
};

export default SchoolOverview;
