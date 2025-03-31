import ArticuloForm from '../components/joyeria/ArticuloForm';
import ArticuloList from '../components/joyeria/ArticuloList';
// import MaterialFilter from '../components/joyeria/MaterialFilter';
// import StatsPanel from '../components/joyeria/StatsPanel';

export default function InventoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Joyería</h1>
      
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> */}
        {/* <div className="lg:col-span-2 space-y-6"> */}
            <ArticuloForm />  
           <ArticuloList />  
        {/* </div> */}
        
        {/* <div className="space-y-6">
           <StatsPanel /> 
        </div> */}
      {/* </div> */}
    </div>
  );
}