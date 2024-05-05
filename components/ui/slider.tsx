"use client";
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  topK: number;
  isHover:boolean
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, isHover,topK,...props }, ref) => (
  <TooltipProvider>
    <Tooltip open={isHover}>
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <SliderPrimitive.Range className="absolute h-full bg-slate-900 dark:bg-slate-50" />
        </SliderPrimitive.Track>
        <TooltipTrigger asChild>
          <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-slate-900 bg-white ring-offset-white transition-colors focus-visible:outline-none -top-1/2 relative   focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-50 dark:bg-slate-950  dark:focus-visible:ring-slate-300" />
        </TooltipTrigger>
        <TooltipContent>Top Contexts: {topK}</TooltipContent>
      </SliderPrimitive.Root>
    </Tooltip>
  </TooltipProvider>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
