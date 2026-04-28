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
      className="rounded-xl border border-slate-200 bg-white p-4"
    >
      <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-5">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {f.label}
            </label>
            {f.type === "select" ? (
              <select
                name={f.name}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className="self-end rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Search
        </button>
      </div>
    </form>
  );
}
