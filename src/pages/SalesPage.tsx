import { useJoyeria } from '../hooks/useJoyeria';
import ArticuloCard from '../components/joyeria/ArticuloCard';

export default function SalesPage() {
  const { articulos } = useJoyeria();
  const articulosVendidos = articulos.filter(a => a.vendido);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Artículos Vendidos</h1>
      
      {articulosVendidos.length === 0 ? (
        <p className="text-gray-500">No hay artículos vendidos aún</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articulosVendidos.map(articulo => (
            <ArticuloCard key={articulo.id} articulo={articulo} />
          ))}
        </div>
      )}
    </div>
  );
}