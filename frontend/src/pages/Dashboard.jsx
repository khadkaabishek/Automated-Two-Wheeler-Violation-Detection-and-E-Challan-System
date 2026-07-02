import { useEffect } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUp,
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  Video,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Area,
  AreaChart as RechartsAreaChart,
  Pie,
  PieChart as RechartsPieChart,
  XAxis,
} from "recharts";

export default function Dashboard() {
  return (
<div className="flex p-8 flex-col flex-1 gap-6">
<div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h1 className="font-semibold text-gray-300 text-xl">
                Dashboard Overview
              </h1>
              <span className="text-[#5A6070] text-[13px]">
                15 Jan 2025 · 14:32 IST
              </span>
            </div>
            <div className="rounded-full bg-[#14171C] border-[#1E2530] border-1 border-solid flex px-3 py-1.5 items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500/80" />
              <span className="text-gray-400 text-[13px]">
                System Operational
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="shadow-sm rounded-[14px] bg-[#14171C] border-[#1E2530] border-1 border-solid flex p-6 flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-[13px]">
                  Total Violations Today
                </span>
                <AlertTriangle className="size-4 text-[#5A6070]" />
              </div>
              <div className="flex items-end gap-2">
                <span className="leading-none font-bold text-gray-300 text-4xl">
                  247
                </span>
                <span className="inline-flex rounded-full bg-emerald-500/10 text-emerald-400/90 text-[11px] mb-1 px-2 py-0.5 items-center gap-0.5">
                  <ArrowUp className="size-3" />
                  12%
                </span>
              </div>
            </div>
            <div className="shadow-sm rounded-[14px] bg-[#14171C] border-[#1E2530] border-1 border-solid flex p-6 flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-[13px]">
                  Active Cameras
                </span>
                <Video className="size-4 text-[#5A6070]" />
              </div>
              <div className="flex items-end gap-2">
                <span className="leading-none font-bold text-gray-300 text-4xl">
                  18/22
                </span>
                <span className="inline-flex rounded-full bg-amber-500/10 text-amber-400/80 text-[11px] mb-1 px-2 py-0.5 items-center gap-0.5">
                  4 offline
                </span>
              </div>
            </div>
            <div className="shadow-sm rounded-[14px] bg-[#14171C] border-[#1E2530] border-1 border-solid flex p-6 flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-[13px]">
                  Challans Generated
                </span>
                <FileText className="size-4 text-[#5A6070]" />
              </div>
              <div className="flex items-end gap-2">
                <span className="leading-none font-bold text-gray-300 text-4xl">
                  189
                </span>
                <span className="inline-flex text-[#6B8A99] text-[11px] mb-1 items-center gap-0.5">
                  <TrendingUp className="size-3" />
                  steady
                </span>
              </div>
            </div>
            <div className="shadow-sm rounded-[14px] bg-[#14171C] border-[#1E2530] border-1 border-solid flex p-6 flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-[13px]">
                  Detection Accuracy
                </span>
                <Target className="size-4 text-[#5A6070]" />
              </div>
              <div className="flex items-end gap-2">
                <span className="leading-none font-bold text-gray-300 text-4xl">
                  94.3%
                </span>
                <span className="size-2 rounded-full bg-emerald-500/80 mb-1" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2 shadow-sm rounded-[14px] bg-[#14171C] border-[#1E2530] border-0 border-solid p-6 gap-4">
              <CardHeader className="p-0 gap-1">
                <CardTitle className="font-semibold text-gray-300 text-[15px]">
                  Violation Trends — Last 7 Days
                </CardTitle>
                <span className="text-[#5A6070] text-xs">
                  Detected violations per day
                </span>
              </CardHeader>
              <CardContent className="p-0">
                <ChartContainer
                  config={{
                    violations: { label: "Violations", color: "#2A6B7C" },
                  }}
                  className="w-full h-50"
                >
                  <RechartsAreaChart
                    data={[
                      { day: "Mon", violations: 180 },
                      { day: "Tue", violations: 210 },
                      { day: "Wed", violations: 195 },
                      { day: "Thu", violations: 240 },
                      { day: "Fri", violations: 220 },
                      { day: "Sat", violations: 265 },
                      { day: "Sun", violations: 247 },
                    ]}
                  >
                    <defs>
                      <linearGradient id="tealFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#2A6B7C"
                          stopOpacity="0.5"
                        />
                        <stop
                          offset="100%"
                          stopColor="#2A6B7C"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#5A6070", fontSize: 12 }}
                    />
                    <ChartTooltip />
                    <Area
                      type="monotone"
                      dataKey="violations"
                      stroke="#2A6B7C"
                      strokeWidth={2}
                      fill="url(#tealFill)"
                    />
                  </RechartsAreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="shadow-sm rounded-[14px] bg-[#14171C] border-[#1E2530] border-0 border-solid p-6 gap-4">
              <CardHeader className="p-0 gap-1">
                <CardTitle className="font-semibold text-gray-300 text-[15px]">
                  Violation Type Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="flex p-0 flex-col items-center gap-4">
                <ChartContainer
                  config={{ value: { label: "Violations" } }}
                  className="w-full h-37.5"
                >
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: "No Helmet", value: 55, fill: "#2A6B7C" },
                        { name: "Triple Riding", value: 30, fill: "#3D5A6B" },
                        { name: "Other", value: 15, fill: "#1E3040" },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={65}
                      strokeWidth={0}
                    />
                    <ChartTooltip />
                  </RechartsPieChart>
                </ChartContainer>
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-sm bg-[#2A6B7C]" />
                      <span className="text-gray-400 text-xs">No Helmet</span>
                    </div>
                    <span className="text-gray-500 text-xs">55%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-sm bg-[#3D5A6B]" />
                      <span className="text-gray-400 text-xs">
                        Triple Riding
                      </span>
                    </div>
                    <span className="text-gray-500 text-xs">30%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-sm bg-[#1E3040]" />
                      <span className="text-gray-400 text-xs">Other</span>
                    </div>
                    <span className="text-gray-500 text-xs">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-sm rounded-[14px] bg-[#14171C] border-[#1E2530] border-0 border-solid p-6 gap-4">
            <CardHeader className="p-0 gap-1">
              <CardTitle className="font-semibold text-gray-300 text-[15px]">
                Recent Violations Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="text-left w-full">
                <thead>
                  <tr className="border-[#1E2530] border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                    <th className="font-medium text-[#5A6070] text-xs py-2">
                      Time
                    </th>
                    <th className="font-medium text-[#5A6070] text-xs py-2">
                      Camera ID
                    </th>
                    <th className="font-medium text-[#5A6070] text-xs py-2">
                      Vehicle No.
                    </th>
                    <th className="font-medium text-[#5A6070] text-xs py-2">
                      Violation Type
                    </th>
                    <th className="font-medium text-[#5A6070] text-xs py-2">
                      Confidence
                    </th>
                    <th className="font-medium text-[#5A6070] text-xs py-2">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-400 text-[13px]">
                  <tr className="border-[#1E2530]/60 border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                    <td className="py-2.5">14:31</td>
                    <td className="py-2.5">CAM-07</td>
                    <td className="py-2.5">MH12 AB 4521</td>
                    <td className="py-2.5">No Helmet</td>
                    <td className="py-2.5">96.2%</td>
                    <td className="py-2.5">
                      <span className="rounded-full bg-amber-500/10 text-amber-400/80 text-[11px] px-2 py-0.5">
                        Pending
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-[#161B22] border-[#1E2530]/60 border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                    <td className="py-2.5">14:28</td>
                    <td className="py-2.5">CAM-03</td>
                    <td className="py-2.5">MH14 CD 9087</td>
                    <td className="py-2.5">Triple Riding</td>
                    <td className="py-2.5">91.7%</td>
                    <td className="py-2.5">
                      <span className="rounded-full bg-emerald-500/10 text-emerald-400/90 text-[11px] px-2 py-0.5">
                        Challan Issued
                      </span>
                    </td>
                  </tr>
                  <tr className="border-[#1E2530]/60 border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                    <td className="py-2.5">14:22</td>
                    <td className="py-2.5">CAM-11</td>
                    <td className="py-2.5">MH02 EF 1342</td>
                    <td className="py-2.5">No Helmet</td>
                    <td className="py-2.5">88.4%</td>
                    <td className="py-2.5">
                      <span className="rounded-full bg-[#3A4A5A]/30 text-[#8FA3B5] text-[11px] px-2 py-0.5">
                        Under Review
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-[#161B22] border-[#1E2530]/60 border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                    <td className="py-2.5">14:18</td>
                    <td className="py-2.5">CAM-05</td>
                    <td className="py-2.5">MH20 GH 7765</td>
                    <td className="py-2.5">No Helmet</td>
                    <td className="py-2.5">95.1%</td>
                    <td className="py-2.5">
                      <span className="rounded-full bg-emerald-500/10 text-emerald-400/90 text-[11px] px-2 py-0.5">
                        Challan Issued
                      </span>
                    </td>
                  </tr>
                  <tr className="border-[#1E2530]/60 border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                    <td className="py-2.5">14:09</td>
                    <td className="py-2.5">CAM-09</td>
                    <td className="py-2.5">MH31 IJ 5520</td>
                    <td className="py-2.5">Triple Riding</td>
                    <td className="py-2.5">82.6%</td>
                    <td className="py-2.5">
                      <span className="rounded-full bg-amber-500/10 text-amber-400/80 text-[11px] px-2 py-0.5">
                        Pending
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-[#161B22]">
                    <td className="py-2.5">14:01</td>
                    <td className="py-2.5">CAM-02</td>
                    <td className="py-2.5">MH12 KL 3398</td>
                    <td className="py-2.5">No Helmet</td>
                    <td className="py-2.5">93.8%</td>
                    <td className="py-2.5">
                      <span className="rounded-full bg-[#3A4A5A]/30 text-[#8FA3B5] text-[11px] px-2 py-0.5">
                        Under Review
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
</div>
);
}
