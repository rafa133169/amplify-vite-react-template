import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";
import { Articulo } from "../types/joyeria";

const client = generateClient<Schema>();

export const useJoyeria = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatAmplifyDate = (date: Date) => {
    return date.toISOString().replace("Z", "");
  };

  const fetchArticulos = async () => {
    try {
      setLoading(true);
      const { data } = await client.models.Articulo.list();
      setArticulos(data as Articulo[]);
      setError(null);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("Error al cargar artículos");
    } finally {
      setLoading(false);
    }
  };

  const addArticulo = async (
    articulo: Omit<
      Articulo,
      | "id"
      | "vendido"
      | "fechaIngreso"
      | "fechaVenta"
      | "precioVenta"
      | "updatedAt"
      | "imagen"
    >
  ) => {
    try {
      setLoading(true);

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
        fechaIngreso: formatAmplifyDate(new Date()),
        vendido: false,
        fechaVenta: null,
        precioVenta: null,
        imagen: null,
      };

      const { data, errors } = await client.models.Articulo.create(
        completeArticulo
      );

      if (errors) {
        throw new Error(errors.map((e) => e.message).join(", "));
      }

      await fetchArticulos();
      return data as Articulo;
    } catch (err) {
      console.error("Error completo al crear artículo:", err);
      setError(
        `Error al crear artículo: ${
          err instanceof Error ? err.message : "Error desconocido"
        }`
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

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

      await fetchArticulos();
      return data as Articulo;
    } catch (error) {
      console.error("Error selling article:", error);
      throw error;
    }
  };

  const calcularEstadisticas = () => {
    const enStock = articulos.filter((a) => !a.vendido);
    const vendidos = articulos.filter((a) => a.vendido);

    const pesoPorMaterial: Record<string, number> = {};

    enStock.forEach((a) => {
      const material = a.tipoMaterial || "Otro";
      const peso = a.pesoUnitario || 0;
      const cant = a.cantidad || 0;
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
