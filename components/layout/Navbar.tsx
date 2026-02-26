'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { 
  Menu, X, Pizza, ShoppingBag, 
  User, LogOut, Settings, ChefHat, Bike, Store
} from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false); 
  
  const pathname = usePathname();
  const router = useRouter();
  
  const { user, logout, isLoggedIn } = useAuthStore();
  const { cart } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Menú', href: '/menu', icon: Pizza, show: true },
    { name: 'Admin', href: '/admin', icon: Settings, show: user?.role === 'admin' },
    { name: 'Cocina', href: '/cocina', icon: ChefHat, show: ['admin', 'cajero', 'cocina'].includes(user?.role) },
    { name: 'Repartos', href: '/repartidor', icon: Bike, show: ['admin', 'repartidor'].includes(user?.role) },
  ].filter(link => link.show);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-[150] shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-red-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md shadow-red-200">
              <Store size={24} />
            </div>
            <span className="font-black text-xl tracking-tighter text-gray-900 italic">
              Pizza Eduardo's
            </span>
          </Link>

          {/* MENÚ ESCRITORIO (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`flex items-center gap-2 font-bold transition-colors ${
                    isActive ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} /> {link.name}
                </Link>
              );
            })}
          </div>

          {/* ACCIONES (Carrito + Login) */}
          <div className="flex items-center gap-4">
            
            {/* CARRITO DE COMPRAS (Visible siempre) */}
            {isMounted && (
              <Link href="/carrito" className="relative p-2 text-gray-700 hover:text-red-600 transition-colors">
                <ShoppingBag size={24} />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            )}

            {/* BOTONES USUARIO ESCRITORIO */}
            <div className="hidden md:flex items-center gap-3 ml-2 border-l border-gray-200 pl-6">
              {isMounted && isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-600 flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                    <User size={14} className="text-gray-400" />
                    Hola, {user?.name?.split(' ')[0]}
                  </span>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors" title="Cerrar Sesión">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-black transition-shadow shadow-md">
                  Ingresar
                </Link>
              )}
            </div>

            {/* BOTÓN HAMBURGUESA (Móvil) */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-red-600 transition-colors bg-gray-50 rounded-lg"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="px-4 py-6 space-y-4">
            
            {/* Links Móvil */}
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`flex items-center gap-3 font-bold p-3 rounded-xl transition-colors ${
                    isActive ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} /> {link.name}
                </Link>
              );
            })}

            {/* Separador */}
            <div className="h-px bg-gray-100 my-4"></div>

            {/* Autenticación Móvil */}
            {isMounted && isLoggedIn ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="bg-white p-2 rounded-lg shadow-sm"><User size={20} className="text-gray-500" /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{user?.role}</p>
                    <p className="font-bold text-gray-800">{user?.name}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold p-3 rounded-xl hover:bg-red-100 transition-colors">
                  <LogOut size={20} /> Cerrar Sesión
                </button>
              </div>
            ) : (
              <Link href="/login" className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold p-4 rounded-xl hover:bg-black transition-shadow shadow-md">
                <User size={20} /> Iniciar Sesión / Registro
              </Link>
            )}
            
          </div>
        </div>
      )}
    </nav>
  );
}