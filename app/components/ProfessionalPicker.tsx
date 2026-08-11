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

export function ProfessionalPicker({ value, onChange, compact = false, professionals }: ProfessionalPickerProps) {
  const visibleOptions = options.filter((option) => !professionals || professionals.includes(option.value));
  return (
    <div className={`professional-picker${compact ? " compact" : ""}`} role="radiogroup" aria-label="Elige una profesional">
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
    </div>
  );
}
