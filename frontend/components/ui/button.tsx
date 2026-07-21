import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-xs font-bold tracking-[0.1em] uppercase transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandAccent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-brandAccent to-brandAccent-dark text-white rounded-[10px] shadow-[0_4px_14px_rgba(6,182,212,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] active:shadow-[0_2px_8px_rgba(6,182,212,0.2)]",
        ghost:
          "bg-transparent text-muted hover:text-white hover:bg-white/5 rounded-[10px]",
        outline:
          "border border-border bg-white/[0.02] text-white hover:bg-white/[0.05] hover:border-white/20 shadow-sm rounded-[10px]",
        secondary:
          "bg-white/[0.08] text-white shadow-sm hover:bg-white/[0.12] rounded-[10px]",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 rounded-[10px]",
        link: "text-brandAccent-light underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
