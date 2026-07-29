"use client";

import { PerformanceHistory } from "@/app/lib/employeeDashboard/performance/definitions";
import { formatDate } from "@/app/lib/utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function PerformanceChart({
  history,
}: {
  history: PerformanceHistory[];
}) {
  const chartData = [...history].reverse().map((item) => ({
    month: formatDate(item.month),
    Productivity: item.productivity,
    Quality: item.quality,
    Teamwork: item.teamwork,
    Attendance: item.attendance,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <YAxis
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderRadius: "8px",
              border: "none",
              color: "#fff",
              fontSize: "12px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: "12px", paddingBottom: "16px" }}
          />

          {/* Productivity Line */}
          <Line
            type="monotone"
            dataKey="Productivity"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{
              r: 5,
              fill: "#2563eb",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 7,
              fill: "#2563eb",
              stroke: "#ffffff",
              strokeWidth: 2.5,
            }}
          />

          {/* Quality Line */}
          <Line
            type="monotone"
            dataKey="Quality"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{
              r: 5,
              fill: "#10b981",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 7,
              fill: "#10b981",
              stroke: "#ffffff",
              strokeWidth: 2.5,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
