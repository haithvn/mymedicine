import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Medicines } from './pages/Medicines';
import { Diseases } from './pages/Diseases';
import { Prescriptions } from './pages/Prescriptions';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="medicines" element={<Medicines />} />
          <Route path="diseases" element={<Diseases />} />
          <Route path="prescriptions" element={<Prescriptions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
