type ProfessionalPickerProps = {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  professionals?: string[];
  allowNoPreference?: boolean;
};

const options = [
  {
    value: "Kiara Moscoso",
    name: "Kiara Moscoso",
    role: "Enfermera dermoestética · Cosmetóloga",
    note: "Armonización · Láser · Dermoestética",
    image: "/images/kiara-moscoso-clean.png",
  },
  {
    value: "Pía Orellana",
    name: "Pía Orellana",
    role: "Enfermera dermoestética · Cosmetóloga",
    note: "Armonización · Láser · Salud integral",
    image: "/images/pia-orellana-clean.png",
  },
];

export function ProfessionalPicker({ value, onChange, compact = false, professionals, allowNoPreference = true }: ProfessionalPickerProps) {
  const visibleOptions = options.filter((option) => !professionals || professionals.includes(option.value));
  const showNoPreference = allowNoPreference && visibleOptions.length > 1;
  return (
    <div className={`professional-picker${compact ? " compact" : ""}${showNoPreference ? " with-flex-choice" : ""}`} role="radiogroup" aria-label="Elige una profesional">
      {visibleOptions.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? "professional-option selected" : "professional-option"}
            onClick={() => onChange(option.value)}
          >
            <img src={option.image} alt="" />
            <span className="professional-option-copy">
              <small>{option.role}</small>
              <b>{option.name}</b>
              {!compact && <span>{option.note}</span>}
            </span>
            <span className="professional-check" aria-hidden="true">{selected ? "✓" : ""}</span>
          </button>
        );
      })}
      {showNoPreference && (
        <button
          type="button"
          role="radio"
          aria-checked={!value}
          className={!value ? "professional-flex-choice selected" : "professional-flex-choice"}
          onClick={() => onChange("")}
        >
          <span>✦</span>
          <b>Sin preferencia: asignar de forma equilibrada según disponibilidad.</b>
          <small>Kiara y Pía mantienen la misma visibilidad; BIOBELLE elige la hora/profesional libre más conveniente.</small>
        </button>
      )}
    </div>
  );
}
