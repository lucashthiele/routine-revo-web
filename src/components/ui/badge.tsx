import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-[#FA1768] focus-visible:ring-[#FA1768]/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#FA1768] text-white [a&]:hover:bg-[#FA1768]/90",
        secondary:
          "border-transparent bg-[#E6B949] text-white [a&]:hover:bg-[#E6B949]/90",
        destructive:
          "border-transparent bg-red-600 text-white [a&]:hover:bg-red-600/90 focus-visible:ring-red-600/20",
        outline:
          "text-[#333333] border-[#333333]/20 [a&]:hover:bg-[#333333]/5 [a&]:hover:text-[#333333]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

