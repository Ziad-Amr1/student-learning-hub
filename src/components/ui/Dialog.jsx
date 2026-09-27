import { useEffect, useRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cx } from '../../utils/cx'

// Shared modal primitive.
//
// Built on Radix Dialog rather than a native `<dialog>` + showModal().
// A native modal dialog sits in the browser's top layer, which makes every
// element outside it inert — and Radix overlays (Select, Popover, Calendar)
// portal their content to `document.body`. The combination was broken: the
// listbox rendered but was inert, so a real user could not click an option,
// and Radix's `aria-hidden` bookkeeping was blocked by focused descendants
// ("Blocked aria-hidden on an element because its descendant retained
// focus"). Radix Dialog keeps the modal, its focus trap and its scroll lock
// while leaving the portal chain interactive, which is what nested Radix
// overlays require.
export default function Dialog({ open, onClose, title, description, children, className }) {
  // A native <dialog> returned focus to whatever opened it. This Dialog is
  // controlled and its trigger belongs to the page, not to the primitive, so
  // Radix has no trigger to restore focus to and focus would fall to <body>.
  // Capture the opener on the open transition and give focus back on close.
  const openerRef = useRef(null)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      openerRef.current = document.activeElement
    } else if (!open && wasOpenRef.current) {
      const opener = openerRef.current
      openerRef.current = null
      if (opener?.isConnected && typeof opener.focus === 'function') opener.focus()
    }
    wasOpenRef.current = open
  }, [open])

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        {/* Overlay and Content share --z-dropdown and rely on DOM order
            (Content is later) so the card paints above its own scrim. The
            Select listboxes and Popover/Tooltip overlays this dialog hosts use
            the same token and are portalled later still, so they sit above
            both. Giving the scrim a higher z-index than the content would make
            it swallow every click inside the dialog. */}
        <DialogPrimitive.Overlay className="fixed inset-0 bg-scrim z-(--z-dropdown)" />
        <DialogPrimitive.Content
          className={cx(
            // Centering + responsive sizing are kept identical to the previous
            // native `<dialog>`: full-bleed width on small screens, capped at
            // `max-w-lg`, vertically centred, never taller than 90dvh.
            'fixed inset-0 m-auto max-h-[90dvh] w-full max-w-lg p-0',
            'z-(--z-dropdown) focus:outline-none',
            className
          )}
        >
          <div className="bg-surface rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col min-h-0 max-h-[inherit]">
            <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-0 shrink-0">
              <div className="space-y-1 min-w-0">
                <DialogPrimitive.Title asChild>
                  <h3 className="font-bold text-foreground">{title}</h3>
                </DialogPrimitive.Title>
                {description && (
                  <DialogPrimitive.Description asChild>
                    <p className="text-body-small text-muted-foreground">{description}</p>
                  </DialogPrimitive.Description>
                )}
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={onClose}
                className="inline-flex items-center justify-center w-10 h-10 shrink-0 border-none rounded-md bg-transparent text-muted-foreground cursor-pointer hover:text-foreground hover:bg-surface-muted transition-colors"
              >
                <X aria-hidden="true" className="w-(--icon-md) h-(--icon-md)" />
              </button>
            </header>
            {/* The one scrollable region of a dialog. The header stays put while a
                long form scrolls under it, and `scrollbar-hub` keeps that scroll
                consistent with the rest of the app. */}
            <div className="px-6 py-5 overflow-y-auto scrollbar-hub min-h-0 flex-1">
              {children}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
