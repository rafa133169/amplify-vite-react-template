import { useState, useEffect } from 'react';
import { useJoyeria } from '../../hooks/useJoyeria';
import ArticuloCard from './ArticuloCard';
import MaterialFilter from './MaterialFilter';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StatsPanel from './StatsPanel';

export default function ArticuloList() {
  const { articulos, loading, error, fetchArticulos } = useJoyeria();
  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState('todos');

  // Efecto para manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Función de filtrado combinada
  const filteredArticulos = articulos.filter(articulo => {
    const matchesSearch = 
      articulo.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.tipoMaterial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.descripcion?.toLowerCase()?.includes(searchTerm.toLowerCase());
    
    const matchesMaterial = 
      materialFilter === 'todos' || 
      articulo.tipoMaterial === materialFilter;
    
    return matchesSearch && matchesMaterial;
  });

  // Función para refrescar la lista
  const handleRefresh = async () => {
    try {
      await fetchArticulos();
      toast.success('Lista actualizada');
    } catch (err) {
      toast.error('Error al actualizar la lista');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
  <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Gestión de Joyería</h1>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Columna principal (2/3 en desktop) */}
    <div className="md:col-span-2 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold">Listado de Artículos</h2>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-3 py-1 rounded-md w-full sm:w-auto ${
                loading 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" 
                  clipRule="evenodd" 
                />
              </svg>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
            
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredArticulos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || materialFilter !== 'todos' 
              ? 'No se encontraron artículos con estos filtros' 
              : 'No hay artículos registrados'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticulos
              .sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime())
              .map(articulo => (
                <ArticuloCard 
                  key={articulo.id} 
                  articulo={articulo} 
                  onUpdate={fetchArticulos}
                />
              ))}
          </div>
        )}
      </div>
    </div>
    
    {/* Columna lateral (1/3 en desktop) */}
    <div className="space-y-6">
      {/* Filtro de Materiales */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Filtrar por Material</h2>
        <MaterialFilter onFilterChange={setMaterialFilter} />
      </div>
      
      {/* Panel de Estadísticas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Estadísticas</h2>
        <StatsPanel />
      </div>
    </div>
  </div>
</div>
  );
}