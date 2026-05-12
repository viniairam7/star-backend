import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

export default function ProfessorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [alunos, setAlunos] = useState([])
  const [aulas, setAulas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [user])

  async function fetchData() {
    setLoading(true)

    // Busca alunos vinculados
    const { data: vinculos } = await supabase
      .from('vinculos')
      .select('*, aluno:aluno_id(id, nome)')
      .eq('professor_id', user.id)

    setAlunos(vinculos || [])

    // Busca últimas aulas
    const { data: aulasData } = await supabase
      .from('aulas')
      .select('*, aluno:aluno_id(nome), materiais(*)')
      .eq('professor_id', user.id)
      .order('data_aula', { ascending: false })
      .limit(10)

    setAulas(aulasData || [])
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

  return (
    <div className="page">
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900, letterSpacing: '0.03em' }}>Meu Painel</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Gerencie seus alunos e registre aulas</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => navigate('/professor/novo-aluno')}>+ Novo Aluno</button>
            <button className="btn btn-primary" onClick={() => navigate('/professor/nova-aula')}>+ Registrar Aula</button>
          </div>
        </div>

        {/* Métricas */}
        <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Meus Alunos', value: alunos.length },
            { label: 'Aulas Registradas', value: aulas.length },
            { label: 'Presenças', value: aulas.filter(a => a.presenca === 'presente').length },
            { label: 'Faltas', value: aulas.filter(a => a.presenca === 'faltou').length },
          ].map(m => (
            <div key={m.label} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, marginTop: 4 }}>{m.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 40 }}>Carregando...</div>
        ) : (
          <>
            {/* Alunos */}
            <div className="fade-up-3">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 14, letterSpacing: '0.03em' }}>Meus Alunos</div>
              {alunos.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 32 }}>
                  Nenhum aluno cadastrado ainda.<br />
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={() => navigate('/professor/novo-aluno')}>Cadastrar primeiro aluno</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {alunos.map(v => (
                    <div key={v.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: '50%',
                          background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, flexShrink: 0
                        }}>{v.aluno?.nome?.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{v.aluno?.nome}</div>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{v.idioma} {v.nivel ? `· ${v.nivel}` : ''}</div>
                        </div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate('/professor/nova-aula', { state: { aluno_id: v.aluno_id, nome: v.aluno?.nome } })}>
                        + Registrar Aula
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Últimas aulas */}
            <div style={{ marginTop: 32 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 14, letterSpacing: '0.03em' }}>Últimas Aulas Registradas</div>
              {aulas.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 32 }}>
                  Nenhuma aula registrada ainda.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {aulas.map(a => (
                    <div key={a.id} className="card">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{a.aluno?.nome} <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>· {fmtDate(a.data_aula)}</span></div>
                          {a.conteudo && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{a.conteudo}</div>}
                        </div>
                        {presencaBadge(a.presenca)}
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        {a.meet_link && (
                          <a href={a.meet_link} target="_blank" rel="noreferrer" className="badge badge-blue" style={{ textDecoration: 'none' }}>
                            🎥 Link Meet
                          </a>
                        )}
                        {a.materiais?.map(m => (
                          <span key={m.id} className="badge badge-blue">📎 {m.nome_arquivo}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
