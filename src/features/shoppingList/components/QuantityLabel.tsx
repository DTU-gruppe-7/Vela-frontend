import { formatShoppingQuantityLabel } from '../utils/quantityDisplay';

interface QuantityLabelProps {
  quantity: number;
  unit: string | null | undefined;
  className?: string;
}

function QuantityLabel({ quantity, unit, className }: QuantityLabelProps) {
  const label = formatShoppingQuantityLabel(quantity, unit);

  if (!label) {
    return null;
  }

  return <span className={className}>{label}</span>;
}

export default QuantityLabel;

