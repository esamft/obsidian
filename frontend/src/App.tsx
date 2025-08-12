import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import './styles/index.css';

// Components
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Coletar from './pages/Coletar';
import ColetarWizard from './pages/ColetarWizard';
import Planos from './pages/Planos';
import NovoPlano from './pages/NovoPlano';
import Analise from './pages/Analise';
import AnaliseNetwork from './pages/AnaliseNetwork';
import Busca from './pages/Busca';
import DesempenhoColetadores from './pages/DesempenhoColetadores';
import NotFound from './pages/NotFound';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/coletar" element={<Coletar />} />
              <Route path="/coletar-wizard" element={<ColetarWizard />} />
              <Route path="/planos" element={<Planos />} />
              <Route path="/novo-plano" element={<NovoPlano />} />
              <Route path="/analise" element={<Analise />} />
              <Route path="/analise-network" element={<AnaliseNetwork />} />
              <Route path="/busca" element={<Busca />} />
              <Route path="/desempenho" element={<DesempenhoColetadores />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App; 