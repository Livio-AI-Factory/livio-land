import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { InboxItem } from "./inbox-item";

export default async function InboxPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");

  const messages = await prisma.message.findMany({
    where: { recipientId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { name: true, company: true, email: true } },
      dcListing: { select: { id: true, title: true } },
      landListing: { select: { id: true, title: true } },
    },
  });

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inbox</h1>
          <p className="mt-1 text-sm text-slate-600">
            {messages.length === 0
              ? "No messages yet — when off-takers reach out about your listings, they'll show up here."
              : `${messages.length} message${messages.length === 1 ? "" : "s"}${unread > 0 ? ` · ${unread} unread` : ""}`}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {messages.length === 0 && (
          <Link
            href="/listings/new"
            className="block rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 hover:border-brand-500 hover:text-brand-700 transition"
          >
            No messages yet. List a site →
          </Link>
        )}
        {messages.map((m) => {
          const target = m.dcListing || m.landListing;
          const link = m.dcListingId
            ? `/listings/dc/${m.dcListingId}`
            : m.landListingId
            ? `/listings/land/${m.landListingId}`
            : null;
          return (
            <InboxItem
              key={m.id}
              id={m.id}
              read={m.read}
              when={m.createdAt}
              senderName={m.sender.company || m.sender.name}
              senderEmail={m.sender.email}
              listingTitle={target?.title ?? "(deleted listing)"}
              listingHref={link}
              body={m.body}
            />
          );
        })}
      </div>
    </div>
  );
}
