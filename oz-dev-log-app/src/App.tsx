import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './context/ToastProvider'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { LogDetailPage } from './pages/LogDetailPage'
import { LogEditorPage } from './pages/LogEditorPage'
import { RequireAuth } from './routes/RequireAuth'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route index element={<HomePage />} />
          <Route path="logs/new" element={<LogEditorPage />} />
          <Route path="logs/:logId/edit" element={<LogEditorPage />} />
          <Route path="logs/:logId" element={<LogDetailPage />} />
          <Route path="me" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}
