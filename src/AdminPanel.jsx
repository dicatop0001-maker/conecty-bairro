import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { supabase } from './supabaseClient'

const ADMIN_PASSWORD = 'conecty2024admin'
const ADMIN_EMAIL = 'dicatop0001@gmail.com'

function AdminPanel({ onClose }) {
  const [authed, setAuthed] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState('')
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [actionMsg, setActionMsg] = useState('')
  const [filterStatus, setFilterStatus] = useState('pending')
  const [saving, setSaving] = useState(false)

  const fetchSponsors = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('created_at', { ascending: false })
    setLoading(false)
    if (!error && data) setSponsors(data)
  }

  useEffect(() => {
    if (authed) fetchSponsors()
  }, [authed])

  const handleLogin = () => {
    if (pwInput.trim() === ADMIN_PASSWORD) {
      setAuthed(true)
      setPwError('')
    } else {
      setPwError('Senha incorreta!')
    }
  }

  const handleApprove = async (sp) => {
    setSaving(true)
    const { error } = await supabase
      .from('sponsors')
      .update({ status: 'active', approved_at: new Date().toISOString() })
      .eq('id', sp.id)
    setSaving(false)
    if (error) { setActionMsg('⚠️ Erro: ' + error.message) }
    else { setActionMsg('✅ Patrocinador aprovado e publicado!'); setSelected(null); fetchSponsors() }
  }

  const handleReject = async (sp) => {
    if (!window.confirm('Rejeitar e remover este patrocinador?')) return
    setSaving(true)
    const { error } = await supabase
      .from('sponsors')
      .delete()
      .eq('id', sp.id)
    setSaving(false)
    if (error) { setActionMsg('⚠️ Erro: ' + error.message) }
    else { setActionMsg('🗑️ Cadastro rejeitado e removido.'); setSelected(null); fetchSponsors() }
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('sponsors')
      .update({
        sponsor_name: editForm.sponsor_name,
        contact_email: editForm.contact_email,
        contact_phone: editForm.contact_phone,
        link_url: editForm.link_url,
        offer_text: editForm.offer_text,
        status: editForm.status
      })
      .eq('id', editForm.id)
    setSaving(false)
    if (error) { setActionMsg('⚠️ Erro: ' + error.message) }
    else { setActionMsg('✅ Alteracoes salvas!'); setEditMode(false); fetchSponsors() }
  }

  const filtered = sponsors.filter(s => filterStatus === 'all' ? true : s.status === filterStatus)

  const statusLabel = { pending: 'Aguard. Aprovacao', active: 'Publicado', inactive: 'Inativo' }
  const statusColor = { pending: '#d97706', active: '#16a34a', inactive: '#94a3b8' }

  const PreviewCard = ({ sp }) => (
    <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', borderRadius: '14px', padding: '14px', color: 'white', maxWidth: '200px' }}>
      {sp.logo_url && <img src={sp.logo_url} alt='logo' style={{ width: '100%', maxHeight: '60px', objectFit: 'contain', borderRadius: '8px', marginBottom: '8px', background: 'white' }} />}
      <div style={{ fontWeight: '900', fontSize: '14px', marginBottom: '4px' }}>{sp.sponsor_name}</div>
      {sp.contact_phone && <div style={{ fontSize: '11px', opacity: 0.85 }}>📱 {sp.contact_phone}</div>}
      {sp.link_url && <div style={{ fontSize: '11px', color: '#93c5fd', marginTop: '3px' }}>🔗 {sp.link_url}</div>}
      {sp.offer_text && sp.offer_text.split('\n').filter(Boolean).map((o, i) => (
        <div key={i} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '3px 6px', marginTop: '3px' }}>🔥 {o}</div>
      ))}
      <div style={{ fontSize: '10px', marginTop: '6px', opacity: 0.7 }}>Cidade: {sp.city} | Slot {sp.slot}</div>
    </div>
  )

  if (!authed) return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '32px 28px', maxWidth: '380px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚙️</div>
        <h2 style={{ margin: '0 0 4px', color: '#1e3a8a', fontSize: '22px' }}>Painel Admin</h2>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>Conecty Bairro — Acesso restrito ao proprietario</p>
        <input
          type='password'
          placeholder='Senha do administrador'
          value={pwInput}
          onChange={e => setPwInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: '12px 14px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box', marginBottom: '10px' }}
        />
        {pwError && <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>{pwError}</div>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Cancelar</button>
          <button onClick={handleLogin} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '15px' }}>Entrar</button>
        </div>
      </div>
    </div>
  , document.body)

  if (selected && !editMode) return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', maxWidth: '560px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', maxHeight: '95vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px' }}>📄 Detalhes do Patrocinador</h2>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', fontSize: '13px', lineHeight: '2', marginBottom: '12px' }}>
              <div><strong>🏢 Negocio:</strong> {selected.sponsor_name}</div>
              <div><strong>📧 E-mail:</strong> {selected.contact_email}</div>
              <div><strong>📱 Tel:</strong> {selected.contact_phone || '—'}</div>
              <div><strong>🌍 Link:</strong> {selected.link_url || '—'}</div>
              <div><strong>🏙️ Cidade:</strong> {selected.city}</div>
              <div><strong>📌 Slot:</strong> {selected.slot}</div>
              <div><strong>💳 Plano:</strong> {selected.plan_type === 'monthly' ? 'Mensal R$ 50' : 'Anual R$ 400'}</div>
              <div><strong>🗓️ Cadastro:</strong> {selected.created_at ? new Date(selected.created_at).toLocaleString('pt-BR') : '—'}</div>
              <div style={{ marginTop: '6px' }}><strong>Status:</strong> <span style={{ color: statusColor[selected.status] || '#666', fontWeight: '800' }}>{statusLabel[selected.status] || selected.status}</span></div>
            </div>
            {selected.offer_text && (
              <div style={{ background: '#fff7ed', borderRadius: '10px', padding: '10px', marginBottom: '12px' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', color: '#c2410c', marginBottom: '4px' }}>🔥 Ofertas:</div>
                {selected.offer_text.split('\n').filter(Boolean).map((o, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#374151', padding: '2px 0' }}>{i+1}. {o}</div>
                ))}
              </div>
            )}
            {selected.voucher_url && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', color: '#374151', marginBottom: '6px' }}>🧾 Comprovante de Pagamento:</div>
                <img src={selected.voucher_url} alt='comprovante' style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: '10px', border: '2px solid #e2e8f0' }} />
              </div>
            )}
            {!selected.voucher_url && (
              <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#92400e', marginBottom: '12px' }}>
                ⚠️ Comprovante ainda nao enviado pelo patrocinador.
              </div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '12px', color: '#374151', marginBottom: '8px' }}>👁️ Preview da publicacao:</div>
            <PreviewCard sp={selected} />
          </div>
        </div>
        {actionMsg && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px', fontSize: '13px', color: '#15803d', marginBottom: '12px', textAlign: 'center', fontWeight: '700' }}>{actionMsg}</div>}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
          {selected.status === 'pending' && (
            <button onClick={() => handleApprove(selected)} disabled={saving} style={{ flex: 2, padding: '13px', background: saving ? '#94a3b8' : 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', borderRadius: '12px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '800', fontSize: '14px' }}>
              {saving ? 'Aprovando...' : '✅ Aprovar e Publicar'}
            </button>
          )}
          {selected.status === 'active' && (
            <button onClick={() => handleApprove(selected)} disabled={saving} style={{ flex: 2, padding: '13px', background: '#667eea', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
              🔄 Reativar
            </button>
          )}
          <button onClick={() => { setEditForm({...selected}); setEditMode(true) }} style={{ flex: 1, padding: '13px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>✏️ Editar</button>
          <button onClick={() => handleReject(selected)} disabled={saving} style={{ flex: 1, padding: '13px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '12px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '800', fontSize: '14px' }}>🗑️ Excluir</button>
        </div>
        <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: '10px', padding: '10px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Voltar a lista</button>
      </div>
    </div>
  , document.body)

  if (editMode) return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', maxWidth: '480px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px' }}>✏️ Editar Patrocinador</h2>
          <button onClick={() => setEditMode(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}>✕</button>
        </div>
        {[
          { key: 'sponsor_name', label: 'Nome do negocio' },
          { key: 'contact_email', label: 'E-mail' },
          { key: 'contact_phone', label: 'Telefone / WhatsApp' },
          { key: 'link_url', label: 'URL do site/rede social' },
          { key: 'offer_text', label: 'Ofertas (uma por linha)', multiline: true }
        ].map(f => (
          <div key={f.key} style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '3px' }}>{f.label}</label>
            {f.multiline
              ? <textarea value={editForm[f.key] || ''} onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))} rows={4} style={{ width: '100%', padding: '9px 11px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }} />
              : <input value={editForm[f.key] || ''} onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={{ width: '100%', padding: '9px 11px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
            }
          </div>
        ))}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '3px' }}>Status</label>
          <select value={editForm.status || 'pending'} onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))} style={{ width: '100%', padding: '9px 11px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}>
            <option value='pending'>Aguardando aprovacao</option>
            <option value='active'>Publicado / Ativo</option>
            <option value='inactive'>Inativo</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setEditMode(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Cancelar</button>
          <button onClick={handleSaveEdit} disabled={saving} style={{ flex: 2, padding: '12px', background: saving ? '#94a3b8' : 'linear-gradient(135deg,#f97316,#ea580c)', color: 'white', border: 'none', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '800', fontSize: '15px' }}>
            {saving ? 'Salvando...' : '💾 Salvar Alteracoes'}
          </button>
        </div>
      </div>
    </div>
  , document.body)

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 99999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.3)' }}>
        <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', borderRadius: '20px 20px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'white', fontWeight: '900', fontSize: '17px' }}>⚙️ Painel Admin — Conecty Bairro</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>Gerencie patrocinadores e publicacoes</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '18px', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', fontWeight: '700' }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: '6px', padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          {[
            { v: 'pending', l: '⏳ Aguardando', c: '#d97706' },
            { v: 'active', l: '✅ Publicados', c: '#16a34a' },
            { v: 'all', l: '📋 Todos', c: '#6366f1' }
          ].map(t => (
            <button key={t.v} onClick={() => setFilterStatus(t.v)} style={{ flex: 1, padding: '8px 4px', background: filterStatus === t.v ? t.c : '#e2e8f0', color: filterStatus === t.v ? 'white' : '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>{t.l}</button>
          ))}
          <button onClick={fetchSponsors} style={{ padding: '8px 12px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }} title='Atualizar'>🔄</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', WebkitOverflowScrolling: 'touch' }}>
          {actionMsg && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px', fontSize: '13px', color: '#15803d', marginBottom: '10px', textAlign: 'center', fontWeight: '700' }}>{actionMsg}</div>}
          {loading && <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Carregando...</div>}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📂</div>
              <div style={{ fontWeight: '700' }}>Nenhum patrocinador encontrado</div>
            </div>
          )}
          {filtered.map(sp => (
            <div key={sp.id} onClick={() => { setSelected(sp); setActionMsg('') }} style={{ background: 'white', border: '2px solid ' + (sp.status === 'pending' ? '#fbbf24' : sp.status === 'active' ? '#86efac' : '#e2e8f0'), borderRadius: '12px', padding: '12px 14px', marginBottom: '10px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              {sp.logo_url
                ? <img src={sp.logo_url} alt='logo' style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }} />
                : <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>⭐</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sp.sponsor_name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{sp.city} • Slot {sp.slot} • {sp.plan_type === 'monthly' ? 'Mensal R$50' : 'Anual R$400'}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{sp.created_at ? new Date(sp.created_at).toLocaleString('pt-BR') : ''}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span style={{ background: statusColor[sp.status] || '#94a3b8', color: 'white', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{statusLabel[sp.status] || sp.status}</span>
                {sp.voucher_url && <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>🧾 Comprovante OK</span>}
                {!sp.voucher_url && <span style={{ fontSize: '10px', color: '#d97706', fontWeight: '700' }}>⏳ Sem comprovante</span>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>Total: {sponsors.length} patrocinadores • Pendentes: {sponsors.filter(s=>s.status==='pending').length} • Ativos: {sponsors.filter(s=>s.status==='active').length}</div>
      </div>
    </div>
  , document.body)
}

export default AdminPanel
