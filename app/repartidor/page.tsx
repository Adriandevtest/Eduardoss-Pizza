'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Loader2, CheckCircle2, Bike, MapPin, 
  Phone, Navigation, MessageCircle, PackageOpen, Clock
} from 'lucide-react';

export default function RepartidorPage() {
  const { user, isLoggedIn } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. PROTECCIÓN DE RUTA
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    // Solo permitimos acceso a repartidores y administradores
    if (user?.role !== 'admin' && user?.role !== 'repartidor') {
      router.push('/menu'); 
    }
  }, [isLoggedIn, user, router]);

  // 2. CARGAR PEDIDOS LISTOS PARA ENTREGAR
  const fetchDeliveryOrders = async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Filtramos solo los pedidos que la cocina marcó como 'listo'
        const listosParaEntrega = data.filter((o: any) => o.status === 'listo');
        setOrders(listosParaEntrega);
      }
    } catch (error) {
      console.error("Error al cargar entregas:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. ACTUALIZACIÓN AUTOMÁTICA
  useEffect(() => {
    if (isLoggedIn && ['admin', 'repartidor'].includes(user?.role)) {
      fetchDeliveryOrders();
      // Refresca automáticamente cada 15 segundos para ver nuevas pizzas listas
      const interval = setInterval(fetchDeliveryOrders, 15000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, user]);

  // 4. MARCAR COMO ENTREGADO
  const handleEntregado = async (id: string) => {
    if (!confirm("¿Confirmas que este pedido ya fue entregado al cliente?")) return;
    
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'entregado' }), // Cambiamos el estado a entregado
      });

      if (res.ok) {
        fetchDeliveryOrders();
      } else {
        alert("Error al actualizar la entrega.");
      }
    } catch (error) {
      console.error("Error al finalizar entrega:", error);
    }
  };

  if (!isLoggedIn || !['admin', 'repartidor'].includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen pb-24">
      <div className="flex flex-col mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
          <Bike className="text-green-600" size={36} /> 
          Rutas de Entrega
        </h1>
        <p className="text-gray-500 font-medium mt-1">Repartidor: <span className="font-bold text-gray-800">{user?.name}</span></p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-green-600" size={48} />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm">
          <PackageOpen size={64} className="mb-4 text-gray-300" />
          <h2 className="text-xl font-black text-gray-500">Sin rutas pendientes</h2>
          <p className="font-medium mt-2 text-gray-400 text-center px-4">Espera a que la cocina marque los pedidos como listos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order: any) => {
            // Limpiamos el teléfono para poder usarlo en los links de WhatsApp/Llamada
            const cleanPhone = order.customerPhone?.replace(/[^0-9]/g, '') || '';
            // Forzamos la búsqueda en Tabasco para mayor precisión en Maps
            const mapQuery = encodeURIComponent(`${order.deliveryAddress}, Tabasco, Mexico`);

            return (
              <div key={order._id} className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col relative">
                
                {/* Etiqueta de Listo */}
                <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  Listo en Cocina
                </div>

                <div className="p-6 pb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-gray-900 text-white text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase">
                      #{order._id.slice(-5)}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-gray-500">
                      <Clock size={14} /> 
                      {new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Dirección Principal (MUY GRANDE para el repartidor) */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-1">Entregar en:</h3>
                    <p className="text-2xl font-black text-gray-800 leading-tight flex items-start gap-2">
                      <MapPin className="text-red-500 shrink-0 mt-1" size={24} />
                      {order.deliveryAddress === 'Mostrador' ? 'ENTREGA EN LOCAL (MOSTRADOR)' : order.deliveryAddress}
                    </p>
                  </div>

                  {/* Datos del Cliente */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
                    <p className="font-bold text-gray-900">{order.customerName}</p>
                    <p className="text-gray-600 text-sm mb-3">Tel: {order.customerPhone}</p>
                    
                    {/* Botones de Contacto Rápido */}
                    {order.customerPhone !== 'N/A' && order.deliveryAddress !== 'Mostrador' && (
                      <div className="flex gap-2">
                        <a 
                          href={`tel:${cleanPhone}`} 
                          className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-xl flex justify-center items-center gap-2 font-bold text-sm hover:bg-gray-50 shadow-sm"
                        >
                          <Phone size={16} /> Llamar
                        </a>
                        <a 
                          href={`https://wa.me/52${cleanPhone}`} 
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 bg-[#25D366] text-white py-2 rounded-xl flex justify-center items-center gap-2 font-bold text-sm hover:bg-[#1ebd5a] shadow-sm shadow-green-200"
                        >
                          <MessageCircle size={16} /> WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Resumen del pedido para verificar */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Paquete a entregar:</p>
                    <ul className="text-sm font-medium text-gray-600 space-y-1">
                      {order.items.map((item: any, idx: number) => (
                        <li key={idx} className="flex gap-2">
                          <span className="font-black text-gray-900">{item.quantity}x</span> {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Método de pago */}
                  <div className="flex justify-between items-center bg-blue-50 text-blue-800 p-3 rounded-xl border border-blue-100 font-bold text-sm">
                    <span>Cobro / Método:</span>
                    <span className="uppercase">{order.paymentMethod || 'No especificado'}</span>
                  </div>
                </div>

                {/* ACCIONES PRINCIPALES */}
                <div className="p-4 bg-white border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3 mt-auto">
                  {/* Botón de Navegación */}
                  {order.deliveryAddress !== 'Mostrador' && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                      target="_blank" rel="noopener noreferrer"
                      className="bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                      <Navigation size={20} />
                      Abrir en Mapa
                    </a>
                  )}

                  {/* Botón de Completar */}
                  <button 
                    onClick={() => handleEntregado(order._id)}
                    className={`${order.deliveryAddress === 'Mostrador' ? 'md:col-span-2' : ''} bg-gray-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2`}
                  >
                    <CheckCircle2 size={20} />
                    Completar Entrega
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}