'use client';

import { useState } from 'react';
import { ChefHat, Bike, CheckCircle2, Clock, PackageCheck } from 'lucide-react';

const PASOS_PEDIDO = [
  { id: 1, label: 'Confirmado', icon: CheckCircle2, description: 'Hemos recibido tu pedido' },
  { id: 2, label: 'Preparando', icon: ChefHat, description: 'Tu pizza está en el horno' },
  { id: 3, label: 'En Camino', icon: Bike, description: 'El repartidor va hacia tu ubicación' },
  { id: 4, label: 'Entregado', icon: PackageCheck, description: '¡Que disfrutes tu pizza!' },
];

export default function TrackerPage() {
  // Simulamos que el pedido está en la etapa 2 (Preparando)
  const [pasoActual] = useState(2);

  return (
    <main className="max-w-3xl mx-auto p-6 lg:p-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Estado de tu Pedido</h1>
        <p className="text-gray-500">Orden: #ED-1025</p>
      </div>

      {/* Tarjeta de tiempo estimado */}
      <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 mb-10 shadow-sm">
        <div className="bg-red-600 p-3 rounded-2xl text-white">
          <Clock size={28} />
        </div>
        <div>
          <p className="text-sm text-red-600 font-bold uppercase tracking-wider">Tiempo estimado</p>
          <p className="text-2xl font-black text-red-900">25 - 35 minutos</p>
        </div>
      </div>

      {/* Línea de Tiempo (Stepper) */}
      <div className="relative space-y-12">
        {/* Línea vertical de fondo */}
        <div className="absolute left-[27px] top-2 bottom-2 w-1 bg-gray-100 -z-10" />

        {PASOS_PEDIDO.map((paso) => {
          const isActive = paso.id <= pasoActual;
          const Icon = paso.icon;

          return (
            <div key={paso.id} className="flex gap-6 items-start">
              <div className={`p-3 rounded-full border-4 border-white shadow-md transition-all duration-500 ${
                isActive ? 'bg-red-600 text-white scale-110' : 'bg-gray-200 text-gray-400'
              }`}>
                <Icon size={24} />
              </div>
              
              <div className={`transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                <h3 className={`font-bold text-lg ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {paso.label}
                </h3>
                <p className="text-gray-500 text-sm">{paso.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 p-6 border-t border-gray-100 text-center">
        <p className="text-gray-500 mb-4">¿Tienes algún problema con tu pedido?</p>
        <button className="text-red-600 font-bold hover:underline">
          Contactar con soporte
        </button>
      </div>
    </main>
  );
}