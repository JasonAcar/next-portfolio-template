/// <reference types="@radix-ui/react-select" />
import * as React from "react"

import {
  Select as RadixSelect,
  SelectContent as RadixSelectContent,
  SelectGroup,
  SelectItem as RadixSelectItem,
  SelectLabel,
  SelectTrigger as RadixSelectTrigger,
  SelectValue,
  SelectViewport,
  SelectIcon,
  SelectSeparator,
} from "@radix-ui/react-select"

import { CheckIcon, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = RadixSelect

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof RadixSelectTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixSelectTrigger>
>(({ className, children, ...props }, ref) => (
  <RadixSelectTrigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SelectIcon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectIcon>
  </RadixSelectTrigger>
))
SelectTrigger.displayName = RadixSelectTrigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof RadixSelectContent>,
  React.ComponentPropsWithoutRef<typeof RadixSelectContent>
>(({ className, children, ...props }, ref) => (
  <RadixSelectContent
    ref={ref}
    className={cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
      className
    )}
    {...props}
  >
    <SelectViewport className="p-1">{children}</SelectViewport>
  </RadixSelectContent>
))
SelectContent.displayName = RadixSelectContent.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof RadixSelectItem>,
  React.ComponentPropsWithoutRef<typeof RadixSelectItem>
>(({ className, children, ...props }, ref) => (
  <RadixSelectItem
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <CheckIcon className="h-4 w-4 opacity-50" />
    </span>
    <span className="ml-6">{children}</span>
  </RadixSelectItem>
))
SelectItem.displayName = RadixSelectItem.displayName

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectValue,
  SelectSeparator,
}
