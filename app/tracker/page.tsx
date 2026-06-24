'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChefHat, Bike, CheckCircle2, Clock,
  PackageCheck, Pizza, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';

const PASOS = [
  {
    id: 1,
    label: 'Recibido',
    icon: CheckCircle2,
    description: 'Tu pedido fue confirmado',
    statuses: ['pendiente', 'pagado', 'listo', 'en_camino', 'entregado'],
  },
  {
    id: 2,
    label: 'Preparando',
    icon: ChefHat,
    description: 'Nuestros chefs están horneando tu pizza',
    statuses: ['pagado', 'listo', 'en_camino', 'entregado'],
  },
  {
    id: 3,
    label: 'En camino',
    icon: Bike,
    description: 'El repartidor va hacia tu ubicación',
    statuses: ['en_camino', 'entregado'],
  },
  {
    id: 4,
    label: 'Entregado',
    icon: PackageCheck,
    description: '¡Que disfrutes tu pizza!',
    statuses: ['entregado'],
  },
];

const STATUS_LABEL: Record<string, string> = {
  pendiente: 'Pedido recibido',
  pagado: 'En preparación',
  listo: 'Listo en cocina',
  en_camino: 'En camino',
  entregado: 'Entregado',
};

function getStepActual(status: string) {
  if (['en_camino', 'entregado'].includes(status)) return status === 'entregado' ? 4 : 3;
  if (['pagado', 'listo'].includes(status)) return 2;
  return 1;
}

export default function TrackerPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) { setError('Pedido no encontrado.'); return; }
      const data = await res.json();
      setOrder(data);
      setLastUpdate(new Date());
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (!orderId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="text-2xl font-black text-gray-700">No se especificó un pedido</h2>
        <Link href="/menu" className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700">
          Ir al Menú
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-red-600" size={48} />
        <p className="text-gray-500 font-bold">Buscando tu pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="text-2xl font-black text-gray-700">{error || 'Pedido no encontrado'}</h2>
        <Link href="/menu" className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700">
          Ir al Menú
        </Link>
      </div>
    );
  }

  const pasoActual = getStepActual(order.status);
  const isEntregado = order.status === 'entregado';
  const minutosTrans = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);

  return (
    <main className="max-w-lg mx-auto p-6 lg:p-10">

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-1">Estado de tu Pedido</h1>
        <p className="text-gray-400 font-mono text-sm">#{String(order._id).slice(-8).toUpperCase()}</p>
        {order.sucursal && (
          <span className="inline-block mt-2 bg-red-50 text-red-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-100">
            Sucursal {order.sucursal}
          </span>
        )}
      </div>

      {/* Tiempo transcurrido */}
      {!isEntregado && (
        <div className="bg-red-50 border border-red-100 p-5 rounded-3xl flex items-center gap-4 mb-8 shadow-sm">
          <div className="bg-red-600 p-3 rounded-2xl text-white shrink-0">
            <Clock size={26} />
          </div>
          <div>
            <p className="text-xs text-red-600 font-black uppercase tracking-wider">Tiempo transcurrido</p>
            <p className="text-2xl font-black text-red-900">{minutosTrans} min</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs text-gray-400 font-medium">
            <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
            {lastUpdate ? `${new Date(lastUpdate).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-gray-100 -z-10" />

        <div className="space-y-8">
          {PASOS.map((paso) => {
            const isActive = paso.statuses.includes(order.status);
            const isCurrent = paso.id === pasoActual;
            const Icon = paso.icon;

            return (
              <div key={paso.id} className="flex gap-5 items-start">
                <div className={`relative p-3 rounded-full border-4 border-white shadow-md transition-all duration-500 shrink-0 ${
                  isActive
                    ? isCurrent && !isEntregado
                      ? 'bg-red-600 text-white scale-110 shadow-red-200 shadow-lg'
                      : 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-300'
                }`}>
                  <Icon size={22} />
                  {isCurrent && !isEntregado && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
                  )}
                </div>

                <div className={`pt-1 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-35'}`}>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-lg ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {paso.label}
                    </h3>
                    {isCurrent && !isEntregado && (
                      <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Ahora
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">{paso.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen del pedido */}
      <div className="mt-10 bg-white border border-gray-100 rounded-3xl shadow-xl p-6">
        <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2">
          <Pizza size={18} className="text-red-600" /> Tu pedido
        </h2>
        <ul className="space-y-2 mb-4">
          {order.items?.map((item: any, i: number) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">
                <span className="font-black text-gray-900">{item.quantity}×</span> {item.name}
              </span>
              <span className="font-bold text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-gray-900">
          <span>Total</span>
          <span>${order.total?.toFixed(2)}</span>
        </div>
        {order.deliveryAddress && order.deliveryAddress !== 'Mostrador' && (
          <p className="mt-3 text-xs text-gray-400 font-medium">
            📍 {order.deliveryAddress}
          </p>
        )}
      </div>

      {/* Éxito */}
      {isEntregado && (
        <div className="mt-8 text-center animate-in zoom-in-95">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">¡Buen provecho!</h2>
          <p className="text-gray-500 mb-6">Esperamos que hayas disfrutado tu pizza.</p>
          <Link href="/menu" className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all">
            Pedir de nuevo
          </Link>
        </div>
      )}
    </main>
  );
}
