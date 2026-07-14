import { useEffect } from "react";
import {
  AlertCircle,
  BarChart3,
  Bell,
  Cctv,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dot as LucideDot,
  FileText,
  HardHat,
  LayoutDashboard,
  Maximize2,
  PlayCircle,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Video,
  XCircle,
} from "lucide-react";

export default function Violations() {
  return (
<div className="flex p-8 flex-col flex-1 gap-6">
<div className="border-border border-t-0 border-r-0 border-b-1 border-l-0 border-solid flex px-8 py-4 justify-between items-center">
              <nav className="text-muted-foreground text-[13px] flex items-center gap-1.5">
                <span>Violations</span>
                <ChevronRight className="size-3.5" />
                <span>Review</span>
                <LucideDot className="size-4" />
                <span className="font-medium text-muted-foreground">
                  VID-2025-04471
                </span>
              </nav>
              <div className="flex items-center gap-2">
                <button className="rounded-[10px] text-muted-foreground text-sm leading-5 border-border border-1 border-solid flex px-3 py-2 items-center gap-1.5">
                  <ChevronLeft className="size-4" />
                  Previous
                </button>
                <button className="rounded-[10px] text-muted-foreground text-sm leading-5 border-border border-1 border-solid flex px-3 py-2 items-center gap-1.5">
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex p-8 flex-1 gap-6">
              <div className="shrink-0 flex flex-col gap-4 w-160">
                <div className="rounded-[14px] bg-card border-border border-1 border-solid flex p-4 flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Cctv className="size-4 text-muted-foreground" />
                      <span className="font-medium text-foreground text-sm leading-5">
                        Evidence Frame
                      </span>
                      <span className="rounded-md bg-muted text-muted-foreground text-[11px] px-2 py-0.5">
                        CAM-07
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs">14:28:33 IST</span>
                  </div>
                  <div className="relative aspect-[16/9] rounded-[10px] border-border border-1 border-solid w-full overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1660797189018-4f033612c016?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwcmlkZXIlMjBvbiUyMGhpZ2h3YXklMjByb2FkJTIwaW5kaWF8ZW58MXwwfHx8MTc4MjgwNDg1Mnww&ixlib=rb-4.1.0&q=80&w=400"
                      alt="CCTV still frame of two-wheeler on highway"
                      className="size-full object-cover"
                      data-photoid="R8fE5P1FoEE"
                      data-authorname="Milin John"
                      data-authorurl="https://unsplash.com/@milinjohn"
                      data-blurhash="L76RcOM{01xt_1Rj9Gxt?aRjE2xt"
                    />
                    <div className="left-[14%] top-[30%] h-[52%] w-[40%] rounded-sm border-[#6B7B96] border-2 border-solid absolute">
                      <span className="font-medium rounded-sm bg-[#6B7B96] text-white text-[10px] absolute left-0 -top-6 px-1.5 py-0.5">
                        Motorcycle
                      </span>
                    </div>
                    <div className="left-[20%] top-[18%] h-[40%] w-[26%] rounded-sm border-[#4E8A86] border-2 border-solid absolute">
                      <span className="font-medium rounded-sm bg-[#4E8A86] text-white text-[10px] absolute left-0 -top-6 px-1.5 py-0.5">
                        Rider
                      </span>
                    </div>
                    <div className="left-[24%] top-[16%] h-[12%] w-[12%] rounded-sm border-[#7A2A2A] border-2 border-solid absolute">
                      <span className="font-medium rounded-sm bg-[#7A2A2A] text-white text-[10px] absolute left-0 -top-6 px-1.5 py-0.5">
                        No Helmet
                      </span>
                    </div>
                    <div className="bottom-[14%] left-[30%] h-[8%] w-[14%] rounded-sm border-[#B08A3E] border-2 border-solid absolute">
                      <span className="font-medium rounded-sm bg-[#B08A3E] text-white text-[10px] absolute left-0 -bottom-6 px-1.5 py-0.5">
                        Number Plate
                      </span>
                    </div>
                    <div className="rounded-md bg-black/50 text-white text-[11px] flex absolute right-3 top-3 px-2 py-1 items-center gap-1.5">
                      <Maximize2 className="size-3.5" />
                      Frame 0142
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="relative aspect-video rounded-[10px] border-border border-1 border-solid overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1610886147082-2f8dfa0c1f1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxzY29vdGVyJTIwbW90b3JiaWtlJTIwY2l0eSUyMHJvYWQlMjB0cmFmZmljfGVufDF8MHx8fDE3ODI4MDQ4NTJ8MA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Evidence frame angle 1"
                        className="size-full object-cover"
                        data-photoid="S0fHHKJO8dU"
                        data-authorname="JavyGo"
                        data-authorurl="https://unsplash.com/@laideaes"
                        data-blurhash="LNFYx}x^%0nN~UxvobaJEMt8NGRP"
                      />
                      <span className="rounded-sm bg-black/50 text-white text-[9px] absolute left-1 bottom-1 px-1">
                        +0.4s
                      </span>
                    </div>
                    <div className="relative aspect-video rounded-[10px] border-border border-1 border-solid overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1771207522065-03f7e359dab2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxDQ1RWJTIwdHJhZmZpYyUyMHJvYWQlMjBtb3RvcmN5Y2xlJTIwdHdvLXdoZWVsZXIlMjBzdHJlZXQlMjBzY2VuZXxlbnwxfDB8fHwxNzgyODA0ODUyfDA&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Evidence frame angle 2"
                        className="size-full object-cover"
                        data-photoid="ULspVlDLSPk"
                        data-authorname="Moth"
                        data-authorurl="https://unsplash.com/@wormtomoth"
                        data-blurhash="LKJH]v_3ofIURj?bt7of~qt7xuxu"
                      />
                      <span className="rounded-sm bg-black/50 text-white text-[9px] absolute left-1 bottom-1 px-1">
                        +0.8s
                      </span>
                    </div>
                    <div className="relative aspect-video rounded-[10px] border-border border-1 border-solid overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1647353154271-4e706f07e55a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHx0cmFmZmljJTIwaW50ZXJzZWN0aW9uJTIwc3VydmVpbGxhbmNlJTIwc3RyZWV0JTIwdmVoaWNsZXN8ZW58MXwwfHx8MTc4MjgwNDg1Mnww&ixlib=rb-4.1.0&q=80&w=400"
                        alt="Evidence frame angle 3"
                        className="size-full object-cover"
                        data-photoid="rjXlgnI-8e4"
                        data-authorname="Kenny Elshoff"
                        data-authorurl="https://unsplash.com/@reallybadnews"
                        data-blurhash="LFDm5TKkDNZ~-8Ipsoj^Q+T0s.of"
                      />
                      <span className="rounded-sm bg-black/50 text-white text-[9px] absolute left-1 bottom-1 px-1">
                        +1.2s
                      </span>
                    </div>
                  </div>
                  <button className="rounded-[10px] text-muted-foreground text-sm leading-5 border-border border-1 border-solid flex py-2.5 justify-center items-center gap-2">
                    <PlayCircle className="size-4" />
                    View Full Video Clip
                  </button>
                </div>
              </div>
              <div className="shrink-0 rounded-[14px] bg-card border-border border-1 border-solid flex p-6 flex-col gap-6 w-110">
                <div className="flex justify-between items-center">
                  <span className="font-semibold uppercase text-muted-foreground text-sm leading-5 tracking-wide">
                    Violation Details
                  </span>
                  <span className="font-medium rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs px-3 py-1">
                    Pending Review
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="uppercase text-muted-foreground text-[11px] tracking-wide">
                      Violation ID
                    </span>
                    <span className="text-foreground text-sm leading-5">
                      VID-2025-04471
                    </span>
                  </div>
                  <div className="bg-muted h-px" />
                  <div className="flex flex-col gap-1">
                    <span className="uppercase text-muted-foreground text-[11px] tracking-wide">
                      Timestamp
                    </span>
                    <span className="text-foreground text-sm leading-5">
                      15 Jan 2025 · 14:28:33 IST
                    </span>
                  </div>
                  <div className="bg-muted h-px" />
                  <div className="flex flex-col gap-1">
                    <span className="uppercase text-muted-foreground text-[11px] tracking-wide">
                      Camera
                    </span>
                    <span className="text-foreground text-sm leading-5">
                      CAM-07 · NH-48 Checkpoint
                    </span>
                  </div>
                  <div className="bg-muted h-px" />
                  <div className="flex flex-col gap-1">
                    <span className="uppercase text-muted-foreground text-[11px] tracking-wide">
                      Vehicle Number
                    </span>
                    <span className="font-mono text-foreground text-sm leading-5 tracking-wider">
                      MH12AB3456
                    </span>
                  </div>
                  <div className="bg-muted h-px" />
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="uppercase text-muted-foreground text-[11px] tracking-wide">
                        Confidence Score
                      </span>
                      <span className="text-foreground text-sm leading-5">
                        96.2%
                      </span>
                    </div>
                    <div className="rounded-full bg-muted w-full h-1.5 overflow-hidden">
                      <div className="w-[96%] rounded-full bg-primary h-full" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="uppercase text-muted-foreground text-[11px] tracking-wide">
                    Violation Tags
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-destructive/10 text-destructive text-xs flex px-3 py-1 items-center gap-1">
                      <HardHat className="size-3.5" />
                      No Helmet
                    </span>
                    <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs flex px-3 py-1 items-center gap-1">
                      <Users className="size-3.5" />
                      Triple Riding
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="uppercase text-muted-foreground text-[11px] tracking-wide">
                    Officer Notes
                  </span>
                  <textarea
                    placeholder="Add review notes..."
                    className="resize-none rounded-[10px] bg-background text-foreground text-sm leading-5 border-border border-1 border-solid p-3 w-full h-24"
                  />
                </div>
                <div className="flex mt-auto flex-col gap-3">
                  <button className="font-medium rounded-xl bg-primary text-primary-foreground text-sm leading-5 flex justify-center items-center gap-2 w-full h-11">
                    <CheckCircle2 className="size-4" />
                    {`Approve & Issue Challan`}
                  </button>
                  <button className="rounded-xl text-destructive text-sm leading-5 border-destructive/30 border-1 border-solid flex py-2.5 justify-center items-center gap-2 w-full">
                    <XCircle className="size-4" />
                    Reject Violation
                  </button>
                </div>
              </div>
            </div>
</div>
);
}
