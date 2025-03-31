import { useJoyeria } from '../../hooks/useJoyeria';

export default function StatsPanel() {
  const { calcularEstadisticas } = useJoyeria();
  const { pesoPorMaterial } = calcularEstadisticas();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-medium mb-4">Peso total por material (en stock)</h3>
      <div className="space-y-3">
        {Object.entries(pesoPorMaterial).map(([material, peso]) => (
          <div key={material}>
            <div className="flex justify-between text-sm mb-1">
              <span className="capitalize">{material}</span>
              <span>{peso.toFixed(2)}g</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min(100, peso / 10)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}