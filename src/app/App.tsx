import { Navigate, Route, Routes } from 'react-router-dom';
import { ExecutiveDocumentsPage } from '../pages/ExecutiveDocumentsPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="executive-documents" replace />} />
      <Route path="/executive-documents" element={<ExecutiveDocumentsPage />} />
    </Routes>
  );
}
