export interface Articulo {
  id: string;
  nombre: string;
  fechaIngreso: string;
  tipoMaterial: string;
  pesoUnitario: number;
  cantidad: number;
  precioCompra: number; // Nuevo campo
  vendido: boolean | null;
  fechaVenta: string | null;
  precioVenta: number | null;
  descripcion: string | null;
  imagen: string | null;
  readonly updatedAt: string;
}
