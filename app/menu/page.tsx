'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useSucursalStore, SUCURSALES } from '@/store/useSucursalStore';
import { Loader2, Plus, Pizza as PizzaIcon, MapPin, ChevronDown } from 'lucide-react';

export default function MenuPage() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { sucursal, setSucursal } = useSucursalStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const res = await fetch('/api/pizzas');
        const data = await res.json();
        if (Array.isArray(data)) setPizzas(data);
      } catch (error) {
        console.error("Error cargando el menú:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPizzas();
  }, []);

  // Esperar hidratación del store
  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  // Selector de sucursal
  if (!sucursal) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center bg-red-100 text-red-600 w-20 h-20 rounded-3xl mb-6 shadow-lg shadow-red-100">
              <MapPin size={40} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-3">
              ¿Cuál es tu sucursal?
            </h1>
            <p className="text-gray-500 text-lg">
              Elige la <span className="font-bold text-red-600">Pizzería Eduardo's</span> más cercana a ti
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {SUCURSALES.map((s) => (
              <button
                key={s}
                onClick={() => setSucursal(s)}
                className="group bg-white border-2 border-gray-100 hover:border-red-500 hover:shadow-xl hover:shadow-red-100 p-6 rounded-3xl text-left transition-all duration-300 active:scale-95"
              >
                <div className="bg-gray-100 group-hover:bg-red-100 w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                  <MapPin size={20} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                </div>
                <p className="font-black text-gray-900 text-lg leading-tight">{s}</p>
                <p className="text-xs text-gray-400 font-medium mt-1">Tabasco, México</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
        <p className="text-gray-500 font-bold">Cargando el menú de hoy...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black text-gray-900 mb-4">Nuestro Menú 🍕</h1>
        <p className="text-xl text-gray-500 mb-4">Pizzas artesanales horneadas en Tabasco</p>

        {/* Chip de sucursal activa */}
        <button
          onClick={() => setSucursal('')}
          className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-red-100 transition-colors"
        >
          <MapPin size={14} />
          {sucursal}
          <span className="text-red-400 ml-1 flex items-center gap-1">
            <ChevronDown size={14} /> Cambiar
          </span>
        </button>
      </header>

      {pizzas.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <PizzaIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 italic">No hay pizzas disponibles por ahora. ¡Vuelve pronto!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pizzas.map((pizza: any) => (
            <div key={pizza._id} className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 group hover:shadow-2xl transition-all duration-500">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={pizza.image}
                  alt={pizza.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl font-black text-red-600 shadow-lg">
                  ${pizza.price}
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{pizza.name}</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-3 py-1 rounded-full">
                    {pizza.category}
                  </span>
                </div>

                <p className="text-gray-500 mb-8 line-clamp-2 text-sm leading-relaxed italic">
                  "{pizza.description}"
                </p>

                <button
                  onClick={() => addItem(pizza)}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg active:scale-95 duration-200"
                >
                  <Plus size={20} /> Agregar al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
