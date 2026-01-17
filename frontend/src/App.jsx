import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import Dashboard from './pages/Dashboard';
import CreateRFP from './pages/CreateRFP';
import VendorManagement from './pages/VendorManagement';
import RfpDetail from './pages/RfpDetail';
import Comparison from './pages/Comparison';

function App() {
  const navigate = useNavigate();

  const items = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      command: () => navigate('/')
    },
    {
      label: 'Create RFP',
      icon: 'pi pi-plus',
      command: () => navigate('/create')
    },
    {
      label: 'Vendors',
      icon: 'pi pi-users',
      command: () => navigate('/vendors')
    }
  ];

  const start = <div className="text-xl font-bold text-primary mr-4">🤖 AI RFP Manager</div>;

  return (
    <div className="min-h-screen">
      <Menubar model={items} start={start} className="mb-4" />
      
      <div className="p-4 md:p-6 lg:p-8 container mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateRFP />} />
          <Route path="/rfp/:id" element={<RfpDetail />} />
          <Route path="/vendors" element={<VendorManagement />} />
          <Route path="/comparison/:id" element={<Comparison />} />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
