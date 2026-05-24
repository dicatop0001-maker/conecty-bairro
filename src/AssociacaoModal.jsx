import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import ReactDOM from 'react-dom'

const amCss = `
.am-overlay { position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.75);z-index:8000;display:flex;align-items:flex-end;justify-content:center; }
.am-sheet { background:#fff;border-radius:22px 22px 0 0;width:100%;max-width:600px;max-height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 -8px 32px rgba(0,0,0,0.3);animation:am-up 0.3s ease; }
@keyframes am-up { from{transform:translateY(100%)} to{transform:translateY(0)} }
.am-head { background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);color:#fff;padding:16px 18px 14px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0; }
.am-head-title { font-size:18px;font-weight:900;margin:0; }
.am-head-sub { font-size:12px;opacity:0.85;margin:2px 0 0; }
.am-close { background:rgba(255,255,255,0.25);border:none;border-radius:50%;width:34px;height:34px;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff; }
.am-body { overflow-y:auto;flex:1;padding:16px; }
.am-section { background:#f8fafc;border-radius:14px;padding:14px 16px;margin-bottom:12px;border-left:4px solid #f97316; }
.am-section-title { font-size:13px;font-weight:900;color:#ea580c;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px; }
.am-info-row { display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;font-size:14px;color:#374151; }
.am-info-icon { font-size:16px;flex-shrink:0;margin-top:1px; }
.am-info-text { flex:1;line-height:1.4; }
.am-notice-item { background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:10px 12px;margin-bottom:8px; }
.am-notice-text { font-size:13px;color:#374151;line-height:1.5;margin:0 0 4px; }
.am-rental-card { background:linear-gradient(135deg,#fff7ed,#fef3c7);border:2px solid #f97316;border-radius:14px;padding:14px;margin-bottom:12px; }
.am-price-big { font-size:26px;font-weight:900;color:#ea580c;margin:4px 0; }
.am-wa-btn { display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;border:none;border-radius:14px;padding:13px;font-size:15px;font-weight:800;cursor:pointer;width:100%;margin-top:4px;text-decoration:none; }
.am-input { width:100%;padding:11px 13px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;box-sizing:border-box;margin-bottom:10px;outline:none; }
.am-input:focus { border-color:#f97316; }
.am-textarea { width:100%;padding:11px 13px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;box-sizing:border-box;margin-bottom:10px;resize:vertical;min-height:80px;outline:none; }
.am-textarea:focus { border-color:#f97316; }
.am-submit { width:100%;padding:14px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:800;cursor:pointer;margin-top:4px; }
.am-submit:disabled { background:#94a3b8;cursor:not-allowed; }
.am-submit-blue { width:100%;padding:14px;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:800;cursor:pointer;margin-top:4px; }
.am-submit-blue:disabled { background:#94a3b8;cursor:not-allowed; }
.am-tabs { display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap; }
.am-tab { flex:1;padding:9px 6px;border-radius:12px;border:2px solid #e2e8f0;background:#fff;font-size:12px;font-weight:700;cursor:pointer;text-align:center;color:#6b7280;min-width:60px; }
.am-tab.active { border-color:#f97316;background:#fff7ed;color:#ea580c; }
.am-tab.active-blue { border-color:#1e40af;background:#eff6ff;color:#1e40af; }
.am-msg-ok { color:#16a34a;font-weight:700;font-size:13px;padding:6px 0; }
.am-msg-err { color:#dc2626;font-weight:700;font-size:13px;padding:6px 0; }
.am-logo { width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #f97316;margin:0 auto 10px;display:block; }
.am-empty { text-align:center;padding:32px;color:#9ca3af; }
.am-code-box { background:linear-gradient(135deg,#1e3a8a,#1e40af);border-radius:16px;padding:20px;text-align:center;margin-bottom:16px; }
.am-code-num { font-size:30px;font-weight:900;letter-spacing:4px;color:#fbbf24;font-family:monospace;margin:8px 0; }
.am-select { width:100%;padding:11px 13px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;box-sizing:border-box;margin-bottom:10px;outline:none;background:#fff; }
`

