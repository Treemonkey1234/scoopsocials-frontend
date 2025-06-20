import React, { useState, useRef, useEffect } from "react";

interface PlusButtonProps {
  onAction: (action: 'post' | 'event' | 'friend') => void;
}

export default function PlusButton({ onAction }: PlusButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500 text-white text-2xl font-bold shadow-md hover:bg-blue-600 focus:outline-none transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open actions menu"
      >
        +
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
          <button
            className="block w-full text-left px-4 py-2 text-primary hover:bg-gray-50 transition-colors"
            onClick={() => { setOpen(false); onAction('post'); }}
          >
            Create post
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-primary hover:bg-gray-50 transition-colors"
            onClick={() => { setOpen(false); onAction('event'); }}
          >
            Create event
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-primary hover:bg-gray-50 transition-colors"
            onClick={() => { setOpen(false); onAction('friend'); }}
          >
            Add Friend
          </button>
        </div>
      )}
    </div>
  );
} 