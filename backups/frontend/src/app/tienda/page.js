import { ShoppingCart } from "lucide-react";

export default function TiendaPage() {
  const productos = [
    { id: 1, nombre: "Camiseta Oficial 2026", precio: "$45.000", categoria: "Indumentaria", img: "bg-jn-red" },
    { id: 2, nombre: "Camiseta Alternativa 2026", precio: "$45.000", categoria: "Indumentaria", img: "bg-jn-black" },
    { id: 3, nombre: "Short Oficial", precio: "$25.000", categoria: "Indumentaria", img: "bg-jn-gray" },
  ];

  return (
    <div className="min-h-screen bg-jn-white text-jn-black">
      <div className="bg-jn-black text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black mb-4">Tienda Oficial JN</h1>
          <p className="text-xl text-gray-400">Llevá los colores a todos lados. Productos originales del club.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {productos.map(prod => (
            <div key={prod.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className={`h-64 ${prod.img} flex items-center justify-center`}>
                <span className="text-white/50 font-black text-2xl rotate-45">JN</span>
              </div>
              <div className="p-6">
                <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">{prod.categoria}</p>
                <h3 className="text-lg font-black mb-2">{prod.nombre}</h3>
                <p className="text-jn-red font-black text-2xl mb-6">{prod.precio}</p>
                <button className="w-full bg-jn-black text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-jn-red transition-colors">
                  <ShoppingCart size={20} /> Añadir al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
