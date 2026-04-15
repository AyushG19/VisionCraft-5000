import * as React from "react";

import { cn } from "../../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:text-primary dark:bg-input/30 flex h-13 w-full min-w-0 rounded-2xl border-personal bg-transparent px-5 py-1 text-justify text-base shadow-primary transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:shadow-pressed ",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
