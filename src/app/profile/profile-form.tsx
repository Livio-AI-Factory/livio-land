"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  changePassword,
  uploadProfilePhoto,
  removeProfilePhoto,
} from "@/lib/profile-actions";

type Props = {
  email: string;
  name: string;
  company: string;
  photoUrl: string | null;
  hasPhoto: boolean;
};

export function ProfileForm({ email, name, company, photoUrl, hasPhoto }: Props) {
  return (
    <div className="mt-8 space-y-8">
      <PhotoSection initialUrl={photoUrl} hasPhoto={hasPhoto} fallbackInitial={name.slice(0, 1)} />
      <ProfileDetailsSection email={email} initialName={name} initialCompany={company} />
      <PasswordSection />
    </div>
  );
}

function PhotoSection({
  initialUrl,
  hasPhoto: initialHasPhoto,
  fallbackInitial,
}: {
  initialUrl: string | null;
  hasPhoto: boolean;
  fallbackInitial: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [hasPhoto, setHasPhoto] = useState(initialHasPhoto);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = (file: File | null) => {
    if (!file) return;
    setError(null);
    setMessage(null);
    // Optimistic local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    startTransition(async () => {
      const fd = new FormData();
      fd.set("file", file);
      const result = await uploadProfilePhoto(fd);
      if (result.ok) {
        setMessage(result.message || "Photo updated.");
        setHasPhoto(true);
        router.refresh();
      } else {
        setError(result.error);
        // Revert preview if upload failed
        setPreviewUrl(initialUrl);
      }
    });
  };

  const handleRemove = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await removeProfilePhoto();
      if (result.ok) {
        setPreviewUrl(null);
        setHasPhoto(false);
        setMessage(result.message || "Photo removed.");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Profile photo</h2>
      <p className="mt-1 text-sm text-slate-500">
        Shown on your listings, questions, and admin actions. JPG, PNG, or WEBP up to 8 MB.
      </p>

      <div className="mt-4 flex items-center gap-5">
        <div className="h-20 w-20 shrink-0 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-2xl font-semibold text-slate-600">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            fallbackInitial.toUpperCase()
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {pending ? "Uploading…" : hasPhoto ? "Replace photo" : "Upload photo"}
          </button>
          {hasPhoto && (
            <button
              type="button"
              disabled={pending}
              onClick={handleRemove}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 disabled:opacity-50"
            >
              Remove
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
            className="sr-only"
            onChange={(e) => handleUpload(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      {error && <Status kind="error">{error}</Status>}
      {message && <Status kind="ok">{message}</Status>}
    </section>
  );
}

function ProfileDetailsSection({
  email,
  initialName,
  initialCompany,
}: {
  email: string;
  initialName: string;
  initialCompany: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(fd);
      if (result.ok) {
        setMessage(result.message || "Saved.");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-6 space-y-4"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Account details</h2>
        <p className="mt-1 text-sm text-slate-500">Your name + company show up on listings.</p>
      </div>

      <Field label="Email">
        <input
          type="email"
          value={email}
          disabled
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
        />
        <p className="mt-1 text-xs text-slate-500">Contact support to change your email.</p>
      </Field>

      <Field label="Full name *">
        <input
          name="name"
          required
          defaultValue={initialName}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </Field>

      <Field label="Company">
        <input
          name="company"
          defaultValue={initialCompany}
          placeholder="e.g. Livio Building Systems"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </Field>

      {error && <Status kind="error">{error}</Status>}
      {message && <Status kind="ok">{message}</Status>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function PasswordSection() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await changePassword(fd);
      if (result.ok) {
        setMessage(result.message || "Password changed.");
        formRef.current?.reset();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-6 space-y-4"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pick something memorable. New password must be at least 8 characters.
        </p>
      </div>

      <Field label="Current password *">
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </Field>
      <Field label="New password *">
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </Field>
      <Field label="Confirm new password *">
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </Field>

      {error && <Status kind="error">{error}</Status>}
      {message && <Status kind="ok">{message}</Status>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {pending ? "Changing…" : "Change password"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Status({ kind, children }: { kind: "ok" | "error"; children: React.ReactNode }) {
  const cls =
    kind === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-700";
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${cls}`} role="status">
      {children}
    </div>
  );
}
