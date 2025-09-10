import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "../../lib/utils"

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-slate-300 text-indigo-600 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-indigo-400 transition-colors",
        "data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-white text-white" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

const RadioGroupLabel = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-slate-800 cursor-pointer",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        "hover:text-indigo-600 transition-colors",
        className
      )}
      {...props}
    />
  )
})
RadioGroupLabel.displayName = "RadioGroupLabel"

const RadioGroupOption = React.forwardRef(({ 
  className, 
  children, 
  value, 
  id, 
  disabled,
  ...props 
}, ref) => {
  const optionId = id || `radio-${value}`
  
  return (
    <div className={cn("flex items-center space-x-3", className)} ref={ref}>
      <RadioGroupItem 
        value={value} 
        id={optionId}
        disabled={disabled}
        className="peer"
        {...props}
      />
      <RadioGroupLabel htmlFor={optionId} className="peer-disabled:opacity-50">
        {children}
      </RadioGroupLabel>
    </div>
  )
})
RadioGroupOption.displayName = "RadioGroupOption"

export { RadioGroup, RadioGroupItem, RadioGroupLabel, RadioGroupOption }

