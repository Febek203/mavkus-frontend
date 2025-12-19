export default function SettingsPanel() {
  return (
    <div className="
      bg-bgCard
      border border-borderSoft
      rounded-2xl
      p-5
      shadow-md
    ">
      <h3 className="text-lg font-semibold text-primary mb-4">
        Impostazioni
      </h3>

      <label className="block text-sm text-textMuted mb-1">
        Modello AI
      </label>
      <select
        className="
          w-full
          bg-bgDark
          border border-borderSoft
          rounded-lg
          px-3 py-2
          text-textMain
          focus:outline-none
          focus:ring-2
          focus:ring-primary
        "
      >
        <option>default</option>
      </select>
    </div>
  );
}
