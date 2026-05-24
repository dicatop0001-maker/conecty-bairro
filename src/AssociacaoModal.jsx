import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import ReactDOM from 'react-dom'

const amCss = `
.am-overlay {
  position: fixed; top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.75); z-index: 8000;
  display: flex; align-items: flex-end; justify-content: center;
}
.am-sheet {
  background: #fff; border-radius: 22px 22px 0 0;
  width: 100%; max-width: 600px; max-height: 92vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.3);
  animation: am-up 0.3s ease;
}
@keyframes am-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
.am-head {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #fff; padding: 16px 18px 14px;
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
}
.am-head-title { font-size: 18px; font-weight: 900; margin: 0; }
.am-head-sub { font-size: 12px; opacity: 0.85; margin: 2px 0 0; }
.am-close {
  background: rgba(255,255,255,0.25); border: none; border-radius: 50%;
  width: 34px; height: 34px; font-size: 20px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.am-body { overflow-y: auto; flex: 1; padding: 16px; }
.am-section {
  background: #f8fafc; border-radius: 14px; padding: 14px 16px;
  margin-bottom: 12px; border-left: 4px solid #f97316;
}
.am-section-title {
  font-size: 13px; font-weight: 900; color: #ea580c;
  text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px;
}
.am-info-row {
  display: flex; align-items: flex-start; gap: 8px;
  margin-bottom: 6px; font-size: 14px; color: #374151;
}
.am-info-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.am-info-text { flex: 1; line-height: 1.4; }
.am-notice-item {
  background: #fff7ed; border: 1px solid #fed7aa;
  border-radius: 10px; padding: 10px 12px; margin-bottom: 8px;
}
.am-notice-text { font-size: 13px; color: #374151; line-height: 1.5; margin: 0; }
.am-rental-card {
  background: linear-gradient(135deg, #fff7ed, #fef3c7);
  border: 2px solid #f97316; border-radius: 14px; padding: 14px;
  margin-bottom: 12px;
}
.am-price-big {
  font-size: 26px; font-weight: 900; color: #ea580c; margin: 4px 0;
}
.am-wa-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  color: #fff; border: none; border-radius: 14px;
  padding: 13px; font-size: 15px; font-weight: 800; cursor: pointer;
  width: 100%; margin-top: 4px; text-decoration: none;
}
.am-input {
  width: 100%; padding: 11px 13px; border: 2px solid #e2e8f0;
  border-radius: 10px; font-size: 14px; box-sizing: border-box;
  margin-bottom: 10px; outline: none;
}
.am-input:focus { border-color: #f97316; }
.am-textarea {
  width: 100%; padding: 11px 13px; border: 2px solid #e2e8f0;
  border-radius: 10px; font-size: 14px; box-sizing: border-box;
  margin-bottom: 10px; resize: vertical; min-height: 80px; outline: none;
}
.am-textarea:focus { border-color: #f97316; }
.am-submit {
  width: 100%; padding: 14px; background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff; border: none; border-radius: 12px; font-size: 16px;
  font-weight: 800; cursor: pointer; margin-top: 4px;
}
.am-submit:disabled { background: #94a3b8; cursor: not-allowed; }
.am-tabs {
  display: flex; gap: 8px; margin-bottom: 16px;
}
.am-tab {
  flex: 1; padding: 10px; border-radius: 12px; border: 2px solid #e2e8f0;
  background: #fff; font-size: 13px; font-weight: 700; cursor: pointer;
  text-align: center; color: #6b7280;
}
.am-tab.active {
  border-color: #f97316; background: #fff7ed; color: #ea580c;
}
.am-msg-ok { color: #16a34a; font-weight: 700; font-size: 13px; padding: 6px 0; }
.am-msg-err { color: #dc2626; font-weight: 700; font-size: 13px; padding: 6px 0; }
.am-logo {
  width: 80px; height: 80px; border-radius: 50%; object-fit: cover;
  border: 3px solid #f97316; margin: 0 auto 10px; display: block;
}
.am-empty {
  text-align: center; padding: 32px; color: #9ca3af;
}

.am-partner-badge {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #3b82f6 100%);
  border-radius: 14px; padding: 16px; color: #fff; margin-bottom: 14px; text-align: center;
}
.am-partner-code {
  font-size: 28px; font-weight: 900; letter-spacing: 3px; color: #fbbf24;
  margin: 8px 0; font-family: monospace;
}
.am-partner-info {
  background: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px;
  padding: 14px; margin-bottom: 12px;
}
.am-select {
  width: 100%; padding: 11px 13px; border: 2px solid #e2e8f0;
  border-radius: 10px; font-size: 14px; box-sizing: border-box;
  margin-bottom: 10px; outline: none; background: #fff;
}
.am-select:focus { border-color: #1e40af; }
`

