import { useEffect, useState, useCallback, useRef } from "react";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";
import { Articulo } from "../types/joyeria";
import { toast } from "react-toastify";

const client = generateClient<Schema>({
  authMode: 'userPool'
});

// Umbrales configurables
const STOCK_BAJO_GRAMOS = 20;
const SOBREPESO_KILOS = 4;
const DEBOUNCE_TIME = 500; // Tiempo de espera para considerar datos estables

export const useJoyeria = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadComplete = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const formatAmplifyDate = useCallback((date: Date) => {
    return date.toISOString().replace("Z", "");
  }, []);

  const showStockNotification = useCallback((pesoTotal: number) => {
    // No mostrar notificaciones durante la carga inicial
    if (!initialLoadComplete.current) return;

    const pesoEnKilos = pesoTotal / 1000;
    const existingLowStock = toast.isActive("low-stock");
    const existingOverweight = toast.isActive("overweight");

    // Notificación de stock bajo
    if (pesoTotal < STOCK_BAJO_GRAMOS) {
      if (!existingLowStock) {
        toast.warning(
          <div className="p-2">
            <h4 className="font-bold text-yellow-800">⚠️ Alerta de Stock Bajo</h4>
            <p className="text-sm">
              Stock total: <span className="font-semibold">{pesoTotal.toFixed(2)}g</span>
            </p>
            <p className="text-xs mt-1">
              El stock está por debajo del mínimo recomendado ({STOCK_BAJO_GRAMOS}g)
            </p>
            <button 
              onClick={() => toast.dismiss("low-stock")}
              className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
            >
              Cerrar
            </button>
          </div>,
          {
            toastId: "low-stock",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            className: "border-l-4 border-yellow-500",
          }
        );
      }
    } else if (existingLowStock) {
      toast.dismiss("low-stock");
    }

    // Notificación de sobrepeso
    if (pesoEnKilos >= SOBREPESO_KILOS) {
      if (!existingOverweight) {
        toast.warning(
          <div className="p-2">
            <h4 className="font-bold text-orange-800">⚠️ Alerta de Sobrepeso</h4>
            <p className="text-sm">
              Stock total: <span className="font-semibold">{pesoEnKilos.toFixed(2)}kg</span>
            </p>
            <p className="text-xs mt-1">
              El stock excede el límite recomendado ({SOBREPESO_KILOS}kg)
            </p>
            <button 
              onClick={() => toast.dismiss("overweight")}
              className="mt-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded"
            >
              Cerrar
            </button>
          </div>,
          {
            toastId: "overweight",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            className: "border-l-4 border-orange-500",
          }
        );
      }
    } else if (existingOverweight) {
      toast.dismiss("overweight");
    }
  }, []);

  const calcularEstadisticas = useCallback(() => {
    const enStock = articulos.filter((a) => !a.vendido);
    const vendidos = articulos.filter((a) => a.vendido);

    const pesoPorMaterial: Record<string, number> = {};
    const inversionPorMaterial: Record<string, number> = {};
    let pesoTotal = 0;
    let inversionTotal = 0;

    enStock.forEach((a) => {
      const peso = typeof a.pesoUnitario === "number" ? a.pesoUnitario : 0;
      const cant = typeof a.cantidad === "number" ? a.cantidad : 0;
      const precio = a.precioCompra || 0;
      const material = a.tipoMaterial || "Otro";

      const pesoContribucion = peso * cant;
      const inversionContribucion = precio * cant;

      pesoPorMaterial[material] = (pesoPorMaterial[material] || 0) + pesoContribucion;
      inversionPorMaterial[material] =
        (inversionPorMaterial[material] || 0) + inversionContribucion;
      pesoTotal += pesoContribucion;
      inversionTotal += inversionContribucion;
    });

    return {
      enStock,
      vendidos,
      pesoPorMaterial,
      inversionPorMaterial,
      inversionTotal,
      pesoTotal,
    };
  }, [articulos]);

  const handleDataUpdate = useCallback((items: Articulo[]) => {
    setArticulos(items);
    
    // Usar debounce para evitar notificaciones repetidas
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      const { pesoTotal } = calcularEstadisticas();
      showStockNotification(pesoTotal);
    }, DEBOUNCE_TIME);
  }, [calcularEstadisticas, showStockNotification]);

  // Modifica fetchArticulos para manejar offline
