import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav style={{
      background: 'rgba(13,27,75,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Star logo SVG */}
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polygon points="14,2 17.5,11 27,11 19.5,17 22,26 14,21 6,26 8.5,17 1,11 10.5,11" fill="#e8271a"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.04em', color: 'white' }}>
          STAR IDIOMAS
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{profile?.nome}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {profile?.role === 'professor' ? 'Professor' : 'Aluno'}
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0
        }}>
          {profile?.nome?.charAt(0).toUpperCase()}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sair</button>
      </div>
    </nav>
  )
}
