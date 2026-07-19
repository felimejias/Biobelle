type ProfessionalPickerProps = {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

const options = [
  {
    value: "Primera disponible",
    name: "Primera profesional disponible",
    role: "La opción más rápida",
    note: "Te asignamos a Kiara o Pía según la primera hora libre.",
    image: null,
  },
  {
    value: "Kiara Moscoso",
    name: "Kiara Moscoso",
    role: "Enfermera dermoestética · Cosmetóloga",
    note: "Armonización · Láser · Dermocosmética",
    image: "/images/kiara-moscoso.jpg",
  },
  {
    value: "Pía Orellana",
    name: "Pía Orellana",
    role: "Enfermera dermoestética · Cosmetóloga",
    note: "Armonización · Láser · Salud integral",
    image: "/images/pia-orellana.jpg",
  },
];

export function ProfessionalPicker({ value, onChange, compact = false }: ProfessionalPickerProps) {
  return (
    <div className={`professional-picker${compact ? " compact" : ""}`} role="radiogroup" aria-label="Elige una profesional">
      {options.map((option) => {
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
            {option.image ? (
              <img src={option.image} alt="" />
            ) : (
              <span className="professional-any" aria-hidden="true">✦</span>
            )}
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
