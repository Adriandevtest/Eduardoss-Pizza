'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import {
  ClipboardList, Loader2, RefreshCw, MapPin,
  ChevronRight, ShoppingBag, CheckCircle2
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pendiente:  { label: 'Recibido',     color: 'bg-gray-100 text-gray-600' },
  pagado:     { label: 'Preparando',   color: 'bg-blue-100 text-blue-700' },
  listo:      { label: 'Listo',        color: 'bg-amber-100 text-amber-700' },
  en_camino:  { label: 'En camino',    color: 'bg-orange-100 text-orange-700' },
  entregado:  { label: 'Entregado',    color: 'bg-green-100 text-green-700' },
};

const ACTIVE_STATUSES = ['pendiente', 'pagado', 'listo', 'en_camino'];

export default function HistorialPage() {
  const { user, isLoggedIn } = useAuthStore();
  const { addItems } = useCartStore();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!isLoggedIn) { router.push('/login'); return; }

    fetch('/api/orders/my')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOrders(data); })
      .finally(() => setLoading(false));
  }, [isMounted, isLoggedIn, router]);

  const handleReorder = async (order: any) => {
    setReordering(order._id);
    try {
      // Busca el menú actual para recuperar IDs e imágenes reales
      const res = await fetch('/api/pizzas');
      const menu: any[] = res.ok ? await res.json() : [];

      const cartItems = order.items.map((item: any) => {
        const match = menu.find((p: any) =>
          p.name.toLowerCase() === item.name.toLowerCase()
        );
        return {
          _id:      match?._id  ?? `reorder-${item.name}`,
          name:     item.name,
          price:    item.price,
          quantity: item.quantity,
          image:    match?.image ?? '',
          category: match?.category ?? '',
        };
      });

      addItems(cartItems);
      router.push('/carrito');
    } finally {
      setReordering(null);
    }
  };

  if (!isMounted || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6 lg:p-12">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
          <ClipboardList className="text-red-600" size={36} />
          Mis Pedidos
        </h1>
        <p className="text-gray-500 mt-2">Hola, <span className="font-bold text-gray-700">{user?.name?.split(' ')[0]}</span> — aquí están tus últimas {orders.length} órdenes</p>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <ShoppingBag size={64} className="text-gray-200 mb-4" />
          <h2 className="text-xl font-black text-gray-500">Aún no tienes pedidos</h2>
          <p className="text-gray-400 mt-1 mb-6">¡Haz tu primer pedido ahora!</p>
          <Link href="/menu" className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all">
            Ver Menú
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' };
            const isActive  = ACTIVE_STATUSES.includes(order.status);
            const date      = new Date(order.createdAt);

            return (
              <article key={order._id} className="bg-white rounded-[2rem] border border-gray-100 shadow-lg overflow-hidden">

                {/* Header de la orden */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
                  <div>
                    <p className="font-mono text-xs text-gray-400 font-bold">#{String(order._id).slice(-8).toUpperCase()}</p>
                    <p className="text-sm font-bold text-gray-600 mt-0.5">
                      {date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}
                      {date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                    {isActive && (
                      <Link
                        href={`/tracker?id=${order._id}`}
                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        Rastrear <ChevronRight size={10} />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="px-6 py-4 space-y-1.5">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        <span className="font-black text-gray-900">{item.quantity}×</span> {item.name}
                      </span>
                      <span className="font-bold text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">
                      {order.sucursal && <span className="flex items-center gap-1"><MapPin size={10} />{order.sucursal}</span>}
                    </p>
                    <p className="font-black text-xl text-gray-900 mt-0.5">${order.total?.toFixed(2)}</p>
                  </div>

                  <button
                    onClick={() => handleReorder(order)}
                    disabled={reordering === order._id}
                    className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-red-600 transition-all shadow-md disabled:bg-gray-300"
                  >
                    {reordering === order._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                    Pide de nuevo
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
