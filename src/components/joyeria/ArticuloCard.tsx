import { useState } from 'react';
import { useJoyeria } from '../../hooks/useJoyeria';
import { toast } from 'react-toastify';
import { Articulo } from '../../types/joyeria';

interface ArticuloCardProps {
  articulo: Articulo;
  onUpdate?: () => Promise<void>;
}

export default function ArticuloCard({ articulo, onUpdate }: ArticuloCardProps) {
  const { sellArticulo } = useJoyeria();
  const [precioVenta, setPrecioVenta] = useState('');
  const [mostrarFormVenta, setMostrarFormVenta] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [validationError, setValidationError] = useState('');
  

  const handleVenta = async () => {
    const precio = parseFloat(precioVenta);
    
    if (!precioVenta || isNaN(precio)) {
      setValidationError('Ingrese un precio válido');
      return;
    }

    if (precio <= 0) {
      setValidationError('El precio debe ser mayor a cero');
      return;
    }

    try {
      setIsSelling(true);
      setValidationError('');
      await sellArticulo(articulo.id, precio);      toast.success('Artículo vendido exitosamente!');
      setMostrarFormVenta(false);
      setPrecioVenta('');
      if (onUpdate) {
        await onUpdate();
      }
      setTimeout(() => {
        window.location.reload();
      }, 5000);     } catch (error) {
      console.error("Error al vender artículo:", error);
      toast.error(`Error al vender: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSelling(false);
      
    }
  };

  return (
    <div className={`border rounded-lg p-4 transition-colors ${
      articulo.vendido ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{articulo.nombre}</h3>
          <p className="text-gray-600 capitalize">{articulo.tipoMaterial}</p>
          <div className="text-sm space-y-1 mt-2">
            <p>Peso unitario: {articulo.pesoUnitario}g</p>
            <p>Cantidad: {articulo.cantidad}</p>
            <p>Total: {(articulo.pesoUnitario * articulo.cantidad).toFixed(2)}g</p>
            {articulo.descripcion && <p className="text-gray-500">{articulo.descripcion}</p>}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            articulo.vendido 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {articulo.vendido ? 'Vendido' : 'En Stock'}
          </span>
          
          {articulo.vendido && articulo.precioVenta && (
            <p className="mt-2 text-sm font-medium">
              Vendido por: ${articulo.precioVenta.toFixed(2)}
            </p>
          )}
        </div>
      </div>
      
      {!articulo.vendido && (
        <div className="mt-4">
          {mostrarFormVenta ? (
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Precio de venta"
                value={precioVenta}
                onChange={(e) => {
                  setPrecioVenta(e.target.value);
                  setValidationError('');
                }}
                className={`w-full border rounded-md p-2 text-sm ${
                  validationError ? 'border-red-500' : 'border-gray-300'
                }`}
                step="0.01"
                min="0"
              />
              {validationError && (
                <p className="text-red-500 text-xs">{validationError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleVenta}
                  disabled={isSelling}
                  className={`flex-1 py-1 rounded-md text-sm transition-colors ${
                    isSelling 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSelling ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Procesando...
                    </span>
                  ) : 'Confirmar Venta'}
                </button>
                <button
                  onClick={() => {
                    setMostrarFormVenta(false);
                    setValidationError('');
                  }}
                  className="bg-gray-200 px-3 py-1 rounded-md text-sm hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setMostrarFormVenta(true)}
              className="w-full bg-green-600 text-white py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
            >
              Registrar Venta
            </button>
          )}
        </div>
      )}
    </div>
  );
}