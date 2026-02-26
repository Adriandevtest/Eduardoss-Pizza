'use client';

import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Trash2, Plus, Minus, ShoppingBag, 
  MapPin, Phone, User, CreditCard, 
  Loader2, CheckCircle2, Lock, Printer, Banknote,
  LocateFixed, X, Map as MapIcon, Calculator
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CarritoPage() {
  const { cart, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocating, setIsLocating] = useState(false); 
  const [step, setStep] = useState(1); 

  // Estado para el método de pago del cajero
  const [staffPaymentMethod, setStaffPaymentMethod] = useState<'efectivo' | 'tarjeta'>('efectivo');

  // Estados para los MODALES nuevos
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashGiven, setCashGiven] = useState('');
  
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCoords, setMapCoords] = useState<{lat: number, lng: number} | null>(null);
  const [tempAddress, setTempAddress] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const isStaff = user?.role === 'admin' || user?.role === 'cajero';

  useEffect(() => {
    if (user && !isStaff) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
      }));
    }
  }, [user, isStaff]);

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // --- FUNCIÓN MEJORADA: ABRIR MAPA GPS ---
  const handleOpenMap = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador o dispositivo no soporta el uso de GPS.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapCoords({ lat: latitude, lng: longitude });
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const streetName = data.address?.road || data.address?.suburb || data.display_name.split(',')[0];
          setTempAddress(`${streetName} (GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
        } catch (error) {
          setTempAddress(`Ubicación GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setIsLocating(false);
          setShowMapModal(true); // Abrimos el modal del mapa
        }
      },
      (error) => {
        alert("No pudimos acceder a tu ubicación. Asegúrate de darle permisos al navegador.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true } 
    );
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // FLUJO PARA STAFF (CAJERO / ADMIN)
    if (isStaff) {
      if (staffPaymentMethod === 'efectivo') {
        setShowCashModal(true); // Abre la calculadora de cambio
        return;
      } else {
        handleProcessPayment(null, true, 'tarjeta'); // Pago directo con terminal
        return;
      }
    }
    
    // FLUJO PARA CLIENTES ONLINE
    if (!formData.name || !formData.address || !formData.phone) {
      alert("Por favor completa los datos de entrega en Tabasco.");
      return;
    }
    setStep(2); 
  };

  const handleProcessPayment = async (e: React.FormEvent | null, isStaffCheckout = false, selectedMethod = 'tarjeta') => {
    if (e) e.preventDefault();
    
    if (!isStaffCheckout) {
      if (cardData.number.length < 16 || !cardData.cvc || !cardData.expiry) {
        alert("Por favor revisa los datos de tu tarjeta.");
        return;
      }
    }

    setIsProcessing(true);

    if (!isStaffCheckout) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const orderData = {
      customerName: formData.name || 'Cliente Mostrador',
      customerEmail: user?.email || 'invitado@pizzeriaeduardos.com', 
      customerPhone: formData.phone || 'N/A',
      deliveryAddress: formData.address || 'Mostrador',
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: total,
      status: isStaffCheckout ? 'pagado' : 'pendiente', 
      paymentMethod: selectedMethod,
      notes: formData.notes
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        if (isStaffCheckout) {
          alert("¡Cobro exitoso! Pedido enviado a cocina. 👨‍🍳🍕"); 
          setShowCashModal(false);
          setCashGiven('');
          setTimeout(() => {
            window.print();
            clearCart();
            setStep(1);
            setFormData({ name: '', phone: '', address: '', notes: '' }); 
          }, 500);
        } else {
          setStep(3); 
          clearCart();
        }
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          alert("Error al guardar: " + (errorData.error || "Intenta de nuevo"));
        } else {
          alert(`Error del servidor (${res.status}): No se pudo procesar la orden.`);
        }
      }
    } catch (error) {
      console.error("Error en checkout:", error);
      alert("Error de conexión con la base de datos.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShoppingBag size={80} className="text-gray-100" />
        <h2 className="text-2xl font-bold text-gray-400">Tu carrito está vacío</h2>
        <Link href="/menu" className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all">
          Ir al Menú
        </Link>
      </div>
    );
  }

  // Calculo matemático para el cambio
  const amountNumber = Number(cashGiven) || 0;
  const changeDue = amountNumber - total;

  return (
    <main className="max-w-6xl mx-auto p-6 lg:p-12 relative min-h-screen">
      
      {/* ESTILOS DE TICKET */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #ticket-impresion, #ticket-impresion * { visibility: visible; }
          #ticket-impresion { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 80mm; 
            margin: 0;
            padding: 0;
          }
        }
      `}} />

      {/* TICKET TÉRMICO */}
      <div id="ticket-impresion" className="hidden print:block font-mono text-xs text-black bg-white p-4">
        <div className="text-center mb-4 border-b border-black pb-2 border-dashed">
          <h1 className="font-black text-lg uppercase tracking-tighter">Pizzería Eduardo's</h1>
          <p>Villahermosa, Tabasco</p>
          <p>Fecha: {new Date().toLocaleString('es-MX')}</p>
        </div>
        
        <p className="font-bold uppercase">Cliente: {formData.name || 'Mostrador'}</p>
        <p className="font-bold uppercase mb-2">Pago: {isStaff ? staffPaymentMethod : 'TARJETA'}</p>
        
        <table className="w-full text-left mb-2">
          <thead>
            <tr className="border-b border-black border-dashed">
              <th className="pb-1 w-8">Cant</th>
              <th className="pb-1">Art.</th>
              <th className="text-right pb-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item._id}>
                <td className="py-1 font-bold align-top">{item.quantity}x</td>
                <td className="py-1 align-top pr-2">{item.name}</td>
                <td className="py-1 text-right align-top">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="border-t border-black border-dashed pt-2 font-black text-base mt-2">
          <div className="flex justify-between">
            <span>TOTAL:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          {isStaff && staffPaymentMethod === 'efectivo' && cashGiven && (
            <>
              <div className="flex justify-between text-xs font-normal mt-1">
                <span>Efectivo Recibido:</span>
                <span>${amountNumber.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-normal">
                <span>Cambio:</span>
                <span>${changeDue.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="text-center mt-6">
          <p className="font-bold">¡Gracias por su compra!</p>
          <p className="italic text-[10px]">Vuelva pronto</p>
        </div>
      </div>

      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 print:hidden">
          <div className="bg-green-100 p-6 rounded-full text-green-600 mb-6">
            <CheckCircle2 size={64} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 text-center">¡Pedido enviado a cocina! 👨‍🍳</h1>
          <p className="text-gray-500 text-lg mb-8 text-center max-w-md">
            Tu pago fue exitoso y los chefs de <strong>Pizzería Eduardo's</strong> ya están preparando tu orden. 
            El repartidor llegará a: <br/> <span className="font-bold text-gray-800">{formData.address}</span>
          </p>
          <div className="flex gap-4">
            <Link href="/menu" onClick={() => setStep(1)} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all">
              Pedir Más
            </Link>
          </div>
        </div>
      )}

      {step !== 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 print:hidden">
          
          <div className="space-y-6">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Resumen de Compra</h1>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <img src={item.image} className="w-16 h-16 object-cover rounded-xl bg-gray-50" alt={item.name} />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-400">Cant: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-red-600">${(item.price * item.quantity).toFixed(2)}</p>
                      {step === 1 && (
                        <button onClick={() => removeItem(item._id)} className="text-xs text-red-400 hover:text-red-600 underline mt-1">
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-6 pt-6 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Total a Pagar</span>
                <span className="text-3xl font-black text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            {step === 1 ? (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 animate-in slide-in-from-right-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-red-100 text-red-600 w-10 h-10 rounded-full flex items-center justify-center font-black">1</div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {isStaff ? 'Datos del Cliente (Opcional)' : 'Datos de Entrega'}
                  </h2>
                </div>
                
                <form onSubmit={handleContinueToPayment} className="space-y-5">
                  
                  {isStaff && (
                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-6">
                      <label className="text-xs font-black text-blue-800 uppercase tracking-widest block mb-3">
                        Método de Cobro en Caja
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button"
                          onClick={() => setStaffPaymentMethod('efectivo')}
                          className={`py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${staffPaymentMethod === 'efectivo' ? 'bg-green-500 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                        >
                          <Banknote size={18} /> Efectivo
                        </button>
                        <button 
                          type="button"
                          onClick={() => setStaffPaymentMethod('tarjeta')}
                          className={`py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${staffPaymentMethod === 'tarjeta' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                        >
                          <CreditCard size={18} /> Terminal
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-3">Nombre</label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 text-gray-300" size={20} />
                      <input 
                        type="text" required={!isStaff}
                        placeholder={isStaff ? "Mostrador" : "Ej. Jimmy Chang"}
                        className="w-full pl-12 p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-red-500 outline-none transition-all font-medium"
                        value={formData.name ?? ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-3 flex justify-between items-center pr-2">
                      Dirección
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-4 text-gray-300" size={20} />
                      <input 
                        type="text" required={!isStaff}
                        placeholder={isStaff ? "Opcional" : "Calle, Número y Colonia"}
                        className="w-full pl-12 pr-14 p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-red-500 outline-none transition-all font-medium"
                        value={formData.address ?? ''}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                      
                      {/* BOTÓN MÁGICO DE UBICACIÓN */}
                      {!isStaff && (
                        <button 
                          type="button"
                          onClick={handleOpenMap} // Cambiado a nueva función visual
                          disabled={isLocating}
                          className="absolute right-3 bg-red-100 text-red-600 p-2 rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Fijar ubicación en Mapa"
                        >
                          {isLocating ? <Loader2 className="animate-spin" size={20} /> : <MapIcon size={20} />}
                        </button>
                      )}
                    </div>
                    {!isStaff && <p className="text-[10px] text-gray-400 ml-3 mt-1">Presiona el ícono para detectar tu calle automáticamente.</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-3">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-4 text-gray-300" size={20} />
                      <input 
                        type="tel" required={!isStaff}
                        placeholder="(993) ..."
                        className="w-full pl-12 p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-red-500 outline-none transition-all font-medium"
                        value={formData.phone ?? ''}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-3">Notas para cocina (Opcional)</label>
                    <textarea 
                      placeholder="Sin cebolla, salsa extra..."
                      rows={2}
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-red-500 outline-none transition-all font-medium"
                      value={formData.notes ?? ''}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isProcessing}
                    className={`w-full text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-xl mt-4 ${
                      isStaff ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-black'
                    }`}
                  >
                     {isProcessing ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : isStaff ? (
                      <><Printer size={20} /> Cobrar e Imprimir Ticket</>
                    ) : (
                      <><CreditCard size={20} /> Continuar al Pago</>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 animate-in slide-in-from-right-8">
                 <div className="flex items-center gap-3 mb-8">
                  <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-black">2</div>
                  <h2 className="text-xl font-bold text-gray-800">Tarjeta de Crédito / Débito</h2>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-3xl text-white shadow-lg mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                  <div className="flex justify-between items-start mb-8">
                    <CreditCard size={32} />
                    <span className="font-mono text-xl italic font-bold">VISA</span>
                  </div>
                  <p className="font-mono text-2xl tracking-widest mb-4 shadow-black drop-shadow-md">
                    {cardData.number || '•••• •••• •••• ••••'}
                  </p>
                  <div className="flex justify-between text-xs font-medium uppercase tracking-widest opacity-80">
                    <span>Titular</span>
                    <span>Expira</span>
                  </div>
                  <div className="flex justify-between font-bold tracking-wide">
                    <span>{cardData.name || 'NOMBRE APELLIDO'}</span>
                    <span>{cardData.expiry || 'MM/YY'}</span>
                  </div>
                </div>

                <form onSubmit={(e) => handleProcessPayment(e, false)} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-3">Número de Tarjeta</label>
                    <input 
                      type="text" required maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-mono font-bold text-gray-700"
                      value={cardData.number ?? ''}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                        const parts = [];
                        for (let i = 0; i < v.length; i += 4) parts.push(v.substr(i, 4));
                        setCardData({...cardData, number: parts.length > 1 ? parts.join(' ') : v});
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-3">Nombre del Titular</label>
                    <input 
                      type="text" required 
                      placeholder="Como aparece en la tarjeta"
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-bold uppercase"
                      value={cardData.name ?? ''}
                      onChange={(e) => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-3">Expiración</label>
                      <input 
                        type="text" required maxLength={5}
                        placeholder="MM/YY"
                        className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-mono font-bold text-center"
                        value={cardData.expiry ?? ''}
                        onChange={(e) => {
                          let v = e.target.value.replace(/[^0-9]/g, '');
                          if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                          setCardData({...cardData, expiry: v});
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-3">CVC</label>
                      <input 
                        type="password" required maxLength={3}
                        placeholder="123"
                        className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-mono font-bold text-center"
                        value={cardData.cvc ?? ''}
                        onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/[^0-9]/g, '')})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100">
                      Atrás
                    </button>
                    <button type="submit" disabled={isProcessing} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-xl flex items-center justify-center gap-2">
                      {isProcessing ? <Loader2 className="animate-spin" /> : 'Pagar Ahora'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================
          MODAL 1: CONFIRMAR UBICACIÓN (MAPA)
      ========================================= */}
      {showMapModal && mapCoords && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2"><MapPin size={18} /> Confirma tu ubicación</h3>
              <button onClick={() => setShowMapModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            
            {/* Visualizador de Google Maps nativo basado en coordenadas */}
            <iframe 
              width="100%" 
              height="250" 
              style={{ border: 0 }} 
              loading="lazy" 
              allowFullScreen 
              src={`https://maps.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&t=m&z=16&output=embed&iwloc=near`}
            ></iframe>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Calle y referencias exactas</label>
                <textarea 
                  rows={2} 
                  className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  placeholder="Ej: Calle Reforma #123, casa roja..."
                />
              </div>
              <button 
                onClick={() => {
                  setFormData(prev => ({ ...prev, address: tempAddress }));
                  setShowMapModal(false);
                }}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex justify-center items-center gap-2"
              >
                <CheckCircle2 size={20} /> Guardar Dirección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL 2: COBRO EN EFECTIVO (CAJERO)
      ========================================= */}
      {showCashModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 border-t-8 border-green-500">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <Calculator className="text-green-600" /> Caja
              </h2>
              <button onClick={() => setShowCashModal(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full"><X size={20} /></button>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl mb-6 text-center border border-gray-100">
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Total a Cobrar</p>
              <p className="text-4xl font-black text-gray-900">${total.toFixed(2)}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-3">Efectivo Recibido</label>
                <div className="relative">
                  <span className="absolute left-4 top-4 font-black text-gray-400">$</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    autoFocus
                    className="w-full pl-8 p-4 rounded-2xl bg-white border-2 border-green-500 outline-none font-black text-xl text-green-700 shadow-inner"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                  />
                </div>
              </div>

              {/* Lógica dinámica de cambio */}
              {cashGiven && (
                <div className={`p-4 rounded-2xl font-black text-center text-lg ${changeDue < 0 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>
                  {changeDue < 0 
                    ? `Faltan $${Math.abs(changeDue).toFixed(2)}` 
                    : `Dar Cambio: $${changeDue.toFixed(2)}`
                  }
                </div>
              )}

              <button 
                onClick={() => handleProcessPayment(null, true, 'efectivo')}
                disabled={changeDue < 0 || !cashGiven || isProcessing}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-green-700 transition-all shadow-xl shadow-green-200 disabled:bg-gray-300 disabled:shadow-none mt-2 flex justify-center items-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <><Printer size={20} /> Finalizar Venta</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}