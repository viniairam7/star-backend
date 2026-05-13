import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

export default function AlunoDashboard() {
  const { user } = useAuth()
  const [aulas, setAulas] = useState([])
  const [materiais, setMateriais] = useState([])
  const [aba, setAba] = useState('historico')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [user])

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase
      .from('aulas')
      .select('*, professor:professor_id(nome), materiais(*)')
      .eq('aluno_id', user.id)
      .order('data_aula', { ascending: false })

    setAulas(data || [])

    // Flatten materiais
    const mats = (data || []).flatMap(a => (a.materiais || []).map(m => ({ ...m, data_aula: a.data_aula })))
    setMateriais(mats)
    setLoading(false)
  }

  function fmtDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const presencaBadge = (p) => {
    if (p === 'presente') return <span className="badge badge-green">✓ Presente</span>
    if (p === 'faltou') return <span className="badge badge-red">✗ Faltou</span>
    if (p === 'atrasou') return <span className="badge badge-amber">⚠ Atrasou</span>
    return null
  }

  const proxima = aulas.find(a => new Date(a.data_aula) > new Date())
  const historico = aulas.filter(a => new Date(a.data_aula) <= new Date())

  const abas = [
    { id: 'historico', label: 'Histórico de Aulas' },
    { id: 'materiais', label: `Materiais (${materiais.length})` },
  ]

  return (
    <div className="page">
      <Navbar />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900, letterSpacing: '0.03em' }}>Meu Portal</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Acompanhe suas aulas e materiais</div>
        </div>

        {/* Próxima aula */}
        <div className="fade-up-2" style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 12, letterSpacing: '0.03em' }}>Próxima Aula</div>
          {proxima ? (
            <div className="card" style={{ borderLeft: '3px solid var(--red)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{fmtDate(proxima.data_aula)}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
                    com {proxima.professor?.nome} · {proxima.duracao_min} min
                  </div>
                  {proxima.conteudo && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>Tema: {proxima.conteudo}</div>}
                </div>
                {proxima.meet_link && (
                  <a href={proxima.meet_link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    🎥 Entrar no Meet
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              Nenhuma aula agendada ainda. Aguarde o professor registrar a próxima.
            </div>
          )}
        </div>

        {/* Abas */}
        <div className="fade-up-3">
          <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
            {abas.map(a => (
              <button key={a.id}
                onClick={() => setAba(a.id)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  fontWeight: 600,
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  borderColor: aba === a.id ? 'var(--red)' : 'var(--glass-border)',
                  background: aba === a.id ? 'rgba(232,39,26,0.15)' : 'transparent',
                  color: aba === a.id ? 'white' : 'rgba(255,255,255,0.55)',
                }}
              >{a.label}</button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 40 }}>Carregando...</div>
          ) : (
            <>
              {aba === 'historico' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {historico.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 32 }}>Nenhuma aula realizada ainda.</div>
                  ) : historico.map(a => (
                    <div key={a.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{fmtDate(a.data_aula)} · {a.duracao_min} min</div>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>com {a.professor?.nome}</div>
                          {a.conteudo && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>{a.conteudo}</div>}
                        </div>
                        {presencaBadge(a.presenca)}
                      </div>
                      {a.materiais?.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                          {a.materiais.map(m => (
                            <span key={m.id} className="badge badge-blue">📎 {m.nome_arquivo}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {aba === 'materiais' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {materiais.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 32 }}>Nenhum material enviado ainda.</div>
                  ) : materiais.map((m, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ fontSize: 28 }}>📄</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{m.nome_arquivo}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Enviado em {fmtDate(m.data_aula)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
