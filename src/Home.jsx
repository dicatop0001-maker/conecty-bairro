function getTimeLeft(endsAt) {
  if (!endsAt) return null
  const diff = new Date(endsAt) - new Date()
  if (diff <= 0) return { label: 'Encerrado', urgent: true }
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h < 24) return { label: h + 'h ' + m + 'm', urgent: h < 2 }
  return { label: Math.floor(h / 24) + 'd', urgent: false }
}

function Home() {
  const [user, setUser] = useState(null)
  const [showAdmin, setShowAdmin] = useState(false)
  const [auctions, setAuctions] = useState([])
  const [activeAuctions, setActiveAuctions] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [userCity, setUserCity] = useState('Ponta Grossa')
  const [userState, setUserState] = useState('PR')
  const [userNeighborhood, setUserNeighborhood] = useState('')
  const [showBuscaModal, setShowBuscaModal] = useState(false)
  const [buscaTab, setBuscaTab] = useState('produto')
  const [searchBairro, setSearchBairro] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const [allCities, setAllCities] = useState([])
  const [filteredCities, setFilteredCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [sponsors, setSponsors] = useState({})
  const [userLat, setUserLat] = useState(null)
  const [userLng, setUserLng] = useState(null)
  const [activeSponsorAds, setActiveSponsorAds] = useState([])
  const [lightboxImg, setLightboxImg] = useState(null)
  const [isSponsor, setIsSponsor] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
    detectLocation()
    loadBrazilianCities()
    requestUserGPS()
  }, [])

  useEffect(() => {
    if (user) { loadAuctions(); loadSponsors() }
  }, [user, userCity])

  useEffect(() => {
    const n = new Date()
    const filtered = auctions.filter(a =>
      (a.status === 'active' || !a.status) &&
      (a.tipo === 'anuncio' || !a.ends_at || new Date(a.ends_at) > n)
    )
    const sameN = filtered.filter(a =>
      userNeighborhood && a.neighborhood &&
      a.neighborhood.toLowerCase().trim() === userNeighborhood.toLowerCase().trim()
    )
    const otherN = filtered.filter(a =>
      !(userNeighborhood && a.neighborhood &&
      a.neighborhood.toLowerCase().trim() === userNeighborhood.toLowerCase().trim())
    )
    setActiveAuctions([...sameN, ...otherN])
  }, [auctions, userNeighborhood])

  useEffect(() => {
    if (searchCity.length >= 2) {
      setFilteredCities(allCities.filter(c =>
        c.nome.toLowerCase().includes(searchCity.toLowerCase())).slice(0, 50))
    } else { setFilteredCities([]) }
  }, [searchCity, allCities])

  const requestUserGPS = () => {
    const cached = localStorage.getItem('cb_neighborhood')
    if (cached) setUserNeighborhood(cached)
    const fetchBairro = async (lat, lng) => {
      try {
        const res = await fetch(
          'https://nominatim.openstreetmap.org/reverse?lat='+lat+'&lon='+lng+'&format=json&addressdetails=1',
          { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } }
        )
        const data = await res.json()
        const addr = data.address || {}
        const bairro = addr.suburb||addr.neighbourhood||addr.quarter||addr.residential||addr.district||addr.village||addr.hamlet||''
        if (bairro) { setUserNeighborhood(bairro); localStorage.setItem('cb_neighborhood', bairro) }
      } catch(e) {}
    }
    const ipFallback = () => {
      fetch('https://ipapi.co/json/').then(r=>r.json())
        .then(d=>{ if(d.latitude&&d.longitude) fetchBairro(d.latitude,d.longitude) })
        .catch(()=>{})
    }
    if (!navigator.geolocation) { ipFallback(); return }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude)
        fetchBairro(pos.coords.latitude, pos.coords.longitude)
        navigator.geolocation.clearWatch(watchId)
      },
      () => {
        navigator.geolocation.getCurrentPosition(
          (pos)=>fetchBairro(pos.coords.latitude,pos.coords.longitude),
          ()=>ipFallback(),
          { enableHighAccuracy:false, timeout:10000, maximumAge:60000 }
        )
      },
      { enableHighAccuracy:true, timeout:15000, maximumAge:0 }
    )
  }

  const loadBrazilianCities = async () => {
    try {
      const r = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome')
      setAllCities(await r.json())
    } catch (e) {}
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  const loadSponsors = async () => {
    const { data } = await supabase.from('sponsors').select('*').eq('city', userCity)
    if (data) {
      const map = {}
      const ads = []
      data.forEach(s => {
        map[s.slot] = s
        if (s.status === 'active') {
          if (!userLat || !s.lat || haversineKm(userLat, userLng, s.lat, s.lng) <= 2) {
            ads.push(s)
          }
        }
      })
      setSponsors(map)
      setActiveSponsorAds(ads)
    }
  }

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/'); return }
    setUser(session.user)
    // Check if user is a sponsor
    const { data: spData } = await supabase.from('sponsors').select('id,status').eq('email', session.user.email).limit(1)
    if (spData && spData.length > 0) setIsSponsor(true)
  }

  const detectLocation = async () => {
    try {
      const r = await fetch('https://ipapi.co/json/')
      const d = await r.json()
      if (d.city) { setUserCity(d.city); setUserState(d.region_code || 'BR') }
    } catch (e) {}
  }

  const loadAuctions = async () => {
    setLoading(true)
    const { data } = await supabase.from('auctions').select('*').eq('city', userCity).order('created_at', { ascending: false })
    if (data) setAuctions(data)
    setLoading(false)
  }

  const handleCitySelect = (city) => {
    setUserCity(city.nome)
    setUserState(city.microrregiao.mesorregiao.UF.sigla)
    setUserNeighborhood('')
    setShowBuscaModal(false)
    setSearchCity('')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleHorarioOnibus = () => {
    const bairroParam = userNeighborhood || userCity
    const url = 'https://www.google.com/maps/search/ponto+de+onibus+' + encodeURIComponent(bairroParam)
    window.open(url, '_blank')
  }

  const handleShare = (e, item) => {
    e.stopPropagation()
    const url = window.location.origin + '/leilao/' + item.id
    const text = item.title + ' - R$ ' + parseFloat(item.current_price || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})
    if (navigator.share) {
      navigator.share({ title: item.title, text: text, url: url }).catch(()=>{})
    } else {
      navigator.clipboard.writeText(url).then(()=>alert('Link copiado!')).catch(()=>alert('Link: ' + url))
    }
  }

  const anuncios = activeAuctions.filter(a => a.tipo === 'anuncio' || !a.ends_at)
    .filter(a => selectedCategory === '' || a.category === selectedCategory)
  const leiloes = activeAuctions.filter(a => a.tipo !== 'anuncio' && a.ends_at)
    .filter(a => selectedCategory === '' || a.category === selectedCategory)

  const isAdmin = user && user.email === 'dicatop0001@gmail.com'
  const showAdminBtn = isAdmin || isSponsor

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1e3a8a 0%, #1e40af 40%, #1a56db 100%)', paddingBottom: '80px' }}>
      <style>{blinkStyle}</style>

      {/* HEADER */}
      <div className='lj-placa'>
        <div className='lj-logo-wrap' onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>
          <img src='/logo.png' alt='Conecty Bairro' className='lj-logo-img' />
        </div>
        {/* CITY + BAIRRO IN GREEN */}
        <div className='lj-city-label'>
          {userCity}{userNeighborhood ? ' • ' + userNeighborhood : ''}
        </div>
        {/* SPONSOR SLOTS */}
        <div className='lj-slots-grid'>
          {[1,2,3,4,5,6].map(n => (
            <SponsorSlot key={n} slotNumber={n} city={userCity} sponsorData={sponsors[n] || null} userEmail={user?.email} onUpdate={loadSponsors} />
          ))}
        </div>
        {/* TWO COLUMNS: ANUNCIOS + LEILOES */}
        <div className='lj-cards-row'>
          {/* ANUNCIOS COLUMN */}
          <div>
            <div className='lj-col-header' style={{background:'rgba(249,115,22,0.85)'}}>
              📦 Anúncios
            </div>
            <div className='lj-mini-cards'>
              {loading ? (
                <div style={{color:'rgba(255,255,255,0.7)',fontSize:'12px',padding:'12px',textAlign:'center'}}>Carregando...</div>
              ) : anuncios.length === 0 ? (
                <div style={{color:'rgba(255,255,255,0.6)',fontSize:'12px',padding:'12px',textAlign:'center'}}>Nenhum anúncio</div>
              ) : anuncios.map(item => (
                <div key={item.id} className='lj-mini-card' onClick={() => navigate('/leilao/' + item.id)}>
                  <div style={{position:'relative'}}>
                    <div style={{background:'rgba(249,115,22,0.9)',color:'white',fontSize:'9px',fontWeight:'bold',padding:'2px 7px',position:'absolute',top:'5px',right:'5px',borderRadius:'10px',zIndex:3}}>ANÚNCIO</div>
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} alt='' className='lj-mini-card-img' onError={e=>{e.target.style.display='none'}} />
                    ) : (
                      <div style={{height:'90px',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',fontSize:'24px'}}>🖼️</div>
                    )}
                  </div>
                  <div className='lj-mini-card-body'>
                    <p className='lj-mini-card-title'>{item.title}</p>
                    <p className='lj-mini-card-price' style={{color:'#f97316'}}>R$ {parseFloat(item.current_price||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</p>
                  </div>
                  <button className='lj-share-btn' onClick={e=>handleShare(e,item)} title='Compartilhar'>🔗</button>
                </div>
              ))}
            </div>
          </div>
          {/* LEILOES COLUMN */}
          <div>
            <div className='lj-col-header' style={{background:'rgba(22,163,74,0.85)'}}>
              🔨 Leilões
            </div>
            <div className='lj-mini-cards'>
              {loading ? (
                <div style={{color:'rgba(255,255,255,0.7)',fontSize:'12px',padding:'12px',textAlign:'center'}}>Carregando...</div>
              ) : leiloes.length === 0 ? (
                <div style={{color:'rgba(255,255,255,0.6)',fontSize:'12px',padding:'12px',textAlign:'center'}}>Nenhum leilão</div>
              ) : leiloes.map(item => {
                const tl = getTimeLeft(item.ends_at)
                return (
                  <div key={item.id} className='lj-mini-card' onClick={() => navigate('/leilao/' + item.id)}>
                    <div style={{position:'relative'}}>
                      <div style={{background:'rgba(22,163,74,0.9)',color:'white',fontSize:'9px',fontWeight:'bold',padding:'2px 7px',position:'absolute',top:'5px',right:'5px',borderRadius:'10px',zIndex:3}}>LEILÃO</div>
                      {tl && (
                        <div style={{background:tl.urgent?'rgba(220,38,38,0.9)':'rgba(30,58,138,0.85)',color:'white',fontSize:'9px',fontWeight:'bold',padding:'2px 7px',position:'absolute',top:'5px',left:'5px',borderRadius:'10px',zIndex:3}}>{tl.label}</div>
                      )}
                      {item.images && item.images[0] ? (
                        <img src={item.images[0]} alt='' className='lj-mini-card-img' onError={e=>{e.target.style.display='none'}} />
                      ) : (
                        <div style={{height:'90px',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',fontSize:'24px'}}>🔨</div>
                      )}
                    </div>
                    <div className='lj-mini-card-body'>
                      <p className='lj-mini-card-title'>{item.title}</p>
                      <p className='lj-mini-card-price' style={{color:'#16a34a'}}>R$ {parseFloat(item.current_price||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</p>
                    </div>
                    <button className='lj-share-btn' onClick={e=>handleShare(e,item)} title='Compartilhar'>🔗</button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      {/* MAIN CONTENT */}
      <div style={{maxWidth:'900px',margin:'0 auto',padding:'16px 12px 40px'}}>
        {/* BUSCA BUTTON */}
        <button
          onClick={() => setShowBuscaModal(true)}
          style={{
            width:'100%',padding:'16px 24px',marginBottom:'10px',
            background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            color:'white',border:'none',borderRadius:'50px',
            fontSize:'clamp(15px,2.5vw,18px)',fontWeight:'800',cursor:'pointer',
            letterSpacing:'0.5px',boxShadow:'0 4px 18px rgba(102,126,234,0.5)',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}
        >
          🔍 Buscar: Produto, Serviço ou Leilão
          {userNeighborhood && <span style={{fontSize:'12px',opacity:0.85,fontWeight:'400'}}>({userNeighborhood})</span>}
        </button>
        {/* CREATE BUTTONS */}
        <button onClick={() => navigate('/anuncio')}
          style={{width:'100%',padding:'clamp(14px,2.5vw,20px)',marginBottom:'10px',background:'#f97316',color:'white',border:'none',borderRadius:'15px',fontSize:'clamp(16px,2.5vw,22px)',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 14px rgba(249,115,22,0.4)'}}>
          📢 CRIAR SEU ANÚNCIO
        </button>
        <button onClick={() => navigate('/novo')}
          style={{width:'100%',padding:'clamp(14px,2.5vw,20px)',marginBottom:'10px',background:'#16a34a',color:'white',border:'none',borderRadius:'15px',fontSize:'clamp(16px,2.5vw,22px)',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 14px rgba(22,163,74,0.4)'}}>
          🔨 CRIAR SEU LEILÃO
        </button>
        {/* BUS BUTTON */}
        <button onClick={handleHorarioOnibus}
          style={{width:'100%',padding:'14px 24px',marginBottom:'10px',background:'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0ea5e9 100%)',color:'white',border:'none',borderRadius:'50px',fontSize:'clamp(14px,2.5vw,18px)',fontWeight:'800',cursor:'pointer',letterSpacing:'0.5px',boxShadow:'0 4px 18px rgba(59,130,246,0.5)',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
          🚌 {userNeighborhood ? 'Horário de Ônibus - ' + userNeighborhood : 'Horário de Ônibus'}
        </button>
        {/* CATEGORY FILTER */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:'8px',marginBottom:'16px'}}>
          {[{v:'',l:'Todos'},{v:'veiculos',l:'Veículos'},{v:'eletronicos',l:'Eletrônicos'},{v:'objetos',l:'Objetos'},{v:'moveis',l:'Móveis'},{v:'imoveis',l:'Imóveis'},{v:'outros',l:'Outros'},{v:'servicos',l:'Serviços'}].map(cat => (
            <button key={cat.v} onClick={() => setSelectedCategory(cat.v)}
              style={{padding:'10px 8px',borderRadius:'50px',border:selectedCategory===cat.v?'3px solid white':'1px solid rgba(255,255,255,0.55)',background:'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',color:'white',fontWeight:selectedCategory===cat.v?'900':'700',fontSize:'clamp(11px,1.8vw,14px)',cursor:'pointer',whiteSpace:'nowrap',boxShadow:selectedCategory===cat.v?'0 4px 16px rgba(249,115,22,0.45),0 0 0 2px white':'0 3px 10px rgba(249,115,22,0.4)',transform:selectedCategory===cat.v?'scale(1.06)':'scale(1)',transition:'transform 0.15s'}}>
              {cat.l}
            </button>
          ))}
        </div>
        {/* SPONSOR ADS */}
        {activeSponsorAds.length > 0 && (
          <div style={{marginBottom:'16px'}}>
            <h3 style={{color:'white',fontSize:'clamp(14px,2vw,18px)',marginBottom:'10px',fontWeight:'800'}}>⭐ Patrocinadores do Seu Bairro</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'12px'}}>
              {activeSponsorAds.map(sp => (
                <div key={'sp-'+sp.id} onClick={() => sp.link_url ? window.open(sp.link_url,'_blank') : null}
                  style={{background:'linear-gradient(135deg,#fff7ed,#fef3c7)',borderRadius:'12px',overflow:'hidden',cursor:sp.link_url?'pointer':'default',boxShadow:'0 0 0 3px #f97316, 0 6px 18px rgba(0,0,0,0.15)',position:'relative'}}>
                  <div style={{position:'absolute',top:'6px',left:'6px',background:'#f97316',color:'white',padding:'2px 8px',borderRadius:'12px',fontSize:'10px',fontWeight:'bold',zIndex:2}}>PATROCINADOR</div>
                  {sp.logo_url && (
                    <div style={{height:'110px',overflow:'hidden',backgroundColor:'#fef9c3',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <img src={sp.logo_url} alt='logo' style={{maxHeight:'100px',maxWidth:'100%',objectFit:'contain'}} />
                    </div>
                  )}
                  <div style={{padding:'12px'}}>
                    <h3 style={{margin:'0 0 4px',fontSize:'15px',color:'#92400e',fontWeight:'bold'}}>{sp.sponsor_name||'Patrocinador'}</h3>
                    {sp.offers && sp.offers.length > 0 && (
                      <ul style={{margin:'0 0 6px',paddingLeft:'16px',color:'#78350f'}}>
                        {sp.offers.slice(0,4).map((o,i) => <li key={i} style={{fontSize:'12px',marginBottom:'2px'}}>{o}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && anuncios.length === 0 && leiloes.length === 0 && activeSponsorAds.length === 0 && (
          <div style={{textAlign:'center',padding:'40px',background:'rgba(255,255,255,0.1)',borderRadius:'15px',color:'white'}}>
            <div style={{fontSize:'48px',marginBottom:'12px'}}>🏪</div>
            <p style={{fontSize:'20px',fontWeight:'bold'}}>Nenhum anúncio ativo em {userCity}{userNeighborhood?' - '+userNeighborhood:''}</p>
            <p style={{fontSize:'15px',opacity:0.8,marginTop:'8px'}}>Seja o primeiro a criar um anúncio na sua cidade!</p>
          </div>
        )}
      </div>
      {/* BUSCA MODAL */}
      {showBuscaModal && (
        <div className='busca-modal-overlay' onClick={() => setShowBuscaModal(false)}>
          <div className='busca-modal' onClick={e => e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <h2 style={{margin:0,fontSize:'20px',color:'#1e3a8a',fontWeight:'900'}}>🔍 Buscar</h2>
              <button onClick={() => setShowBuscaModal(false)} style={{background:'none',border:'none',fontSize:'22px',cursor:'pointer',color:'#666'}}>×</button>
            </div>
            {/* TABS: tipo de busca */}
            <div style={{display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap'}}>
              {[{v:'produto',l:'📦 Produto'},{v:'servico',l:'🔧 Serviço'},{v:'leilao',l:'🔨 Leilão'}].map(t => (
                <button key={t.v} onClick={() => setBuscaTab(t.v)}
                  style={{flex:'1',padding:'10px 8px',borderRadius:'50px',border:buscaTab===t.v?'3px solid #6366f1':'2px solid #e2e8f0',background:buscaTab===t.v?'linear-gradient(135deg,#6366f1,#a855f7)':'white',color:buscaTab===t.v?'white':'#4b5563',fontWeight:'700',fontSize:'13px',cursor:'pointer'}}>
                  {t.l}
                </button>
              ))}
            </div>
            {/* SCOPE: bairro ou cidade */}
            <div style={{marginBottom:'16px'}}>
              <p style={{margin:'0 0 8px',fontWeight:'700',color:'#374151',fontSize:'14px'}}>📍 Onde buscar?</p>
              <div style={{display:'flex',gap:'8px'}}>
              <button onClick={() => { setSelectedCategory(buscaTab==='leilao'?'':buscaTab==='servico'?'servicos':buscaTab); if(userNeighborhood){setShowBuscaModal(false)} }}
                style={{flex:1,padding:'10px',borderRadius:'12px',background:'#f0fdf4',border:'2px solid #16a34a',color:'#15803d',fontWeight:'700',fontSize:'13px',cursor:'pointer'}}>
                🏘️ Meu Bairro{userNeighborhood?' ('+userNeighborhood+')':''}
              </button>
              <button onClick={() => { setSelectedCategory(buscaTab==='leilao'?'':buscaTab==='servico'?'servicos':buscaTab); setShowBuscaModal(false) }}
                style={{flex:1,padding:'10px',borderRadius:'12px',background:'#eff6ff',border:'2px solid #3b82f6',color:'#1d4ed8',fontWeight:'700',fontSize:'13px',cursor:'pointer'}}>
                🏙️ Cidade toda{' ('+userCity+')'}
              </button>
              </div>
            </div>
            {/* CIDADE SEARCH */}
            <div style={{marginBottom:'12px'}}>
              <p style={{margin:'0 0 8px',fontWeight:'700',color:'#374151',fontSize:'14px'}}>🌎 Mudar cidade?</p>
              <input value={searchCity} onChange={e => setSearchCity(e.target.value)}
                placeholder='Digite a cidade...'
                style={{width:'100%',padding:'10px 14px',border:'2px solid #e2e8f0',borderRadius:'12px',fontSize:'14px',boxSizing:'border-box'}} />
              {filteredCities.length > 0 && (
                <div style={{maxHeight:'180px',overflowY:'auto',border:'1px solid #e2e8f0',borderRadius:'8px',marginTop:'4px'}}>
                  {filteredCities.map(city => (
                    <div key={city.id} onClick={() => handleCitySelect(city)}
                      style={{padding:'10px 14px',cursor:'pointer',fontSize:'14px',color:'#1e3a8a',borderBottom:'1px solid #f1f5f9',background:'white',fontWeight:'500'}}
                      onMouseEnter={e=>e.target.style.background='#eff6ff'}
                      onMouseLeave={e=>e.target.style.background='white'}>
                      {city.nome} - {city.microrregiao.mesorregiao.UF.sigla}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.95)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',cursor:'zoom-out'}}>
          <img src={lightboxImg} alt='Foto ampliada' onClick={e => e.stopPropagation()} style={{maxWidth:'100vw',maxHeight:'100vh',objectFit:'contain'}} />
          <button onClick={() => setLightboxImg(null)} style={{position:'absolute',top:'16px',right:'16px',background:'rgba(255,255,255,0.15)',border:'none',color:'white',fontSize:'28px',width:'48px',height:'48px',borderRadius:'50%',cursor:'pointer',fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center'}}>X</button>
        </div>
      )}
      <BottomBar user={user} onLogout={handleLogout} onAdminOpen={() => setShowAdmin(true)} showAdminBtn={showAdminBtn} />
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  )
}

export default Home
