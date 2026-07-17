"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const chartData = [
  { month: "Jan", engagement: 81, retention: 100 },
  { month: "Feb", engagement: 84, retention: 100 },
  { month: "Mar", engagement: 82, retention: 101 },
  { month: "Apr", engagement: 77, retention: 98 },
  { month: "May", engagement: 85, retention: 100 },
  { month: "Jun", engagement: 89, retention: 102 },
  { month: "Jul", engagement: 88, retention: 101 },
]

export function RetentionEngagementChart() {
  const [activeRange, setActiveRange] = React.useState("YTD")

  return (
    <Card className="w-full max-w-[650px] border border-gray-100 rounded-2xl shadow-sm bg-white p-2">
      {/* Header Container with Title and Buttons aligned horizontally */}
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">
            Retention & Engagement Trends
          </CardTitle>
          <CardDescription className="text-sm font-normal text-slate-500 mt-1">
            Monthly overview · Jan–Jul 2026
          </CardDescription>
        </div>
        
        {/* Filter Timeline Buttons */}
        <div className="flex gap-1 bg-white">
          {["1M", "3M", "6M", "YTD"].map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                activeRange === range
                  ? "bg-[#5046e5] text-white border-[#5046e5]"
                  : "bg-white text-slate-500 border-gray-200 hover:bg-slate-50"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                {/* Purple Area Gradient for Retention */}
                <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5046e5" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#5046e5" stopOpacity={0.0} />
                </linearGradient>
                {/* Green Area Gradient for Engagement */}
                <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Light dashed horizontal grid lines */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                className="text-xs font-medium text-slate-400"
              />
              
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                className="text-xs font-medium text-slate-400"
              />

              {/* Engagement Area & Line (Green) */}
              <Area
                type="monotone"
                dataKey="engagement"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#engagementGrad)"
                dot={{
                  r: 4,
                  fill: "#10b981",
                  stroke: "#10b981",
                  strokeWidth: 1,
                }}
                activeDot={{ r: 6 }}
              />

              {/* Retention Area & Line (Purple) */}
              <Area
                type="monotone"
                dataKey="retention"
                stroke="#5046e5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#retentionGrad)"
                dot={{
                  r: 4,
                  fill: "#5046e5",
                  stroke: "#5046e5",
                  strokeWidth: 1,
                }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Customized Bottom Legend Row */}
        <div className="flex justify-center items-center gap-6 mt-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <span className="w-3 h-0.5 bg-[#10b981] relative flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-white border-2 border-[#10b981]" />
              </span>
            </div>
            <span className="text-[#10b981]">Engagement %</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <span className="w-3 h-0.5 bg-[#5046e5] relative flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-white border-2 border-[#5046e5]" />
              </span>
            </div>
            <span className="text-[#5046e5]">Retention %</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}