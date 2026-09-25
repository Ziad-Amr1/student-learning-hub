import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cx } from '../../utils/cx'

// Shared shadcn-style Popover primitive (JS port of the shadcn/ui popover,
// rebuilt on Huby tokens). Installed as part of the shared shadcn cleanup —
// deliberately WITHOUT a consumer yet: no current UI is genuinely
// popover-shaped (menus/dialogs stay native, filters are Selects). Overlays
// layer on the `--z-dropdown` token like the Select listbox and the retired
// StatusDropdown.

function Popover({ ...props }) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({ className, align = 'center', sideOffset = 4, ...props }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cx(
          'z-(--z-dropdown) rounded-lg border border-border bg-surface text-foreground shadow-lg outline-none',
          'data-[side=bottom]:mt-1 data-[side=top]:-mt-1',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({ ...props }) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }