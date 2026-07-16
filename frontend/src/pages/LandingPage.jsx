import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Camera, 
  Lock, 
  Mail, 
  Shield, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Cpu, 
  FileText, 
  Eye, 
  EyeOff,
  Sparkles,
  Layers,
  Video,
  AlertTriangle,
  ArrowUp,
  TrendingUp,
  Target,
  LogIn,
  X,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Area,
  AreaChart as RechartsAreaChart,
  Pie,
  PieChart as RechartsPieChart,
  XAxis,
} from "recharts";

export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Real-Time CCTV Stream Analysis",
      description: "VisionGuard continuously monitors high-definition street camera streams, identifying two-wheeler riders automatically.",
      icon: <Camera className="size-10 text-primary" />,
      tag: "Surveillance Integration"
    },
    {
      title: "Automated Helmet Enforcement",
      description: "Utilizes advanced YOLO object recognition algorithms to analyze and detect riders or pillions without helmets.",
      icon: <Cpu className="size-10 text-primary" />,
      tag: "Helmet Detection AI"
    },
    {
      title: "License Plate Recognition (ALPR)",
      description: "High-accuracy optical character recognition (OCR) extracts vehicle registration plates, even in low-light environments.",
      icon: <Layers className="size-10 text-primary" />,
      tag: "License Plate Extraction"
    },
    {
      title: "Seamless E-Challan Issuance",
      description: "Directly integrates with the Ministry's Vahan database, auto-generating and dispatching challan details with evidence.",
      icon: <FileText className="size-10 text-primary" />,
      tag: "Challan Generation"
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    const userMail = email.trim() || "officer.id@morth.gov.in";
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", userMail);
    setShowLoginModal(false);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="bg-background text-foreground flex w-full min-h-screen relative font-sans">
      
      {/* Sidebar: Public Portal Branding */}
      <aside className="shrink-0 bg-card border-r border-border flex p-6 flex-col gap-8 w-64">
        <div className="flex px-2 pt-2 items-center gap-2">
          <div className="size-9 rounded-xl bg-secondary flex justify-center items-center">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight font-semibold text-foreground text-sm leading-5">
              VisionGuard
            </span>
            <span className="leading-tight text-muted-foreground text-[11px]">
              AI Traffic Patrol
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className="rounded-xl bg-muted/30 border border-border p-4 flex flex-col gap-3">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Public Overview</span>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              This public board presents real-time AI safety statistics, accuracy indices, and enforcement modules active in the metropolitan area.
            </p>
          </div>

          <div className="rounded-xl bg-muted/30 border border-border p-4 flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Authority</span>
            <span className="text-[12px] font-semibold text-foreground">MoRTH Central Division</span>
            <span className="text-[10px] text-muted-foreground">Digital India Initiative</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <button 
            onClick={() => setShowLoginModal(true)}
            className="rounded-xl bg-primary text-primary-foreground font-semibold flex p-3.5 items-center justify-center gap-2.5 hover:bg-primary/90 transition-all cursor-pointer shadow-md shadow-primary/10"
          >
            <LogIn className="size-4" />
            <span className="text-[13px]">Officer Sign In</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area: Public Dashboard Screen */}
      <main className="bg-background flex flex-col flex-1 h-screen overflow-y-auto">
        <div className="flex p-8 flex-col flex-1 gap-6">
          
          {/* Header Row */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h1 className="font-bold text-foreground text-2xl tracking-tight">
                VisionGuard AI Public Information Board
              </h1>
              <span className="text-muted-foreground text-[13px]">
                Autonomous Two-Wheeler Safety & Violation Tracking Panel
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-card border border-border flex px-3 py-1.5 items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-muted-foreground text-[13px] font-medium">
                  System Operational
                </span>
              </div>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="rounded-xl bg-card border border-border flex px-4 py-2 items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all cursor-pointer text-sm font-semibold"
              >
                <LogIn className="size-4 text-primary" />
                <span>Login</span>
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="shadow-sm rounded-[14px] bg-card border border-border flex p-6 flex-col gap-2 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-[13px]">
                  Total Detections Today
                </span>
                <AlertTriangle className="size-4 text-muted-foreground" />
              </div>
              <div className="flex items-end gap-2">
                <span className="leading-none font-bold text-foreground text-4xl">
                  247
                </span>
                <span className="inline-flex rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] mb-1 px-2 py-0.5 items-center gap-0.5 font-medium">
                  <ArrowUp className="size-3" />
                  12%
                </span>
              </div>
            </div>
            
            <div className="shadow-sm rounded-[14px] bg-card border border-border flex p-6 flex-col gap-2 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-[13px]">
                  Active CCTV Feeds
                </span>
                <Video className="size-4 text-muted-foreground" />
              </div>
              <div className="flex items-end gap-2">
                <span className="leading-none font-bold text-foreground text-4xl">
                  18/22
                </span>
                <span className="inline-flex rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] mb-1 px-2 py-0.5 items-center gap-0.5 font-medium">
                  4 Standby
                </span>
              </div>
            </div>

            <div className="shadow-sm rounded-[14px] bg-card border border-border flex p-6 flex-col gap-2 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-[13px]">
                  Challans Dispatched
                </span>
                <FileText className="size-4 text-muted-foreground" />
              </div>
              <div className="flex items-end gap-2">
                <span className="leading-none font-bold text-foreground text-4xl">
                  189
                </span>
                <span className="inline-flex text-muted-foreground text-[11px] mb-1 items-center gap-0.5 font-medium">
                  <TrendingUp className="size-3 text-primary" />
                  Steady flow
                </span>
              </div>
            </div>

            <div className="shadow-sm rounded-[14px] bg-card border border-border flex p-6 flex-col gap-2 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-[13px]">
                  AI Processing Accuracy
                </span>
                <Target className="size-4 text-muted-foreground" />
              </div>
              <div className="flex items-end gap-2">
                <span className="leading-none font-bold text-foreground text-4xl">
                  94.3%
                </span>
                <span className="size-2 rounded-full bg-emerald-500 mb-2" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-6">
            
            {/* Area Chart: Violation Trends */}
            <Card className="col-span-2 shadow-sm rounded-[14px] bg-card border border-border p-6 gap-4">
              <CardHeader className="p-0 gap-1">
                <CardTitle className="font-semibold text-foreground text-[15px]">
                  Violation Trends — Last 7 Days
                </CardTitle>
                <span className="text-muted-foreground text-xs">
                  Detected helmet and multi-riding violations per day
                </span>
              </CardHeader>
              <CardContent className="p-0 mt-4">
                <ChartContainer
                  config={{
                    violations: { label: "Violations", color: "var(--chart-1)" },
                  }}
                  className="w-full h-52"
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
                      <linearGradient id="purpleFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="var(--chart-1)"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--chart-1)"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                    />
                    <ChartTooltip />
                    <Area
                      type="monotone"
                      dataKey="violations"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      fill="url(#purpleFill)"
                    />
                  </RechartsAreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Pie Chart: Violation breakdown */}
            <Card className="shadow-sm rounded-[14px] bg-card border border-border p-6 gap-4">
              <CardHeader className="p-0 gap-1">
                <CardTitle className="font-semibold text-foreground text-[15px]">
                  Violation Type Breakdown
                </CardTitle>
                <span className="text-muted-foreground text-xs">
                  Percentage distribution of violations
                </span>
              </CardHeader>
              <CardContent className="flex p-0 mt-2 flex-col items-center gap-4">
                <ChartContainer
                  config={{ value: { label: "Violations" } }}
                  className="w-full h-40"
                >
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: "No Helmet", value: 55, fill: "var(--chart-1)" },
                        { name: "Triple Riding", value: 30, fill: "var(--chart-2)" },
                        { name: "Other", value: 15, fill: "var(--chart-3)" },
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
                <div className="flex flex-col gap-2 w-full text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">No Helmet</span>
                    </div>
                    <span className="font-semibold text-foreground">55%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-primary/70" />
                      <span className="text-muted-foreground">Triple Riding</span>
                    </div>
                    <span className="font-semibold text-foreground">30%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-primary/40" />
                      <span className="text-muted-foreground">Other</span>
                    </div>
                    <span className="font-semibold text-foreground">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Bottom details block: Slide Show & Features info */}
          <div className="grid grid-cols-12 gap-6 mt-2">
            
            {/* Sliding details cards (vision guard explanation) */}
            <div className="col-span-8 flex flex-col justify-between bg-card border border-border rounded-[14px] p-6 relative overflow-hidden min-h-[220px]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-secondary px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="size-3" />
                  Module Details: {slides[currentSlide].tag}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={handlePrevSlide}
                    className="size-7 rounded border border-border bg-card flex justify-center items-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    className="size-7 rounded border border-border bg-card flex justify-center items-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-5 flex-1 mt-2">
                <div className="shrink-0 size-16 rounded-xl bg-secondary flex justify-center items-center border border-primary/10">
                  {slides[currentSlide].icon}
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <h3 className="text-lg font-bold text-foreground transition-all duration-300">
                    {slides[currentSlide].title}
                  </h3>
                  <p className="text-muted-foreground text-[13px] leading-relaxed max-w-2xl">
                    {slides[currentSlide].description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-4">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === index ? "w-5 bg-primary" : "w-1.5 bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Quick Government Portal Info list */}
            <div className="col-span-4 rounded-[14px] bg-card border border-border p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-[14px] mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  Portal Directives
                </h3>
                <ul className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="size-1.5 rounded-full bg-primary mt-1.5" />
                    <span>Real-time detection models run under central MoRTH node.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="size-1.5 rounded-full bg-primary mt-1.5" />
                    <span>Detections mapped to Vahan & Sarathi API gateways.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="size-1.5 rounded-full bg-primary mt-1.5" />
                    <span>End-to-end evidence logs encrypted using AES-256 protocols.</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-[11px] text-muted-foreground/60 border-t border-border/50 pt-3 mt-4 text-center">
                Ministry of Road Transport & Highways · Govt. of India
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Login modal overlay backdrop */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          
          {/* Sign In Card */}
          <div className="max-w-[420px] w-full relative animate-in fade-in-50 zoom-in-95 duration-200">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground size-8 rounded-lg bg-muted/20 border border-border/10 flex justify-center items-center transition-colors cursor-pointer z-10"
            >
              <X className="size-4" />
            </button>

            <Card className="shadow-2xl rounded-3xl bg-card border border-border p-10 gap-6">
              <CardHeader className="p-0 gap-3">
                <span className="font-semibold uppercase text-muted-foreground text-[10px] tracking-widest">{`Ministry of Road Transport & Highways`}</span>
                <h2 className="font-bold text-foreground text-xl">
                  Officer Terminal Login
                </h2>
                <div className="bg-border w-full h-px mt-1" />
              </CardHeader>
              
              <form onSubmit={handleSignIn} className="flex flex-col gap-6 w-full">
                <CardContent className="p-0 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-foreground text-[13px]">
                      Official Email ID
                    </label>
                    <div className="rounded-xl bg-muted/40 border border-border flex px-4 items-center gap-2.5 focus-within:border-primary/50 transition-colors">
                      <Mail className="size-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="officer.id@morth.gov.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-transparent outline-none text-foreground text-sm w-full h-11"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-foreground text-[13px]">
                      Password
                    </label>
                    <div className="rounded-xl bg-muted/40 border border-border flex px-4 items-center gap-2.5 focus-within:border-primary/50 transition-colors">
                      <Lock className="size-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter authentication password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-transparent outline-none text-foreground text-sm w-full h-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      className="border-border"
                    />
                    <label
                      htmlFor="remember"
                      className="text-muted-foreground text-[13px] cursor-pointer"
                    >
                      Remember officer session
                    </label>
                  </div>
                </CardContent>
                
                <CardFooter className="p-0 flex-col gap-4">
                  <Button 
                    type="submit"
                    className="shadow-md shadow-primary/10 font-semibold rounded-xl bg-primary text-primary-foreground text-sm w-full h-11 hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Authenticate & Enter
                  </Button>
                  <a className="text-muted-foreground hover:text-primary hover:underline text-xs cursor-pointer text-center">
                    Forgot credentials? Contact IT Support
                  </a>
                </CardFooter>
              </form>
            </Card>
          </div>

        </div>
      )}

    </div>
  );
}
