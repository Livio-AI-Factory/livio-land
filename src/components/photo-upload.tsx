"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadListingPhoto, deleteListingPhoto } from "@/lib/photo-actions";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  kind: string;
  originalName: string;
};

type Props = {
  type: "dc" | "land";
  listingId: string;
  photos: Photo[];
  canEdit: boolean;
};

export function PhotoUpload({ type, listingId, photos, canEdit }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploadingCount(files.length);

    startTransition(async () => {
      let lastError: string | null = null;
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("type", type);
        fd.set("listingId", listingId);
        fd.set("file", file);
        fd.set("kind", file.type === "application/pdf" ? "document" : "photo");
        const result = await uploadListingPhoto(fd);
        if (!result.ok) {
          lastError = result.error;
          break;
        }
      }
      setUploadingCount(0);
      if (lastError) setError(lastError);
      router.refresh();
    });
  };

  const handleDelete = (photoId: string) => {
    if (!confirm("Delete this photo?")) return;
    startTransition(async () => {
      const result = await deleteListingPhoto(photoId);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  };

  return (
    <div>
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {photos.map((p) => (
            <div key={p.id} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-[4/3]">
              {p.kind === "document" || p.originalName.toLowerCase().endsWith(".pdf") ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col items-center justify-center gap-2 text-slate-700 hover:text-brand-700"
                >
                  <span className="text-3xl">📄</span>
                  <span className="text-xs font-medium px-2 text-center truncate w-full">
                    {p.originalName}
                  </span>
                </a>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.url}
                  alt={p.caption || p.originalName}
                  className="w-full h-full object-cover"
                />
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  disabled={pending}
                  aria-label="Delete photo"
                  className="absolute top-2 right-2 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  Delete
                </button>
              )}
              {p.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs px-2 py-1.5">
                  {p.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        <label className="block">
          <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-colors">
            <p className="text-sm font-medium text-slate-700">
              {pending && uploadingCount > 0
                ? `Uploading ${uploadingCount} file${uploadingCount === 1 ? "" : "s"}…`
                : "Drop photos here or click to upload"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Site photos, drone shots, substation diagrams, utility letters (PDF). Up to 12 MB each.
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="sr-only"
            disabled={pending}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {!canEdit && photos.length === 0 && (
        <p className="text-sm text-slate-500 italic">No photos uploaded yet.</p>
      )}
    </div>
  );
}
