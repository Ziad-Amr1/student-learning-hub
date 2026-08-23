/* Shared utility class composition for form controls (Input, Textarea).
   Replaces the retired form.css — same declarations, token-driven. */

export const FIELD_CLASSES = 'flex flex-col gap-2'

export const FIELD_CONTROL_CLASSES =
  'w-full bg-surface border border-input rounded-md px-3 py-2 text-foreground ' +
  'transition-[border-color,box-shadow] duration-150 ease-standard ' +
  'placeholder:text-muted-foreground placeholder:opacity-80 ' +
  'focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-soft)] focus:outline-none ' +
  'disabled:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-70'

export const FIELD_CONTROL_ERROR_CLASSES =
  'border-destructive focus:border-destructive focus:shadow-[0_0_0_3px_var(--ring-destructive-soft)]'

export const FIELD_ERROR_CLASSES = 'text-destructive-strong text-body-small'
