import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useJoyeria } from "./useJoyeria";

export const useStockNotifications = () => {
  const { calcularEstadisticas, articulos } = useJoyeria();
  const [lastNotification, setLastNotification] = useState<number | null>(null);

  useEffect(() => {
    if (articulos.length === 0) return;

    const { pesoTotal } = calcularEstadisticas();
    const pesoEnGramos = pesoTotal;
    const pesoEnKilos = pesoTotal / 1000;

    // Evitar notificaciones duplicadas
    const now = Date.now();
    if (lastNotification && now - lastNotification < 5000) return;

    if (pesoEnGramos < 20) {
      toast.warning(`⚠️ Bajo stock: ${pesoEnGramos.toFixed(2)}g disponibles`, {
        toastId: "low-stock", // ID único para evitar duplicados
        autoClose: false,
      });
      setLastNotification(now);
    }

    if (pesoEnKilos >= 4) {
      toast.warning(`⚠️ Sobrepeso: ${pesoEnKilos.toFixed(2)}kg en stock`, {
        toastId: "overweight", // ID único para evitar duplicados
        autoClose: false,
      });
      setLastNotification(now);
    }
  }, [articulos, calcularEstadisticas, lastNotification]);
};
