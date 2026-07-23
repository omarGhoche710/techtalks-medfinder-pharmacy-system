"use client";

type NearMeToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  loading?: boolean;
};

export default function NearMeToggle({
  enabled,
  onChange,
  loading = false,
}: NearMeToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 select-none">
      <span className="text-sm font-medium text-gray-700">Near Me</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Near Me toggle"
        disabled={loading}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] ${
          enabled ? "bg-[#2563eb]" : "bg-gray-200"
        } ${loading ? "opacity-60" : ""}`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}
