import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const DropdownMenuTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn("outline-none", className)}
    {...props}
  />
));
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;

export { DropdownMenuTrigger };
