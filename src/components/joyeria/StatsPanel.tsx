import { useJoyeria } from '../../hooks/useJoyeria';
import { useMemo } from 'react';

export default function StatsPanel() {
  const { articulos, calcularEstadisticas, loading, error } = useJoyeria();
  
  const { pesoPorMaterial } = useMemo(() => {
    return calcularEstadisticas();
  }, [articulos, calcularEstadisticas]);

  // Calcular el peso máximo para normalizar las barras
  const maxPeso = useMemo(() => {
    const valores = Object.values(pesoPorMaterial);
    return valores.length > 0 ? Math.max(...valores) : 0;
  }, [pesoPorMaterial]);

  if (loading) return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-white p-4 rounded-lg shadow-md text-red-500">
      Error al cargar estadísticas
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-medium mb-4">Peso total por material (en stock)</h3>
      <div className="space-y-3">
        {Object.entries(pesoPorMaterial).map(([material, peso]) => (
          <div key={material}>
            <div className="flex justify-between text-sm mb-1">
              <span className="capitalize font-medium">{material}</span>
              <span className="font-semibold">{peso.toFixed(2)}g</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full" 
                style={{ 
                  width: `${maxPeso > 0 ? Math.min(100, (peso / maxPeso) * 100) : 0}%`,
                  transition: 'width 0.5s ease'
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}