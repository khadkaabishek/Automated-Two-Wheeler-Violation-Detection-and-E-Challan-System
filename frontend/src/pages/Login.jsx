import { useEffect } from "react";
import { Camera, Eye, Lock, Mail, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  return (
    <div>
      <div className="bg-zinc-950 text-neutral-50 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="bg-[#0F1115] flex w-285 h-239">
          <div className="relative w-1/2 bg-[#0F1115] border-[#1A1E25] border-t-0 border-r-1 border-b-0 border-l-0 border-solid overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1719606456508-14f8e3a1a226?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHx0cmFmZmljJTIwc3VydmVpbGxhbmNlJTIwY2FtZXJhJTIwb24lMjBwb2xlJTIwY2l0eSUyMG5pZ2h0JTIwbW9ub2Nocm9tZXxlbnwxfDF8fHwxNzgyODA0ODUwfDA&ixlib=rb-4.1.0&q=80&w=400"
              alt="Traffic surveillance camera on a pole at night"
              className="object-cover grayscale opacity-15 absolute inset-0 w-full h-full"
              data-photoid="j-ICjh24xIg"
              data-authorname="Jahanzeb Ahsan"
              data-authorurl="https://unsplash.com/@jahan_photobox"
              data-blurhash="L47-Wm009F_34nxu%MIV01ayozxu"
            />
            <div className="bg-[#0F1115]/70 absolute inset-0" />
            <div className="relative z-10 flex p-12 flex-col justify-between h-full">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-[#1A1E25] border-[#2A3040] border-1 border-solid flex justify-center items-center">
                  <ShieldCheck className="size-6 text-[#7E8FA6]" />
                </div>
              </div>
              <div className="flex flex-col items-start gap-4">
                <div className="size-16 rounded-2xl bg-[#1A1E25] border-[#2A3040] border-1 border-solid flex justify-center items-center">
                  <Shield className="size-8 text-[#7E8FA6]" />
                </div>
                <div className="flex flex-col gap-2">
                  <h1 className="leading-tight font-semibold text-[#C8CDD6] text-[28px]">
                    TrafficGuard AI
                  </h1>
                  <p className="text-gray-500 text-[13px]">{`Automated Violation Detection & E-Challan System`}</p>
                </div>
              </div>
              <div className="text-[#3A4050] flex items-center gap-2">
                <Camera className="size-4" />
                <span className="text-xs">
                  AI-Powered Two-Wheeler Enforcement
                </span>
              </div>
            </div>
          </div>
          <div className="w-1/2 bg-[#0F1115] flex p-12 justify-center items-center">
            <div className="max-w-[420px] w-full">
              <Card className="shadow-[0_8px_40px_rgba(0,0,0,0.45)] rounded-3xl bg-[#14171C] border-[#1F2430] border-1 border-solid p-12 gap-6">
                <CardHeader className="p-0 gap-4">
                  <span className="font-medium uppercase text-[#5A6070] text-[11px] tracking-widest">{`Ministry of Road Transport & Highways`}</span>
                  <h2 className="font-semibold text-gray-300 text-[22px]">
                    Officer Sign In
                  </h2>
                  <div className="bg-[#1F2430] w-full h-px" />
                </CardHeader>
                <CardContent className="p-0 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-[#9AA0AC] text-[13px]">
                      Official Email ID
                    </label>
                    <div className="rounded-xl bg-[#1C2030] border-[#2A3040] border-1 border-solid flex px-4 items-center gap-2">
                      <Mail className="size-4 text-[#4A5568]" />
                      <input
                        type="email"
                        placeholder="officer.id@morth.gov.in"
                        className="bg-transparent outline-none text-[#C0C5CE] text-sm w-full h-11"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-[#9AA0AC] text-[13px]">
                      Password
                    </label>
                    <div className="rounded-xl bg-[#1C2030] border-[#2A3040] border-1 border-solid flex px-4 items-center gap-2">
                      <Lock className="size-4 text-[#4A5568]" />
                      <input
                        type="password"
                        placeholder="Enter your password"
                        className="bg-transparent outline-none text-[#C0C5CE] text-sm w-full h-11"
                      />
                      <Eye className="size-4 cursor-pointer text-[#4A5568]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      className="border-[#2A3040] border-0 border-solid"
                    />
                    <label
                      htmlFor="remember"
                      className="text-gray-500 text-[13px]"
                    >
                      Remember this device
                    </label>
                  </div>
                </CardContent>
                <CardFooter className="p-0 flex-col gap-4">
                  <Button className="shadow-[0_4px_16px_rgba(42,107,124,0.25)] font-semibold rounded-xl bg-[#2A6B7C] text-[#E8ECEF] text-sm w-full h-11">
                    Sign In
                  </Button>
                  <a className="text-[#4A5568] text-xs">
                    Forgot credentials? Contact IT Admin
                  </a>
                </CardFooter>
              </Card>
              <div className="text-[#3A4050] text-[11px] flex mt-8 justify-center items-center gap-2">
                <ShieldCheck className="size-3" />
                <span>Secure Government Portal · v2.4.1 · © 2024 MORTH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
