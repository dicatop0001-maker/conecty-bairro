    import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'

const OWNER_EMAIL = 'dicatop0001@gmail.com'

const css = `
.pf-wrap {
  min-height: 100vh;
  background: linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 50%,#1e40af 100%);
  font-family: 'Segoe UI',sans-serif;
  padding-bottom: 80px;
}
.pf-header {
  background: #fff;
  padding: 12px 16px 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.pf-back {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #1e40af;
  padding: 4px;
}
.pf-title {
  font-size: 20px;
  font-weight: 800;
  color: #1e3a8a;
  margin: 0;
}
.pf-body {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}
.pf-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.pf-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #1e40af;
  margin-bottom: 8px;
}
.pf-avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg,#1e40af,#16a34a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #fff;
  border: 3px solid #1e40af;
  margin-bottom: 8px;
}
.pf-label {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 4px;
  display: block;
}
.pf-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
  font-family: inherit;
}
.pf-input:focus { border-color: #1e40af; }
.pf-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.2s;
}
.pf-textarea:focus { border-color: #1e40af; }
.pf-btn {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s;
}
.pf-btn-primary {
  background: linear-gradient(135deg,#1e40af,#16a34a);
  color: #fff;
}
.pf-btn-danger {
  background: #dc2626;
  color: #fff;
}
.pf-btn-outline {
  background: #fff;
  color: #1e40af;
  border: 2px solid #1e40af;
}
.pf-section-title {
  font-size: 16px;
  font-weight: 800;
  color: #1e3a8a;
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.pf-badge {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 999px;
  font-weight: 700;
}
.pf-badge-owner { background:#fef3c7; color:#b45309; }
.pf-badge-sponsor { background:#dcfce7; color:#166534; }
.pf-badge-user { background:#dbeafe; color:#1e40af; }
.pf-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  background: #f9fafb;
}
.pf-item-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
}
.pf-item-sub {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 8px;
}
.pf-item-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pf-action-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.pf-action-btn:hover { opacity: 0.85; }
.pf-btn-approve { background:#16a34a; color:#fff; }
.pf-btn-reject { background:#dc2626; color:#fff; }
.pf-btn-edit { background:#1e40af; color:#fff; }
.pf-btn-delete { background:#f97316; color:#fff; }
.pf-tab-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 4px;
}
.pf-tab {
  flex: 1;
  padding: 10px 6px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  color: rgba(255,255,255,0.7);
}
.pf-tab.active {
  background: #fff;
  color: #1e40af;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.pf-empty {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 24px 0;
}
.pf-status-pending { color:#b45309; font-size:12px; font-weight:600; }
.pf-status-approved { color:#16a34a; font-size:12px; font-weight:600; }
.pf-status-rejected { color:#dc2626; font-size:12px; font-weight:600; }
@media (max-width:480px) {
  .pf-body { padding: 10px; }
  .pf-card { padding: 14px; }
}
`

