"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Settings, Tag, DollarSign, FileText, Pencil, X } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';

const fetch = apiFetch;

export default function AdminCategorias() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("SOCIO");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || "No se pudieron obtener las categorías del servidor.");
      }
    } catch (e) {
      console.error("Error al cargar categorías:", e);
      setErrorMsg("Error de conexión con el servidor. No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);


  const handleStartEdit = (category) => {
    setIsEditing(true);
    setEditId(category.id);
    setName(category.name);
    setType(category.type);
    setPrice(category.price.toString());
    setDescription(category.description || "");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setName("");
    setType("SOCIO");
    setPrice("");
    setDescription("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name || !price) {
      setErrorMsg("Por favor completá el nombre y el precio arancelario.");
      return;
    }

    const payload = {
      name,
      type,
      price: parseFloat(price),
      description
    };

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg("¡Categoría creada exitosamente!");
        setName("");
        setPrice("");
        setDescription("");
        fetchCategories();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Error al crear la categoría");
      }
    } catch (e) {
      console.error("Error al crear categoría:", e);
      setErrorMsg(e.message || "Error de red: No se pudo crear la categoría.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name || !price) {
      setErrorMsg("Por favor completá el nombre y el precio arancelario.");
      return;
    }

    const payload = {
      name,
      type,
      price: parseFloat(price),
      description
    };

    try {
      const res = await fetch(`/api/categories/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg("¡Categoría actualizada exitosamente!");
        handleCancelEdit();
        fetchCategories();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Error al actualizar la categoría");
      }
    } catch (e) {
      console.error("Error al actualizar categoría:", e);
      setErrorMsg(e.message || "Error de red: No se pudo actualizar la categoría.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchCategories();
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo eliminar la categoría del servidor.");
      }
    } catch (e) {
      console.error("Error al eliminar categoría:", e);
      setErrorMsg(e.message || "Error de red: No se pudo eliminar la categoría.");
    }
  };

  const filtered = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase()) || 
                          (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === "ALL" || cat.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-jn-black tracking-tight">Administración de Categorías</h2>
          <p className="text-sm text-gray-500">Configurá aranceles de disciplinas y cuotas sociales dinámicamente.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO DE ALTA / EDICION */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-150 h-fit">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-jn-red">
            {isEditing ? <Pencil size={20} /> : <Plus size={20} />} {isEditing ? "Editar Categoría" : "Crear Nueva Categoría"}
          </h3>
          
          <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Futsal Juvenil" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tipo de Categoría</label>
              <select 
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none"
              >
                <option value="SOCIO">Cuota Social (Socio)</option>
                <option value="DISCIPLINA">Arancel Deportivo (Disciplina)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Precio Mensual ($ ARS)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="number" 
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="10000" 
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Descripción / Beneficios</label>
              <textarea 
                rows="3"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detalle o requisitos..." 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jn-red/45 outline-none resize-none"
              ></textarea>
            </div>

            {errorMsg && <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-green-600 font-semibold">{successMsg}</p>}

            <div className="flex flex-col gap-2">
              <button 
                type="submit" 
                className="w-full bg-jn-black text-white hover:bg-jn-red py-3 rounded-lg font-bold text-sm tracking-wider transition-colors shadow-md uppercase"
              >
                {isEditing ? "Guardar Cambios" : "Crear Categoría"}
              </button>
              
              {isEditing && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="w-full bg-gray-100 text-gray-600 hover:bg-gray-250 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors border border-gray-250"
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LISTADO Y BÚSQUEDA */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-150 flex flex-wrap gap-4 items-center justify-between">
            {/* Buscador */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar categoría..." 
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-250 rounded-lg focus:outline-none"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex gap-2">
              <button 
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  filterType === 'ALL' ? 'bg-jn-black text-white border-jn-black' : 'bg-gray-55 border-gray-200 text-gray-600'
                }`}
              >
                Todas
              </button>
              <button 
                onClick={() => setFilterType("SOCIO")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  filterType === 'SOCIO' ? 'bg-jn-black text-white border-jn-black' : 'bg-gray-55 border-gray-200 text-gray-600'
                }`}
              >
                Socios
              </button>
              <button 
                onClick={() => setFilterType("DISCIPLINA")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  filterType === 'DISCIPLINA' ? 'bg-jn-black text-white border-jn-black' : 'bg-gray-55 border-gray-200 text-gray-600'
                }`}
              >
                Disciplinas
              </button>
            </div>
          </div>

          {/* Listado en tarjetas/grilla */}
          {loading ? (
            <div className="text-center py-10 font-bold text-gray-500">Cargando categorías...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center bg-white border border-gray-100 py-12 rounded-xl text-gray-500 font-semibold">
              No se encontraron categorías. ¡Crea una nueva a la izquierda!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map(cat => (
                <div 
                  key={cat.id} 
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150 hover:shadow-md transition-shadow relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        cat.type === 'SOCIO' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-jn-red'
                      }`}>
                        {cat.type === 'SOCIO' ? 'Socio' : 'Deporte'}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStartEdit(cat)}
                          className="text-gray-400 hover:text-jn-red transition-colors"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-black text-lg text-jn-black leading-tight mb-1">{cat.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{cat.description || "Sin descripción adicional."}</p>
                  </div>

                  <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Arancel</span>
                    <span className="font-black text-xl text-jn-black">${parseFloat(cat.price).toLocaleString('es-AR')} <span className="text-xs text-gray-400">/ mes</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
