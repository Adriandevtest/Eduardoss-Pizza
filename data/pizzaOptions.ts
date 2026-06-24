export const SIZES = [
  { id: 'chica',    label: 'Chica',    size: '8"',  multiplier: 0.70 },
  { id: 'mediana',  label: 'Mediana',  size: '12"', multiplier: 1.00 },
  { id: 'grande',   label: 'Grande',   size: '14"', multiplier: 1.35 },
  { id: 'familiar', label: 'Familiar', size: '16"', multiplier: 1.80 },
] as const;

export const TOPPINGS = [
  { id: 'extra-queso',    label: 'Extra Queso',   price: 20 },
  { id: 'pepperoni',      label: 'Pepperoni',     price: 25 },
  { id: 'jamon',          label: 'Jamón Extra',   price: 20 },
  { id: 'champinones',    label: 'Champiñones',   price: 15 },
  { id: 'cebolla',        label: 'Cebolla',       price: 10 },
  { id: 'chipotle',       label: 'Chipotle',      price: 10 },
  { id: 'jalapenos',      label: 'Jalapeños',     price: 10 },
  { id: 'aceitunas',      label: 'Aceitunas',     price: 15 },
  { id: 'pina',           label: 'Piña',          price: 10 },
] as const;

export type SizeId = typeof SIZES[number]['id'];
