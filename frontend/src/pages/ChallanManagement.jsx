import { useEffect } from "react";
import {
  AlertCircle,
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChallanManagement() {
  return (
<div className="flex p-8 flex-col flex-1 gap-6">
<div className="flex justify-between items-center">
            <h1 className="font-semibold text-foreground text-xl">
              E-Challan Management
            </h1>
            <Button
              variant="ghost"
              className="rounded-[10px] text-muted-foreground border-border border-1 border-solid px-4 py-2"
            >
              <Download className="size-4" />
              Generate Report
            </Button>
          </div>
          <div className="rounded-xl bg-card border-border border-1 border-solid flex p-4 flex-wrap items-center gap-4">
            <div className="relative w-70">
              <Search className="size-4 top-1/2 -translate-y-1/2 text-muted-foreground absolute left-3" />
              <input
                className="outline-none rounded-[10px] bg-background text-foreground text-sm leading-5 border-border border-1 border-solid pl-9 pr-3 py-2 w-full"
                placeholder="Search by vehicle number..."
              />
            </div>
            <button className="rounded-[10px] bg-card text-muted-foreground text-sm leading-5 border-border border-1 border-solid flex px-3 py-2 items-center gap-2">
              <SlidersHorizontal className="size-3.5 text-muted-foreground" />
              Status: All
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
            <button className="rounded-[10px] bg-card text-muted-foreground text-sm leading-5 border-border border-1 border-solid flex px-3 py-2 items-center gap-2">
              <Tag className="size-3.5 text-muted-foreground" />
              Violation Type: All
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
            <button className="rounded-[10px] bg-card text-muted-foreground text-sm leading-5 border-border border-1 border-solid flex px-3 py-2 items-center gap-2">
              <Calendar className="size-3.5 text-muted-foreground" />
              Date Range
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="flex px-1 items-center gap-6">
            <div className="text-muted-foreground text-xs flex items-center gap-1.5">
              Total Challans
              <span className="font-medium text-foreground">1,247</span>
            </div>
            <span className="text-[#2A3040]">·</span>
            <div className="text-muted-foreground text-xs flex items-center gap-1.5">
              Pending<span className="font-medium text-foreground">312</span>
            </div>
            <span className="text-[#2A3040]">·</span>
            <div className="text-muted-foreground text-xs flex items-center gap-1.5">
              Issued<span className="font-medium text-foreground">689</span>
            </div>
            <span className="text-[#2A3040]">·</span>
            <div className="text-muted-foreground text-xs flex items-center gap-1.5">
              Paid<span className="font-medium text-foreground">246</span>
            </div>
          </div>
          <div className="rounded-[14px] bg-card border-border border-1 border-solid flex flex-col flex-1 overflow-hidden">
            <table className="border-collapse w-full">
              <thead>
                <tr className="uppercase text-muted-foreground text-[11px] tracking-wide border-border border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                  <th className="font-medium text-left px-4 py-3">
                    Challan ID
                  </th>
                  <th className="font-medium text-left px-4 py-3">
                    Vehicle No.
                  </th>
                  <th className="font-medium text-left px-4 py-3">
                    Violation Type
                  </th>
                  <th className="font-medium text-left px-4 py-3">{`Date & Time`}</th>
                  <th className="font-medium text-left px-4 py-3">Camera</th>
                  <th className="font-medium text-left px-4 py-3">
                    Fine Amount
                  </th>
                  <th className="font-medium text-left px-4 py-3">Status</th>
                  <th className="font-medium text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground text-[13px]">
                <tr className="bg-[#161B22] border-border border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                  <td className="font-medium text-[#5A9A95] px-4 py-3">
                    CHN-10247
                  </td>
                  <td className="text-foreground px-4 py-3">KA01AB1234</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-destructive/10 text-destructive text-[11px] px-2 py-0.5 items-center">
                      No Helmet
                    </span>
                  </td>
                  <td className="px-4 py-3">12 Jun, 09:42</td>
                  <td className="px-4 py-3">CAM-07</td>
                  <td className="text-foreground px-4 py-3">₹500</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] px-2 py-0.5 items-center">
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-muted-foreground flex items-center gap-3">
                      <Eye className="size-4" />
                      <FileText className="size-4" />
                    </div>
                  </td>
                </tr>
                <tr className="bg-card border-border border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                  <td className="font-medium text-[#5A9A95] px-4 py-3">
                    CHN-10246
                  </td>
                  <td className="text-foreground px-4 py-3">KA05CD5678</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] px-2 py-0.5 items-center">
                      Triple Riding
                    </span>
                  </td>
                  <td className="px-4 py-3">12 Jun, 09:18</td>
                  <td className="px-4 py-3">CAM-12</td>
                  <td className="text-foreground px-4 py-3">₹1,000</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-[#1A2535] text-[#6A9AB0] text-[11px] px-2 py-0.5 items-center">
                      Issued
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-muted-foreground flex items-center gap-3">
                      <Eye className="size-4" />
                      <FileText className="size-4" />
                    </div>
                  </td>
                </tr>
                <tr className="bg-[#161B22] border-border border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                  <td className="font-medium text-[#5A9A95] px-4 py-3">
                    CHN-10245
                  </td>
                  <td className="text-foreground px-4 py-3">KA03EF9012</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-destructive/10 text-destructive text-[11px] px-2 py-0.5 items-center">
                      No Helmet
                    </span>
                  </td>
                  <td className="px-4 py-3">12 Jun, 08:55</td>
                  <td className="px-4 py-3">CAM-03</td>
                  <td className="text-foreground px-4 py-3">₹500</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-[#0F2A1A] text-[#5A9A70] text-[11px] px-2 py-0.5 items-center">
                      Paid
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-muted-foreground flex items-center gap-3">
                      <Eye className="size-4" />
                      <FileText className="size-4" />
                    </div>
                  </td>
                </tr>
                <tr className="bg-card border-border border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                  <td className="font-medium text-[#5A9A95] px-4 py-3">
                    CHN-10244
                  </td>
                  <td className="text-foreground px-4 py-3">KA07GH3456</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] px-2 py-0.5 items-center">
                      Triple Riding
                    </span>
                  </td>
                  <td className="px-4 py-3">12 Jun, 08:31</td>
                  <td className="px-4 py-3">CAM-09</td>
                  <td className="text-foreground px-4 py-3">₹1,000</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-destructive/10 text-destructive text-[11px] px-2 py-0.5 items-center">
                      Disputed
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-muted-foreground flex items-center gap-3">
                      <Eye className="size-4" />
                      <FileText className="size-4" />
                    </div>
                  </td>
                </tr>
                <tr className="bg-[#161B22] border-border border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                  <td className="font-medium text-[#5A9A95] px-4 py-3">
                    CHN-10243
                  </td>
                  <td className="text-foreground px-4 py-3">KA02IJ7890</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-destructive/10 text-destructive text-[11px] px-2 py-0.5 items-center">
                      No Helmet
                    </span>
                  </td>
                  <td className="px-4 py-3">11 Jun, 19:14</td>
                  <td className="px-4 py-3">CAM-15</td>
                  <td className="text-foreground px-4 py-3">₹500</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-[#1A2535] text-[#6A9AB0] text-[11px] px-2 py-0.5 items-center">
                      Issued
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-muted-foreground flex items-center gap-3">
                      <Eye className="size-4" />
                      <FileText className="size-4" />
                    </div>
                  </td>
                </tr>
                <tr className="bg-card border-border border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                  <td className="font-medium text-[#5A9A95] px-4 py-3">
                    CHN-10242
                  </td>
                  <td className="text-foreground px-4 py-3">KA09KL2345</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] px-2 py-0.5 items-center">
                      Triple Riding
                    </span>
                  </td>
                  <td className="px-4 py-3">11 Jun, 18:47</td>
                  <td className="px-4 py-3">CAM-06</td>
                  <td className="text-foreground px-4 py-3">₹1,000</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-[#0F2A1A] text-[#5A9A70] text-[11px] px-2 py-0.5 items-center">
                      Paid
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-muted-foreground flex items-center gap-3">
                      <Eye className="size-4" />
                      <FileText className="size-4" />
                    </div>
                  </td>
                </tr>
                <tr className="bg-[#161B22] border-border border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
                  <td className="font-medium text-[#5A9A95] px-4 py-3">
                    CHN-10241
                  </td>
                  <td className="text-foreground px-4 py-3">KA04MN6789</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-destructive/10 text-destructive text-[11px] px-2 py-0.5 items-center">
                      No Helmet
                    </span>
                  </td>
                  <td className="px-4 py-3">11 Jun, 17:22</td>
                  <td className="px-4 py-3">CAM-11</td>
                  <td className="text-foreground px-4 py-3">₹500</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] px-2 py-0.5 items-center">
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-muted-foreground flex items-center gap-3">
                      <Eye className="size-4" />
                      <FileText className="size-4" />
                    </div>
                  </td>
                </tr>
                <tr className="bg-card">
                  <td className="font-medium text-[#5A9A95] px-4 py-3">
                    CHN-10240
                  </td>
                  <td className="text-foreground px-4 py-3">KA08OP0123</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] px-2 py-0.5 items-center">
                      Triple Riding
                    </span>
                  </td>
                  <td className="px-4 py-3">11 Jun, 16:09</td>
                  <td className="px-4 py-3">CAM-04</td>
                  <td className="text-foreground px-4 py-3">₹1,000</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-[#1A2535] text-[#6A9AB0] text-[11px] px-2 py-0.5 items-center">
                      Issued
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-muted-foreground flex items-center gap-3">
                      <Eye className="size-4" />
                      <FileText className="size-4" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="border-border border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex mt-auto px-4 py-3 justify-between items-center">
              <span className="text-muted-foreground text-[13px]">Page 1 of 47</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="rounded-[10px] text-muted-foreground text-sm leading-5 border-border border-1 border-solid px-3 py-1.5"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-[10px] text-muted-foreground text-sm leading-5 border-border border-1 border-solid px-3 py-1.5"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
</div>
);
}
