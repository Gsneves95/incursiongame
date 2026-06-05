import { useEffect } from "react";
import type { ReactNode } from "react";
import { Icon } from "../Icon";

export function Modal({
  open,
  onClose,
  title,
  size = "md",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: "md" | "lg" | "preview";
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="folio-modal-backdrop" onClick={onClose}>
      <div className={`folio-modal folio-modal-${size}`} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="modal-head">
            <h3 className="h3">{title}</h3>
            <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
              <Icon.X />
            </button>
          </div>
        )}
        <div className="folio-modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
