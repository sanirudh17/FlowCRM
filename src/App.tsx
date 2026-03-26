import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CRMProvider } from './store/CRMContext';
import { SearchProvider } from './store/SearchContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Leads from './pages/Leads';
import Companies from './pages/Companies';
import Contacts from './pages/Contacts';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Landing from './pages/Landing';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { session } = useAuth();

  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <CRMProvider>
              <SearchProvider>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/pipeline" element={<Pipeline />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </Layout>
              </SearchProvider>
            </CRMProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
