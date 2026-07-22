import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { Icon } from '@/components/ui/Icon';
import { useDialogBehavior } from '@/lib/useDialogBehavior';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Accessible label for the close button — provide via i18n. */
  closeLabel: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Centered dialog with a backdrop, for confirmations and focused tasks. */
export function Modal({ open, onClose, title, closeLabel, children, footer }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialogBehavior({ open, onClose, containerRef: panelRef });

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center p-16">
      <div className="fixed inset-0 bg-neutral-900/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-modal w-full max-w-modal flex-col overflow-hidden rounded-xl bg-white shadow-xl focus:outline-none"
      >
        <header className="flex items-center justify-between gap-16 border-b border-neutral-200 px-24 py-16">
          <h2 id={titleId} className="text-lg font-semibold text-foreground-light">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="rounded-full p-8 text-neutral-500 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Icon icon={X} size="md" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-24 py-16">{children}</div>
        {footer ? <footer className="border-t border-neutral-200 px-24 py-16">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
