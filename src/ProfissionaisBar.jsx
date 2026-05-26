import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'

const pbCss = `
.pb-wrap {
  width: 100%;
  background: linear-gradient(90deg, #1e3a8a 0%, #1e40af 40%, #3b82f6 70%, #e0eaff 100%);
  border: 2px solid #1e40af;
  border-radius: 12px;
  padding: 8px 0 6px;
  box-sizing: border-box;
  overflow: hidden;
  margin-bottom: 4px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}
.pb-fixed {
  flex-shrink: 0;
  padding: 0 8px 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.pb-scroll-area {
  flex: 1;
  overflow: hidden;
}
.pb-track {
  display: flex;
  gap: 12px;
  padding: 0 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  cursor: grab;
  user-select: none;
  align-items: flex-start;
}
.pb-track::-webkit-scrollbar { display: none; }
.pb-track.dragging { cursor: grabbing; }
.pb-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  scroll-snap-align: start;
  flex-shrink: 0;
  min-width: 74px;
  cursor: pointer;
}
.pb-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 900;
  text-align: center;
  line-height: 1.2;
  padding: 4px;
  box-sizing: border-box;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 3px 10px rgba(0,0,0,0.18);
  overflow: hidden;
}
.pb-circle:active { transform: scale(0.93); }
.pb-circle.cadastro {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #fff;
  border: 3px solid #fed7aa;
  overflow: visible;
  font-size: 6px;
}
.pb-circle.profissional {
  background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
  color: #fff;
  border: 3px solid #bfdbfe;
}
.pb-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.pb-label {
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  text-align: center;
  max-width: 74px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}
.pb-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  z-index: 5000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.pb-modal {
  background: #fff;
  border-radius: 22px 22px 0 0;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.3);
  animation: pb-slide-up 0.3s ease;
}
@keyframes pb-slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.pb-modal-header {
  padding: 16px 18px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #f1f5f9;
  flex-shrink: 0;
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
  color: #fff;
}
.pb-modal-title {
  font-size: 18px;
  font-weight: 900;
  margin: 0;
  color: #fff;
}
.pb-modal-close {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.pb-modal-body {
  overflow-y: auto;
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pb-pro-card {
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.pb-pro-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 900;
  flex-shrink: 0;
  overflow: hidden;
}
.pb-pro-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.pb-pro-info { flex: 1; }
.pb-pro-name { font-size: 15px; font-weight: 800; color: #1a202c; margin: 0 0 3px; }
.pb-pro-job { font-size: 12px; color: #6b7280; margin: 0 0 6px; font-weight: 600; }
.pb-pro-wa {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #25D366;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}
.pb-form-wrap { padding: 0; }
.pb-form-title {
  font-size: 17px;
  font-weight: 900;
  color: #1e40af;
  margin: 0 0 14px;
}
.pb-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  box-sizing: border-box;
  margin-bottom: 10px;
  outline: none;
  transition: border-color 0.2s;
}
.pb-input:focus { border-color: #1e40af; }
.pb-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 4px;
}
.pb-submit:disabled { background: #94a3b8; cursor: not-allowed; }
.pb-msg-ok { color: #16a34a; font-weight: 700; font-size: 14px; padding: 8px 0; }
.pb-msg-err { color: #dc2626; font-weight: 700; font-size: 14px; padding: 8px 0; }
.pb-foto-box {
  border: 2px dashed #3b82f6;
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  margin-bottom: 12px;
  background: #eff6ff;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.pb-foto-box:hover { border-color: #1e40af; background: #dbeafe; }
.pb-foto-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #1e40af;
  margin: 0 auto 8px;
  display: block;
}
.pb-foto-label {
  font-size: 13px;
  font-weight: 700;
  color: #1e40af;
  display: block;
  margin-bottom: 4px;
}
.pb-foto-hint {
  font-size: 11px;
  color: #6b7280;
}
`

