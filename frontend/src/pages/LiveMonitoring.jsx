import { useEffect } from "react";
import {
  AlertCircle,
  BarChart3,
  Bell,
  Cctv,
  ChevronDown,
  FileText,
  Flag,
  LayoutDashboard,
  ScanLine,
  Search,
  Settings,
  ShieldCheck,
  TriangleAlert,
  User,
  Video,
} from "lucide-react";

export default function LiveMonitoring() {
  return (
<div className="flex p-8 flex-col flex-1 gap-6">
<div className="flex justify-between items-center">
              <h1 className="font-semibold text-gray-300 text-xl">
                Live Monitoring
              </h1>
              <div className="flex items-center gap-4">
                <button className="rounded-[10px] bg-[#14171C] text-neutral-50 text-sm leading-5 border-[#1E2530] border-1 border-solid flex px-4 py-2 items-center gap-2">
                  <Cctv className="size-4 text-[#9f9fa9]" />
                  <span>CAM-07 · NH-48 Checkpoint</span>
                  <ChevronDown className="size-4 text-[#9f9fa9]" />
                </button>
                <div className="rounded-full bg-[#14171C] border-[#1E2530] border-1 border-solid flex px-3 py-1.5 items-center gap-2">
                  <span className="relative size-2 flex">
                    <span className="inline-flex size-full animate-ping opacity-60 rounded-full bg-[#00bc7d] absolute" />
                    <span className="relative inline-flex size-2 rounded-full bg-[#00bc7d]" />
                  </span>
                  <span className="text-[#9f9fa9] text-xs leading-4">
                    HD · 30fps · Latency 42ms
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-1 gap-6">
              <div className="flex flex-col flex-1 gap-4">
                <div className="relative rounded-[14px] bg-[#0A0D12] border-[#1E2530] border-1 border-solid w-full h-120 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1673680059436-0d474d6ebf81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxncmF5c2NhbGUlMjB0cmFmZmljJTIwcm9hZCUyMG1vdG9yY3ljbGUlMjByaWRlcnMlMjBjY3R2JTIwdmlld3xlbnwxfDB8fHwxNzgyODA0ODUwfDA&ixlib=rb-4.1.0&q=80&w=400"
                    alt="Live traffic camera feed"
                    className="size-full object-cover grayscale"
                    data-photoid="7xYnori08bE"
                    data-authorname="Đăng Nguyên"
                    data-authorurl="https://unsplash.com/@dangnguyen43"
                    data-blurhash="LCE{kNWB00ay~qIUIUM{?bt7RjWB"
                  />
                  <div className="bg-[#0A0D12]/20 absolute inset-0" />
                  <div className="left-[34%] top-[30%] h-[48%] w-[30%] rounded-sm border-[#2A6B7C] border-2 border-solid absolute">
                    <span className="font-medium rounded-sm bg-[#2A6B7C] text-white text-[11px] absolute left-0 -top-6 px-2 py-0.5">
                      Motorcycle
                    </span>
                  </div>
                  <div className="left-[38%] top-[34%] h-[34%] w-[20%] rounded-sm border-[#3E8595] border-2 border-solid absolute">
                    <span className="font-medium rounded-sm bg-[#3E8595] text-white text-[11px] absolute left-0 -top-6 px-2 py-0.5">
                      Rider
                    </span>
                  </div>
                  <div className="left-[41%] top-[31%] h-[10%] w-[12%] rounded-sm border-[#7A2A2A] border-2 border-solid absolute">
                    <span className="font-medium rounded-sm bg-[#7A2A2A] text-white text-[11px] flex absolute left-0 -top-6 px-2 py-0.5 items-center gap-1">
                      <TriangleAlert className="size-3" />
                      No Helmet
                    </span>
                  </div>
                  <div className="left-[37%] top-[68%] h-[8%] w-[18%] rounded-sm border-[#7A5A1E] border-2 border-solid absolute">
                    <span className="font-medium rounded-sm bg-[#7A5A1E] text-white text-[11px] absolute left-0 -bottom-6 px-2 py-0.5">
                      Number Plate · MH12AB3456
                    </span>
                  </div>
                  <div className="rounded-full bg-[#0A0D12]/80 flex absolute left-4 bottom-4 px-3 py-1.5 items-center gap-2">
                    <ScanLine className="size-3.5 text-[#ff6467]" />
                    <span className="text-gray-300 text-[13px]">
                      Violation Detected · 96.2% confidence
                    </span>
                  </div>
                  <div className="rounded-full bg-[#0A0D12]/80 flex absolute right-4 top-4 px-3 py-1 items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#ff6467]" />
                    <span className="font-medium text-gray-300 text-[11px]">
                      REC
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="relative rounded-[10px] bg-[#14171C] border-[#1E2530] border-1 border-solid h-25 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1494488180300-4c634d1b2124?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc3RyZWV0JTIwdHJhZmZpYyUyMGNhbWVyYSUyMHN1cnZlaWxsYW5jZSUyMHNjZW5lfGVufDF8MHx8fDE3ODI4MDQ4NTB8MA&ixlib=rb-4.1.0&q=80&w=400"
                      alt="CAM-01"
                      className="size-full object-cover grayscale"
                      data-photoid="alGtgU3MQu4"
                      data-authorname="Julien Riedel"
                      data-authorurl="https://unsplash.com/@djulien"
                      data-blurhash="LA8Dw.a~0eRj={j[9tR*xuayWAWC"
                    />
                    <div className="bg-[#0A0D12]/30 absolute inset-0" />
                    <div className="flex absolute left-2 bottom-1.5 items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#00bc7d]" />
                      <span className="font-medium text-gray-300 text-[11px]">
                        CAM-01
                      </span>
                    </div>
                  </div>
                  <div className="relative rounded-[10px] bg-[#14171C] border-[#1E2530] border-1 border-solid h-25 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1507211222203-4d522e372607?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHN0cmVldCUyMHRyYWZmaWMlMjBtb3RvcmN5Y2xlJTIwcmlkZXJzJTIwZGFya3xlbnwxfDB8fHwxNzgyODA0ODU1fDA&ixlib=rb-4.1.0&q=80&w=400"
                      alt="CAM-02"
                      className="size-full object-cover grayscale"
                      data-photoid="IrGyuTSrkK4"
                      data-authorname="Yiran Ding"
                      data-authorurl="https://unsplash.com/@yiranding"
                      data-blurhash="L76I4]oz4TWBPBbbrXjZ01ae-:kW"
                    />
                    <div className="bg-[#0A0D12]/30 absolute inset-0" />
                    <div className="flex absolute left-2 bottom-1.5 items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#00bc7d]" />
                      <span className="font-medium text-gray-300 text-[11px]">
                        CAM-02
                      </span>
                    </div>
                  </div>
                  <div className="relative rounded-[10px] bg-[#14171C] border-[#1E2530] border-1 border-solid h-25 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1777647647320-75c1fda15080?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHx0cmFmZmljJTIwaW50ZXJzZWN0aW9uJTIwY2FycyUyMHN0cmVldCUyMHZpZXd8ZW58MXwwfHx8MTc4MjgwNDg1OXww&ixlib=rb-4.1.0&q=80&w=400"
                      alt="CAM-03"
                      className="size-full object-cover grayscale"
                      data-photoid="UaVnS_G8Gaw"
                      data-authorname="Chutikarn Dejpeum"
                      data-authorurl="https://unsplash.com/@pongz"
                      data-blurhash="L*J+DaM|M{j[.TWCj[ayRPj@j]kC"
                    />
                    <div className="bg-[#0A0D12]/30 absolute inset-0" />
                    <div className="flex absolute left-2 bottom-1.5 items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#ff6467]" />
                      <span className="font-medium text-gray-300 text-[11px]">
                        CAM-03
                      </span>
                    </div>
                  </div>
                  <div className="relative rounded-[10px] bg-[#14171C] border-[#1E2530] border-1 border-solid h-25 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1673680059436-0d474d6ebf81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxncmF5c2NhbGUlMjB0cmFmZmljJTIwcm9hZCUyMG1vdG9yY3ljbGUlMjByaWRlcnMlMjBjY3R2JTIwdmlld3xlbnwxfDB8fHwxNzgyODA0ODUwfDA&ixlib=rb-4.1.0&q=80&w=400"
                      alt="CAM-04"
                      className="size-full object-cover grayscale"
                      data-photoid="7xYnori08bE"
                      data-authorname="Đăng Nguyên"
                      data-authorurl="https://unsplash.com/@dangnguyen43"
                      data-blurhash="LCE{kNWB00ay~qIUIUM{?bt7RjWB"
                    />
                    <div className="bg-[#0A0D12]/30 absolute inset-0" />
                    <div className="flex absolute left-2 bottom-1.5 items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#00bc7d]" />
                      <span className="font-medium text-gray-300 text-[11px]">
                        CAM-04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="shrink-0 rounded-[14px] bg-[#14171C] border-[#1E2530] border-t-0 border-r-0 border-b-0 border-l-1 border-solid flex p-5 flex-col gap-4 w-70">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-gray-400 text-sm">
                    Event Stream
                  </h2>
                  <span className="rounded-full bg-zinc-800 text-[#9f9fa9] text-[10px] flex px-2 py-0.5 items-center gap-1">
                    <span className="size-1.5 rounded-full bg-[#00bc7d]" />
                    Live
                  </span>
                </div>
                <div className="max-h-[640px] overflow-y-auto flex pr-1 flex-col gap-2">
                  <div className="rounded-[10px] bg-[#161B22] flex p-3 flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <div className="size-12 shrink-0 rounded-sm bg-[#0A0D12] overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1673680059436-0d474d6ebf81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxncmF5c2NhbGUlMjB0cmFmZmljJTIwcm9hZCUyMG1vdG9yY3ljbGUlMjByaWRlcnMlMjBjY3R2JTIwdmlld3xlbnwxfDB8fHwxNzgyODA0ODUwfDA&ixlib=rb-4.1.0&q=80&w=400"
                          alt="event"
                          className="size-full object-cover grayscale"
                          data-photoid="7xYnori08bE"
                          data-authorname="Đăng Nguyên"
                          data-authorurl="https://unsplash.com/@dangnguyen43"
                          data-blurhash="LCE{kNWB00ay~qIUIUM{?bt7RjWB"
                        />
                      </div>
                      <div className="flex flex-col flex-1 gap-0.5">
                        <span className="text-[#4A5568] text-[11px]">
                          14:32:08
                        </span>
                        <span className="text-[#C8CDD6] text-[13px]">
                          No Helmet
                        </span>
                        <span className="text-[#5E9AA6] text-xs">
                          MH12AB3456
                        </span>
                      </div>
                    </div>
                    <button className="rounded-sm bg-[#2A6B7C]/30 text-[#7FB3C0] text-[11px] flex py-1.5 justify-center items-center gap-1.5 w-full">
                      <Flag className="size-3" />
                      Flag for Review
                    </button>
                  </div>
                  <div className="rounded-[10px] bg-[#161B22] flex p-3 flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <div className="size-12 shrink-0 rounded-sm bg-[#0A0D12] overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1507211222203-4d522e372607?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHN0cmVldCUyMHRyYWZmaWMlMjBtb3RvcmN5Y2xlJTIwcmlkZXJzJTIwZGFya3xlbnwxfDB8fHwxNzgyODA0ODU1fDA&ixlib=rb-4.1.0&q=80&w=400"
                          alt="event"
                          className="size-full object-cover grayscale"
                          data-photoid="IrGyuTSrkK4"
                          data-authorname="Yiran Ding"
                          data-authorurl="https://unsplash.com/@yiranding"
                          data-blurhash="L76I4]oz4TWBPBbbrXjZ01ae-:kW"
                        />
                      </div>
                      <div className="flex flex-col flex-1 gap-0.5">
                        <span className="text-[#4A5568] text-[11px]">
                          14:31:47
                        </span>
                        <span className="text-[#C8CDD6] text-[13px]">
                          Triple Riding
                        </span>
                        <span className="text-[#5E9AA6] text-xs">
                          MH14CD7890
                        </span>
                      </div>
                    </div>
                    <button className="rounded-sm bg-[#2A6B7C]/30 text-[#7FB3C0] text-[11px] flex py-1.5 justify-center items-center gap-1.5 w-full">
                      <Flag className="size-3" />
                      Flag for Review
                    </button>
                  </div>
                  <div className="rounded-[10px] bg-[#161B22] flex p-3 flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <div className="size-12 shrink-0 rounded-sm bg-[#0A0D12] overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1494488180300-4c634d1b2124?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc3RyZWV0JTIwdHJhZmZpYyUyMGNhbWVyYSUyMHN1cnZlaWxsYW5jZSUyMHNjZW5lfGVufDF8MHx8fDE3ODI4MDQ4NTB8MA&ixlib=rb-4.1.0&q=80&w=400"
                          alt="event"
                          className="size-full object-cover grayscale"
                          data-photoid="alGtgU3MQu4"
                          data-authorname="Julien Riedel"
                          data-authorurl="https://unsplash.com/@djulien"
                          data-blurhash="LA8Dw.a~0eRj={j[9tR*xuayWAWC"
                        />
                      </div>
                      <div className="flex flex-col flex-1 gap-0.5">
                        <span className="text-[#4A5568] text-[11px]">
                          14:30:55
                        </span>
                        <span className="text-[#C8CDD6] text-[13px]">
                          No Helmet
                        </span>
                        <span className="text-[#5E9AA6] text-xs">
                          MH01EF2345
                        </span>
                      </div>
                    </div>
                    <button className="rounded-sm bg-[#2A6B7C]/30 text-[#7FB3C0] text-[11px] flex py-1.5 justify-center items-center gap-1.5 w-full">
                      <Flag className="size-3" />
                      Flag for Review
                    </button>
                  </div>
                  <div className="rounded-[10px] bg-[#161B22] flex p-3 flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <div className="size-12 shrink-0 rounded-sm bg-[#0A0D12] overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1777647647320-75c1fda15080?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHx0cmFmZmljJTIwaW50ZXJzZWN0aW9uJTIwY2FycyUyMHN0cmVldCUyMHZpZXd8ZW58MXwwfHx8MTc4MjgwNDg1OXww&ixlib=rb-4.1.0&q=80&w=400"
                          alt="event"
                          className="size-full object-cover grayscale"
                          data-photoid="UaVnS_G8Gaw"
                          data-authorname="Chutikarn Dejpeum"
                          data-authorurl="https://unsplash.com/@pongz"
                          data-blurhash="L*J+DaM|M{j[.TWCj[ayRPj@j]kC"
                        />
                      </div>
                      <div className="flex flex-col flex-1 gap-0.5">
                        <span className="text-[#4A5568] text-[11px]">
                          14:29:33
                        </span>
                        <span className="text-[#C8CDD6] text-[13px]">
                          Wrong Lane
                        </span>
                        <span className="text-[#5E9AA6] text-xs">
                          MH02GH6789
                        </span>
                      </div>
                    </div>
                    <button className="rounded-sm bg-[#2A6B7C]/30 text-[#7FB3C0] text-[11px] flex py-1.5 justify-center items-center gap-1.5 w-full">
                      <Flag className="size-3" />
                      Flag for Review
                    </button>
                  </div>
                  <div className="rounded-[10px] bg-[#161B22] flex p-3 flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <div className="size-12 shrink-0 rounded-sm bg-[#0A0D12] overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1673680059436-0d474d6ebf81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxncmF5c2NhbGUlMjB0cmFmZmljJTIwcm9hZCUyMG1vdG9yY3ljbGUlMjByaWRlcnMlMjBjY3R2JTIwdmlld3xlbnwxfDB8fHwxNzgyODA0ODUwfDA&ixlib=rb-4.1.0&q=80&w=400"
                          alt="event"
                          className="size-full object-cover grayscale"
                          data-photoid="7xYnori08bE"
                          data-authorname="Đăng Nguyên"
                          data-authorurl="https://unsplash.com/@dangnguyen43"
                          data-blurhash="LCE{kNWB00ay~qIUIUM{?bt7RjWB"
                        />
                      </div>
                      <div className="flex flex-col flex-1 gap-0.5">
                        <span className="text-[#4A5568] text-[11px]">
                          14:28:12
                        </span>
                        <span className="text-[#C8CDD6] text-[13px]">
                          No Helmet
                        </span>
                        <span className="text-[#5E9AA6] text-xs">
                          MH04JK1122
                        </span>
                      </div>
                    </div>
                    <button className="rounded-sm bg-[#2A6B7C]/30 text-[#7FB3C0] text-[11px] flex py-1.5 justify-center items-center gap-1.5 w-full">
                      <Flag className="size-3" />
                      Flag for Review
                    </button>
                  </div>
                  <div className="rounded-[10px] bg-[#161B22] flex p-3 flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <div className="size-12 shrink-0 rounded-sm bg-[#0A0D12] overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1507211222203-4d522e372607?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHN0cmVldCUyMHRyYWZmaWMlMjBtb3RvcmN5Y2xlJTIwcmlkZXJzJTIwZGFya3xlbnwxfDB8fHwxNzgyODA0ODU1fDA&ixlib=rb-4.1.0&q=80&w=400"
                          alt="event"
                          className="size-full object-cover grayscale"
                          data-photoid="IrGyuTSrkK4"
                          data-authorname="Yiran Ding"
                          data-authorurl="https://unsplash.com/@yiranding"
                          data-blurhash="L76I4]oz4TWBPBbbrXjZ01ae-:kW"
                        />
                      </div>
                      <div className="flex flex-col flex-1 gap-0.5">
                        <span className="text-[#4A5568] text-[11px]">
                          14:27:40
                        </span>
                        <span className="text-[#C8CDD6] text-[13px]">
                          No Helmet
                        </span>
                        <span className="text-[#5E9AA6] text-xs">
                          MH09LM3344
                        </span>
                      </div>
                    </div>
                    <button className="rounded-sm bg-[#2A6B7C]/30 text-[#7FB3C0] text-[11px] flex py-1.5 justify-center items-center gap-1.5 w-full">
                      <Flag className="size-3" />
                      Flag for Review
                    </button>
                  </div>
                  <div className="rounded-[10px] bg-[#161B22] flex p-3 flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <div className="size-12 shrink-0 rounded-sm bg-[#0A0D12] overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1494488180300-4c634d1b2124?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc3RyZWV0JTIwdHJhZmZpYyUyMGNhbWVyYSUyMHN1cnZlaWxsYW5jZSUyMHNjZW5lfGVufDF8MHx8fDE3ODI4MDQ4NTB8MA&ixlib=rb-4.1.0&q=80&w=400"
                          alt="event"
                          className="size-full object-cover grayscale"
                          data-photoid="alGtgU3MQu4"
                          data-authorname="Julien Riedel"
                          data-authorurl="https://unsplash.com/@djulien"
                          data-blurhash="LA8Dw.a~0eRj={j[9tR*xuayWAWC"
                        />
                      </div>
                      <div className="flex flex-col flex-1 gap-0.5">
                        <span className="text-[#4A5568] text-[11px]">
                          14:26:18
                        </span>
                        <span className="text-[#C8CDD6] text-[13px]">
                          Triple Riding
                        </span>
                        <span className="text-[#5E9AA6] text-xs">
                          MH12NP5566
                        </span>
                      </div>
                    </div>
                    <button className="rounded-sm bg-[#2A6B7C]/30 text-[#7FB3C0] text-[11px] flex py-1.5 justify-center items-center gap-1.5 w-full">
                      <Flag className="size-3" />
                      Flag for Review
                    </button>
                  </div>
                  <div className="rounded-[10px] bg-[#161B22] flex p-3 flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <div className="size-12 shrink-0 rounded-sm bg-[#0A0D12] overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1777647647320-75c1fda15080?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHx0cmFmZmljJTIwaW50ZXJzZWN0aW9uJTIwY2FycyUyMHN0cmVldCUyMHZpZXd8ZW58MXwwfHx8MTc4MjgwNDg1OXww&ixlib=rb-4.1.0&q=80&w=400"
                          alt="event"
                          className="size-full object-cover grayscale"
                          data-photoid="UaVnS_G8Gaw"
                          data-authorname="Chutikarn Dejpeum"
                          data-authorurl="https://unsplash.com/@pongz"
                          data-blurhash="L*J+DaM|M{j[.TWCj[ayRPj@j]kC"
                        />
                      </div>
                      <div className="flex flex-col flex-1 gap-0.5">
                        <span className="text-[#4A5568] text-[11px]">
                          14:25:02
                        </span>
                        <span className="text-[#C8CDD6] text-[13px]">
                          No Helmet
                        </span>
                        <span className="text-[#5E9AA6] text-xs">
                          MH20QR7788
                        </span>
                      </div>
                    </div>
                    <button className="rounded-sm bg-[#2A6B7C]/30 text-[#7FB3C0] text-[11px] flex py-1.5 justify-center items-center gap-1.5 w-full">
                      <Flag className="size-3" />
                      Flag for Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
</div>
);
}
