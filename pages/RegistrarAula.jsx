import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

export default function RegistrarAula() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const preAluno = location.state

  const [alunos, setAlunos] = useState([])
  const [alunoId, setAlunoId] = useState(preAluno?.aluno_id || '')
  const [dataAula, setDataAula] = useState('')
  const [duracao, setDuracao] = useState('60')
  const [presenca, setPresenca] = useState('presente')
  const [conteudo, setConteudo] = useState('')
  const [meetLink, setMeetLink] = useState('')
  const [arquivos, setArquivos] = useState([])
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetchAlunos()
  }, [user])

  async function fetchAlunos() {
    const { data } = await supabase
      .from('vinculos')
      .select('aluno_id, aluno:aluno_id(id, nome)')
      .eq('professor_id', user.id)
    setAlunos(data || [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!alunoId) { setErro('Selecione um aluno.'); return }
    setErro('')
    setLoading(true)

    // Insere aula
    const { data: aula, error: aulaErr } = await supabase
      .from('aulas')
      .insert({
        professor_id: user.id,
        aluno_id: alunoId,
        data_aula: new Date(dataAula).toISOString(),
        duracao_min: parseInt(duracao),
        presenca,
        conteudo,
        meet_link: meetLink || null,
      })
      .select()
      .single()

    if (aulaErr) { setErro('Erro ao salvar aula: ' + aulaErr.message); setLoading(false); return }

    // Upload arquivos
    for (const arquivo of arquivos) {
      const path = `${user.id}/${aula.id}/${arquivo.name}`
      const { error: upErr } = await supabase.storage.from('materiais').upload(path, arquivo)
      if (!upErr) {
        await supabase.from('materiais').insert({
          aula_id: aula.id,
          nome_arquivo: arquivo.name,
          storage_path: path,
        })
      }
    }

    setLoading(false)
    setSucesso(true)
    setTimeout(() => navigate('/professor'), 1800)
  }

  if (sucesso) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900 }}>Aula registrada!</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>Redirecionando...</div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <Navbar />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
        <div className="fade-up" style={{ marginBottom: 24 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/professor')} style={{ marginBottom: 16 }}>← Voltar</button>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, letterSpacing: '0.03em' }}>Registrar Aula</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Preencha os dados da aula realizada</div>
        </div>

        <div className="card fade-up-2">
          <form onSubmit={handleSubmit}>
            <Field label="Aluno">
              <select value={alunoId} onChange={e => setAlunoId(e.target.value)} required>
                <option value="">Selecione o aluno...</option>
                {alunos.map(v => (
                  <option key={v.aluno_id} value={v.aluno_id}>{v.aluno?.nome}</option>
                ))}
              </select>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Data e horário da aula">
                <input type="datetime-local" value={dataAula} onChange={e => setDataAula(e.target.value)} required />
              </Field>
              <Field label="Duração (min)">
                <input type="number" value={duracao} onChange={e => setDuracao(e.target.value)} min="15" max="240" />
              </Field>
            </div>

            <Field label="Presença do aluno">
              <select value={presenca} onChange={e => setPresenca(e.target.value)}>
                <option value="presente">✅ Presente</option>
                <option value="faltou">❌ Faltou</option>
                <option value="atrasou">⚠️ Chegou atrasado</option>
              </select>
            </Field>

            <Field label="Conteúdo ministrado">
              <textarea
                rows={3}
                placeholder="Ex: Present perfect, exercícios p. 34-36, revisão de vocabulário..."
                value={conteudo}
                onChange={e => setConteudo(e.target.value)}
              />
            </Field>

            <Field label="Link do Google Meet">
              <input type="url" placeholder="https://meet.google.com/xxx-xxxx-xxx" value={meetLink} onChange={e => setMeetLink(e.target.value)} />
            </Field>

            <Field label="Material para o aluno (opcional)">
              <div style={{
                border: '1px dashed rgba(255,255,255,0.25)',
                borderRadius: 10,
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
              }}>
                <input
                  type="file"
                  multiple
                  onChange={e => setArquivos(Array.from(e.target.files))}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                />
                <div style={{ fontSize: 24, marginBottom: 6 }}>📎</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  {arquivos.length > 0
                    ? arquivos.map(f => f.name).join(', ')
                    : 'Clique ou arraste PDF, DOC, imagem...'}
                </div>
              </div>
            </Field>

            {erro && (
              <div style={{ fontSize: 13, color: '#f87171', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, marginBottom: 16 }}>
                {erro}
              </div>
            )}

            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Salvando...' : '✓ Salvar Registro de Aula'}
            </button>
          </form>
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
