'use client';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function UbicacionPage() {
  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Información de la Sucursal */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Visítanos</h1>
            <p className="text-lg text-gray-600">
              Disfruta de la mejor pizza artesanal en un ambiente acogedor. ¡Te esperamos en nuestra sucursal principal!
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="bg-red-100 p-3 rounded-2xl text-red-600">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Dirección</h3>
                <p className="text-gray-600">Av. Principal 123, Colonia Centro<br />Villahermosa, Tabasco</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-red-100 p-3 rounded-2xl text-red-600">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Horarios</h3>
                <p className="text-gray-600">Lunes a Domingo: 12:00 PM - 11:00 PM</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-red-100 p-3 rounded-2xl text-red-600">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Teléfono</h3>
                <p className="text-gray-600">993 123 4567</p>
              </div>
            </div>
          </div>

          <Button className="w-full md:w-auto px-8 py-4">
            <Navigation size={20} /> Cómo llegar
          </Button>
        </div>

        {/* Mapa Interactivo (Google Maps Iframe) */}
        <div className="h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3794.137025251662!2d-92.9255!3d17.9869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDU5JzEyLjgiTiA5MsKwNTUnMzEuOCJX!5e0!3m2!1ses-419!2smx!4v1700000000000!5m2!1ses-419!2smx" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

      </div>
    </main>
  );
}