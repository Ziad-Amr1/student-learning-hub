import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cx } from '../../utils/cx'

// Shared shadcn-style Select primitive (JS port of the shadcn/ui select,
// rebuilt on Huby tokens). Layout/width are deliberately NOT baked into the
// trigger so consumers own sizing: forms pass `w-full px-3 py-2`, module
// toolbars pass `px-3 py-2` (auto width), compact card triggers pass
// `px-2.5 py-1.5`. Overlays layer on the `--z-dropdown` token like the old
// StatusDropdown listbox. Keyboard/ARIA behavior is Radix's built-in
// combobox pattern (typeahead, arrows, Enter/Escape, focus stays on trigger).

function Select({ ...props }) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ ...props }) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({ ...props }) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({ className, children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cx(
        'group inline-flex items-center justify-between gap-2 rounded-md border border-input bg-surface text-sm text-foreground cursor-pointer',
        'transition-[border-color,box-shadow] duration-150 ease-standard',
        'focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-soft)] focus:outline-none',
        'disabled:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          aria-hidden="true"
          className="w-(--icon-sm) h-(--icon-sm) shrink-0 text-muted-foreground opacity-60 transition-transform duration-150 ease-standard group-data-[state=open]:rotate-180"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectScrollUpButton({ className, ...props }) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cx('flex w-full cursor-default items-center justify-center py-1 text-muted-foreground', className)}
      {...props}
    >
      <ChevronUp className="w-(--icon-sm) h-(--icon-sm)" aria-hidden="true" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({ className, ...props }) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cx('flex w-full cursor-default items-center justify-center py-1 text-muted-foreground', className)}
      {...props}
    >
      <ChevronDown className="w-(--icon-sm) h-(--icon-sm)" aria-hidden="true" />
    </SelectPrimitive.ScrollDownButton>
  )
}

function SelectContent({ className, children, position = 'popper', ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cx(
          'z-(--z-dropdown) min-w-36 overflow-hidden rounded-lg border border-border bg-surface text-foreground shadow-lg',
          'data-[side=bottom]:mt-1 data-[side=top]:-mt-1',
          className
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cx('p-1', position === 'popper' && 'w-full min-w-(--radix-select-trigger-width)')}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cx('px-2 py-1.5 text-caption text-muted-foreground', className)}
      {...props}
    />
  )
}

function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cx(
        'relative flex w-full cursor-pointer select-none items-center gap-2 py-2 pl-3 pr-8 text-sm outline-none transition-colors',
        'data-[highlighted]:bg-surface-muted data-[highlighted]:text-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <SelectPrimitive.ItemIndicator>
          <Check aria-hidden="true" className="w-(--icon-sm) h-(--icon-sm) text-primary-strong" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cx('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}