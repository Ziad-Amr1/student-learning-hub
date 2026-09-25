import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cx } from '../../utils/cx'

// Shared shadcn-style Tooltip primitive (JS port of the shadcn/ui tooltip,
// rebuilt on Huby tokens). Adopted on the icon-only card action buttons
// (Pin/Edit/Delete/Visit) — a supplementary hover affordance on top of the
// existing aria-labels, never the sole way to identify an action.

function TooltipProvider({ delayDuration = 0, ...props }) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({ ...props }) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({ className, sideOffset = 4, ...props }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cx(
          'z-(--z-dropdown) rounded-md bg-foreground px-2.5 py-1 text-caption text-background shadow-md',
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }