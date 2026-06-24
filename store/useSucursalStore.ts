import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const SUCURSALES = ['Emiliano Zapata', 'Cunduacán', 'Jalpa de Méndez', 'Cárdenas'];

interface SucursalState {
  sucursal: string;
  setSucursal: (s: string) => void;
  clearSucursal: () => void;
}

export const useSucursalStore = create<SucursalState>()(
  persist(
    (set) => ({
      sucursal: '',
      setSucursal: (s) => set({ sucursal: s }),
      clearSucursal: () => set({ sucursal: '' }),
    }),
    { name: 'sucursal-storage' }
  )
);