const fetchArticulos = useCallback(async () => {
  if (isOffline) {
    toast.info("No se puede actualizar en modo offline");
    return;
  }

  try {
    setLoading(true);
    const { data, errors } = await client.models.Articulo.list({
      authMode: 'userPool'
    });

    if (errors) {
      throw new Error(errors.map(e => e.message).join(", "));
    }

    if (data) {
      handleDataUpdate(data as Articulo[]);
    }
  } catch (err) {
    console.error("Error al cargar artículos:", err);
    setIsOffline(true);
  } finally {
    setLoading(false);
  }
}, [handleDataUpdate, isOffline]);

// Agrega esta función al return
const checkConnection = async () => {
  try {
    // Pequeña prueba de conexión
    await client.models.Articulo.list({ limit: 1, authMode: 'userPool' });
    setIsOffline(false);
    return true;
  } catch {
    setIsOffline(true);
    return false;
  }
};

  const addArticulo = useCallback(async (
    articulo: Omit<
      Articulo,
      | "id"
      | "vendido"
      | "fechaIngreso"
      | "fechaVenta"
      | "precioVenta"
      | "updatedAt"
      | "imagen"
    > & {
      precioCompra: number;
    }
  ) => {
    try {
      setLoading(true);

          // Verificar conexión primero
      if (!navigator.onLine) {
        throw new Error("No hay conexión a internet");
      }

      // Validaciones
      if (
        !articulo.nombre?.trim() ||
        !articulo.tipoMaterial?.trim() ||
        isNaN(articulo.pesoUnitario) ||
        isNaN(articulo.cantidad) ||
        isNaN(articulo.precioCompra)
      ) {
        throw new Error("Todos los campos son requeridos");
      }

      if (articulo.pesoUnitario <= 0 || articulo.cantidad <= 0 || articulo.precioCompra <= 0) {
        throw new Error("Los valores deben ser positivos");
      }

      const completeArticulo = {
        ...articulo,
        fechaIngreso: formatAmplifyDate(new Date()),
        vendido: false,
        fechaVenta: null,
        precioVenta: null,
        imagen: null,
      };

      const { data, errors } = await client.models.Articulo.create(completeArticulo);

      if (errors) {
        throw new Error(errors.map((e) => e.message).join(", "));
      }

      toast.success(
        <div>
          <p className="font-semibold">Artículo agregado</p>
          <p className="text-sm">{articulo.nombre} - {articulo.pesoUnitario}g</p>
        </div>,
        { autoClose: 3000 }
      );

      return data as Articulo;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      toast.error(
        <div>
          <p className="font-semibold">Error al crear artículo</p>
          <p className="text-sm">{errorMessage}</p>
        </div>,
        { autoClose: 5000 }
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formatAmplifyDate]);

  const sellArticulo = useCallback(async (id: string, precioVenta: number) => {
    try {
      if (isNaN(precioVenta) || precioVenta <= 0) {
        throw new Error("El precio de venta debe ser un valor positivo");
      }

      const { data, errors } = await client.models.Articulo.update({
        id,
        vendido: true,
        fechaVenta: new Date().toISOString(),
        precioVenta,
      });

      if (errors) {
        throw new Error(errors.map((e) => e.message).join(", "));
      }

      const articuloVendido = articulos.find(a => a.id === id);
      toast.success(
        <div>
          <p className="font-semibold">Venta registrada</p>
          <p className="text-sm">{articuloVendido?.nombre} - ${precioVenta.toFixed(2)}</p>
        </div>,
        { autoClose: 3000 }
      );

      return data as Articulo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(
        <div>
          <p className="font-semibold">Error al vender artículo</p>
          <p className="text-sm">{errorMessage}</p>
        </div>,
        { autoClose: 5000 }
      );
      throw error;
    }
  }, [articulos]);

  // En la función useEffect principal de useJoyeria
  useEffect(() => {
    let mounted = true;
  
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Solo carga inicial, sin suscripciones
        const { data } = await client.models.Articulo.list({ authMode: 'userPool' });
        if (mounted && data) {
          setArticulos(data as Articulo[]);
        }
        
        initialLoadComplete.current = true;
      } catch (error) {
        console.error("Error al cargar artículos:", error);
        setError("Error al cargar artículos");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
  
    fetchData();
  
    return () => {
      mounted = false;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []); 

  return {
    articulos,
    loading,
    error,
    isOffline,
    fetchArticulos,
    addArticulo,
    sellArticulo,
    calcularEstadisticas,
    checkConnection,
    setLoading
  };
};