"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  options: RadioOption[];
  className?: string;
}

export function RadioGroup({
  value,
  onValueChange,
  options,
  className,
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      className={cn("flex flex-col gap-2", className)}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex items-center gap-3.5 px-3.5 py-3 rounded-[10px] cursor-pointer transition-all duration-150",
              "border",
              isSelected
                ? "bg-teal/5 border-teal/20"
                : "bg-transparent border-border hover:border-border-2"
            )}
          >
            <RadioGroupPrimitive.Item
              value={option.value}
              className={cn(
                "w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50",
                isSelected ? "border-teal" : "border-border-2"
              )}
            >
              <RadioGroupPrimitive.Indicator className="w-2 h-2 rounded-full bg-teal" />
            </RadioGroupPrimitive.Item>
            <div>
              <div className="text-sm font-semibold text-text-secondary">
                {option.label}
              </div>
              {option.description && (
                <div className="text-xs text-text-muted">{option.description}</div>
              )}
            </div>
          </label>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}