function AssociacaoModal({ city, neighborhood, onClose }) {
  const [assoc, setAssoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('info')
  const [loginPwd, setLoginPwd] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loginMsg, setLoginMsg] = useState({ text: '', type: '' })
  const [partnerTab, setPartnerTab] = useState('regform')
  const [partner, setPartner] = useState(null)
  const [partnerForm, setPartnerForm] = useState({
    pix_key: '', pix_owner: '', pix_type: 'CPF', commission_contact: ''
  })
  const [partnerSaving, setPartnerSaving] = useState(false)
  const [partnerMsg, setPartnerMsg] = useState({ text: '', type: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState({ text: '', type: '' })
  const [noticeText, setNoticeText] = useState('')
  const [form, setForm] = useState({
    assoc_name: '', president_name: '', contact_phone: '', contact_email: '',
    address: '', description: '', rental_available: false,
    rental_days: '', rental_price: '', rental_description: '', logo_url: ''
  })

  useEffect(() => { loadAssoc() }, [city, neighborhood])

  const loadAssoc = async () => {
    setLoading(true)
  
  const handlePartnerSave = async () => {
    if (!partnerForm.pix_key.trim() || !partnerForm.pix_owner.trim()) {
      setPartnerMsg({ text: 'Chave PIX e nome do titular sao obrigatorios.', type: 'err' }); return
    }
    if (!assoc || !assoc.id) {
      setPartnerMsg({ text: 'Salve os dados da associacao primeiro.', type: 'err' }); return
    }
    setPartnerSaving(true)
    setPartnerMsg({ text: '', type: '' })
    if (partner && partner.id) {
      const { error } = await supabase.from('partner_associations').update({
        pix_key: partnerForm.pix_key,
        pix_owner: partnerForm.pix_owner,
        pix_type: partnerForm.pix_type,
        commission_contact: partnerForm.commission_contact,
        updated_at: new Date().toISOString()
      }).eq('id', partner.id)
      setPartnerSaving(false)
      if (error) { setPartnerMsg({ text: 'Erro: ' + error.message, type: 'err' }) }
      else { setPartnerMsg({ text: 'Dados atualizados com sucesso!', type: 'ok' }); await loadAssoc() }
    } else {
      const code = 'ASSOC-' + Math.random().toString(36).substr(2,6).toUpperCase()
      const { error } = await supabase.from('partner_associations').insert({
        association_id: assoc.id,
        assoc_name: assoc.assoc_name,
        neighborhood: assoc.neighborhood,
        city: assoc.city,
        registration_code: code,
        pix_key: partnerForm.pix_key,
        pix_owner: partnerForm.pix_owner,
        pix_type: partnerForm.pix_type,
        commission_contact: partnerForm.commission_contact,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setPartnerSaving(false)
      if (error) { setPartnerMsg({ text: 'Erro: ' + error.message, type: 'err' }) }
      else { setPartnerMsg({ text: 'Cadastro realizado!', type: 'ok' }); await loadAssoc() }
    }
  }
  const bairro = neighborhood || city
    const { data } = await supabase.from('associations').select('*')
      .eq('neighborhood', bairro).limit(1)
    if (data && data.length > 0) {
      setAssoc(data[0])
      setForm({
        assoc_name: data[0].assoc_name || '',
        president_name: data[0].president_name || '',
        contact_phone: data[0].contact_phone || '',
        contact_email: data[0].contact_email || '',
        address: data[0].address || '',
        description: data[0].description || '',
        rental_available: data[0].rental_available || false,
        rental_days: data[0].rental_days || '',
        rental_price: data[0].rental_price || '',
        rental_description: data[0].rental_description || '',
        logo_url: data[0].logo_url || ''
      })
      const { data: pd } = await supabase.from('partner_associations')
        .select('*').eq('association_id', data[0].id).limit(1)
      if (pd && pd.length > 0) {
        setPartner(pd[0])
        setPartnerForm({
          pix_key: pd[0].pix_key || '',
          pix_owner: pd[0].pix_owner || '',
          pix_type: pd[0].pix_type || 'CPF',
          commission_contact: pd[0].commission_contact || ''
        })
      } else {
        setPartner(null)
      }
    }
    setLoading(false)
  }

  const handleLogin = async () => {
    setLoginMsg({ text: '', type: '' })
    if (!loginEmail || !loginPwd) { setLoginMsg({ text: 'Preencha e-mail e senha.', type: 'err' }); return }
    if (assoc && assoc.password && assoc.password.length > 0) {
      if (loginPwd !== assoc.password) {
        setLoginMsg({ text: 'Senha incorreta.', type: 'err' }); return
      }
    }
    setAuthenticated(true)
    setTab('edit')
  }

  const handleSave = async () => {
    if (!form.assoc_name.trim() || !form.president_name.trim()) {
      setSaveMsg({ text: 'Nome da associacao e presidente sao obrigatorios!', type: 'err' }); return
    }
    setSaving(true)
    const bairro = neighborhood || city
    const payload = { ...form, city, neighborhood: bairro, password: loginPwd, updated_at: new Date().toISOString() }
    let error
    if (assoc && assoc.id) {
      const r = await supabase.from('associations').update(payload).eq('id', assoc.id)
      error = r.error
    } else {
      const r = await supabase.from('associations').insert({ ...payload, created_at: new Date().toISOString() })
      error = r.error
    }
    setSaving(false)
    if (error) { setSaveMsg({ text: 'Erro: ' + error.message, type: 'err' }) }
    else { setSaveMsg({ text: 'Salvo com sucesso!', type: 'ok' }); await loadAssoc(); setTab('info') }
  }

  const handleAddNotice = async () => {
    if (!noticeText.trim()) return
    const current = (assoc && assoc.notices) ? assoc.notices : []
    const updated = [...current, { text: noticeText.trim(), date: new Date().toISOString() }]
    const { error } = await supabase.from('associations').update({ notices: updated, updated_at: new Date().toISOString() }).eq('id', assoc.id)
    if (!error) { setNoticeText(''); await loadAssoc() }
  }

  const handleDeleteNotice = async (idx) => {
    const current = [...(assoc.notices || [])]
    current.splice(idx, 1)
    await supabase.from('associations').update({ notices: current }).eq('id', assoc.id)
    await loadAssoc()
  }

  const bairro = neighborhood || city
  const hasAssoc = assoc && assoc.assoc_name

  return ReactDOM.createPortal(
    <div className="am-overlay" onClick={e => { if(e.target===e.currentTarget) onClose() }}>
      <div className="am-sheet" onClick={e => e.stopPropagation()}>
        <style>{amCss}</style>
        <div className="am-head">
          <div>
            <p className="am-head-title">
              {hasAssoc ? assoc.assoc_name : 'Associação de Moradores'}
            </p>
            <p className="am-head-sub">🏘️ {bairro}</p>
          </div>
          <button className="am-close" onClick={onClose}>×</button>
        </div>

        <div className="am-body">
          {loading ? (
            <div className="am-empty"><div style={{fontSize:32}}>⏳</div><p>Carregando...</p></div>
          ) : (
            <>
              <div className="am-tabs">
                <button className={'am-tab'+(tab==='info'?' active':'')} onClick={()=>setTab('info')}>📋 Informações</button>
                {hasAssoc && <button className={'am-tab'+(tab==='avisos'?' active':'')} onClick={()=>setTab('avisos')}>📢 Avisos</button>}
                {hasAssoc && assoc.rental_available && <button className={'am-tab'+(tab==='aluguel'?' active':'')} onClick={()=>setTab('aluguel')}>🏠 Aluguel</button>}
                <button className={'am-tab'+(tab==='login'?' active':'')} onClick={()=>setTab(authenticated?'edit':'login')}>⚙️ {authenticated?'Editar':'Entrar'}</button>
                {authenticated && hasAssoc && <button className={'am-tab'+(tab==='parceira'?' active':'')} onClick={()=>setTab('parceira')} style={{background:tab==='parceira'?'linear-gradient(135deg,#1e3a8a,#3b82f6)':undefined,color:tab==='parceira'?'#fff':undefined,borderColor:tab==='parceira'?'#1e40af':undefined}}>🤝 Parceira</button>}
              </div>

              {tab==='info' && (
                !hasAssoc ? (
                  <div className="am-empty">
                    <div style={{fontSize:48,marginBottom:12}}>🏘️</div>
                    <p style={{fontWeight:700,color:'#374151',fontSize:16}}>Associação não cadastrada</p>
                    <p style={{color:'#9ca3af',fontSize:13}}>O presidente da associação pode cadastrar aqui.</p>
                    <button className="am-submit" style={{marginTop:16}} onClick={()=>setTab('login')}>Cadastrar Associação</button>
                  </div>
                ) : (
                  <div>
                    {assoc.logo_url && <img src={assoc.logo_url} alt="logo" className="am-logo"/>}
                    {assoc.description && (
                      <div className="am-section">
                        <p className="am-section-title">📝 Sobre</p>
                        <p style={{margin:0,fontSize:14,color:'#374151',lineHeight:1.6}}>{assoc.description}</p>
                      </div>
                    )}
                    <div className="am-section">
                      <p className="am-section-title">👤 Responsável</p>
                      <div className="am-info-row"><span className="am-info-icon">🧑‍💼</span><span className="am-info-text">{assoc.president_name}</span></div>
                      {assoc.contact_phone && <div className="am-info-row"><span className="am-info-icon">📱</span><span className="am-info-text">{assoc.contact_phone}</span></div>}
                      {assoc.contact_email && <div className="am-info-row"><span className="am-info-icon">✉️</span><span className="am-info-text">{assoc.contact_email}</span></div>}
                    </div>
                    {assoc.address && (
                      <div className="am-section">
                        <p className="am-section-title">📍 Endereço</p>
                        <div className="am-info-row"><span className="am-info-icon">🗺️</span><span className="am-info-text">{assoc.address}</span></div>
                        <a href={'https://www.google.com/maps/search/'+encodeURIComponent(assoc.address+', '+city)} target="_blank" rel="noopener noreferrer"
                          style={{display:'inline-block',marginTop:6,padding:'6px 14px',background:'#1e3a8a',color:'#fff',borderRadius:8,fontSize:12,fontWeight:700,textDecoration:'none'}}>
                          Ver no mapa 🗺️
                        </a>
                      </div>
                    )}
                    {assoc.contact_phone && (
                      <a href={'https://wa.me/55'+assoc.contact_phone.replace(/\\D/g,'')} target="_blank" rel="noopener noreferrer" className="am-wa-btn">
                        💬 Falar com a Associação
                      </a>
                    )}
                  </div>
                )
              )}

              {tab==='avisos' && (
                <div>
                  {authenticated && (
                    <div style={{marginBottom:16,background:'#fff7ed',borderRadius:12,padding:12,border:'2px solid #fed7aa'}}>
                      <p style={{fontWeight:800,fontSize:13,color:'#ea580c',margin:'0 0 8px'}}>➕ Novo Aviso</p>
                      <textarea className="am-textarea" placeholder="Escreva o aviso aqui..." value={noticeText} onChange={e=>setNoticeText(e.target.value)}/>
                      <button className="am-submit" onClick={handleAddNotice} style={{marginTop:0}}>Publicar Aviso</button>
                    </div>
                  )}
                  {(!assoc.notices || assoc.notices.length===0) ? (
                    <div className="am-empty"><div style={{fontSize:32}}>📢</div><p>Nenhum aviso publicado.</p></div>
                  ) : (
                    [...(assoc.notices||[])].reverse().map((n,i)=>(
                      <div key={i} className="am-notice-item">
                        <p className="am-notice-text">{n.text || n}</p>
                        <p style={{fontSize:11,color:'#9ca3af',margin:'4px 0 0'}}>{n.date ? new Date(n.date).toLocaleString('pt-BR') : ''}</p>
                        {authenticated && <button onClick={()=>handleDeleteNotice(assoc.notices.length-1-i)} style={{marginTop:6,padding:'4px 10px',background:'#fee2e2',border:'none',borderRadius:6,fontSize:11,color:'#dc2626',cursor:'pointer',fontWeight:700}}>🗑 Remover</button>}
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab==='aluguel' && assoc && assoc.rental_available && (
                <div>
                  <div className="am-rental-card">
                    <p style={{margin:'0 0 4px',fontSize:13,fontWeight:700,color:'#92400e'}}>🏠 Espaço disponível para locação</p>
                    {assoc.rental_price && <p className="am-price-big">{assoc.rental_price}</p>}
                    {assoc.rental_days && <p style={{margin:'0 0 8px',fontSize:13,color:'#374151'}}>📅 Dias: {assoc.rental_days}</p>}
                    {assoc.rental_description && <p style={{margin:0,fontSize:13,color:'#374151',lineHeight:1.5}}>{assoc.rental_description}</p>}
                  </div>
                  {assoc.contact_phone && (
                    <a href={'https://wa.me/55'+assoc.contact_phone.replace(/\\D/g,'')+'?text=Ola!%20Gostaria%20de%20saber%20mais%20sobre%20o%20aluguel%20do%20espaco%20da%20associacao.'} target="_blank" rel="noopener noreferrer" className="am-wa-btn">
                      💬 Solicitar Reserva via WhatsApp
                    </a>
                  )}
                </div>
              )}

              {tab==='login' && !authenticated && (
                <div>
                  <p style={{fontWeight:800,color:'#ea580c',fontSize:16,margin:'0 0 4px'}}>🔐 Área do Presidente</p>
                  <p style={{fontSize:13,color:'#6b7280',margin:'0 0 16px'}}>Entre com seu e-mail e senha para gerenciar a associação.</p>
                  {loginMsg.text && <p className={loginMsg.type==='ok'?'am-msg-ok':'am-msg-err'}>{loginMsg.text}</p>}
                  <input className="am-input" type="email" placeholder="Seu e-mail *" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}/>
                  <input className="am-input" type="password" placeholder="Senha *" value={loginPwd} onChange={e=>setLoginPwd(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
                  <button className="am-submit" onClick={handleLogin}>Entrar</button>
                  {!hasAssoc && <p style={{fontSize:12,color:'#9ca3af',marginTop:8,textAlign:'center'}}>Primeiro acesso? Crie uma senha para cadastrar sua associação.</p>}
                </div>
              )}

              {tab==='edit' && authenticated && (
                <div>
                  <p style={{fontWeight:900,color:'#ea580c',fontSize:16,margin:'0 0 16px'}}>✏️ Editar Associação</p>
                  {saveMsg.text && <p className={saveMsg.type==='ok'?'am-msg-ok':'am-msg-err'}>{saveMsg.text}</p>}
                  <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Nome da Associação *</label>
                  <input className="am-input" placeholder="Ex: Associação de Moradores do Jardim Paraíso" value={form.assoc_name} onChange={e=>setForm(f=>({...f,assoc_name:e.target.value}))}/>
                  <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Nome do Presidente / Responsável *</label>
                  <input className="am-input" placeholder="Nome completo" value={form.president_name} onChange={e=>setForm(f=>({...f,president_name:e.target.value}))}/>
                  <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>WhatsApp / Telefone</label>
                  <input className="am-input" placeholder="(42) 99999-9999" value={form.contact_phone} onChange={e=>setForm(f=>({...f,contact_phone:e.target.value}))}/>
                  <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>E-mail de contato</label>
                  <input className="am-input" placeholder="associacao@email.com" value={form.contact_email} onChange={e=>setForm(f=>({...f,contact_email:e.target.value}))}/>
                  <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Endereço da sede</label>
                  <input className="am-input" placeholder="Rua, número, bairro" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/>
                  <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Descrição / Sobre a associação</label>
                  <textarea className="am-textarea" placeholder="Fale sobre a associação, atividades, missão..." value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
                  <label style={{fontSize:12,fontWeight:800,color:'#ea580c',display:'block',marginBottom:8}}>🏠 Espaço para Locação</label>
                  <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,cursor:'pointer'}}>
                    <input type="checkbox" checked={form.rental_available} onChange={e=>setForm(f=>({...f,rental_available:e.target.checked}))} style={{width:18,height:18}}/>
                    <span style={{fontSize:14,fontWeight:600,color:'#374151'}}>Possui espaço disponível para locação</span>
                  </label>
                  {form.rental_available && <>
                    <input className="am-input" placeholder="Dias disponíveis (ex: Sáb e Dom)" value={form.rental_days} onChange={e=>setForm(f=>({...f,rental_days:e.target.value}))}/>
                    <input className="am-input" placeholder="Preço (ex: R$ 200 por dia)" value={form.rental_price} onChange={e=>setForm(f=>({...f,rental_price:e.target.value}))}/>
                    <textarea className="am-textarea" placeholder="Detalhes do espaço (capacidade, estrutura...)" value={form.rental_description} onChange={e=>setForm(f=>({...f,rental_description:e.target.value}))}/>
                  </>}
                  <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>URL do logo/foto (opcional)</label>
                  <input className="am-input" placeholder="https://..." value={form.logo_url} onChange={e=>setForm(f=>({...f,logo_url:e.target.value}))}/>
                  <button className="am-submit" onClick={handleSave} disabled={saving}>{saving?'Salvando...':'💾 Salvar Associação'}</button>
                </div>
              )}

              {tab==='parceira' && authenticated && hasAssoc && (
                <div>
                  <div className="am-partner-badge">
                    <p style={{margin:'0 0 4px',fontSize:14,fontWeight:700}}>🤝 Programa Associação Parceira</p>
                    <p style={{margin:0,fontSize:12,opacity:0.9}}>Angarie patrocinadores do seu bairro e ganhe 50% da renda!</p>
                  </div>
                  <div className="am-partner-info">
                    <p style={{fontWeight:800,fontSize:14,color:'#1e40af',margin:'0 0 8px'}}>📋 Como funciona:</p>
                    <p style={{fontSize:13,color:'#1e3a8a',lineHeight:1.6,margin:'0 0 6px'}}>1. Cadastre seus dados de PIX abaixo e receba seu número de inscrição.</p>
                    <p style={{fontSize:13,color:'#1e3a8a',lineHeight:1.6,margin:'0 0 6px'}}>2. Indique ao patrocinador do bairro para usar seu código ao se cadastrar no site.</p>
                    <p style={{fontSize:13,color:'#1e3a8a',lineHeight:1.6,margin:'0 0 6px'}}>3. O administrador do site será notificado e realizará o PIX de 50% para sua conta.</p>
                    <p style={{fontSize:13,color:'#1e3a8a',lineHeight:1.6,margin:0}}>4. Quanto mais patrocinadores você indicar, mais você recebe!</p>
                  </div>
                  {partner && partner.registration_code && (
                    <div style={{background:'linear-gradient(135deg,#1e3a8a,#1e40af)',borderRadius:14,padding:16,marginBottom:14,textAlign:'center'}}>
                      <p style={{margin:'0 0 4px',fontSize:12,fontWeight:700,color:'#bfdbfe'}}>SEU NÚMERO DE INSCRIÇÃO</p>
                      <p className="am-partner-code">{partner.registration_code}</p>
                      <p style={{margin:0,fontSize:11,color:'#93c5fd'}}>Passe este código para os patrocinadores do seu bairro</p>
                    </div>
                  )}
                  <div style={{background:'#f8fafc',borderRadius:12,padding:14,border:'2px solid #e2e8f0',marginBottom:14}}>
                    <p style={{fontWeight:900,fontSize:15,color:'#1e40af',margin:'0 0 12px'}}>{partner ? '✏️ Atualizar Dados de Pagamento' : '📝 Cadastrar para Receber Comissão'}</p>
                    {partnerMsg.text && <p className={partnerMsg.type==='ok'?'am-msg-ok':'am-msg-err'}>{partnerMsg.text}</p>}
                    <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Tipo de Chave PIX *</label>
                    <select className="am-select" value={partnerForm.pix_type} onChange={e=>setPartnerForm(f=>({...f,pix_type:e.target.value}))}>
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                      <option value="Telefone">Telefone</option>
                      <option value="E-mail">E-mail</option>
                      <option value="Chave aleatória">Chave aleatória</option>
                    </select>
                    <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Chave PIX *</label>
                    <input className="am-input" placeholder="Ex: 999.999.999-99 ou email@..." value={partnerForm.pix_key} onChange={e=>setPartnerForm(f=>({...f,pix_key:e.target.value}))} style={{borderColor:'#3b82f6'}}/>
                    <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Nome do titular da conta *</label>
                    <input className="am-input" placeholder="Nome completo do titular" value={partnerForm.pix_owner} onChange={e=>setPartnerForm(f=>({...f,pix_owner:e.target.value}))} style={{borderColor:'#3b82f6'}}/>
                    <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Telefone / WhatsApp para contato sobre pagamento</label>
                    <input className="am-input" placeholder="(99) 99999-9999" value={partnerForm.commission_contact} onChange={e=>setPartnerForm(f=>({...f,commission_contact:e.target.value}))}/>
                    <button className="am-submit" onClick={handlePartnerSave} disabled={partnerSaving} style={{background:'linear-gradient(135deg,#1e3a8a,#3b82f6)'}}>
                      {partnerSaving ? 'Salvando...' : (partner ? '💾 Atualizar Dados' : '✅ Cadastrar e Gerar Código')}
                    </button>
                  </div>
                  <div style={{background:'#fef9c3',borderRadius:10,padding:12,border:'1px solid #fde047'}}>
                    <p style={{fontSize:12,color:'#713f12',margin:0,lineHeight:1.6}}>⚠️ <strong>Importante:</strong> Ao cadastrar um patrocinador, oriente-o a informar seu código de inscrição no campo indicado. Após a confirmação do pagamento, o administrador realizará o repasse de 50% para sua chave PIX cadastrada.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default AssociacaoModal
