'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, CheckCircle2, ChefHat, Clock, AlertCircle } from 'lucide-react';

export default function CocinaPage() {
  const { user, isLoggedIn } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. PROTECCIÓN DE RUTA MULTI-ROL
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    // Permitir acceso a admin, cajero y cocina
    const rolesPermitidos = ['admin', 'cajero', 'cocina'];
    if (!rolesPermitidos.includes(user?.role)) {
      router.push('/menu'); // Si es un cliente normal, lo mandamos al menú
    }
  }, [isLoggedIn, user, router]);

  // 2. OBTENER PEDIDOS PENDIENTES
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Filtramos para ver solo lo que la cocina debe preparar
        const pendientes = data.filter((o: any) => o.status === 'pendiente' || o.status === 'pagado');
        setOrders(pendientes);
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. ACTUALIZACIÓN AUTOMÁTICA (AUTO-REFRESH)
  useEffect(() => {
    if (isLoggedIn && ['admin', 'cajero', 'cocina'].includes(user?.role)) {
      fetchOrders();
      // Refresca los pedidos cada 10 segundos automáticamente
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, user]);

  // 4. MARCAR PEDIDO COMO LISTO
  const handleCompletar = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'listo' }),
      });

      if (res.ok) {
        // Reproducir un sonido opcional aquí si lo deseas
        fetchOrders();
      } else {
        alert("Error al actualizar el estado del pedido.");
      }
    } catch (error) {
      console.error("Error al marcar como listo:", error);
    }
  };

  // PANTALLA DE CARGA MIENTRAS VALIDA ROL
  if (!isLoggedIn || !['admin', 'cajero', 'cocina'].includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            <ChefHat className="text-red-600" size={40} /> 
            Monitor de Cocina
          </h1>
          <p className="text-gray-500 font-medium mt-2">Pizzería Eduardo's - Sucursal Tabasco</p>
        </div>
        <div className="bg-red-50 px-6 py-3 rounded-full text-red-700 text-sm font-bold border border-red-100 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
          Turno: {user?.name} ({user?.role.toUpperCase()})
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-red-600" size={48} />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
          <CheckCircle2 size={80} className="mb-4 text-gray-300" />
          <h2 className="text-2xl font-black text-gray-500">Sin pedidos pendientes</h2>
          <p className="font-medium mt-2 text-gray-400">La cocina está al día. ¡Buen trabajo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {orders.map((order: any) => (
            <div key={order._id} className="bg-white rounded-[2rem] shadow-xl border-t-8 border-t-red-600 overflow-hidden flex flex-col">
              
              {/* HEADER DEL PEDIDO */}
              <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-gray-900 text-white text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase">
                    #{order._id.slice(-5)}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                    <Clock size={14} /> 
                    {new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="font-black text-xl text-gray-800 uppercase tracking-tight">{order.customerName}</h3>
                {order.notes && (
                  <div className="mt-3 bg-yellow-50 text-yellow-800 p-3 rounded-xl text-sm font-bold flex gap-2 border border-yellow-200">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="leading-tight">Nota: {order.notes}</p>
                  </div>
                )}
              </div>

              {/* LISTA DE PIZZAS A PREPARAR */}
              <div className="p-6 flex-1">
                <ul className="space-y-4">
                  {order.items.map((item: any, index: number) => (
                    <li key={index} className="flex items-center gap-3 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <span className="bg-red-100 text-red-700 w-8 h-8 rounded-xl flex items-center justify-center font-black text-lg shrink-0">
                        {item.quantity}
                      </span>
                      <span className="font-bold text-gray-700 text-lg leading-tight">
                        {item.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* BOTÓN DE ACCIÓN */}
              <div className="p-6 pt-0 mt-auto">
                <button 
                  onClick={() => handleCompletar(order._id)}
                  className="w-full bg-green-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-green-600 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <CheckCircle2 size={24} />
                  Marcar Listo
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </main>
  );
}