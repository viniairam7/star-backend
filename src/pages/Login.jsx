import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [role, setRole] = useState('aluno')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { error } = await signIn(email, senha)
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
    }
  }

  const roleStyle = (r) => ({
    flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid',
    cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
    textAlign: 'center', transition: 'all 0.18s',
    borderColor: role === r ? '#e8271a' : 'rgba(255,255,255,0.15)',
    background: role === r ? 'rgba(232,39,26,0.18)' : 'transparent',
    color: role === r ? 'white' : 'rgba(255,255,255,0.5)',
  })

  return (
    <div className="page" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,58,143,0.6) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,39,26,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ marginBottom: 12 }}>
            <polygon points="28,4 35,21 54,21 39,34 44,51 28,41 12,51 17,34 2,21 21,21" fill="#e8271a"/>
          </svg>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, letterSpacing: '0.05em', lineHeight: 1 }}>STAR IDIOMAS</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Portal do Aluno & Professor</div>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Entrar como</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" style={roleStyle('aluno')} onClick={() => setRole('aluno')}>👤 Aluno</button>
              <button type="button" style={roleStyle('professor')} onClick={() => setRole('professor')}>🎓 Professor</button>
            </div>
          </div>

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
            {role === 'aluno' ? 'Primeiro acesso? Seu professor enviará o convite.' : 'Acesso restrito a professores cadastrados.'}
          </p>
        </div>
      </div>
    </div>
  )
}
