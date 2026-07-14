import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e) => {
    e.preventDefault();
    const userMail = email.trim() || "officer.id@morth.gov.in";
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", userMail);
    navigate("/", { replace: true });
  };

  return (
    <div>
      <div className="bg-background text-foreground w-full h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="bg-background flex w-285 h-239">
          <div className="relative w-1/2 bg-background border-r border-border overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1719606456508-14f8e3a1a226?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHx0cmFmZmljJTIwc3VydmVpbGxhbmNlJTIwY2FtZXJhJTIwb24lMjBwb2xlJTIwY2l0eSUyMG5pZ2h0JTIwbW9ub2Nocm9tZXxlbnwxfDF8fHwxNzgyODA0ODUwfDA&ixlib=rb-4.1.0&q=80&w=400"
              alt="Traffic surveillance camera on a pole at night"
              className="object-cover grayscale opacity-15 absolute inset-0 w-full h-full"
              data-photoid="j-ICjh24xIg"
              data-authorname="Jahanzeb Ahsan"
              data-authorurl="https://unsplash.com/@jahan_photobox"
              data-blurhash="L47-Wm009F_34nxu%MIV01ayozxu"
            />
            <div className="bg-background/80 absolute inset-0" />
            <div className="relative z-10 flex p-12 flex-col justify-between h-full">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-card border border-border flex justify-center items-center">
                  <ShieldCheck className="size-6 text-primary" />
                </div>
              </div>
              <div className="flex flex-col items-start gap-4">
                <div className="size-16 rounded-2xl bg-card border border-border flex justify-center items-center">
                  <Shield className="size-8 text-primary" />
                </div>
                <div className="flex flex-col gap-2">
                  <h1 className="leading-tight font-semibold text-foreground text-[28px]">
                    TrafficGuard AI
                  </h1>
                  <p className="text-muted-foreground text-[13px]">{`Automated Violation Detection & E-Challan System`}</p>
                </div>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Camera className="size-4" />
                <span className="text-xs">
                  AI-Powered Two-Wheeler Enforcement
                </span>
              </div>
            </div>
          </div>
          <div className="w-1/2 bg-background flex p-12 justify-center items-center">
            <div className="max-w-[420px] w-full">
              <Card className="shadow-lg rounded-3xl bg-card border border-border p-12 gap-6">
                <CardHeader className="p-0 gap-4">
                  <span className="font-medium uppercase text-muted-foreground text-[11px] tracking-widest">{`Ministry of Road Transport & Highways`}</span>
                  <h2 className="font-semibold text-foreground text-[22px]">
                    Officer Sign In
                  </h2>
                  <div className="bg-border w-full h-px" />
                </CardHeader>
                
                <form onSubmit={handleSignIn} className="flex flex-col gap-6 w-full">
                  <CardContent className="p-0 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-muted-foreground text-[13px]">
                        Official Email ID
                      </label>
                      <div className="rounded-xl bg-muted/30 border border-border flex px-4 items-center gap-2">
                        <Mail className="size-4 text-muted-foreground" />
                        <input
                          type="email"
                          placeholder="officer.id@morth.gov.in"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-transparent outline-none text-foreground text-sm w-full h-11"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-muted-foreground text-[13px]">
                        Password
                      </label>
                      <div className="rounded-xl bg-muted/30 border border-border flex px-4 items-center gap-2">
                        <Lock className="size-4 text-muted-foreground" />
                        <input
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-transparent outline-none text-foreground text-sm w-full h-11"
                        />
                        <Eye className="size-4 cursor-pointer text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        className="border-border"
                      />
                      <label
                        htmlFor="remember"
                        className="text-muted-foreground text-[13px]"
                      >
                        Remember this device
                      </label>
                    </div>
                  </CardContent>
                  <CardFooter className="p-0 flex-col gap-4">
                    <Button 
                      type="submit"
                      className="shadow-[0_4px_16px_rgba(124,58,237,0.15)] font-semibold rounded-xl bg-primary text-primary-foreground text-sm w-full h-11 hover:bg-primary/90 transition-colors"
                    >
                      Sign In
                    </Button>
                    <a className="text-muted-foreground text-xs hover:underline cursor-pointer">
                      Forgot credentials? Contact IT Admin
                    </a>
                  </CardFooter>
                </form>
              </Card>
              <div className="text-muted-foreground text-[11px] flex mt-8 justify-center items-center gap-2">
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
