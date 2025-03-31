import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export const useJoyeria = () => {
  const [articulos, setArticulos] = useState<Schema["Articulo"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para formatear fecha en el formato exacto que Amplify espera
  const formatAmplifyDate = (date: Date) => {
    return date.toISOString().replace("Z", ""); // Remueve la 'Z' final
  };

  // Cargar todos los artículos
  const fetchArticulos = async () => {
    try {
      setLoading(true);
      const { data } = await client.models.Articulo.list();
      setArticulos(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("Error al cargar artículos");
    } finally {
      setLoading(false);
    }
  };

  // Registrar nuevo artículo
  const addArticulo = async (
    articulo: Omit<
      Schema["Articulo"],
      "id" | "vendido" | "fechaIngreso" | "fechaVenta" | "precioVenta"
    >
  ) => {
    try {
      setLoading(true);

      // Validación de campos requeridos
      if (
        !articulo.nombre ||
        !articulo.tipoMaterial ||
        isNaN(articulo.pesoUnitario) ||
        isNaN(articulo.cantidad)
      ) {
        throw new Error("Todos los campos son requeridos y deben ser válidos");
      }

      const completeArticulo = {
        ...articulo,
        fechaIngreso: formatAmplifyDate(new Date()), // Fecha formateada correctamente
        vendido: false,
      };

      console.log("Datos a enviar a DynamoDB:", completeArticulo);

      const { data, errors } = await client.models.Articulo.create({
        ...completeArticulo,
        fechaIngreso: completeArticulo.fechaIngreso, // Asegurar el formato
      });

      if (errors) {
        throw new Error(errors.map((e) => e.message).join(", "));
      }

      await fetchArticulos();
      return data;
    } catch (err) {
      console.error("Error completo al crear artículo:", err);
      setError(`Error al crear artículo: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Vender artículo (función faltante)
  const sellArticulo = async (id: string, precioVenta: number) => {
    try {
      const { data, errors } = await client.models.Articulo.update({
        id,
        vendido: true,
        fechaVenta: new Date().toISOString(),
        precioVenta,
      });

      if (errors) {
        throw new Error(errors.map((e) => e.message).join(", "));
      }

      return data;
    } catch (error) {
      console.error("Error selling article:", error);
      throw error;
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const enStock = articulos.filter((a) => !a.vendido);
    const vendidos = articulos.filter((a) => a.vendido);

    const pesoPorMaterial: Record<string, number> = {};

    enStock.forEach((a) => {
      const material = a.tipoMaterial || "Otro";
      const peso = parseFloat(String(a.pesoUnitario)) || 0;
      const cant = parseInt(String(a.cantidad)) || 0;
      pesoPorMaterial[material] =
        (pesoPorMaterial[material] || 0) + peso * cant;
    });

    return { enStock, vendidos, pesoPorMaterial };
  };

  useEffect(() => {
    fetchArticulos();
  }, []);

  return {
    articulos,
    loading,
    error,
    fetchArticulos,
    addArticulo,
    sellArticulo,
    calcularEstadisticas,
  };
};
