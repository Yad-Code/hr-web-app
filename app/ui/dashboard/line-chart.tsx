"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// Define the shape of our dynamic data
export interface ChartDataPoint {
  month: string;
  engagement: number; // Kept as 'engagement' so it seamlessly accepts your wrapper data
  retention: number; // Kept as 'retention' so it seamlessly accepts your wrapper data
}

interface RetentionEngagementChartProps {
  data: ChartDataPoint[];
}

const chartConfig = {
  engagement: {
    label: "Teamwork",
    color: "#10b981",
  },
  retention: {
    label: "Attendance",
    color: "#5046e5",
  },
} satisfies ChartConfig;

export function RetentionEngagementChart({
  data,
}: RetentionEngagementChartProps) {
  const [activeRange, setActiveRange] = React.useState("Y");

  // Dynamically slice the data based on the selected range
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    if (activeRange === "1M") return data.slice(-1);
    if (activeRange === "3M") return data.slice(-3);
    if (activeRange === "6M") return data.slice(-6);
    return data; // "Y" returns all year-to-date data
  }, [data, activeRange]);

  return (
    <Card className="w-full max-w-162.5 border border-gray-100 rounded-2xl shadow-sm bg-white p-2">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">
            Teamwork & Attendance Trends
          </CardTitle>
          <CardDescription className="text-sm font-normal text-slate-500 mt-1">
            Monthly overview · YTD
          </CardDescription>
        </div>

        <div className="flex gap-1 bg-white">
          {["1M", "3M", "6M", "Y"].map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                activeRange === range
                  ? "bg-[#5046e5] text-white border-[#5046e5]"
                  : "bg-white text-slate-500 border-gray-200 hover:bg-slate-50"
              }`}
            >
              {range === "Y" ? "YTD" : range}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="h-60 w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="retentionGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#5046e5" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#5046e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient
                    id="engagementGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

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

                <ChartTooltip
                  cursor={{
                    stroke: "#e2e8f0",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value, name) => {
                        const label =
                          chartConfig[name as keyof typeof chartConfig]
                            ?.label || name;
                        return (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-slate-600">
                              {label}:
                            </span>
                            <span className="font-bold text-slate-900">
                              {value}%
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />

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
          </ChartContainer>
        </div>

        <div className="flex justify-center items-center gap-6 mt-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <span className="w-3 h-0.5 bg-[#10b981] relative flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-white border-2 border-[#10b981]" />
              </span>
            </div>
            <span className="text-[#10b981]">Teamwork %</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <span className="w-3 h-0.5 bg-[#5046e5] relative flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-white border-2 border-[#5046e5]" />
              </span>
            </div>
            <span className="text-[#5046e5]">Attendance %</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