function Perfil() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ name:'', bio:'', avatar_url:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [isSponsor, setIsSponsor] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [adminTab, setAdminTab] = useState('sponsors')
  
  // Admin data
  const [pendingSponsors, setPendingSponsors] = useState([])
  const [allAnuncios, setAllAnuncios] = useState([])
  const [allLeiloes, setAllLeiloes] = useState([])
  
  // Sponsor data
  const [myAnuncios, setMyAnuncios] = useState([])
  const [myLeiloes, setMyLeiloes] = useState([])
  const [sponsorTab, setSponsorTab] = useState('anuncios')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { navigate('/'); return }
      const u = session.user
      setUser(u)
      const owner = u.email === OWNER_EMAIL
      setIsOwner(owner)
      loadProfile(u.id)
      if (owner) {
        loadAdminData()
      } else {
        checkSponsor(u.id)
        loadMyContent(u.id)
      }
    })
  }, [])

  async function loadProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile({ name: data.name||'', bio: data.bio||'', avatar_url: data.avatar_url||'' })
  }

  async function checkSponsor(userId) {
    const { data } = await supabase.from('sponsors').select('id,status').eq('user_id', userId).single()
    if (data?.status === 'approved') setIsSponsor(true)
  }

  async function loadMyContent(userId) {
    const { data: an } = await supabase.from('auctions').select('*').eq('user_id', userId).eq('tipo','anuncio').order('created_at',{ascending:false})
    if (an) setMyAnuncios(an)
    const { data: le } = await supabase.from('auctions').select('*').eq('user_id', userId).neq('tipo','anuncio').order('created_at',{ascending:false})
    if (le) setMyLeiloes(le)
  }

  async function loadAdminData() {
    const { data: sp } = await supabase.from('sponsors').select('*,profiles(name)').order('created_at',{ascending:false})
    if (sp) setPendingSponsors(sp)
    const { data: an } = await supabase.from('auctions').select('*').eq('tipo','anuncio').order('created_at',{ascending:false})
    if (an) setAllAnuncios(an)
    const { data: le } = await supabase.from('auctions').select('*').neq('tipo','anuncio').order('created_at',{ascending:false})
    if (le) setAllLeiloes(le)
  }

  async function saveProfile() {
    setSaving(true)
    setMsg('')
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: profile.name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      updated_at: new Date().toISOString()
    })
    setSaving(false)
    setMsg(error ? '❌ Erro ao salvar' : '✅ Perfil salvo!')
    setTimeout(() => setMsg(''), 3000)
  }

  async function approveAnuncio(id) {
    await supabase.from('auctions').update({ status:'active' }).eq('id',id)
    loadAdminData()
  }

  async function rejectAnuncio(id) {
    await supabase.from('auctions').update({ status:'rejected' }).eq('id',id)
    loadAdminData()
  }

  async function deleteAnuncio(id) {
    if (!window.confirm('Excluir este item?')) return
    await supabase.from('auctions').delete().eq('id',id)
    loadAdminData()
  }

  async function approveSponsor(id) {
    await supabase.from('sponsors').update({ status:'approved' }).eq('id',id)
    loadAdminData()
  }

  async function rejectSponsor(id) {
    await supabase.from('sponsors').update({ status:'rejected' }).eq('id',id)
    loadAdminData()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  async function requestSponsorAccess() {
    if (!user) return
    const { error } = await supabase.from('sponsors').upsert({ user_id: user.id, status:'pending', created_at: new Date().toISOString() })
    if (!error) setMsg('✅ Solicitação enviada! Aguarde aprovação.')
    else setMsg('❌ Erro ao enviar solicitação.')
    setTimeout(() => setMsg(''), 4000)
  }

  const roleLabel = isOwner ? 'Dono do Site' : isSponsor ? 'Patrocinador' : 'Usuário'
  const roleBadge = isOwner ? 'pf-badge-owner' : isSponsor ? 'pf-badge-sponsor' : 'pf-badge-user'

  const pendingOnly = pendingSponsors.filter(s => s.status==='pending')
  const approvedSponsors = pendingSponsors.filter(s => s.status==='approved')
  const allSponsors = pendingSponsors

  return (
    <div className="pf-wrap">
      <style>{css}</style>

      {/* Header */}
      <div className="pf-header">
        <button className="pf-back" onClick={() => navigate('/home')}>←</button>
        <h1 className="pf-title">Meu Perfil</h1>
        <span style={{marginLeft:'auto'}} className={`pf-badge ${roleBadge}`}>{roleLabel}</span>
      </div>

      <div className="pf-body">

        {/* Profile Card */}
        <div className="pf-card">
          <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'16px'}}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" className="pf-avatar" />
              : <div className="pf-avatar-placeholder">👤</div>
            }
            <div>
              <div style={{fontWeight:800,fontSize:17,color:'#111827'}}>{profile.name || user?.email?.split('@')[0] || 'Usuário'}</div>
              <div style={{fontSize:13,color:'#6b7280'}}>{user?.email}</div>
            </div>
          </div>

          <div style={{marginBottom:10}}>
            <label className="pf-label">Nome de exibição</label>
            <input
              className="pf-input"
              placeholder="Seu nome"
              value={profile.name}
              onChange={e => setProfile(p => ({...p, name: e.target.value}))}
            />
          </div>

          <div style={{marginBottom:10}}>
            <label className="pf-label">Sobre você</label>
            <textarea
              className="pf-textarea"
              placeholder="Conte um pouco sobre você..."
              value={profile.bio}
              onChange={e => setProfile(p => ({...p, bio: e.target.value}))}
            />
          </div>

          <div style={{marginBottom:10}}>
            <label className="pf-label">URL da foto de perfil (opcional)</label>
            <input
              className="pf-input"
              placeholder="https://..."
              value={profile.avatar_url}
              onChange={e => setProfile(p => ({...p, avatar_url: e.target.value}))}
            />
          </div>

          {msg && <div style={{padding:'10px',background:'#f0fdf4',borderRadius:10,fontSize:14,fontWeight:600,color:'#166534',marginBottom:8}}>{msg}</div>}

          <button className="pf-btn pf-btn-primary" onClick={saveProfile} disabled={saving}>
            {saving ? 'Salvando...' : '💾 Salvar Perfil'}
          </button>

          <button className="pf-btn pf-btn-outline" onClick={handleLogout} style={{marginTop:8}}>
            🚪 Sair da Conta
          </button>
        </div>

        {/* ==== OWNER PANEL ==== */}
        {isOwner && (
          <div className="pf-card">
            <div className="pf-section-title">⚙️ Painel Administrativo</div>

            <div className="pf-tab-row" style={{background:'#f1f5f9'}}>
              <button
                className={`pf-tab ${adminTab==='sponsors'?'active':''}`}
                style={adminTab==='sponsors'?{}:{color:'#374151'}}
                onClick={() => setAdminTab('sponsors')}
              >
                🏢 Patrocinadores
                {pendingOnly.length > 0 && <span style={{background:'#dc2626',color:'#fff',borderRadius:999,padding:'1px 7px',marginLeft:4,fontSize:11}}>{pendingOnly.length}</span>}
              </button>
              <button
                className={`pf-tab ${adminTab==='anuncios'?'active':''}`}
                style={adminTab==='anuncios'?{}:{color:'#374151'}}
                onClick={() => setAdminTab('anuncios')}
              >
                📢 Anúncios
              </button>
              <button
                className={`pf-tab ${adminTab==='leiloes'?'active':''}`}
                style={adminTab==='leiloes'?{}:{color:'#374151'}}
                onClick={() => setAdminTab('leiloes')}
              >
                🔨 Leilões
              </button>
            </div>

            {/* Sponsors tab */}
            {adminTab === 'sponsors' && (
              <div>
                {allSponsors.length === 0 && <div className="pf-empty">Nenhum patrocinador encontrado</div>}
                {allSponsors.map(sp => (
                  <div key={sp.id} className="pf-item">
                    <div className="pf-item-title">{sp.profiles?.name || sp.user_id?.substring(0,12)+'...'}</div>
                    <div className="pf-item-sub">
                      Solicitado em {sp.created_at ? new Date(sp.created_at).toLocaleDateString('pt-BR') : ''}
                    </div>
                    <div style={{marginBottom:6}}>
                      <span className={`${sp.status==='pending'?'pf-status-pending':sp.status==='approved'?'pf-status-approved':'pf-status-rejected'}`}>
                        {sp.status==='pending'?'⏳ Pendente':sp.status==='approved'?'✅ Aprovado':'❌ Rejeitado'}
                      </span>
                    </div>
                    {sp.status === 'pending' && (
                      <div className="pf-item-actions">
                        <button className="pf-action-btn pf-btn-approve" onClick={() => approveSponsor(sp.id)}>✅ Aprovar</button>
                        <button className="pf-action-btn pf-btn-reject" onClick={() => rejectSponsor(sp.id)}>❌ Rejeitar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Anúncios tab */}
            {adminTab === 'anuncios' && (
              <div>
                {allAnuncios.length === 0 && <div className="pf-empty">Nenhum anúncio encontrado</div>}
                {allAnuncios.map(a => (
                  <div key={a.id} className="pf-item">
                    <div className="pf-item-title">{a.title || 'Sem título'}</div>
                    <div className="pf-item-sub">
                      {a.neighborhood && <span>📍 {a.neighborhood} · </span>}
                      {a.price ? <span>R$ {Number(a.price).toLocaleString('pt-BR')} · </span> : null}
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('pt-BR') : ''}
                    </div>
                    <div style={{marginBottom:6}}>
                      <span className={`${a.status==='active'?'pf-status-approved':a.status==='rejected'?'pf-status-rejected':'pf-status-pending'}`}>
                        {a.status==='active'?'✅ Ativo':a.status==='rejected'?'❌ Rejeitado':'⏳ Pendente'}
                      </span>
                    </div>
                    <div className="pf-item-actions">
                      {a.status !== 'active' && <button className="pf-action-btn pf-btn-approve" onClick={() => approveAnuncio(a.id)}>✅ Aprovar</button>}
                      {a.status === 'active' && <button className="pf-action-btn pf-btn-reject" onClick={() => rejectAnuncio(a.id)}>🚫 Desativar</button>}
                      <button className="pf-action-btn pf-btn-edit" onClick={() => navigate('/editar-anuncio/'+a.id)}>✏️ Editar</button>
                      <button className="pf-action-btn pf-btn-delete" onClick={() => deleteAnuncio(a.id)}>🗑️ Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Leilões tab */}
            {adminTab === 'leiloes' && (
              <div>
                {allLeiloes.length === 0 && <div className="pf-empty">Nenhum leilão encontrado</div>}
                {allLeiloes.map(a => (
                  <div key={a.id} className="pf-item">
                    <div className="pf-item-title">{a.title || 'Sem título'}</div>
                    <div className="pf-item-sub">
                      {a.neighborhood && <span>📍 {a.neighborhood} · </span>}
                      {a.price ? <span>Lance mín. R$ {Number(a.price).toLocaleString('pt-BR')} · </span> : null}
                      {a.ends_at ? <span>Encerra {new Date(a.ends_at).toLocaleDateString('pt-BR')}</span> : ''}
                    </div>
                    <div style={{marginBottom:6}}>
                      <span className={`${a.status==='active'?'pf-status-approved':a.status==='rejected'?'pf-status-rejected':'pf-status-pending'}`}>
                        {a.status==='active'?'✅ Ativo':a.status==='rejected'?'❌ Rejeitado':'⏳ Pendente'}
                      </span>
                    </div>
                    <div className="pf-item-actions">
                      {a.status !== 'active' && <button className="pf-action-btn pf-btn-approve" onClick={() => approveAnuncio(a.id)}>✅ Aprovar</button>}
                      {a.status === 'active' && <button className="pf-action-btn pf-btn-reject" onClick={() => rejectAnuncio(a.id)}>🚫 Desativar</button>}
                      <button className="pf-action-btn pf-btn-edit" onClick={() => navigate('/editar-leilao/'+a.id)}>✏️ Editar</button>
                      <button className="pf-action-btn pf-btn-delete" onClick={() => deleteAnuncio(a.id)}>🗑️ Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==== SPONSOR PANEL ==== */}
        {!isOwner && isSponsor && (
          <div className="pf-card">
            <div className="pf-section-title">🏢 Meu Espaço de Patrocinador</div>

            <div className="pf-tab-row" style={{background:'#f1f5f9'}}>
              <button
                className={`pf-tab ${sponsorTab==='anuncios'?'active':''}`}
                style={sponsorTab==='anuncios'?{}:{color:'#374151'}}
                onClick={() => setSponsorTab('anuncios')}
              >
                📢 Meus Anúncios ({myAnuncios.length})
              </button>
              <button
                className={`pf-tab ${sponsorTab==='leiloes'?'active':''}`}
                style={sponsorTab==='leiloes'?{}:{color:'#374151'}}
                onClick={() => setSponsorTab('leiloes')}
              >
                🔨 Meus Leilões ({myLeiloes.length})
              </button>
            </div>

            {sponsorTab === 'anuncios' && (
              <div>
                <button className="pf-btn pf-btn-primary" onClick={() => navigate('/anuncio')} style={{marginBottom:12}}>
                  ➕ Criar Novo Anúncio
                </button>
                {myAnuncios.length === 0 && <div className="pf-empty">Você ainda não tem anúncios</div>}
                {myAnuncios.map(a => (
                  <div key={a.id} className="pf-item">
                    <div className="pf-item-title">{a.title || 'Sem título'}</div>
                    <div className="pf-item-sub">
                      {a.neighborhood && <span>📍 {a.neighborhood} · </span>}
                      {a.price ? <span>R$ {Number(a.price).toLocaleString('pt-BR')} · </span> : null}
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('pt-BR') : ''}
                    </div>
                    <div style={{marginBottom:6}}>
                      <span className={`${a.status==='active'?'pf-status-approved':a.status==='rejected'?'pf-status-rejected':'pf-status-pending'}`}>
                        {a.status==='active'?'✅ Ativo':a.status==='rejected'?'❌ Rejeitado':'⏳ Aguardando aprovação'}
                      </span>
                    </div>
                    <div className="pf-item-actions">
                      <button className="pf-action-btn pf-btn-edit" onClick={() => navigate('/editar-anuncio/'+a.id)}>✏️ Editar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sponsorTab === 'leiloes' && (
              <div>
                <button className="pf-btn pf-btn-primary" onClick={() => navigate('/novo')} style={{marginBottom:12}}>
                  ➕ Criar Novo Leilão
                </button>
                {myLeiloes.length === 0 && <div className="pf-empty">Você ainda não tem leilões</div>}
                {myLeiloes.map(a => (
                  <div key={a.id} className="pf-item">
                    <div className="pf-item-title">{a.title || 'Sem título'}</div>
                    <div className="pf-item-sub">
                      {a.neighborhood && <span>📍 {a.neighborhood} · </span>}
                      {a.price ? <span>R$ {Number(a.price).toLocaleString('pt-BR')} · </span> : null}
                      {a.ends_at ? <span>Encerra {new Date(a.ends_at).toLocaleDateString('pt-BR')}</span> : ''}
                    </div>
                    <div style={{marginBottom:6}}>
                      <span className={`${a.status==='active'?'pf-status-approved':a.status==='rejected'?'pf-status-rejected':'pf-status-pending'}`}>
                        {a.status==='active'?'✅ Ativo':a.status==='rejected'?'❌ Rejeitado':'⏳ Aguardando aprovação'}
                      </span>
                    </div>
                    <div className="pf-item-actions">
                      <button className="pf-action-btn pf-btn-edit" onClick={() => navigate('/editar-leilao/'+a.id)}>✏️ Editar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==== COMMON USER PANEL ==== */}
        {!isOwner && !isSponsor && (
          <div className="pf-card">
            <div className="pf-section-title">💬 Chat e Comunidade</div>
            <p style={{fontSize:14,color:'#374151',marginTop:0,marginBottom:12,lineHeight:'1.6'}}>
              Complete seu cadastro para participar do chat da comunidade e interagir com outros moradores do seu bairro.
            </p>
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:14,marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:14,color:'#166534',marginBottom:4}}>🏘️ Benefícios da comunidade:</div>
              <ul style={{fontSize:13,color:'#166534',margin:0,paddingLeft:18,lineHeight:'1.8'}}>
                <li>Chat com vizinhos do bairro</li>
                <li>Receber alertas de anúncios próximos</li>
                <li>Participar de leilões locais</li>
                <li>Acompanhar novidades do bairro</li>
              </ul>
            </div>
            <div style={{background:'#fef3c7',border:'1px solid #fde68a',borderRadius:12,padding:14,marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:14,color:'#92400e',marginBottom:4}}>🏢 Quer ser Patrocinador?</div>
              <p style={{fontSize:13,color:'#92400e',margin:0,lineHeight:'1.6',marginBottom:8}}>
                Patrocinadores podem publicar anúncios e leilões na plataforma. Solicite acesso:
              </p>
              <button className="pf-btn pf-btn-primary" onClick={requestSponsorAccess} style={{width:'auto',padding:'8px 18px',marginTop:0}}>
                📋 Solicitar Acesso de Patrocinador
              </button>
            </div>
            {msg && <div style={{padding:10,background:'#f0fdf4',borderRadius:10,fontSize:14,fontWeight:600,color:'#166534'}}>{msg}</div>}
          </div>
        )}

      </div>
    </div>
  )
}

export default Perfil
