import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import ProfessorDashboard from './pages/ProfessorDashboard'
import AlunoDashboard from './pages/AlunoDashboard'
import RegistrarAula from './pages/RegistrarAula'
import CadastrarAluno from './pages/CadastrarAluno'

function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'rgba(255,255,255,0.5)'}}>Carregando...</div>
  if (!user) return <Navigate to="/" replace />
  if (role && profile?.role !== role) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'rgba(255,255,255,0.5)'}}>Carregando...</div>

  return (
    <Routes>
      <Route path="/" element={
        user
          ? <Navigate to={profile?.role === 'professor' ? '/professor' : '/aluno'} replace />
          : <Login />
      } />
      <Route path="/professor" element={
        <ProtectedRoute role="professor"><ProfessorDashboard /></ProtectedRoute>
      } />
      <Route path="/professor/nova-aula" element={
        <ProtectedRoute role="professor"><RegistrarAula /></ProtectedRoute>
      } />
      <Route path="/professor/novo-aluno" element={
        <ProtectedRoute role="professor"><CadastrarAluno /></ProtectedRoute>
      } />
      <Route path="/aluno" element={
        <ProtectedRoute role="aluno"><AlunoDashboard /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