function AssociacaoModal({ city, neighborhood, onClose }) {
  const [assoc, setAssoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('info')
  const [loginPwd, setLoginPwd] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loginMsg, setLoginMsg] = useState({ text: '', type: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState({ text: '', type: '' })
  const [noticeText, setNoticeText] = useState('')
  const [form, setForm] = useState({ assoc_name:'',president_name:'',contact_phone:'',contact_email:'',address:'',description:'',rental_available:false,rental_days:'',rental_price:'',rental_description:'',logo_url:'' })
  const [partner, setPartner] = useState(null)
  const [pForm, setPForm] = useState({ assoc_name:'',neighborhood:'',president_name:'',pix_type:'CPF',pix_key:'',pix_owner:'',commission_contact:'',email:'',pwd:'',pwd2:'' })
  const [pMsg, setPMsg] = useState({ text:'', type:'' })
  const [pSaving, setPSaving] = useState(false)
  const [pStep, setPStep] = useState('info')

  useEffect(() => { loadAssoc() }, [city, neighborhood])

  const loadAssoc = async () => {
    setLoading(true)
    const bairro = neighborhood || city
    const { data } = await supabase.from('associations').select('*').eq('neighborhood', bairro).limit(1)
    if (data && data.length > 0) {
      setAssoc(data[0])
      setForm({ assoc_name:data[0].assoc_name||'',president_name:data[0].president_name||'',contact_phone:data[0].contact_phone||'',contact_email:data[0].contact_email||'',address:data[0].address||'',description:data[0].description||'',rental_available:data[0].rental_available||false,rental_days:data[0].rental_days||'',rental_price:data[0].rental_price||'',rental_description:data[0].rental_description||'',logo_url:data[0].logo_url||'' })
    }
    setLoading(false)
  }

  const loadPartnerByEmail = async (email) => {
    const { data } = await supabase.from('partner_associations').select('*').eq('contact_email', email.trim().toLowerCase()).limit(1)
    return data && data.length > 0 ? data[0] : null
  }

  const handleLogin = async () => {
    setLoginMsg({ text:'', type:'' })
    if (!loginEmail || !loginPwd) { setLoginMsg({ text:'Preencha e-mail e senha.', type:'err' }); return }
    if (assoc && assoc.password && assoc.password.length > 0) {
      if (loginPwd !== assoc.password) { setLoginMsg({ text:'Senha incorreta.', type:'err' }); return }
    }
    setAuthenticated(true)
    setTab('edit')
  }

  const handleSave = async () => {
    if (!form.assoc_name.trim() || !form.president_name.trim()) { setSaveMsg({ text:'Nome da associacao e presidente sao obrigatorios!', type:'err' }); return }
    setSaving(true)
    const bairro = neighborhood || city
    const payload = { ...form, city, neighborhood:bairro, password:loginPwd, updated_at:new Date().toISOString() }
    let error
    if (assoc && assoc.id) { const r = await supabase.from('associations').update(payload).eq('id', assoc.id); error = r.error }
    else { const r = await supabase.from('associations').insert({ ...payload, created_at:new Date().toISOString() }); error = r.error }
    setSaving(false)
    if (error) { setSaveMsg({ text:'Erro: '+error.message, type:'err' }) }
    else { setSaveMsg({ text:'Salvo com sucesso!', type:'ok' }); await loadAssoc(); setTab('info') }
  }

  const handleAddNotice = async () => {
    if (!noticeText.trim()) return
    const current = (assoc && assoc.notices) ? assoc.notices : []
    const updated = [...current, { text:noticeText.trim(), date:new Date().toISOString() }]
    const { error } = await supabase.from('associations').update({ notices:updated, updated_at:new Date().toISOString() }).eq('id', assoc.id)
    if (!error) { setNoticeText(''); await loadAssoc() }
  }

  const handleDeleteNotice = async (idx) => {
    const current = [...(assoc.notices || [])]
    current.splice(idx, 1)
    await supabase.from('associations').update({ notices:current }).eq('id', assoc.id)
    await loadAssoc()
  }

  const handleParceiraCadastro = async () => {
    setPMsg({ text:'', type:'' })
    const f = pForm
    if (!f.assoc_name.trim()) { setPMsg({ text:'Nome da associacao obrigatorio.', type:'err' }); return }
    if (!f.neighborhood.trim()) { setPMsg({ text:'Nome do bairro obrigatorio.', type:'err' }); return }
    if (!f.president_name.trim()) { setPMsg({ text:'Nome do presidente obrigatorio.', type:'err' }); return }
    if (!f.pix_key.trim() || !f.pix_owner.trim()) { setPMsg({ text:'Chave PIX e titular obrigatorios.', type:'err' }); return }
    if (!f.commission_contact.trim()) { setPMsg({ text:'Telefone de contato obrigatorio.', type:'err' }); return }
    if (!f.email.trim()) { setPMsg({ text:'E-mail obrigatorio.', type:'err' }); return }
    if (!f.pwd.trim() || f.pwd.length < 6) { setPMsg({ text:'Senha deve ter pelo menos 6 caracteres.', type:'err' }); return }
    if (f.pwd !== f.pwd2) { setPMsg({ text:'As senhas nao conferem.', type:'err' }); return }
    setPSaving(true)
    const existing = await loadPartnerByEmail(f.email)
    if (existing) { setPartner(existing); setPStep('code'); setPSaving(false); return }
    const code = 'ASSOC-' + Math.random().toString(36).substr(2,6).toUpperCase()
    const payload = { association_id: assoc ? assoc.id : null, assoc_name:f.assoc_name.trim(), neighborhood:f.neighborhood.trim(), city:city||'', registration_code:code, pix_key:f.pix_key.trim(), pix_owner:f.pix_owner.trim(), pix_type:f.pix_type, commission_contact:f.commission_contact.trim(), contact_email:f.email.trim().toLowerCase(), pwd_hash:f.pwd, status:'active', total_sponsors:0, total_commission:0, created_at:new Date().toISOString(), updated_at:new Date().toISOString() }
    const { data:ins, error } = await supabase.from('partner_associations').insert(payload).select().single()
    setPSaving(false)
    if (error) { setPMsg({ text:'Erro ao cadastrar: '+error.message, type:'err' }) }
    else { setPartner(ins || { registration_code:code, assoc_name:f.assoc_name.trim(), pix_key:f.pix_key.trim(), pix_owner:f.pix_owner.trim(), pix_type:f.pix_type, neighborhood:f.neighborhood.trim(), commission_contact:f.commission_contact.trim() }); setPStep('code') }
  }

  const handleParceiraLogin = async () => {
    setPMsg({ text:'', type:'' })
    if (!pForm.email.trim() || !pForm.pwd.trim()) { setPMsg({ text:'Preencha e-mail e senha.', type:'err' }); return }
    setPSaving(true)
    const found = await loadPartnerByEmail(pForm.email)
    setPSaving(false)
    if (!found) { setPMsg({ text:'Cadastro nao encontrado para este e-mail.', type:'err' }); return }
    if (found.pwd_hash !== pForm.pwd) { setPMsg({ text:'Senha incorreta.', type:'err' }); return }
    setPartner(found); setPStep('code')
  }

  const bairro = neighborhood || city
  const hasAssoc = assoc && assoc.assoc_name

  return ReactDOM.createPortal(
    <div className="am-overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div className="am-sheet" onClick={e=>e.stopPropagation()}>
        <style>{amCss}</style>
        <div className="am-head">
          <div>
            <p className="am-head-title">{hasAssoc ? assoc.assoc_name : 'Associação de Moradores'}</p>
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
                <button className={'am-tab'+(tab==='info'?' active':'')} onClick={()=>setTab('info')}>📋 Info</button>
                {hasAssoc && <button className={'am-tab'+(tab==='avisos'?' active':'')} onClick={()=>setTab('avisos')}>📢 Avisos</button>}
                {hasAssoc && assoc.rental_available && <button className={'am-tab'+(tab==='aluguel'?' active':'')} onClick={()=>setTab('aluguel')}>🏠 Aluguel</button>}
                <button className={'am-tab'+(tab==='login'?' active':'')} onClick={()=>setTab(authenticated?'edit':'login')}>⚙️ {authenticated?'Editar':'Entrar'}</button>
                <button
                  className={'am-tab'+(tab==='parceira'?' active':'')}
                  onClick={()=>setTab('parceira')}
                  style={{background:tab==='parceira'?'linear-gradient(135deg,#1e3a8a,#3b82f6)':'#fff7ed',color:tab==='parceira'?'#fff':'#ea580c',borderColor:tab==='parceira'?'#1e40af':'#f97316',fontWeight:900}}
                >🤝 Parceira</button>
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
                    {assoc.description && <div className="am-section"><p className="am-section-title">📝 Sobre</p><p style={{margin:0,fontSize:14,color:'#374151',lineHeight:1.6}}>{assoc.description}</p></div>}
                    <div className="am-section">
                      <p className="am-section-title">👤 Responsável</p>
                      <div className="am-info-row"><span className="am-info-icon">🧑‍💼</span><span className="am-info-text">{assoc.president_name}</span></div>
                      {assoc.contact_phone && <div className="am-info-row"><span className="am-info-icon">📱</span><span className="am-info-text">{assoc.contact_phone}</span></div>}
                      {assoc.contact_email && <div className="am-info-row"><span className="am-info-icon">✉️</span><span className="am-info-text">{assoc.contact_email}</span></div>}
                    </div>
                    {assoc.address && <div className="am-section"><p className="am-section-title">📍 Endereço</p><div className="am-info-row"><span className="am-info-icon">🗺️</span><span className="am-info-text">{assoc.address}</span></div><a href={'https://www.google.com/maps/search/'+encodeURIComponent(assoc.address+', '+city)} target="_blank" rel="noopener noreferrer" style={{display:'inline-block',marginTop:6,padding:'6px 14px',background:'#1e3a8a',color:'#fff',borderRadius:8,fontSize:12,fontWeight:700,textDecoration:'none'}}>Ver no mapa 🗺️</a></div>}
                    {assoc.contact_phone && <a href={'https://wa.me/55'+assoc.contact_phone.replace(/\D/g,'')} target="_blank" rel="noopener noreferrer" className="am-wa-btn">💬 Falar com a Associação</a>}
                  </div>
                )
              )}

              {tab==='avisos' && (
                <div>
                  {authenticated && <div style={{marginBottom:16,background:'#fff7ed',borderRadius:12,padding:12,border:'2px solid #fed7aa'}}><p style={{fontWeight:800,fontSize:13,color:'#ea580c',margin:'0 0 8px'}}>➕ Novo Aviso</p><textarea className="am-textarea" placeholder="Escreva o aviso aqui..." value={noticeText} onChange={e=>setNoticeText(e.target.value)}/><button className="am-submit" onClick={handleAddNotice} style={{marginTop:0}}>Publicar Aviso</button></div>}
                  {(!assoc||!assoc.notices||assoc.notices.length===0) ? <div className="am-empty"><p>Nenhum aviso publicado.</p></div> : [...(assoc.notices||[])].reverse().map((n,i)=><div key={i} className="am-notice-item"><p className="am-notice-text">{n.text||n}</p><p style={{fontSize:11,color:'#9ca3af',margin:'4px 0 0'}}>{n.date?new Date(n.date).toLocaleString('pt-BR'):''}</p>{authenticated&&<button onClick={()=>handleDeleteNotice(assoc.notices.length-1-i)} style={{marginTop:6,padding:'4px 10px',background:'#fee2e2',border:'none',borderRadius:6,fontSize:11,color:'#dc2626',cursor:'pointer',fontWeight:700}}>🗑 Remover</button>}</div>)}
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
                  {assoc.contact_phone && <a href={'https://wa.me/55'+assoc.contact_phone.replace(/\D/g,'')+'?text=Ola!%20Gostaria%20de%20saber%20sobre%20o%20aluguel.'} target="_blank" rel="noopener noreferrer" className="am-wa-btn">💬 Solicitar Reserva via WhatsApp</a>}
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
                  <textarea className="am-textarea" placeholder="Fale sobre a associação..." value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
                  <label style={{fontSize:12,fontWeight:800,color:'#ea580c',display:'block',marginBottom:8}}>🏠 Espaço para Locação</label>
                  <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,cursor:'pointer'}}><input type="checkbox" checked={form.rental_available} onChange={e=>setForm(f=>({...f,rental_available:e.target.checked}))} style={{width:18,height:18}}/><span style={{fontSize:14,fontWeight:600,color:'#374151'}}>Possui espaço disponível para locação</span></label>
                  {form.rental_available && <><input className="am-input" placeholder="Dias disponíveis (ex: Sáb e Dom)" value={form.rental_days} onChange={e=>setForm(f=>({...f,rental_days:e.target.value}))}/><input className="am-input" placeholder="Preço (ex: R$ 200 por dia)" value={form.rental_price} onChange={e=>setForm(f=>({...f,rental_price:e.target.value}))}/><textarea className="am-textarea" placeholder="Detalhes do espaço..." value={form.rental_description} onChange={e=>setForm(f=>({...f,rental_description:e.target.value}))}/></>}
                  <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>URL do logo/foto (opcional)</label>
                  <input className="am-input" placeholder="https://..." value={form.logo_url} onChange={e=>setForm(f=>({...f,logo_url:e.target.value}))}/>
                  <button className="am-submit" onClick={handleSave} disabled={saving}>{saving?'Salvando...':'💾 Salvar Associação'}</button>
                </div>
              )}

              {tab==='parceira' && (
                <div>
                  {pStep==='info' && (
                    <div>
                      <div style={{background:'linear-gradient(135deg,#1e3a8a,#1e40af)',borderRadius:16,padding:20,marginBottom:16,textAlign:'center',color:'#fff'}}>
                        <p style={{fontSize:22,fontWeight:900,margin:'0 0 6px'}}>🤝 Associação Parceira</p>
                        <p style={{fontSize:14,opacity:0.9,margin:0}}>Ganhe <strong>50% da renda</strong> de cada patrocinador que você cadastrar no Conecty Bairro!</p>
                      </div>
                      <div style={{background:'#eff6ff',border:'2px solid #3b82f6',borderRadius:14,padding:16,marginBottom:14}}>
                        <p style={{fontWeight:900,fontSize:15,color:'#1e40af',margin:'0 0 12px'}}>📋 Como funciona:</p>
                        <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
                          <div style={{background:'#1e40af',color:'#fff',borderRadius:'50%',width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,flexShrink:0,fontSize:14}}>1</div>
                          <p style={{margin:0,fontSize:13,color:'#1e3a8a',lineHeight:1.6}}>Cadastre sua associação no programa e receba seu <strong>número de inscrição único</strong>.</p>
                        </div>
                        <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
                          <div style={{background:'#1e40af',color:'#fff',borderRadius:'50%',width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,flexShrink:0,fontSize:14}}>2</div>
                          <p style={{margin:0,fontSize:13,color:'#1e3a8a',lineHeight:1.6}}>Indique comércios do seu bairro e peça para usarem seu número ao se cadastrar como patrocinador.</p>
                        </div>
                        <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
                          <div style={{background:'#1e40af',color:'#fff',borderRadius:'50%',width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,flexShrink:0,fontSize:14}}>3</div>
                          <p style={{margin:0,fontSize:13,color:'#1e3a8a',lineHeight:1.6}}>O administrador recebe a notificação e faz o PIX de <strong>50% do plano</strong> para sua conta cadastrada.</p>
                        </div>
                        <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                          <div style={{background:'#1e40af',color:'#fff',borderRadius:'50%',width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,flexShrink:0,fontSize:14}}>4</div>
                          <p style={{margin:0,fontSize:13,color:'#1e3a8a',lineHeight:1.6}}>6 patrocinadores = <strong>6 comissões de 50%!</strong> Quanto mais indicar, mais recebe.</p>
                        </div>
                      </div>
                      <div style={{background:'#f0fdf4',border:'2px solid #86efac',borderRadius:12,padding:14,marginBottom:16}}>
                        <p style={{fontWeight:800,color:'#15803d',fontSize:14,margin:'0 0 8px'}}>💰 Sua comissão por patrocinador indicado:</p>
                        <p style={{fontSize:14,color:'#374151',margin:'0 0 6px'}}>Plano Mensal (R$ 50,00) → <strong style={{color:'#15803d',fontSize:16}}>R$ 25,00 para você</strong></p>
                        <p style={{fontSize:14,color:'#374151',margin:0}}>Plano Anual (R$ 400,00) → <strong style={{color:'#15803d',fontSize:16}}>R$ 200,00 para você</strong></p>
                      </div>
                      <button className="am-submit-blue" style={{marginBottom:10}} onClick={()=>setPStep('form')}>✅ Quero me cadastrar no programa!</button>
                      <button onClick={()=>setPStep('login')} style={{width:'100%',padding:'12px',background:'none',border:'2px solid #3b82f6',color:'#3b82f6',borderRadius:12,fontWeight:700,cursor:'pointer',fontSize:14}}>Já sou parceiro - Ver meu código</button>
                    </div>
                  )}

                  {pStep==='login' && !partner && (
                    <div>
                      <button onClick={()=>setPStep('info')} style={{background:'none',border:'none',color:'#3b82f6',fontWeight:700,fontSize:13,cursor:'pointer',padding:'0 0 12px',display:'block'}}>← Voltar</button>
                      <div style={{background:'linear-gradient(135deg,#1e3a8a,#1e40af)',borderRadius:14,padding:16,marginBottom:16,textAlign:'center',color:'#fff'}}>
                        <p style={{fontWeight:900,fontSize:17,margin:'0 0 4px'}}>🔐 Acesso Parceira</p>
                        <p style={{fontSize:12,opacity:0.85,margin:0}}>Entre com seu e-mail e senha para ver seu código de inscrição.</p>
                      </div>
                      {pMsg.text && <p className={pMsg.type==='ok'?'am-msg-ok':'am-msg-err'}>{pMsg.text}</p>}
                      <input className="am-input" type="email" placeholder="Seu e-mail de cadastro *" value={pForm.email} onChange={e=>setPForm(f=>({...f,email:e.target.value}))}/>
                      <input className="am-input" type="password" placeholder="Sua senha *" value={pForm.pwd} onChange={e=>setPForm(f=>({...f,pwd:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&handleParceiraLogin()}/>
                      <button className="am-submit-blue" onClick={handleParceiraLogin} disabled={pSaving}>{pSaving?'Verificando...':'Entrar e ver meu código'}</button>
                      <button onClick={()=>setPStep('form')} style={{marginTop:10,width:'100%',padding:'12px',background:'none',border:'2px solid #f97316',color:'#ea580c',borderRadius:12,fontWeight:700,cursor:'pointer',fontSize:14}}>Ainda não sou parceiro → Cadastrar agora</button>
                    </div>
                  )}

                  {pStep==='form' && (
                    <div>
                      <button onClick={()=>setPStep('info')} style={{background:'none',border:'none',color:'#3b82f6',fontWeight:700,fontSize:13,cursor:'pointer',padding:'0 0 12px',display:'block'}}>← Voltar</button>
                      <p style={{fontWeight:900,color:'#1e40af',fontSize:16,margin:'0 0 4px'}}>📝 Cadastro Associação Parceira</p>
                      <p style={{fontSize:12,color:'#6b7280',margin:'0 0 16px'}}>Preencha os dados e receba seu número de inscrição na hora.</p>
                      {pMsg.text && <p className={pMsg.type==='ok'?'am-msg-ok':'am-msg-err'}>{pMsg.text}</p>}
                      <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Nome da Associação *</label>
                      <input className="am-input" placeholder="Ex: Associação Jardim Paraíso" value={pForm.assoc_name} onChange={e=>setPForm(f=>({...f,assoc_name:e.target.value}))} style={{borderColor:'#3b82f6'}}/>
                      <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Bairro *</label>
                      <input className="am-input" placeholder="Nome do bairro" value={pForm.neighborhood} onChange={e=>setPForm(f=>({...f,neighborhood:e.target.value}))} style={{borderColor:'#3b82f6'}}/>
                      <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Nome do Presidente / Responsável *</label>
                      <input className="am-input" placeholder="Nome completo" value={pForm.president_name} onChange={e=>setPForm(f=>({...f,president_name:e.target.value}))}/>
                      <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Tipo de Chave PIX para receber comissão *</label>
                      <select className="am-select" value={pForm.pix_type} onChange={e=>setPForm(f=>({...f,pix_type:e.target.value}))}><option value="CPF">CPF</option><option value="CNPJ">CNPJ</option><option value="Telefone">Telefone</option><option value="E-mail">E-mail</option><option value="Chave aleatória">Chave aleatória</option></select>
                      <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Chave PIX *</label>
                      <input className="am-input" placeholder="Sua chave PIX" value={pForm.pix_key} onChange={e=>setPForm(f=>({...f,pix_key:e.target.value}))} style={{borderColor:'#3b82f6'}}/>
                      <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Nome do titular da conta PIX *</label>
                      <input className="am-input" placeholder="Nome completo do titular" value={pForm.pix_owner} onChange={e=>setPForm(f=>({...f,pix_owner:e.target.value}))} style={{borderColor:'#3b82f6'}}/>
                      <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>WhatsApp para contato sobre pagamento *</label>
                      <input className="am-input" placeholder="(99) 99999-9999" value={pForm.commission_contact} onChange={e=>setPForm(f=>({...f,commission_contact:e.target.value}))}/>
                      <div style={{background:'#f0f9ff',borderRadius:10,padding:12,border:'2px solid #bae6fd',marginBottom:12}}>
                        <p style={{fontWeight:800,color:'#0369a1',fontSize:13,margin:'0 0 10px'}}>🔒 Crie seu acesso (para consultar seu código depois):</p>
                        <input className="am-input" type="email" placeholder="Seu e-mail *" value={pForm.email} onChange={e=>setPForm(f=>({...f,email:e.target.value}))} style={{marginBottom:8}}/>
                        <input className="am-input" type="password" placeholder="Crie uma senha (mín. 6 caracteres) *" value={pForm.pwd} onChange={e=>setPForm(f=>({...f,pwd:e.target.value}))} style={{marginBottom:8}}/>
                        <input className="am-input" type="password" placeholder="Confirme a senha *" value={pForm.pwd2} onChange={e=>setPForm(f=>({...f,pwd2:e.target.value}))} style={{marginBottom:0}}/>
                      </div>
                      <button className="am-submit-blue" onClick={handleParceiraCadastro} disabled={pSaving}>{pSaving?'Cadastrando...':'✅ Cadastrar e Gerar Número de Inscrição'}</button>
                    </div>
                  )}

                  {pStep==='code' && partner && (
                    <div>
                      <div className="am-code-box">
                        <p style={{margin:'0 0 4px',fontSize:11,fontWeight:700,color:'#bfdbfe',textTransform:'uppercase',letterSpacing:2}}>SEU NÚMERO DE INSCRIÇÃO</p>
                        <p className="am-code-num">{partner.registration_code}</p>
                        <p style={{margin:0,fontSize:12,color:'#93c5fd'}}>Guarde este número — informe ao patrocinador e ao administrador</p>
                      </div>
                      <div style={{background:'#f8fafc',borderRadius:12,padding:14,border:'2px solid #e2e8f0',marginBottom:14}}>
                        <p style={{fontWeight:800,fontSize:14,color:'#374151',margin:'0 0 10px'}}>📋 Dados do cadastro:</p>
                        <div className="am-info-row"><span className="am-info-icon">🏘️</span><span className="am-info-text"><strong>Associação:</strong> {partner.assoc_name}</span></div>
                        <div className="am-info-row"><span className="am-info-icon">📍</span><span className="am-info-text"><strong>Bairro:</strong> {partner.neighborhood}</span></div>
                        <div className="am-info-row"><span className="am-info-icon">💰</span><span className="am-info-text"><strong>PIX ({partner.pix_type}):</strong> {partner.pix_key}</span></div>
                        <div className="am-info-row"><span className="am-info-icon">👤</span><span className="am-info-text"><strong>Titular:</strong> {partner.pix_owner}</span></div>
                        {partner.commission_contact && <div className="am-info-row"><span className="am-info-icon">📱</span><span className="am-info-text"><strong>Contato:</strong> {partner.commission_contact}</span></div>}
                        {partner.total_sponsors > 0 && <div className="am-info-row"><span className="am-info-icon">⭐</span><span className="am-info-text"><strong>Patrocinadores indicados:</strong> {partner.total_sponsors} | Comissão acumulada: R$ {(partner.total_commission||0).toFixed(2)}</span></div>}
                      </div>
                      <div style={{background:'#fef9c3',borderRadius:12,padding:14,border:'2px solid #fde047',marginBottom:14}}>
                        <p style={{fontWeight:800,color:'#713f12',fontSize:14,margin:'0 0 8px'}}>💡 Como usar seu número:</p>
                        <p style={{fontSize:13,color:'#92400e',margin:'0 0 6px',lineHeight:1.6}}><strong>1.</strong> Apresente o Conecty Bairro aos comércios do seu bairro</p>
                        <p style={{fontSize:13,color:'#92400e',margin:'0 0 6px',lineHeight:1.6}}><strong>2.</strong> Peça para o patrocinador informar o código <strong style={{fontFamily:'monospace',fontSize:15,color:'#1e40af'}}>{partner.registration_code}</strong> no campo “Código Associação Parceira” ao se cadastrar</p>
                        <p style={{fontSize:13,color:'#92400e',margin:0,lineHeight:1.6}}><strong>3.</strong> O admin do site recebe a notificação e faz o PIX de <strong>50%</strong> para: <strong>{partner.pix_key}</strong></p>
                      </div>
                      {partner.commission_contact && <a href={'https://wa.me/55'+partner.commission_contact.replace(/\D/g,'')+'?text=Meu+c%C3%B3digo+Associa%C3%A7%C3%A3o+Parceira+Conecty+Bairro:+'+partner.registration_code} target="_blank" rel="noopener noreferrer" className="am-wa-btn" style={{marginBottom:10}}>💬 Compartilhar meu código via WhatsApp</a>}
                      <button onClick={()=>{setPartner(null);setPForm(f=>({...f,email:'',pwd:'',pwd2:''}));setPStep('login')}} style={{width:'100%',padding:'12px',background:'none',border:'2px solid #94a3b8',color:'#64748b',borderRadius:12,fontWeight:700,cursor:'pointer',fontSize:13}}>🔄 Sair / Trocar conta</button>
                    </div>
                  )}
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
