'use client';

import { useState, useEffect } from 'react';
import { useCartStore, CartItem } from '@/store/useCartStore';
import { useSucursalStore, SUCURSALES } from '@/store/useSucursalStore';
import { SIZES, TOPPINGS } from '@/data/pizzaOptions';
import {
  Loader2, Plus, Pizza as PizzaIcon, MapPin, ChevronDown,
  X, ShoppingBag, Check, Minus
} from 'lucide-react';

export default function MenuPage() {
  const [pizzas, setPizzas]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [estimate, setEstimate]   = useState<{ min: number; max: number } | null>(null);

  // Estado del modal de personalización
  const [selectedPizza,    setSelectedPizza]    = useState<any>(null);
  const [selectedSize,     setSelectedSize]     = useState('mediana');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [modalQty,         setModalQty]         = useState(1);

  const { addItems } = useCartStore();
  const { sucursal, setSucursal } = useSucursalStore();

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    fetch('/api/pizzas')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPizzas(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/orders/estimate')
      .then(r => r.json())
      .then(d => setEstimate(d))
      .catch(() => {});
  }, []);

  const openModal = (pizza: any) => {
    setSelectedPizza(pizza);
    setSelectedSize('mediana');
    setSelectedToppings([]);
    setModalQty(1);
  };

  const toggleTopping = (id: string) => {
    setSelectedToppings(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    if (!selectedPizza) return;
    const sizeObj          = SIZES.find(s => s.id === selectedSize)!;
    const selectedTops     = TOPPINGS.filter(t => selectedToppings.includes(t.id));
    const toppingsExtra    = selectedTops.reduce((sum, t) => sum + t.price, 0);
    const finalPrice       = Math.round(selectedPizza.price * sizeObj.multiplier) + toppingsExtra;

    const cartItem: CartItem = {
      _id:          `${selectedPizza._id}-${selectedSize}-${[...selectedToppings].sort().join(',')}`,
      pizzaId:      selectedPizza._id,
      name:         selectedPizza.name,
      price:        finalPrice,
      basePrice:    selectedPizza.price,
      quantity:     modalQty,
      image:        selectedPizza.image,
      category:     selectedPizza.category,
      size:         selectedSize,
      sizeLabel:    `${sizeObj.label} (${sizeObj.size})`,
      toppings:     selectedToppings,
      toppingLabels: selectedTops.map(t => t.label),
    };

    addItems([cartItem]);
    setSelectedPizza(null);
  };

  // Precio calculado en tiempo real
  const sizeObj       = SIZES.find(s => s.id === selectedSize)!;
  const selectedTops  = TOPPINGS.filter(t => selectedToppings.includes(t.id));
  const toppingsExtra = selectedTops.reduce((sum, t) => sum + t.price, 0);
  const calculatedPrice = selectedPizza
    ? Math.round(selectedPizza.price * sizeObj.multiplier) + toppingsExtra
    : 0;

  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  if (!sucursal) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center bg-red-100 text-red-600 w-20 h-20 rounded-3xl mb-6 shadow-lg shadow-red-100">
              <MapPin size={40} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-3">¿Cuál es tu sucursal?</h1>
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
    <>
      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black text-gray-900 mb-4">Nuestro Menú 🍕</h1>
          <p className="text-xl text-gray-500 mb-4">Pizzas artesanales horneadas en Tabasco</p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Chip de sucursal */}
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

            {/* Badge de tiempo estimado */}
            {estimate && (
              <span className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 px-4 py-2 rounded-full font-bold text-sm">
                🛵 Entrega: {estimate.min}–{estimate.max} min
              </span>
            )}
          </div>
        </header>

        {pizzas.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <PizzaIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 italic">No hay pizzas disponibles por ahora. ¡Vuelve pronto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pizzas.map((pizza: any) => (
              <div
                key={pizza._id}
                className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 group hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={pizza.image}
                    alt={pizza.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl font-black text-red-600 shadow-lg">
                    desde ${Math.round(pizza.price * 0.70)}
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
                    onClick={() => openModal(pizza)}
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

      {/* MODAL DE PERSONALIZACIÓN */}
      {selectedPizza && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPizza(null); }}
        >
          <div className="bg-white w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">

            {/* Imagen + nombre */}
            <div className="relative h-44 shrink-0">
              <img
                src={selectedPizza.image}
                alt={selectedPizza.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button
                onClick={() => setSelectedPizza(null)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur text-white p-2 rounded-full hover:bg-white/40 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-5 text-white">
                <h2 className="text-2xl font-black leading-tight">{selectedPizza.name}</h2>
                <p className="text-xs opacity-75 mt-0.5">{selectedPizza.category}</p>
              </div>
            </div>

            {/* Body scrollable */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">

              {/* Tamaño */}
              <div>
                <h3 className="font-black text-gray-800 mb-3 text-sm uppercase tracking-wider">Tamaño</h3>
                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map(size => {
                    const price     = Math.round(selectedPizza.price * size.multiplier);
                    const isSelected = selectedSize === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`p-3 rounded-2xl border-2 text-center transition-all ${
                          isSelected
                            ? 'border-red-600 bg-red-50'
                            : 'border-gray-150 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <p className={`font-black text-sm ${isSelected ? 'text-red-700' : 'text-gray-700'}`}>
                          {size.label}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">{size.size}</p>
                        <p className={`text-xs font-black mt-1 ${isSelected ? 'text-red-600' : 'text-gray-500'}`}>
                          ${price}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extras */}
              <div>
                <h3 className="font-black text-gray-800 mb-3 text-sm uppercase tracking-wider">
                  Extras{selectedToppings.length > 0 && <span className="text-red-600 ml-2">+${toppingsExtra}</span>}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TOPPINGS.map(topping => {
                    const isSelected = selectedToppings.includes(topping.id);
                    return (
                      <button
                        key={topping.id}
                        onClick={() => toggleTopping(topping.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-md shadow-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? <Check size={12} /> : <Plus size={12} />}
                        {topping.label}
                        {!isSelected && <span className="text-gray-400 text-[10px]">+${topping.price}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cantidad */}
              <div className="flex items-center gap-4">
                <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider">Cantidad</h3>
                <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1 ml-auto">
                  <button
                    onClick={() => setModalQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-black shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-black text-xl w-8 text-center">{modalQty}</span>
                  <button
                    onClick={() => setModalQty(q => q + 1)}
                    className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-black shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer con CTA */}
            <div className="p-5 border-t border-gray-100 bg-white shrink-0 pb-safe">
              <button
                onClick={handleAddToCart}
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-red-700 transition-colors shadow-lg shadow-red-200 active:scale-[0.98]"
              >
                <ShoppingBag size={22} />
                Agregar · ${calculatedPrice} × {modalQty} ={' '}
                <span className="underline underline-offset-2">${calculatedPrice * modalQty}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
