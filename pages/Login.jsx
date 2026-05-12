import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { data, error } = await signIn(email, senha)
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }
    // Navigation handled by App.jsx via auth state
    setLoading(false)
  }

  return (
    <div className="page" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorative circles */}
      <div style={{
        position: 'absolute', top: -120, right: -120,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,58,143,0.6) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -80,
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,39,26,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ marginBottom: 12 }}>
            <polygon points="28,4 35,21 54,21 39,34 44,51 28,41 12,51 17,34 2,21 21,21" fill="#e8271a"/>
          </svg>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, letterSpacing: '0.05em', lineHeight: 1 }}>
            STAR IDIOMAS
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Portal do Aluno & Professor</div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Entrar</div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>E-mail</label>
              <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Senha</label>
              <input type="password" placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)} required />
            </div>
            {erro && <div style={{ fontSize: 13, color: '#f87171', marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>{erro}</div>}
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 20 }}>
            Primeiro acesso? Seu professor enviará o convite por e-mail.
          </p>
        </div>
      </div>
    </div>
  )
}
