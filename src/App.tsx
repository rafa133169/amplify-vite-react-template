import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStockNotifications } from './hooks/useStockNotifications';
import { Header } from './components/Header';
import { Footer } from './components/Footer';


function App() {
  useStockNotifications();
  return (
    <>
    <Router>
    <Header/>

      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<InventoryPage />} />
          <Route path="/ventas" element={<SalesPage />} />
        </Routes>
      </div>
      <Footer/>

    </Router>
    <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="light"
        toastClassName="shadow-lg"
      />    
      </>
  );
}

export default App;