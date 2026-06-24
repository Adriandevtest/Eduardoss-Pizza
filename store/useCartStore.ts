import { create } from 'zustand';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  // Personalización de pizza
  pizzaId?: string;
  basePrice?: number;
  size?: string;
  sizeLabel?: string;
  toppings?: string[];
  toppingLabels?: string[];
}

interface CartState {
  cart: CartItem[];
  addItem: (product: any) => void;
  addItems: (items: CartItem[]) => void; // Para "Pide de nuevo"
  removeItem: (id: string) => void;
  updateQuantity: (id: string, action: 'plus' | 'minus') => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  
  addItem: (product) => set((state) => {
    const existingItem = state.cart.find((item) => item._id === product._id);
    if (existingItem) {
      return {
        cart: state.cart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),

  addItems: (items) => set((state) => {
    let newCart = [...state.cart];
    for (const item of items) {
      const existing = newCart.find((i) => i._id === item._id);
      if (existing) {
        newCart = newCart.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        newCart.push(item);
      }
    }
    return { cart: newCart };
  }),

  // Eliminar producto completamente (Icono de Basura)
  removeItem: (id) => set((state) => ({
    cart: state.cart.filter((item) => item._id !== id)
  })),

  // Lógica para botones + y -
  updateQuantity: (id, action) => set((state) => ({
    cart: state.cart.map((item) => {
      if (item._id === id) {
        const nextQuantity = action === 'plus' ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: Math.max(0, nextQuantity) };
      }
      return item;
    }).filter((item) => item.quantity > 0) // Si llega a 0, se va del carrito
  })),
  
  clearCart: () => set({ cart: [] }),
}));