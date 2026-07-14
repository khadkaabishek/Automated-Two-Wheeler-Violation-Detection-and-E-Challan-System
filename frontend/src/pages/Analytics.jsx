import { useEffect } from "react";
import {
  AlertCircle,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Pie,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
} from "recharts";

export default function Analytics() {
  return (
<div className="flex p-8 flex-col flex-1 gap-6">
<div className="flex justify-between items-center">
            <h1 className="font-semibold text-foreground text-xl">{`Analytics & Insights`}</h1>
            <div className="flex items-center gap-4">
              <div className="rounded-[10px] border-border border-1 border-solid flex p-1 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-foreground text-sm leading-5 px-2">
                  Jan 2025
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                className="rounded-[10px] text-foreground border-border border-1 border-solid gap-2"
              >
                <Download className="size-4" />
                Export Data
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <Card className="rounded-[14px] bg-card border-border border-0 border-solid p-5 gap-2">
              <CardHeader className="p-0 gap-1">
                <CardTitle className="font-medium text-muted-foreground text-xs leading-4">
                  Monthly Violations
                </CardTitle>
              </CardHeader>
              <CardContent className="flex p-0 justify-between items-end gap-2">
                <span className="leading-none font-bold text-foreground text-[32px]">
                  3,847
                </span>
                <span className="text-[oklch(0.696_0.17_162.48)] text-sm leading-5 flex items-center gap-1">
                  <TrendingUp className="size-4" />
                  +8.4%
                </span>
              </CardContent>
            </Card>
            <Card className="rounded-[14px] bg-card border-border border-0 border-solid p-5 gap-2">
              <CardHeader className="p-0 gap-1">
                <CardTitle className="font-medium text-muted-foreground text-xs leading-4">
                  Helmet Compliance Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="flex p-0 justify-between items-end gap-2">
                <span className="leading-none font-bold text-foreground text-[32px]">
                  61.2%
                </span>
                <span className="text-[oklch(0.769_0.188_70.08)] text-sm leading-5 flex items-center gap-1">
                  <TrendingDown className="size-4" />
                  -1.2%
                </span>
              </CardContent>
            </Card>
            <Card className="rounded-[14px] bg-card border-border border-0 border-solid p-5 gap-2">
              <CardHeader className="p-0 gap-1">
                <CardTitle className="font-medium text-muted-foreground text-xs leading-4">
                  Avg Detection Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent className="flex p-0 justify-between items-end gap-2">
                <span className="leading-none font-bold text-foreground text-[32px]">
                  94.7%
                </span>
                <span className="text-[oklch(0.696_0.17_162.48)] text-sm leading-5 flex items-center gap-1">
                  <TrendingUp className="size-4" />
                  +2.1%
                </span>
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-6">
            <Card className="rounded-[14px] bg-card border-border border-0 border-solid p-6 flex-1 gap-4">
              <CardHeader className="p-0 gap-1">
                <CardTitle className="font-semibold text-foreground text-sm leading-5">
                  Monthly Violation Trends
                </CardTitle>
                <div className="flex pt-1 items-center gap-4">
                  <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                    <span className="size-2 rounded-sm bg-primary" />
                    No Helmet
                  </span>
                  <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                    <span className="size-2 rounded-sm bg-[#3D5A6B]" />
                    Triple Riding
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ChartContainer
                  config={{
                    noHelmet: { label: "No Helmet", color: "var(--chart-1)" },
                    triple: { label: "Triple Riding", color: "var(--chart-2)" },
                  }}
                  className="w-full h-55"
                >
                  <RechartsBarChart
                    data={[
                      { m: "Jan", noHelmet: 240, triple: 120 },
                      { m: "Feb", noHelmet: 280, triple: 140 },
                      { m: "Mar", noHelmet: 220, triple: 110 },
                      { m: "Apr", noHelmet: 300, triple: 160 },
                      { m: "May", noHelmet: 260, triple: 130 },
                      { m: "Jun", noHelmet: 320, triple: 170 },
                      { m: "Jul", noHelmet: 290, triple: 150 },
                      { m: "Aug", noHelmet: 340, triple: 180 },
                      { m: "Sep", noHelmet: 310, triple: 160 },
                      { m: "Oct", noHelmet: 360, triple: 190 },
                      { m: "Nov", noHelmet: 330, triple: 170 },
                      { m: "Dec", noHelmet: 380, triple: 200 },
                    ]}
                  >
                    <CartesianGrid vertical={false} stroke="#1E2530" />
                    <XAxis
                      dataKey="m"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#4A5568", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                      width={32}
                    />
                    <ChartTooltip />
                    <Bar dataKey="noHelmet" fill="var(--chart-1)" radius={3} />
                    <Bar dataKey="triple" fill="var(--chart-2)" radius={3} />
                  </RechartsBarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="shrink-0 rounded-[14px] bg-card border-border border-0 border-solid p-6 gap-4 w-95">
              <CardHeader className="p-0 gap-1">
                <CardTitle className="font-semibold text-foreground text-sm leading-5">
                  Violation Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="flex p-0 flex-col items-center gap-4">
                <div className="relative">
                  <ChartContainer
                    config={{ v: { label: "Violations" } }}
                    className="w-50 h-50"
                  >
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: "No Helmet", value: 1820, fill: "var(--chart-1)" },
                          {
                            name: "Triple Riding",
                            value: 980,
                            fill: "var(--chart-2)",
                          },
                          { name: "Wrong Lane", value: 620, fill: "#4A5568" },
                          { name: "Signal Jump", value: 427, fill: "#2D3748" },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={88}
                        strokeWidth={2}
                        stroke="#14171C"
                      />
                      <ChartTooltip />
                    </RechartsPieChart>
                  </ChartContainer>
                  <div className="pointer-events-none flex absolute inset-0 flex-col justify-center items-center">
                    <span className="font-bold text-foreground text-xl leading-7">
                      3,847
                    </span>
                    <span className="text-muted-foreground text-[11px]">Total</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <span className="text-muted-foreground text-xs leading-4 flex items-center gap-1">
                    <span className="size-2 rounded-sm bg-primary" />
                    No Helmet
                  </span>
                  <span className="text-muted-foreground text-xs leading-4 flex items-center gap-1">
                    <span className="size-2 rounded-sm bg-[#3D5A6B]" />
                    Triple Riding
                  </span>
                  <span className="text-muted-foreground text-xs leading-4 flex items-center gap-1">
                    <span className="size-2 rounded-sm bg-[#4A5568]" />
                    Wrong Lane
                  </span>
                  <span className="text-muted-foreground text-xs leading-4 flex items-center gap-1">
                    <span className="size-2 rounded-sm bg-[#2D3748]" />
                    Signal Jump
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-6">
            <Card className="shrink-0 rounded-[14px] bg-card border-border border-0 border-solid p-5 gap-4 w-110">
              <CardHeader className="p-0 gap-1">
                <CardTitle className="font-semibold text-foreground text-sm leading-5">
                  Camera Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ChartContainer
                  config={{ c: { label: "Violations", color: "var(--chart-1)" } }}
                  className="w-full h-50"
                >
                  <RechartsBarChart
                    layout="vertical"
                    data={[
                      { cam: "CAM-07", c: 420 },
                      { cam: "CAM-12", c: 380 },
                      { cam: "CAM-03", c: 340 },
                      { cam: "CAM-19", c: 300 },
                      { cam: "CAM-05", c: 270 },
                      { cam: "CAM-21", c: 240 },
                      { cam: "CAM-09", c: 210 },
                      { cam: "CAM-14", c: 180 },
                    ]}
                    margin={{ left: 8 }}
                  >
                    <CartesianGrid horizontal={false} stroke="#1E2530" />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="cam"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      width={56}
                    />
                    <ChartTooltip />
                    <Bar dataKey="c" fill="var(--chart-1)" radius={3} />
                  </RechartsBarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="rounded-[14px] bg-card border-border border-0 border-solid p-5 flex-1 gap-4">
              <CardHeader className="p-0 gap-1">
                <CardTitle className="font-semibold text-foreground text-sm leading-5">
                  Helmet Compliance Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent className="flex p-0 flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    <span className="text-muted-foreground text-[11px] w-8">Mon</span>
                    <div className="flex flex-1 gap-1">
                      <span className="rounded-xs bg-background flex-1 h-4" />
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                      <span className="rounded-xs bg-background flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-muted-foreground text-[11px] w-8">Tue</span>
                    <div className="flex flex-1 gap-1">
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-background flex-1 h-4" />
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-muted-foreground text-[11px] w-8">Wed</span>
                    <div className="flex flex-1 gap-1">
                      <span className="rounded-xs bg-background flex-1 h-4" />
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-muted-foreground text-[11px] w-8">Thu</span>
                    <div className="flex flex-1 gap-1">
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-background flex-1 h-4" />
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-muted-foreground text-[11px] w-8">Fri</span>
                    <div className="flex flex-1 gap-1">
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-muted-foreground text-[11px] w-8">Sat</span>
                    <div className="flex flex-1 gap-1">
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-muted-foreground text-[11px] w-8">Sun</span>
                    <div className="flex flex-1 gap-1">
                      <span className="rounded-xs bg-background flex-1 h-4" />
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                      <span className="rounded-xs bg-background flex-1 h-4" />
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-primary flex-1 h-4" />
                      <span className="rounded-xs bg-[#22566B] flex-1 h-4" />
                      <span className="rounded-xs bg-[#1A3D4A] flex-1 h-4" />
                      <span className="rounded-xs bg-[#16313A] flex-1 h-4" />
                    </div>
                  </div>
                  <div className="flex pt-1 gap-1">
                    <span className="w-8" />
                    <div className="flex flex-1 gap-1">
                      <span className="text-center text-muted-foreground text-[11px] flex-1">
                        00
                      </span>
                      <span className="text-center text-muted-foreground text-[11px] flex-1">
                        02
                      </span>
                      <span className="text-center text-muted-foreground text-[11px] flex-1">
                        04
                      </span>
                      <span className="text-center text-muted-foreground text-[11px] flex-1">
                        06
                      </span>
                      <span className="text-center text-muted-foreground text-[11px] flex-1">
                        08
                      </span>
                      <span className="text-center text-muted-foreground text-[11px] flex-1">
                        10
                      </span>
                      <span className="text-center text-muted-foreground text-[11px] flex-1">
                        12
                      </span>
                      <span className="text-center text-muted-foreground text-[11px] flex-1">
                        14
                      </span>
                      <span className="text-center text-muted-foreground text-[11px] flex-1">
                        16
                      </span>
                      <span className="text-center text-muted-foreground text-[11px] flex-1">
                        18
                      </span>
                      <span className="text-center text-muted-foreground text-[11px] flex-1">
                        20
                      </span>
                      <span className="text-center text-muted-foreground text-[11px] flex-1">
                        22
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[11px]">Low</span>
                  <span className="rounded-xs bg-background border-border border-1 border-solid w-6 h-3" />
                  <span className="rounded-xs bg-[#16313A] w-6 h-3" />
                  <span className="rounded-xs bg-[#1A3D4A] w-6 h-3" />
                  <span className="rounded-xs bg-[#22566B] w-6 h-3" />
                  <span className="rounded-xs bg-primary w-6 h-3" />
                  <span className="text-muted-foreground text-[11px]">High</span>
                </div>
              </CardContent>
            </Card>
          </div>
</div>
);
}
