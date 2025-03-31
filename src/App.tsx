import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<InventoryPage />} />
          <Route path="/ventas" element={<SalesPage />} />
        </Routes>
      </div>
    </Router>
    <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}

export default App;