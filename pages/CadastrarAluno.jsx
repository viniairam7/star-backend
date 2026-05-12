import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

export default function CadastrarAluno() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [idioma, setIdioma] = useState('Inglês')
  const [nivel, setNivel] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    // 1. Cria usuário via admin (usando service role via edge function ou direto)
    // Como estamos no frontend, usamos signUp e depois vinculamos
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, role: 'aluno' }
      }
    })

    if (authErr) { setErro('Erro ao criar conta: ' + authErr.message); setLoading(false); return }

    const alunoId = authData.user?.id
    if (!alunoId) { setErro('Erro inesperado ao criar usuário.'); setLoading(false); return }

    // 2. Insere perfil do aluno
    const { error: profileErr } = await supabase.from('profiles').insert({
      id: alunoId,
      nome,
      role: 'aluno',
    })

    if (profileErr && !profileErr.message.includes('duplicate')) {
      setErro('Erro ao criar perfil: ' + profileErr.message)
      setLoading(false)
      return
    }

    // 3. Cria vínculo professor ↔ aluno
    const { error: vincErr } = await supabase.from('vinculos').insert({
      professor_id: user.id,
      aluno_id: alunoId,
      idioma,
      nivel,
    })

    if (vincErr) { setErro('Erro ao criar vínculo: ' + vincErr.message); setLoading(false); return }

    setLoading(false)
    setSucesso(true)
    setTimeout(() => navigate('/professor'), 2000)
  }

  if (sucesso) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900 }}>Aluno cadastrado!</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>O aluno já pode fazer login com o e-mail e senha cadastrados.</div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <Navbar />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 20px' }}>
        <div className="fade-up" style={{ marginBottom: 24 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/professor')} style={{ marginBottom: 16 }}>← Voltar</button>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, letterSpacing: '0.03em' }}>Cadastrar Aluno</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Crie o acesso do aluno ao portal</div>
        </div>

        <div className="card fade-up-2">
          <form onSubmit={handleSubmit}>
            <Field label="Nome completo">
              <input type="text" placeholder="Ex: Ana Lima" value={nome} onChange={e => setNome(e.target.value)} required />
            </Field>
            <Field label="E-mail do aluno">
              <input type="email" placeholder="aluno@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </Field>
            <Field label="Senha de acesso">
              <input type="text" placeholder="Crie uma senha para o aluno" value={senha} onChange={e => setSenha(e.target.value)} required minLength={6} />
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Mínimo 6 caracteres. Compartilhe com o aluno após cadastro.</div>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Idioma">
                <select value={idioma} onChange={e => setIdioma(e.target.value)}>
                  <option>Inglês</option>
                  <option>Espanhol</option>
                  <option>Francês</option>
                  <option>Alemão</option>
                  <option>Italiano</option>
                  <option>Português</option>
                  <option>Outro</option>
                </select>
              </Field>
              <Field label="Nível (opcional)">
                <select value={nivel} onChange={e => setNivel(e.target.value)}>
                  <option value="">—</option>
                  <option>A1</option><option>A2</option>
                  <option>B1</option><option>B2</option>
                  <option>C1</option><option>C2</option>
                </select>
              </Field>
            </div>

            {erro && (
              <div style={{ fontSize: 13, color: '#f87171', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, marginBottom: 16 }}>
                {erro}
              </div>
            )}

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Criando acesso...' : '+ Cadastrar Aluno'}
            </button>
          </form>
        </div>

        <div className="card fade-up-3" style={{ marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
          💡 Após cadastrar, compartilhe o e-mail e senha com o aluno. Ele poderá trocar a senha depois de entrar.
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600,
        color: 'rgba(255,255,255,0.55)', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.05em'
      }}>{label}</label>
      {children}
    </div>
  )
}
