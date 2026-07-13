import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";

export default function InferioresLayout({ children }) {
  const categorias = [
    { id: 'tercera', nombre: '3° División' },
    { id: 'cuarta', nombre: '4° División' },
    { id: 'quinta', nombre: '5° División' },
    { id: 'sexta', nombre: '6° División' },
    { id: 'septima', nombre: '7° División' },
    { id: 'octava', nombre: '8° División' },
    { id: 'escuelita', nombre: 'Escuelita' },
    { id: 'pre-infantil', nombre: 'Pre Infantil' },
    { id: 'infantil', nombre: 'Infantil' },
  ];

  return (
    <div className="min-h-screen bg-jn-white">
      {/* Header Inferiores */}
      <div className="bg-jn-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/disciplinas/futsal" className="hover:text-white">Futsal AFA</Link>
            <ChevronRight size={16} />
            <span className="text-jn-red font-bold">Divisiones Inferiores</span>
          </div>
          <h1 className="text-4xl font-black mb-2">LA FÁBRICA</h1>
          <p className="text-gray-300">El semillero del Club Jorge Newbery.</p>
        </div>
      </div>

      {/* Navegación de Categorías */}
      <div className="bg-white border-b border-gray-200 sticky top-[72px] z-40">
        <div className="container mx-auto px-4">
          <ul className="flex overflow-x-auto hide-scrollbar gap-2 py-4">
            {categorias.map(cat => (
              <li key={cat.id}>
                <Link 
                  href={`/disciplinas/futsal/inferiores/${cat.id}`}
                  className="whitespace-nowrap px-6 py-2 rounded-full border border-gray-200 font-semibold hover:border-jn-red hover:text-jn-red transition-colors inline-block"
                >
                  {cat.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contenido Dinámico */}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
