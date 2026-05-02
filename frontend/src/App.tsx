import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import VotePage from './pages/VotePage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import PocTasksPage from './pages/PocTasksPage';
import PocProfilePage from './pages/PocProfilePage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/vote" replace />} />
        <Route path="/vote" element={<VotePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/poc/tasks" element={<PocTasksPage />} />
        <Route path="/poc/profile" element={<PocProfilePage />} />
      </Route>
    </Routes>
  );
}

