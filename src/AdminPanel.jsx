import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { supabase } from './supabaseClient'

const ADMIN_EMAIL = 'dicatop0001@gmail.com'

const S = {
  overlay: { position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:99999,display:'flex',alignItems:'flex-end',justifyContent:'center' },
  panel: { background:'#fff',borderRadius:'22px 22px 0 0',width:'100%',maxWidth:'720px',maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 -8px 40px rgba(0,0,0,0.4)' },
  header: { background:'linear-gradient(135deg,#1e3a8a,#1d4ed8)',borderRadius:'22px 22px 0 0',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 },
  tabs: { display:'flex',gap:'4px',padding:'10px 14px',background:'#f1f5f9',borderBottom:'1px solid #e2e8f0',flexShrink:0,overflowX:'auto' },
  tab: (active,color) => ({ padding:'7px 12px',borderRadius:'20px',border:'none',cursor:'pointer',fontWeight:'700',fontSize:'12px',whiteSpace:'nowrap',background:active?color:'#e2e8f0',color:active?'#fff':'#4b5563',transition:'all 0.15s' }),
  body: { flex:1,overflowY:'auto',padding:'12px 16px',WebkitOverflowScrolling:'touch' },
  card: (border) => ({ background:'#f8fafc',border:'2px solid '+(border||'#e2e8f0'),borderRadius:'14px',padding:'12px 14px',marginBottom:'10px',display:'flex',gap:'12px',alignItems:'center' }),
  btnDel: { padding:'7px 14px',background:'#dc2626',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'800',fontSize:'12px',whiteSpace:'nowrap' },
  btnOk: { padding:'7px 14px',background:'#16a34a',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'800',fontSize:'12px',whiteSpace:'nowrap' },
  btnEdit: { padding:'7px 14px',background:'#f59e0b',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'800',fontSize:'12px',whiteSpace:'nowrap' },
  btnBlock: { padding:'7px 14px',background:'#7c3aed',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'800',fontSize:'12px',whiteSpace:'nowrap' },
  closeBtn: { background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',fontSize:'18px',borderRadius:'50%',width:'34px',height:'34px',cursor:'pointer',fontWeight:'700',flexShrink:0 },
  msg: (ok) => ({ background:ok?'#f0fdf4':'#fef2f2',border:'1px solid '+(ok?'#86efac':'#fca5a5'),borderRadius:'8px',padding:'9px 14px',fontSize:'13px',color:ok?'#15803d':'#dc2626',marginBottom:'10px',fontWeight:'700',textAlign:'center' }),
  empty: { textAlign:'center',padding:'40px 20px',color:'#94a3b8' },
  input: { width:'100%',padding:'9px 12px',border:'2px solid #e2e8f0',borderRadius:'8px',fontSize:'13px',boxSizing:'border-box',marginBottom:'8px',outline:'none' },
}

// Confirm dialog rendered in its OWN portal at z-index 199999
// This way it sits ABOVE the admin overlay and clicks don't bubble to onClose
function ConfirmDialog({ msg, onYes, onNo }) {
  return ReactDOM.createPortal(
    <div
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:199999,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}
      onClick={e => e.stopPropagation()}
    >
      <div style={{background:'#fff',borderRadius:'16px',padding:'24px',maxWidth:'340px',width:'100%',textAlign:'center',boxShadow:'0 8px 32px rgba(0,0,0,0.35)'}}>
        <div style={{fontSize:'36px',marginBottom:'10px'}}>⚠️</div>
        <p style={{fontSize:'15px',fontWeight:'700',color:'#1e293b',marginBottom:'20px',lineHeight:'1.4'}}>{msg}</p>
        <div style={{display:'flex',gap:'10px'}}>
          <button onClick={e=>{e.stopPropagation();onNo()}} style={{flex:1,padding:'12px',background:'#f1f5f9',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'700',fontSize:'14px'}}>Cancelar</button>
          <button onClick={e=>{e.stopPropagation();onYes()}} style={{flex:2,padding:'12px',background:'#dc2626',color:'#fff',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'800',fontSize:'14px'}}>✅ Confirmar</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

function AdminPanel({ onClose, adminUser }) {
  const [tab, setTab] = useState('anuncios')
  const [data, setData] = useState({ anuncios:[], leiloes:[], sponsors:[], pros:[], blocked:[] })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [editSp, setEditSp] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [blockInput, setBlockInput] = useState('')

  const isAdmin = adminUser && adminUser.email === ADMIN_EMAIL
  if (!isAdmin) return null

  const showMsg = (text, ok=true) => {
    setMsg({text,ok})
    setTimeout(()=>setMsg(null),4000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const [an, le, sp, pr, bl] = await Promise.all([
        supabase.from('auctions').select('*').eq('tipo','anuncio').order('created_at',{ascending:false}),
        supabase.from('auctions').select('*').neq('tipo','anuncio').order('created_at',{ascending:false}),
        supabase.from('sponsors').select('*').order('created_at',{ascending:false}),
        supabase.from('professionals').select('*').order('created_at',{ascending:false}),
        supabase.from('blocked_users').select('*').order('created_at',{ascending:false}),
      ])
      setData({
        anuncios: an.data||[],
        leiloes: le.data||[],
        sponsors: sp.data||[],
        pros: pr.data||[],
        blocked: bl.data||[],
      })
    } catch(e){
      showMsg('Erro ao carregar: '+e.message, false)
    }
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  // Delete auction or anuncio: first remove bids (lances) then delete the item
  const delAuction = (id, label) => {
    setConfirm({
      msg: 'Excluir este ' + label + ' permanentemente? Todos os lances também serão removidos.',
      onYes: async () => {
        setConfirm(null)
        setSaving(true)
        // Step 1: delete bids first (foreign key constraint)
        const { error: bidsErr } = await supabase.from('bids').delete().eq('auction_id', id)
        if (bidsErr) {
          setSaving(false)
          showMsg('Erro ao remover lances: ' + bidsErr.message, false)
          return
        }
        // Step 2: delete contact_unlocks (foreign key constraint)
        const { error: unlockErr } = await supabase.from('contact_unlocks').delete().eq('auction_id', id)
        if (unlockErr) {
          setSaving(false)
          showMsg('Erro ao remover desbloqueios: ' + unlockErr.message, false)
          return
        }
        // Step 3: delete messages (foreign key constraint)
        const { error: msgErr } = await supabase.from('messages').delete().eq('auction_id', id)
        if (msgErr) {
          setSaving(false)
          showMsg('Erro ao remover mensagens: ' + msgErr.message, false)
          return
        }
        // Step 4: delete the auction/anuncio
        const { error } = await supabase.from('auctions').delete().eq('id', id)
        setSaving(false)
        if (error) showMsg('Erro: ' + error.message, false)
        else { showMsg(label + ' excluído com sucesso! ✅'); load() }
      },
      onNo: () => setConfirm(null)
    })
  }

  // Delete any other table (sponsors, professionals, blocked_users)
  const del = (table, id, label) => {
    setConfirm({
      msg: 'Excluir este ' + label + ' permanentemente?',
      onYes: async () => {
        setConfirm(null)
        setSaving(true)
        const { error } = await supabase.from(table).delete().eq('id', id)
        setSaving(false)
        if (error) showMsg('Erro: ' + error.message, false)
        else { showMsg(label + ' excluído! ✅'); load() }
      },
      onNo: () => setConfirm(null)
    })
  }

  const blockUser = (userId, email) => {
    if (!userId && !email) { showMsg('ID ou e-mail inválido', false); return }
    setConfirm({
      msg: 'Bloquear usuário ' + (email || userId) + '?',
      onYes: async () => {
        setConfirm(null)
        setSaving(true)
        const { error } = await supabase.from('blocked_users').upsert({
          user_id: userId || null,
          email: email || null,
          blocked_at: new Date().toISOString(),
          blocked_by: ADMIN_EMAIL
        })
        setSaving(false)
        if (error) showMsg('Erro ao bloquear: ' + error.message, false)
        else { showMsg('Usuário bloqueado! 🚫'); setBlockInput(''); load() }
      },
      onNo: () => setConfirm(null)
    })
  }

  const unblock = (id, label) => {
    setConfirm({
      msg: 'Desbloquear ' + label + '?',
      onYes: async () => {
        setConfirm(null)
        setSaving(true)
        const { error } = await supabase.from('blocked_users').delete().eq('id', id)
        setSaving(false)
        if (error) showMsg('Erro: ' + error.message, false)
        else { showMsg('Usuário desbloqueado! ✅'); load() }
      },
      onNo: () => setConfirm(null)
    })
  }

  const approveSponsor = async (sp) => {
    setSaving(true)
    const { error } = await supabase.from('sponsors').update({ status:'active', approved_at: new Date().toISOString() }).eq('id', sp.id)
    setSaving(false)
    if (error) showMsg('Erro: ' + error.message, false)
    else { showMsg('Patrocinador aprovado! ✅'); load() }
  }

  const saveEditSponsor = async () => {
    setSaving(true)
    const { error } = await supabase.from('sponsors').update({
      sponsor_name: editForm.sponsor_name,
      contact_email: editForm.contact_email,
      contact_phone: editForm.contact_phone,
      link_url: editForm.link_url,
      offer_text: editForm.offer_text,
      status: editForm.status
    }).eq('id', editForm.id)
    setSaving(false)
    if (error) showMsg('Erro: ' + error.message, false)
    else { showMsg('Patrocinador salvo! ✅'); setEditSp(null); load() }
  }

  const fmt = (d) => d ? new Date(d).toLocaleString('pt-BR', {day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—'

  const TABS = [
    { v:'anuncios', l:'📢 Anúncios',  c:'#f97316' },
    { v:'leiloes',  l:'🔨 Leilões',   c:'#16a34a' },
    { v:'sponsors', l:'⭐ Patrocin.',  c:'#1e40af' },
    { v:'pros',     l:'👷 Profissio.', c:'#7c3aed' },
    { v:'blocked',  l:'🚫 Bloqueados', c:'#dc2626' },
  ]

  const counts = {
    anuncios: data.anuncios.length,
    leiloes:  data.leiloes.length,
    sponsors: data.sponsors.length,
    pros:     data.pros.length,
    blocked:  data.blocked.length,
  }

  // EDIT SPONSOR MODAL — own portal above admin panel
  const editModal = editSp ? ReactDOM.createPortal(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',zIndex:199999,display:'flex',alignItems:'center',justifyContent:'center',padding:'12px'}}
      onClick={e=>e.stopPropagation()}>
      <div style={{background:'#fff',borderRadius:'20px',padding:'22px',maxWidth:'480px',width:'100%',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.4)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
          <h2 style={{margin:0,color:'#1e3a8a',fontSize:'17px'}}>✏️ Editar Patrocinador</h2>
          <button onClick={()=>setEditSp(null)} style={{background:'none',border:'none',fontSize:'22px',cursor:'pointer'}}>✕</button>
        </div>
        {[
          {k:'sponsor_name',  l:'Nome do negócio'},
          {k:'contact_email', l:'E-mail'},
          {k:'contact_phone', l:'Telefone/WhatsApp'},
          {k:'link_url',      l:'URL site/rede'},
        ].map(f=>(
          <div key={f.k}>
            <label style={{fontSize:'11px',fontWeight:'700',color:'#374151',display:'block',marginBottom:'2px'}}>{f.l}</label>
            <input style={S.input} value={editForm[f.k]||''} onChange={e=>setEditForm(p=>({...p,[f.k]:e.target.value}))} />
          </div>
        ))}
        <label style={{fontSize:'11px',fontWeight:'700',color:'#374151',display:'block',marginBottom:'2px'}}>Ofertas (uma por linha)</label>
        <textarea style={{...S.input,resize:'vertical'}} rows={3} value={editForm.offer_text||''} onChange={e=>setEditForm(p=>({...p,offer_text:e.target.value}))} />
        <label style={{fontSize:'11px',fontWeight:'700',color:'#374151',display:'block',marginBottom:'2px'}}>Status</label>
        <select style={S.input} value={editForm.status||'pending'} onChange={e=>setEditForm(p=>({...p,status:e.target.value}))}>
          <option value='pending'>⏳ Aguardando aprovação</option>
          <option value='active'>✅ Ativo/Publicado</option>
          <option value='inactive'>❌ Inativo</option>
        </select>
        <div style={{display:'flex',gap:'10px',marginTop:'6px'}}>
          <button onClick={()=>setEditSp(null)} style={{flex:1,padding:'11px',background:'#f1f5f9',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'700'}}>Cancelar</button>
          <button onClick={saveEditSponsor} disabled={saving} style={{flex:2,padding:'11px',background:saving?'#94a3b8':'#f59e0b',color:'#fff',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'800',fontSize:'14px'}}>{saving?'Salvando...':'💾 Salvar'}</button>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  return ReactDOM.createPortal(
    <div style={S.overlay} onClick={onClose}>
      <div style={S.panel} onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div style={S.header}>
          <div>
            <div style={{color:'#fff',fontWeight:'900',fontSize:'16px'}}>⚙️ Painel Admin — Conecty Bairro</div>
            <div style={{color:'rgba(255,255,255,0.7)',fontSize:'11px'}}>Controle total • {ADMIN_EMAIL}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <button onClick={load} style={{background:'rgba(255,255,255,0.15)',border:'none',color:'#fff',borderRadius:'8px',padding:'6px 10px',cursor:'pointer',fontSize:'14px'}} title='Atualizar'>🔄</button>
            <button onClick={onClose} style={S.closeBtn}>✕</button>
          </div>
        </div>

        {/* TABS */}
        <div style={S.tabs}>
          {TABS.map(t=>(
            <button key={t.v} style={S.tab(tab===t.v, t.c)} onClick={()=>setTab(t.v)}>
              {t.l} <span style={{marginLeft:'4px',background:'rgba(0,0,0,0.15)',borderRadius:'10px',padding:'1px 6px',fontSize:'10px'}}>{counts[t.v]||0}</span>
            </button>
          ))}
        </div>

        {/* BODY */}
        <div style={S.body}>
          {msg && <div style={S.msg(msg.ok)}>{msg.text}</div>}
          {saving && <div style={{...S.msg(true),background:'#eff6ff',color:'#1e40af',border:'1px solid #93c5fd'}}>⏳ Processando...</div>}
          {loading && <div style={S.empty}><div style={{fontSize:'32px'}}>⏳</div><div style={{fontWeight:'700',marginTop:'8px'}}>Carregando...</div></div>}

          {/* ANUNCIOS */}
          {!loading && tab==='anuncios' && (
            data.anuncios.length===0
              ? <div style={S.empty}><div style={{fontSize:'40px'}}>📢</div><div style={{fontWeight:'700',marginTop:'8px'}}>Nenhum anúncio</div></div>
              : data.anuncios.map(item=>(
                <div key={item.id} style={S.card('#fed7aa')}>
                  {item.images&&item.images[0]
                    ? <img src={item.images[0]} style={{width:'52px',height:'52px',objectFit:'cover',borderRadius:'8px',flexShrink:0}} alt='' onError={e=>e.target.style.display='none'} />
                    : <div style={{width:'52px',height:'52px',background:'#fed7aa',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>📢</div>
                  }
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:'800',fontSize:'13px',color:'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title}</div>
                    <div style={{fontSize:'11px',color:'#64748b',marginTop:'2px'}}>📍 {item.neighborhood||item.city} • R$ {parseFloat(item.current_price||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
                    <div style={{fontSize:'10px',color:'#94a3b8',marginTop:'2px'}}>{fmt(item.created_at)}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'5px',flexShrink:0}}>
                    <button style={S.btnDel} onClick={()=>delAuction(item.id,'anúncio')}>🗑️ Excluir</button>
                    {item.user_id && <button style={S.btnBlock} onClick={()=>blockUser(item.user_id,null)}>🚫 Bloquear</button>}
                  </div>
                </div>
              ))
          )}

          {/* LEILOES */}
          {!loading && tab==='leiloes' && (
            data.leiloes.length===0
              ? <div style={S.empty}><div style={{fontSize:'40px'}}>🔨</div><div style={{fontWeight:'700',marginTop:'8px'}}>Nenhum leilão</div></div>
              : data.leiloes.map(item=>{
                const ends = item.ends_at ? new Date(item.ends_at) : null
                const ended = ends && ends < new Date()
                return (
                  <div key={item.id} style={S.card(ended?'#e2e8f0':'#86efac')}>
                    {item.images&&item.images[0]
                      ? <img src={item.images[0]} style={{width:'52px',height:'52px',objectFit:'cover',borderRadius:'8px',flexShrink:0}} alt='' onError={e=>e.target.style.display='none'} />
                      : <div style={{width:'52px',height:'52px',background:'#bbf7d0',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>🔨</div>
                    }
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:'800',fontSize:'13px',color:'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title}</div>
                      <div style={{fontSize:'11px',color:'#64748b',marginTop:'2px'}}>📍 {item.neighborhood||item.city} • Lance: R$ {parseFloat(item.current_price||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
                      <div style={{fontSize:'10px',color:ended?'#dc2626':'#16a34a',marginTop:'2px',fontWeight:'700'}}>{ended?'⏹ Encerrado':'🟢 Ativo'} • {fmt(item.ends_at)}</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'5px',flexShrink:0}}>
                      <button style={S.btnDel} onClick={()=>delAuction(item.id,'leilão')}>🗑️ Excluir</button>
                      {item.user_id && <button style={S.btnBlock} onClick={()=>blockUser(item.user_id,null)}>🚫 Bloquear</button>}
                    </div>
                  </div>
                )
              })
          )}

          {/* SPONSORS */}
          {!loading && tab==='sponsors' && (
            data.sponsors.length===0
              ? <div style={S.empty}><div style={{fontSize:'40px'}}>⭐</div><div style={{fontWeight:'700',marginTop:'8px'}}>Nenhum patrocinador</div></div>
              : data.sponsors.map(sp=>(
                <div key={sp.id} style={S.card(sp.status==='pending'?'#fbbf24':sp.status==='active'?'#86efac':'#e2e8f0')}>
                  {sp.logo_url
                    ? <img src={sp.logo_url} style={{width:'52px',height:'52px',objectFit:'contain',borderRadius:'8px',border:'1px solid #e2e8f0',background:'#f8fafc',flexShrink:0}} alt='' />
                    : <div style={{width:'52px',height:'52px',background:'linear-gradient(135deg,#1e3a8a,#3b82f6)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>⭐</div>
                  }
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:'800',fontSize:'13px',color:'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sp.sponsor_name}</div>
                    <div style={{fontSize:'11px',color:'#64748b',marginTop:'2px'}}>{sp.city} • Slot {sp.slot} • {sp.plan_type==='monthly'?'Mensal R$50':'Anual R$400'}</div>
                    <span style={{background:sp.status==='active'?'#16a34a':sp.status==='pending'?'#d97706':'#94a3b8',color:'#fff',padding:'2px 7px',borderRadius:'10px',fontSize:'10px',fontWeight:'800'}}>
                      {sp.status==='active'?'✅ Ativo':sp.status==='pending'?'⏳ Aguardando':'❌ Inativo'}
                    </span>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'5px',flexShrink:0}}>
                    {sp.status==='pending' && <button style={S.btnOk} onClick={()=>approveSponsor(sp)}>✅ Aprovar</button>}
                    <button style={S.btnEdit} onClick={()=>{setEditSp(sp);setEditForm({...sp})}}>✏️ Editar</button>
                    <button style={S.btnDel} onClick={()=>del('sponsors',sp.id,'patrocinador')}>🗑️ Excluir</button>
                  </div>
                </div>
              ))
          )}

          {/* PROFISSIONAIS */}
          {!loading && tab==='pros' && (
            data.pros.length===0
              ? <div style={S.empty}><div style={{fontSize:'40px'}}>👷</div><div style={{fontWeight:'700',marginTop:'8px'}}>Nenhum profissional</div></div>
              : data.pros.map(pro=>(
                <div key={pro.id} style={S.card('#c7d2fe')}>
                  {pro.foto_url
                    ? <img src={pro.foto_url} style={{width:'52px',height:'52px',objectFit:'cover',borderRadius:'50%',border:'2px solid #818cf8',flexShrink:0}} alt='' />
                    : <div style={{width:'52px',height:'52px',background:'linear-gradient(135deg,#6366f1,#4f46e5)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0,color:'#fff',fontWeight:'900'}}>{pro.nome?.[0]?.toUpperCase()||'?'}</div>
                  }
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:'800',fontSize:'13px',color:'#1e293b'}}>{pro.nome}</div>
                    <div style={{fontSize:'11px',color:'#64748b',marginTop:'2px'}}>🔧 {pro.profissao} • 📱 {pro.whatsapp}</div>
                    <div style={{fontSize:'10px',color:'#94a3b8',marginTop:'2px'}}>🏙️ {pro.city} • {fmt(pro.created_at)}</div>
                  </div>
                  <button style={S.btnDel} onClick={()=>del('professionals',pro.id,'profissional')}>🗑️ Excluir</button>
                </div>
              ))
          )}

          {/* BLOQUEADOS */}
          {!loading && tab==='blocked' && (
            <div>
              <div style={{background:'#fef2f2',border:'2px solid #fca5a5',borderRadius:'12px',padding:'12px 14px',marginBottom:'14px'}}>
                <div style={{fontWeight:'800',fontSize:'13px',color:'#dc2626',marginBottom:'8px'}}>🚫 Bloquear novo usuário</div>
                <div style={{display:'flex',gap:'8px'}}>
                  <input
                    style={{...S.input,marginBottom:0,flex:1}}
                    placeholder='ID do usuário (UUID) ou e-mail'
                    value={blockInput}
                    onChange={e=>setBlockInput(e.target.value)}
                    onKeyDown={e=>{
                      if(e.key==='Enter'){
                        const v=blockInput.trim()
                        if(!v) return
                        blockUser(v.includes('@')?null:v, v.includes('@')?v:null)
                      }
                    }}
                  />
                  <button
                    style={{...S.btnDel,padding:'9px 14px'}}
                    onClick={()=>{
                      const v=blockInput.trim()
                      if(!v) return
                      blockUser(v.includes('@')?null:v, v.includes('@')?v:null)
                    }}
                  >🚫 Bloquear</button>
                </div>
                <div style={{fontSize:'11px',color:'#94a3b8',marginTop:'6px'}}>Cole o UUID ou e-mail. Enter para confirmar.</div>
              </div>
              {data.blocked.length===0
                ? <div style={S.empty}><div style={{fontSize:'40px'}}>✅</div><div style={{fontWeight:'700',marginTop:'8px'}}>Nenhum usuário bloqueado</div></div>
                : data.blocked.map(b=>(
                  <div key={b.id} style={S.card('#fca5a5')}>
                    <div style={{width:'44px',height:'44px',background:'#dc2626',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0}}>🚫</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:'800',fontSize:'13px',color:'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.email||b.user_id||'desconhecido'}</div>
                      <div style={{fontSize:'10px',color:'#94a3b8',marginTop:'2px'}}>Bloqueado: {fmt(b.blocked_at)}</div>
                    </div>
                    <button style={S.btnOk} onClick={()=>unblock(b.id, b.email||b.user_id)}>✅ Desbloquear</button>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{padding:'8px 16px',borderTop:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0,background:'#f8fafc'}}>
          <span style={{fontSize:'11px',color:'#94a3b8'}}>📢{data.anuncios.length} 🔨{data.leiloes.length} ⭐{data.sponsors.length} 👷{data.pros.length} 🚫{data.blocked.length}</span>
          <button onClick={onClose} style={{padding:'7px 18px',background:'#1e3a8a',color:'#fff',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'700',fontSize:'12px'}}>Fechar</button>
        </div>

      </div>

      {/* Confirm and Edit modals rendered as separate portals */}
      {confirm && <ConfirmDialog msg={confirm.msg} onYes={confirm.onYes} onNo={confirm.onNo} />}
      {editModal}
    </div>,
    document.body
  )
}

export default AdminPanel
