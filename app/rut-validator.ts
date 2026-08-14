/**
 * Validador y formateador de RUT chileno (Módulo 11) y pasaportes.
 * Conforme a estándares de identificación en salud en Chile (Ley 20.584 y DFL 725).
 */

export function cleanRut(value: string): string {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^0-9K]/g, "");
}

export function calculateDv(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return "0";
  if (remainder === 10) return "K";
  return String(remainder);
}

export function validateRut(value: string): boolean {
  const cleaned = cleanRut(value);
  if (cleaned.length < 7 || cleaned.length > 9) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  if (!/^\d+$/.test(body)) return false;

  // Evitar números inválidos ficticios repetidos
  if (/^(\d)\1+$/.test(body) && body.length >= 7) {
    // Casos como 1111111-1
    return false;
  }

  const expectedDv = calculateDv(body);
  return dv === expectedDv;
}

export function formatRut(value: string): string {
  const cleaned = cleanRut(value);
  if (!cleaned) return "";
  if (cleaned.length === 1) return cleaned;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  let formattedBody = "";
  let count = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    count++;
    formattedBody = body[i] + formattedBody;
    if (count % 3 === 0 && i !== 0) {
      formattedBody = "." + formattedBody;
    }
  }

  return `${formattedBody}-${dv}`;
}

export function formatIdentification(value: string, isPassport = false): string {
  if (isPassport) return String(value || "").trim().toUpperCase();
  return formatRut(value);
}
