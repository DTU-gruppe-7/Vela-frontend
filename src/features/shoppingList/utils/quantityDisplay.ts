const SMALL_UNITS = new Set<string>(['g', 'ml']);

interface UnitConversionRule {
  to: string;
  threshold: number;
  factor: number;
}

const UP_CONVERSION_RULES: Record<string, UnitConversionRule> = {
  g: { to: 'kg', threshold: 1000, factor: 1000 },
  ml: { to: 'dl', threshold: 100, factor: 100 },
  dl: { to: 'l', threshold: 10, factor: 10 },
};

function normalizeUnit(unit: string | null | undefined): string {
  return (unit ?? '').trim().toLowerCase();
}

function roundUpForDisplay(quantity: number, unit: string): number {
  if (SMALL_UNITS.has(unit)) {
    return Math.ceil(quantity);
  }

  return Math.ceil(quantity * 10) / 10;
}

function tryUpConvert(quantity: number, unit: string): { quantity: number; unit: string } {
  let nextQuantity = quantity;
  let nextUnit = unit;

  while (UP_CONVERSION_RULES[nextUnit] && nextQuantity >= UP_CONVERSION_RULES[nextUnit].threshold) {
    const conversion = UP_CONVERSION_RULES[nextUnit];
    nextQuantity /= conversion.factor;
    nextUnit = conversion.to;
  }

  return { quantity: nextQuantity, unit: nextUnit };
}

function formatNumber(quantity: number, unit: string): string {
  const maximumFractionDigits = SMALL_UNITS.has(unit) ? 0 : 1;

  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(quantity);
}

export function formatShoppingQuantityLabel(quantity: number, unit: string | null | undefined): string {
  const normalizedUnit = normalizeUnit(unit);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return normalizedUnit;
  }

  const converted = tryUpConvert(quantity, normalizedUnit);
  const roundedQuantity = roundUpForDisplay(converted.quantity, converted.unit);
  const convertedAfterRounding = tryUpConvert(roundedQuantity, converted.unit);
  const quantityLabel = formatNumber(convertedAfterRounding.quantity, convertedAfterRounding.unit);

  return convertedAfterRounding.unit
    ? `${quantityLabel} ${convertedAfterRounding.unit}`
    : quantityLabel;
}

