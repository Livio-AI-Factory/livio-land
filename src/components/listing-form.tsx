"use client";

import { useState, ReactNode } from "react";

export function ListingForm({
  action,
  submitLabel,
  children,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  submitLabel: string;
  children: ReactNode;
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
        } catch (e) {
          // Next.js redirect throws — re-throw so the framework handles navigation
          throw e;
        } finally {
          setPending(false);
        }
      }}
      className="space-y-8"
    >
      {children}
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-600 px-6 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {pending ? "Publishing..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

interface BaseProps {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  helper?: string;
}

interface InputFieldProps extends BaseProps {
  type?: "text" | "email" | "password" | "number" | "date";
  step?: string;
}
interface TextareaFieldProps extends BaseProps {
  type: "textarea";
}
interface SelectFieldProps extends BaseProps {
  type: "select";
  options: { value: string; label: string }[];
}

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

export function FormField(props: FormFieldProps) {
  const { name, label, required, helper, defaultValue } = props;
  const baseClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {props.type === "textarea" ? (
        <textarea
          name={name}
          required={required}
          placeholder={props.placeholder}
          defaultValue={defaultValue}
          rows={4}
          className={baseClass}
        />
      ) : props.type === "select" ? (
        <select name={name} defaultValue={defaultValue ?? ""} className={baseClass}>
          {props.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={props.type ?? "text"}
          name={name}
          required={required}
          placeholder={props.placeholder}
          defaultValue={defaultValue}
          step={(props as InputFieldProps).step}
          className={baseClass}
        />
      )}
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}
