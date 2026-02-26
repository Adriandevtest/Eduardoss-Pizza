'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Loader2, Plus, Pizza as PizzaIcon } from 'lucide-react';

export default function MenuPage() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  // 1. Cargar las pizzas reales desde MongoDB
  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const res = await fetch('/api/pizzas');
        const data = await res.json();
        
        // Validamos que sea un arreglo para evitar el error de .map()
        if (Array.isArray(data)) {
          setPizzas(data);
        }
      } catch (error) {
        console.error("Error cargando el menú en Tabasco:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, []);

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
        <p className="text-xl text-gray-500">Pizzas artesanales horneadas en Tabasco</p>
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