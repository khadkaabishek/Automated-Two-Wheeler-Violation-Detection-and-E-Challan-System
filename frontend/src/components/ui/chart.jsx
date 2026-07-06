import * as React from "react"
import { cn } from "@/utils"
import { ResponsiveContainer, Tooltip } from "recharts"

export const ChartContainer = React.forwardRef(({ className, config, children, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
))
ChartContainer.displayName = "ChartContainer"

export const ChartTooltip = Tooltip;
