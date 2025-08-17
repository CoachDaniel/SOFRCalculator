"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, parse, isValid } from "date-fns"

import { cn } from "./utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Input } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

interface DatePickerProps {
  date?: Date | string
  onDateChange?: (date: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder: _placeholder = "Pick a date",
  className,
  disabled = false,
  id
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  
  // Convert date prop to Date object and input string
  const dateObject = React.useMemo(() => {
    if (!date) return undefined
    if (typeof date === 'string') {
      const parsed = parse(date, 'yyyy-MM-dd', new Date())
      return isValid(parsed) ? parsed : undefined
    }
    return date
  }, [date])

  // Update input value when date prop changes
  React.useEffect(() => {
    if (dateObject) {
      setInputValue(format(dateObject, 'yyyy-MM-dd'))
    } else if (typeof date === 'string') {
      setInputValue(date)
    } else {
      setInputValue("")
    }
  }, [date, dateObject])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // Try to parse the input value
    const parsed = parse(value, 'yyyy-MM-dd', new Date())
    if (isValid(parsed) || value === '') {
      onDateChange?.(value)
    }
  }

  const handleInputBlur = () => {
    // Validate and format the input when user leaves the field
    if (inputValue) {
      const parsed = parse(inputValue, 'yyyy-MM-dd', new Date())
      if (isValid(parsed)) {
        const formatted = format(parsed, 'yyyy-MM-dd')
        setInputValue(formatted)
        onDateChange?.(formatted)
      }
    }
  }

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const formatted = format(selectedDate, 'yyyy-MM-dd')
      setInputValue(formatted)
      onDateChange?.(formatted)
    }
    setOpen(false)
  }

  return (
    <div className="relative">
      <Input
        id={id}
        type="date"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder="YYYY-MM-DD"
        className={cn("form-control pr-12 text-xs", className)}
        disabled={disabled}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent",
              !dateObject && "text-muted-foreground"
            )}
            disabled={disabled}
            type="button"
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="sr-only">Open calendar</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border border-border" align="start">
          <Calendar
            mode="single"
            selected={dateObject}
            onSelect={handleCalendarSelect}
            disabled={disabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
