import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CRMProvider } from './store/CRMContext';
import { SearchProvider } from './store/SearchContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Leads from './pages/Leads';
import Companies from './pages/Companies';
import Contacts from './pages/Contacts';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
