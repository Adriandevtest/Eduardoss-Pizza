'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  PlusCircle, Loader2, Trash2, Edit3, Users, 
  Pizza as PizzaIcon, Mail, Calendar, Upload, 
  X, CheckCircle2, UserCog, Shield, ChefHat, 
  Bike, CreditCard, User
} from 'lucide-react';

export default function AdminPage() {
  const { user, isLoggedIn } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('pizzas'); 
  const [pizzas, setPizzas] = useState([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPizza, setEditingPizza] = useState<any>(null);

  const [pizzaForm, setPizzaForm] = useState({
    name: '', price: '', description: '', image: '', category: 'clasica'
  });

  const [colaboradorForm, setColaboradorForm] = useState({
    name: '', email: '', password: '', role: 'cocina'
  });

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      if (activeTab === 'pizzas') fetchPizzas();
      if (activeTab === 'clientes' || activeTab === 'colaboradores') fetchUsuarios();
    }
  }, [activeTab, isLoggedIn, user]);

  const fetchPizzas = async () => {
    try {
      const res = await fetch('/api/pizzas', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setPizzas(data);
    } catch (error) {
      console.error("Error cargando pizzas:", error);
    }
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEdit) {
          setEditingPizza((prev: any) => ({ ...prev, image: base64String }));
        } else {
          setPizzaForm((prev) => ({ ...prev, image: base64String }));
        }
      };
      reader.readAsDataURL(file); 
    }
  };

  const handleAddPizza = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pizzaForm.image) {
      alert("Por favor, sube una imagen para la pizza.");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/pizzas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pizzaForm, price: Number(pizzaForm.price) }),
      });

      if (res.ok) {
        setPizzaForm({ name: '', price: '', description: '', image: '', category: 'clasica' });
        await fetchPizzas(); 
        alert("¡Pizza añadida correctamente al menú!");
      }
    } catch (error) {
      console.error("Error al publicar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (pizza: any) => {
    setEditingPizza({ ...pizza });
    setIsEditModalOpen(true);
  };

  const handleUpdatePizza = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/pizzas/${editingPizza._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editingPizza.name,
          price: Number(editingPizza.price),
          description: editingPizza.description,
          image: editingPizza.image, 
          category: editingPizza.category
        }),
      });

      if (res.ok) {
        await fetchPizzas(); 
        setIsEditModalOpen(false);
        setEditingPizza(null);
        alert("¡Cambios guardados con éxito!");
      } else {
        alert("Hubo un problema al guardar los cambios.");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePizza = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta pizza del menú de Tabasco?")) return;
    try {
      const res = await fetch(`/api/pizzas/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchPizzas();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`¿Cambiar el rol de este usuario a ${newRole.toUpperCase()}?`)) return;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchUsuarios(); 
      } else {
        alert("Error al actualizar el rol.");
      }
    } catch (error) {
      console.error("Error cambiando rol:", error);
    }
  };

  const handleAddColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colaboradorForm),
      });

      if (res.ok) {
        setColaboradorForm({ name: '', email: '', password: '', role: 'cocina' });
        fetchUsuarios();
        alert("Personal registrado con éxito.");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al registrar.");
      }
    } catch (error) {
      console.error("Error registrando personal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  const clientes = usuarios.filter(u => u.role === 'cliente');
  const colaboradores = usuarios.filter(u => u.role !== 'cliente');

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <Shield size={16} className="text-purple-600" />;
      case 'cocina': return <ChefHat size={16} className="text-orange-600" />;
      case 'cajero': return <CreditCard size={16} className="text-blue-600" />;
      case 'repartidor': return <Bike size={16} className="text-green-600" />;
      default: return <User size={16} className="text-gray-500" />;
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 lg:p-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic">Pizzería Eduardo's Admin</h1>
        <div className="bg-red-50 px-4 py-2 rounded-full text-red-700 text-sm font-bold border border-red-100 flex items-center gap-2">
          <Shield size={16} /> Admin: {user?.name}
        </div>
      </div>

      <div className="flex gap-4 mb-10 bg-gray-100 p-2 rounded-2xl w-fit border border-gray-200 overflow-x-auto">
        <button onClick={() => setActiveTab('pizzas')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'pizzas' ? 'bg-white shadow-md text-red-600' : 'text-gray-500 hover:text-gray-700'}`}><PizzaIcon size={20} /> Inventario</button>
        <button onClick={() => setActiveTab('clientes')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'clientes' ? 'bg-white shadow-md text-red-600' : 'text-gray-500 hover:text-gray-700'}`}><Users size={20} /> Clientes</button>
        <button onClick={() => setActiveTab('colaboradores')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'colaboradores' ? 'bg-white shadow-md text-red-600' : 'text-gray-500 hover:text-gray-700'}`}><UserCog size={20} /> Personal</button>
      </div>

      {activeTab === 'pizzas' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
          
          <section>
            <form onSubmit={handleAddPizza} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-4 sticky top-24">
              <h2 className="text-2xl font-black mb-6 text-gray-800 flex items-center gap-2 italic">
                <PlusCircle className="text-red-600" /> Nueva Pizza
              </h2>
              
              <input type="text" placeholder="Nombre de la Pizza" required className="w-full p-4 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-red-500" value={pizzaForm.name ?? ''} onChange={(e) => setPizzaForm({...pizzaForm, name: e.target.value})} />
              
              <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer overflow-hidden">
                {pizzaForm.image ? (
                  <img src={pizzaForm.image} className="h-40 w-full object-cover rounded-xl mb-2 shadow-sm" alt="Preview" />
                ) : (
                  <Upload className="text-gray-400 mb-2 group-hover:text-red-500 transition-colors" size={40} />
                )}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} className="absolute inset-0 opacity-0 cursor-pointer" title="Subir imagen" />
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">
                  {pizzaForm.image ? 'Cambiar Imagen' : 'Sube una Foto'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Precio ($)" required className="w-full p-4 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-red-500" value={pizzaForm.price ?? ''} onChange={(e) => setPizzaForm({...pizzaForm, price: e.target.value})} />
                <select className="w-full p-4 rounded-xl border bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-red-500" value={pizzaForm.category ?? 'clasica'} onChange={(e) => setPizzaForm({...pizzaForm, category: e.target.value})}>
                  <option value="clasica">Clásica</option>
                  <option value="especial">Especial</option>
                </select>
              </div>
              <textarea placeholder="Ingredientes y descripción..." required rows={3} className="w-full p-4 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-red-500" value={pizzaForm.description ?? ''} onChange={(e) => setPizzaForm({...pizzaForm, description: e.target.value})} />
              
              <button disabled={isSaving} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:bg-gray-400">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                {isSaving ? 'Guardando...' : 'Publicar Pizza'}
              </button>
            </form>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-gray-800 italic underline decoration-red-500">Menú Actual</h2>
            <div className="grid gap-4">
              {pizzas.map((p: any) => (
                <div key={p._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group">
                  <img src={p.image} alt={p.name} className="w-20 h-20 rounded-xl object-cover bg-gray-50 border border-gray-100" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{p.name}</h3>
                    <p className="text-red-600 font-black tracking-tighter">${p.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(p)} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar Pizza"><Edit3 size={20} /></button>
                    <button onClick={() => handleDeletePizza(p._id)} className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Eliminar Pizza"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
              {pizzas.length === 0 && !loading && (
                <p className="text-gray-500 text-center py-10 font-medium">Aún no hay pizzas en el menú.</p>
              )}
            </div>
          </section>
        </div>
      ) : activeTab === 'clientes' ? (
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-800">Directorio de Clientes</h2>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{clientes.length} Registros</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-5 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Nombre</th>
                <th className="p-5 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Email</th>
                <th className="p-5 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Fecha Registro</th>
                <th className="p-5 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Acciones (Promover)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" size={32} /></td></tr>
              ) : clientes.map((u: any) => (
                <tr key={u._id} className="hover:bg-red-50/30 transition-colors">
                  <td className="p-5 font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><User size={16} /></div>
                    {u.name}
                  </td>
                  <td className="p-5 text-gray-600 font-medium">{u.email}</td>
                  <td className="p-5 text-gray-500 text-sm font-medium">{new Date(u.createdAt).toLocaleDateString('es-MX')}</td>
                  <td className="p-5">
                    <select 
                      value={u.role ?? 'cliente'}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="cliente">Cliente</option>
                      <option value="cocina">Cocina</option>
                      <option value="cajero">Cajero</option>
                      <option value="repartidor">Repartidor</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <section className="lg:col-span-1">
            <form onSubmit={handleAddColaborador} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-4 sticky top-24">
              <h2 className="text-xl font-black mb-6 text-gray-800 flex items-center gap-2">
                <UserPlus size={24} className="text-blue-600" /> Alta de Personal
              </h2>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nombre Completo</label>
                <input type="text" required className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" value={colaboradorForm.name ?? ''} onChange={(e) => setColaboradorForm({...colaboradorForm, name: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Correo Electrónico</label>
                <input type="email" required className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" value={colaboradorForm.email ?? ''} onChange={(e) => setColaboradorForm({...colaboradorForm, email: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Contraseña Inicial</label>
                <input type="password" required className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" value={colaboradorForm.password ?? ''} onChange={(e) => setColaboradorForm({...colaboradorForm, password: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Asignar Puesto</label>
                <select className="w-full p-3 rounded-xl border bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-blue-500" value={colaboradorForm.role ?? 'cocina'} onChange={(e) => setColaboradorForm({...colaboradorForm, role: e.target.value})}>
                  <option value="cocina">Cocina (Chef)</option>
                  <option value="cajero">Cajero (Mostrador)</option>
                  <option value="repartidor">Repartidor</option>
                </select>
              </div>

              <button disabled={isSaving} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors mt-2">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Registrar Colaborador'}
              </button>
            </form>
          </section>

          <section className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-800">Equipo de Trabajo</h2>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{colaboradores.length} Activos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-5 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Colaborador</th>
                    <th className="p-5 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Contacto</th>
                    <th className="p-5 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Puesto Actual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={3} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></td></tr>
                  ) : colaboradores.map((u: any) => (
                    <tr key={u._id} className={`hover:bg-blue-50/30 transition-colors ${u.role === 'admin' ? 'bg-purple-50/20' : ''}`}>
                      <td className="p-5 font-bold text-gray-800">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {getRoleIcon(u.role)}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td className="p-5 text-gray-600 font-medium text-sm">{u.email}</td>
                      <td className="p-5">
                        <select 
                          value={u.role ?? 'cliente'}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={u.role === 'admin'} 
                          className={`border text-xs font-bold rounded-lg px-3 py-2 outline-none cursor-pointer ${
                            u.role === 'admin' 
                              ? 'bg-purple-50 text-purple-700 border-purple-200 cursor-not-allowed' 
                              : 'bg-white text-gray-700 border-gray-200 focus:border-blue-500'
                          }`}
                        >
                          {u.role === 'admin' && <option value="admin">Admin Principal</option>}
                          <option value="cocina">Cocina</option>
                          <option value="cajero">Cajero</option>
                          <option value="repartidor">Repartidor</option>
                          <option value="cliente">Degradar a Cliente</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {isEditModalOpen && editingPizza && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative border-t-8 border-blue-600">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full"><X size={24} className="text-gray-400" /></button>
            <h2 className="text-3xl font-black mb-8 italic">Editar Producto</h2>
            <form onSubmit={handleUpdatePizza} className="space-y-5">
              
              <input type="text" required className="w-full p-4 rounded-2xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={editingPizza.name ?? ''} onChange={(e) => setEditingPizza({...editingPizza, name: e.target.value})} />
              
              <div className="relative border-2 border-dashed border-blue-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-blue-50/30 hover:bg-blue-50 cursor-pointer overflow-hidden">
                <img src={editingPizza.image} className="h-32 w-full object-cover rounded-xl mb-3 shadow-sm" />
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-xs uppercase"><Upload size={16} /> Cambiar Foto</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" required className="w-full p-4 rounded-2xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={editingPizza.price ?? ''} onChange={(e) => setEditingPizza({...editingPizza, price: e.target.value})} />
                <select className="w-full p-4 rounded-2xl border bg-gray-50 font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={editingPizza.category ?? 'clasica'} onChange={(e) => setEditingPizza({...editingPizza, category: e.target.value})}>
                  <option value="clasica">Clásica</option>
                  <option value="especial">Especial</option>
                </select>
              </div>
              <textarea rows={2} required className="w-full p-4 rounded-2xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={editingPizza.description ?? ''} onChange={(e) => setEditingPizza({...editingPizza, description: e.target.value})} />
              <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" /> : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function UserPlus(props: any) {
  return <UserCog {...props} />;
}