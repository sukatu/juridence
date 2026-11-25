import React, { useEffect, useRef } from 'react';
import { LogOut, X } from 'lucide-react';

const LogoutConfirmationModal = ({ onClose, onConfirm }) => {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050F1C]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        className="relative w-full max-w-[420px] border border-[#CDD5DF] bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-[#525866] transition-colors hover:bg-[#F1F3F5] hover:text-[#050F1C] focus:outline-none focus:ring-2 focus:ring-[#35639A]"
          aria-label="Close logout confirmation"
          title="Close"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="pr-10">
          <h2 id="logout-dialog-title" className="m-0 text-lg font-semibold text-[#050F1C]">
            Log out of Juridence?
          </h2>
          <p id="logout-dialog-description" className="mb-0 mt-2 text-sm leading-5 text-[#525866]">
            Your current session will end and you will return to the sign-in page.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-[#E4E7EB] pt-4">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            className="h-10 border border-[#AEB8C4] bg-white px-4 text-sm font-semibold text-[#263241] transition-colors hover:bg-[#F7F8FA] focus:outline-none focus:ring-2 focus:ring-[#35639A]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-10 items-center gap-2 border border-[#B42318] bg-[#C62828] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#A61B1B] focus:outline-none focus:ring-2 focus:ring-[#D64545] focus:ring-offset-2"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </button>
        </div>
      </section>
    </div>
  );
};

export default LogoutConfirmationModal;
