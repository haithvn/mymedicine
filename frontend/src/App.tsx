import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Medicines } from './pages/Medicines';
import { Diseases } from './pages/Diseases';
import { Prescriptions } from './pages/Prescriptions';
import { ApiStatusProvider, useApiStatus, registerApiStatusSetter } from './context/ApiStatusContext';

// Component to register API status setter for axios interceptor
function ApiStatusRegistrar() {
  const { setConnected, setDisconnected, setError } = useApiStatus();

  useEffect(() => {
    registerApiStatusSetter({ setConnected, setDisconnected, setError });
    return () => registerApiStatusSetter(null);
  }, [setConnected, setDisconnected, setError]);

  return null;
}

function App() {
  return (
    <ApiStatusProvider>
      <ApiStatusRegistrar />
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
    </ApiStatusProvider>
  );
}

export default App;
