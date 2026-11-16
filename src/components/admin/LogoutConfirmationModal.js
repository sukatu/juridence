import React from 'react';
import { LogOut, X } from 'lucide-react';
import { Button, IconButton } from '../ui';

const LogoutConfirmationModal = ({ onClose, onConfirm }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#071b2f]/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
    <section
      className="relative w-full max-w-md rounded-md border border-[#dce5e9] bg-white p-6 shadow-[0_24px_70px_rgba(7,27,47,0.28)] sm:p-7"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <IconButton label="Close" variant="ghost" className="absolute right-4 top-4" onClick={onClose}>
        <X size={19} />
      </IconButton>
      <div className="pr-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#fff0f1] text-[#b52f3f]"><LogOut size={19} /></span>
        <h2 id="logout-title" className="mt-5 text-xl font-semibold text-[#17334a]">Sign out of Juridence?</h2>
        <p className="mt-2 text-sm leading-6 text-[#687983]">You will need to sign in again to return to this workspace.</p>
      </div>
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="danger" icon={<LogOut size={16} />} onClick={onConfirm}>Sign out</Button>
      </div>
    </section>
  </div>
);

export default LogoutConfirmationModal;
