import { Users } from "lucide-react";

export default function InferioresHome() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
        <Users size={48} />
      </div>
      <h2 className="text-2xl font-bold mb-4">Seleccioná una Categoría</h2>
      <p className="text-gray-500 max-w-md">
        Navegá por las distintas divisiones inferiores utilizando el menú superior para ver sus estadísticas, resultados y planteles.
      </p>
    </div>
  );
}
