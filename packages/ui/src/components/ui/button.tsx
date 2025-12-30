import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  " inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2  disabled:opacity-50 cursor-pointer hover:scale-[103%] transform ease-in",
  {
    variants: {
      variant: {
        default:
          "shadow-primary bg-light_sky_blue text-[var(--primary-foreground)] hover:bg-[color-mix(in srgb, var(--primary) 90%, black)]  transform transition-transform ease-in-out outline-personal",
        destructive:
          "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[color-mix(in srgb, var(--destructive) 90%, black)]",
        outline:
          "shadow-primary outline-personal bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
        secondary:
          "bg-light_sky_blue-700 text-[var(--secondary-foreground)] hover:bg-[color-mix(in srgb, var(--secondary) 80%, black)]",
        ghost: "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
        iconic:
          "overflow-hidden relative dark:bg-input/30 flex min-w-0 rounded-2xl border-personal bg-transparent px-3 py-1 text-base shadow-primary  disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm active:shadow-pressed hover:scale-none after:content-[''] after:w-1/10 after:h-[200%] after:rotate-30 after:absolute after:top-0 after:left-0 after:-translate-y-8 after:-translate-x-15 hover:after:transition-transform  hover:after:translate-x-110 hover:after:duration-300 hover:after:ease-in after:blur-sm after:bg-white after:opacity-60 hover ",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xl: "h-13 w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
