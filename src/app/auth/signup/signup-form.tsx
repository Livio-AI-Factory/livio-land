"use client";

import { useState } from "react";

export function SignupForm({
  action,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (formData) => {
        setPending(true);
        setError(null);
        try {
          const result = await action(formData);
          if (result && "error" in result && result.error) setError(result.error);
        } finally {
          setPending(false);
        }
      }}
      className="space-y-4"
    >
      <Field label="Full name" name="name" required />
      <Field label="Work email" name="email" type="email" required />
      <Field label="Company" name="company" />
      <Field
        label="Password"
        name="password"
        type="password"
        required
        helper="At least 8 characters"
      />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          I'm primarily here to...
        </label>
        <select
          name="role"
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          defaultValue="both"
        >
          <option value="supplier">List capacity / land (supplier)</option>
          <option value="offtaker">Search for capacity / land (off-taker)</option>
          <option value="both">Both</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  helper,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  helper?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}
