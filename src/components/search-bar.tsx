interface BaseField {
  name: string;
  label: string;
  placeholder?: string;
}
interface InputField extends BaseField {
  type: "text" | "number";
  step?: string;
}
interface SelectField extends BaseField {
  type: "select";
  options: { value: string; label: string }[];
}
type Field = InputField | SelectField;

export function SearchBar({
  basePath,
  fields,
}: {
  basePath: string;
  fields: Field[];
}) {
  return (
    <form
      action={basePath}
      method="get"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
      >
        {fields.map((f) => (
          <div key={f.name} className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {f.label}
            </label>
            {f.type === "select" ? (
              <select
                name={f.name}
                className="h-9 rounded-md border border-slate-300 px-2 text-sm bg-white text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition"
              >
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type}
                name={f.name}
                step={(f as InputField).step}
                placeholder={f.placeholder}
                className="h-9 rounded-md border border-slate-300 px-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-slate-900 hover:bg-slate-800 px-5 py-2 text-sm font-medium text-white transition"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}
