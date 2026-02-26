import { create } from 'zustand';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

interface CartState {
  cart: CartItem[];
  addItem: (product: any) => void;      // Aumentar o agregar
  removeItem: (id: string) => void;     // Eliminar (Trash)
  updateQuantity: (id: string, action: 'plus' | 'minus') => void; // +/-
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