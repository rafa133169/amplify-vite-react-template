import { useState } from 'react';
import { useJoyeria } from '../../hooks/useJoyeria';
import { toast } from 'react-toastify'; // Opcional: para notificaciones
import 'react-toastify/dist/ReactToastify.css'; // Estilos para notificaciones

const materiales = ['acero inoxidable', 'plata', 'oro', 'platino', 'otros'];

export default function ArticuloForm() {
    const [form, setForm] = useState({
        nombre: '',
        tipoMaterial: 'acero inoxidable',
        pesoUnitario: '',
        cantidad: '1',
        descripcion: ''
      });
      const [isSubmitting, setIsSubmitting] = useState(false);
      const { addArticulo } = useJoyeria();
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
          // Validación mejorada
          if (!form.nombre.trim() || !form.tipoMaterial.trim() || 
              !form.pesoUnitario || !form.cantidad) {
            toast.error('Por favor complete todos los campos requeridos');
            return;
          }
      
          const peso = parseFloat(form.pesoUnitario);
          const cantidad = parseInt(form.cantidad);
      
          if (isNaN(peso) || isNaN(cantidad)) {
            toast.error('Peso y cantidad deben ser números válidos');
            return;
          }
      
          const result = await addArticulo({
            nombre: form.nombre.trim(),
            tipoMaterial: form.tipoMaterial,
            pesoUnitario: peso,
            cantidad: cantidad,
            descripcion: form.descripcion.trim()
          });
      
          toast.success('¡Artículo creado exitosamente!');
          console.log("Respuesta de DynamoDB:", result);
          
          // Reset del formulario
          setForm({
            nombre: '',
            tipoMaterial: 'acero inoxidable',
            pesoUnitario: '',
            cantidad: '1',
            descripcion: ''
          });
      
        } catch (error) {
          toast.error(`Error al crear artículo: ${error.message}`);
          console.error("Detalles completos del error:", error);
        }
      };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Registrar Nuevo Artículo</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({...form, nombre: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Material</label>
            <select
              value={form.tipoMaterial}
              onChange={(e) => setForm({...form, tipoMaterial: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              {materiales.map(material => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Peso Unitario (g)</label>
            <input
              type="number"
              step="0.1"
              value={form.pesoUnitario}
              onChange={(e) => setForm({...form, pesoUnitario: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Cantidad</label>
            <input
              type="number"
              min="1"
              value={form.cantidad}
              onChange={(e) => setForm({...form, cantidad: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({...form, descripcion: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows={3}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-4 text-white py-2 px-4 rounded-md ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Artículo'}
        </button>
      </form>
    </div>
  );
}