"use client";

import Link from "next/link";
import { useState } from "react";
import { markMessageRead } from "@/lib/listing-actions";

export function InboxItem({
  id,
  read,
  when,
  senderName,
  senderEmail,
  listingTitle,
  listingHref,
  body,
}: {
  id: string;
  read: boolean;
  when: Date;
  senderName: string;
  senderEmail: string;
  listingTitle: string;
  listingHref: string | null;
  body: string;
}) {
  const [open, setOpen] = useState(!read);
  const [isRead, setIsRead] = useState(read);

  const onToggle = async () => {
    setOpen(!open);
    if (!isRead) {
      setIsRead(true);
      await markMessageRead(id);
    }
  };

  return (
    <div
      className={`rounded-xl border transition ${
        isRead
          ? "border-slate-200 bg-white"
          : "border-brand-200 bg-brand-50/40"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 group"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            {!isRead && (
              <span className="w-2 h-2 rounded-full bg-brand-600" aria-label="unread" />
            )}
            <span className="font-semibold text-slate-900 truncate">
              {senderName}
            </span>
            <span className="text-slate-400 truncate">·</span>
            <span className="text-slate-500 truncate">
              {listingHref ? (
                <Link
                  href={listingHref}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-brand-600 hover:underline"
                >
                  {listingTitle}
                </Link>
              ) : (
                listingTitle
              )}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-700 line-clamp-1">{body}</p>
        </div>
        <span className="text-xs text-slate-400 shrink-0">
          {new Date(when).toLocaleDateString()}
        </span>
      </button>
      {open && (
        <div className="border-t border-slate-200 px-5 py-4 text-sm">
          <p className="whitespace-pre-wrap text-slate-800">{body}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <a
              href={`mailto:${senderEmail}?subject=Re: ${encodeURIComponent(listingTitle)}`}
              className="text-brand-600 hover:underline"
            >
              Reply via email →
            </a>
            <span>{senderEmail}</span>
          </div>
        </div>
      )}
    </div>
  );
}
