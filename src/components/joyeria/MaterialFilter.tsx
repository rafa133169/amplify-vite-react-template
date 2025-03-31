import { useMemo } from 'react';
import { useJoyeria } from '../../hooks/useJoyeria';
import { toast } from 'react-toastify';

const materiales = ['todos', 'acero inoxidable', 'plata', 'oro', 'platino', 'otros'];

interface MaterialFilterProps {
  onFilterChange: (material: string) => void;
}

export default function MaterialFilter({ onFilterChange }: MaterialFilterProps) {
  const { articulos, calcularEstadisticas } = useJoyeria();

  // Calcular estadísticas de manera eficiente
  const { enStock, vendidos, pesoPorMaterial } = useMemo(() => {
    return calcularEstadisticas();
  }, [articulos]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-medium mb-2">Filtrar por material</h3>
      <div className="flex flex-wrap gap-2">
        {materiales.map(material => (
          <button
            key={material}
            onClick={() => onFilterChange(material)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              material === 'todos' 
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {material}
          </button>
        ))}
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">Total artículos</p>
          <p className="text-xl font-semibold">{articulos.length}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-800">En stock</p>
          <p className="text-xl font-semibold">{enStock.length}</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-sm text-red-800">Vendidos</p>
          <p className="text-xl font-semibold">{vendidos.length}</p>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Peso total por material (en stock)</h4>
        <div className="space-y-2">
          {Object.entries(pesoPorMaterial).map(([material, peso]) => (
            <div key={material} className="bg-gray-50 p-2 rounded">
              <div className="flex justify-between text-sm">
                <span className="capitalize font-medium">{material}</span>
                <span className="font-semibold">{peso.toFixed(2)}g</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}