function ProfissionaisBar({ userCity }) {
  const [pros, setPros] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ nome: '', profissao: '', whatsapp: '' })
  const [fotoFile, setFotoFile] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const trackRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const fotoInputRef = useRef(null)

  useEffect(() => { loadPros() }, [userCity])

  const loadPros = async () => {
    const city = userCity || 'Ponta Grossa'
    const { data } = await supabase
      .from('professionals')
      .select('*')
      .eq('city', city)
      .order('created_at', { ascending: true })
    if (data) setPros(data)
  }

  const showMsg = (text, type) => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 4000)
  }

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showMsg('Foto muito grande. Use uma imagem menor que 5MB.', 'err')
      return
    }
    setFotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setFotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const uploadFoto = async () => {
    if (!fotoFile) return null
    setUploadingFoto(true)
    try {
      const ext = fotoFile.name.split('.').pop()
      const fileName = 'prof_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '.' + ext
      const { error } = await supabase.storage
        .from('professionals')
        .upload(fileName, fotoFile, { cacheControl: '3600', upsert: false })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('professionals').getPublicUrl(fileName)
      return urlData.publicUrl
    } catch (err) {
      showMsg('Erro no upload da foto: ' + err.message, 'err')
      return null
    } finally {
      setUploadingFoto(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nome.trim() || !form.profissao.trim() || !form.whatsapp.trim()) {
      showMsg('Preencha todos os campos obrigatorios.', 'err')
      return
    }
    setLoading(true)
    try {
      const city = userCity || 'Ponta Grossa'
      const wa = form.whatsapp.replace(/\D/g, '')
      let foto_url = null
      if (fotoFile) {
        foto_url = await uploadFoto()
      }
      const { error } = await supabase.from('professionals').insert({
        nome: form.nome.trim(),
        profissao: form.profissao.trim(),
        whatsapp: wa,
        city: city,
        foto_url: foto_url
      })
      if (error) throw error
      showMsg('Cadastro realizado! Seu circulo aparecera em breve.', 'ok')
      setForm({ nome: '', profissao: '', whatsapp: '' })
      setFotoFile(null)
      setFotoPreview(null)
      await loadPros()
      setTimeout(() => setModal(null), 2000)
    } catch (err) {
      showMsg(err.message || 'Erro ao cadastrar.', 'err')
    } finally {
      setLoading(false)
    }
  }

  const grouped = pros.reduce((acc, p) => {
    const key = p.profissao.toLowerCase()
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})
  const profissoes = Object.keys(grouped)

  const onMouseDown = (e) => {
    isDragging.current = true
    startX.current = e.pageX - trackRef.current.offsetLeft
    scrollLeft.current = trackRef.current.scrollLeft
    trackRef.current.classList.add('dragging')
  }
  const onMouseMove = (e) => {
    if (!isDragging.current) return
    e.preventDefault()
    const x = e.pageX - trackRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    trackRef.current.scrollLeft = scrollLeft.current - walk
  }
  const onMouseUp = () => {
    isDragging.current = false
    if (trackRef.current) trackRef.current.classList.remove('dragging')
  }

  const openProfissao = (profissao) => {
    const list = grouped[profissao.toLowerCase()] || []
    setModal({ type: 'profissao', profissao, list })
  }

  const waLink = (wa, nome) => {
    const n = wa.replace(/\D/g, '')
    const full = n.startsWith('55') ? n : '55' + n
    return 'https://wa.me/' + full + '?text=Oi ' + encodeURIComponent(nome) + ', vi seu contato no Conecty Bairro!'
  }

  return (
    <>
      <style>{pbCss}</style>
      <div className="pb-wrap">
        <div className="pb-fixed" onClick={() => { setModal({ type: 'cadastro' }); setFotoFile(null); setFotoPreview(null); setMsg({ text: '', type: '' }); }}>
          <div className="pb-circle cadastro">
            <span style={{ fontSize: '6px', lineHeight: '1.3', fontWeight: '900', textAlign: 'center', display: 'block', padding: '0px', letterSpacing: '-0.3px' }}>
              PROFISSIONAL<br />DO<br />BAIRRO
            </span>
          </div>
          <span className="pb-label" style={{ color: '#fed7aa', fontWeight: '900' }}>cadastro</span>
        </div>
        <div className="pb-scroll-area">
          <div
            className="pb-track"
            ref={trackRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {profissoes.map((prof) => {
              const list = grouped[prof]
              const first = list[0]
              return (
                <div key={prof} className="pb-item" onClick={() => openProfissao(first.profissao)}>
                  <div className="pb-circle profissional">
                    {first.foto_url ? (
                      <img src={first.foto_url} alt={first.nome} />
                    ) : (
                      <span style={{ fontSize: '26px' }}>&#128119;</span>
                    )}
                  </div>
                  <span className="pb-label">{first.profissao}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {modal && (
        <div className="pb-overlay" onClick={() => setModal(null)}>
          <div className="pb-modal" onClick={e => e.stopPropagation()}>
            <div className="pb-modal-header">
              <p className="pb-modal-title">
                {modal.type === 'cadastro' ? 'Cadastrar Profissional' : modal.profissao}
              </p>
              <button className="pb-modal-close" onClick={() => setModal(null)}>X</button>
            </div>
            <div className="pb-modal-body">
              {modal.type === 'cadastro' ? (
                <div className="pb-form-wrap">
                  <p className="pb-form-title">Cadastre seu servico gratuitamente!</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 14px' }}>
                    Seu circulo com sua foto ou logo aparecera no menu para toda a regiao ver e entrar em contato pelo WhatsApp.
                  </p>
                  {msg.text && (
                    <p className={msg.type === 'ok' ? 'pb-msg-ok' : 'pb-msg-err'}>{msg.text}</p>
                  )}
                  <form onSubmit={handleSubmit}>
                    <input
                      className="pb-input"
                      placeholder="Seu nome completo *"
                      value={form.nome}
                      onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                      required
                    />
                    <input
                      className="pb-input"
                      placeholder="Seu oficio (ex: Pedreiro, Pintor...) *"
                      value={form.profissao}
                      onChange={e => setForm(f => ({ ...f, profissao: e.target.value }))}
                      required
                    />
                    <input
                      className="pb-input"
                      placeholder="WhatsApp com DDD (ex: 42999999999) *"
                      value={form.whatsapp}
                      onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                      type="tel"
                      required
                    />

                    {/* Upload de foto/logo */}
                    <input
                      ref={fotoInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFotoChange}
                    />
                    <div className="pb-foto-box" onClick={() => fotoInputRef.current && fotoInputRef.current.click()}>
                      {fotoPreview ? (
                        <>
                          <img src={fotoPreview} alt="preview" className="pb-foto-preview" />
                          <span className="pb-foto-label">&#10003; Foto selecionada — clique para trocar</span>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: '36px', marginBottom: '6px' }}>&#128247;</div>
                          <span className="pb-foto-label">Adicionar foto ou logotipo</span>
                          <span className="pb-foto-hint">Clique para escolher uma imagem (opcional)<br/>Ela aparecera no circulo do menu</span>
                        </>
                      )}
                    </div>

                    <button className="pb-submit" type="submit" disabled={loading || uploadingFoto}>
                      {loading || uploadingFoto ? 'Cadastrando...' : 'Cadastrar agora'}
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  {modal.list && modal.list.length === 0 ? (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>Nenhum profissional encontrado.</p>
                  ) : (
                    modal.list.map(pro => (
                      <div key={pro.id} className="pb-pro-card">
                        <div className="pb-pro-avatar">
                          {pro.foto_url ? <img src={pro.foto_url} alt={pro.nome} /> : pro.nome[0].toUpperCase()}
                        </div>
                        <div className="pb-pro-info">
                          <p className="pb-pro-name">{pro.nome}</p>
                          <p className="pb-pro-job">{pro.profissao}</p>
                          <a
                            href={waLink(pro.whatsapp, pro.nome)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pb-pro-wa"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProfissionaisBar
