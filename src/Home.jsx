import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'
import BottomBar from './BottomBar'
import SponsorSlot from './SponsorSlot'
import AdminPanel from './AdminPanel'

const css = `
.cb-header {
  background: #ffffff;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 16px 10px;
}
.cb-logo { width:100%; max-width:340px; display:block; margin:0 auto; }
.cb-city-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  padding: 0 2px;
}
.cb-city {
  font-size: clamp(13px,3vw,20px);
  font-weight: 900;
  color: #16a34a;
  margin: 0;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.1);
  flex: 1;
}
.cb-busca-btn {
  background: linear-gradient(135deg,#6366f1 0%,#a855f7 100%);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: clamp(12px,2vw,14px);
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(99,102,241,0.4);
  margin-left: 8px;
  flex-shrink: 0;
}
.cb-busca-btn:active { transform: scale(0.95); }
.cb-blue {
  background: linear-gradient(160deg,#1e3a8a 0%,#1e40af 50%,#1d4ed8 100%);
  width: 100%; box-sizing: border-box;
}
.cb-slots {
  display: grid;
  grid-template-columns: repeat(6,1fr);
  gap: 6px;
  padding: 10px 8px 8px;
}
.cb-slots-main {
  display: grid;
  grid-template-columns: repeat(6,1fr);
  gap: 6px;
  margin-bottom: 14px;
}
.cb-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0 8px 12px;
}
.cb-col-head {
  text-align: center;
  font-size: clamp(11px,2.5vw,14px);
  font-weight: 900;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 6px 4px;
  border-radius: 8px 8px 0 0;
}
.cb-strip {
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: scroll;
  overflow-x: hidden;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.5) rgba(255,255,255,0.1);
  height: 240px;
}
.cb-strip::-webkit-scrollbar { width: 5px; }
.cb-strip::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 4px; }
.cb-strip::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.5); border-radius: 4px; }
.cb-card {
  flex: 0 0 240px;
  height: 240px;
  width: 100%;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
}
.cb-card:active { transform:scale(0.97); }
.cb-card-img {
  width: 100%;
  height: 155px;
  object-fit: cover;
  display: block;
  flex-shrink: 0;
  background: #e2e8f0;
}
.cb-card-body { padding: 5px 8px 28px; flex: 1; min-height: 0; }
.cb-card-title {
  font-size: clamp(10px,2vw,12px);
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 3px;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cb-card-price {
  font-size: clamp(11px,2vw,13px);
  font-weight: 700;
  margin: 0;
}
.cb-badge {
  position: absolute;
  top: 4px; right: 4px;
  font-size: 8px;
  font-weight: 900;
  padding: 2px 5px;
  border-radius: 10px;
  color: #fff;
  z-index: 3;
}
.cb-timer {
  position: absolute;
  top: 4px; left: 4px;
  font-size: 8px;
  font-weight: 900;
  padding: 2px 5px;
  border-radius: 10px;
  color: #fff;
  z-index: 3;
}
.cb-share {
  position: absolute;
  bottom: 4px; right: 4px;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  border: none;
  color: #fff;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
}
.cb-share:hover { background: rgba(249,115,22,0.9); }
.cb-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 14px 12px 40px;
}
.cb-overlay {
  position:fixed;top:0;left:0;right:0;bottom:0;
  background:rgba(0,0,0,0.7);z-index:3000;
  display:flex;align-items:flex-start;justify-content:center;
  padding-top:60px;overflow-y:auto;
}
.cb-modal {
  background:#fff;border-radius:18px;padding:22px;
  width:90%;max-width:480px;box-shadow:0 8px 32px rgba(0,0,0,0.4);
}
.cb-sp-card {
  background:linear-gradient(135deg,#fff7ed,#fef3c7);
  border-radius:12px;overflow:hidden;
  box-shadow:0 0 0 3px #f97316,0 6px 18px rgba(0,0,0,0.15);
  position:relative;cursor:pointer;
}
.cb-cat-grid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 7px;
  margin-bottom: 14px;
}
.cb-cat-btn {
  padding: 10px 4px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: #fff;
  color: #4b5563;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  text-align: center;
  line-height: 1.3;
  transition: all 0.15s;
}
.cb-cat-btn.active {
  border-color: #6366f1;
  background: linear-gradient(135deg,#6366f1,#a855f7);
  color: #fff;
}
@media(max-width:600px){
  .cb-slots { grid-template-columns: repeat(3,1fr); }
  .cb-slots-main { grid-template-columns: repeat(3,1fr); }
  .cb-strip { height: 200px; }
  .cb-card { flex: 0 0 200px; height: 200px; }
  .cb-card-img { height: 120px; }
}
`

function getTimeLeft(endsAt){
  if(!endsAt)return null
  const diff=new Date(endsAt)-new Date()
  if(diff<=0)return{label:'Encerrado',urgent:true}
  const h=Math.floor(diff/3600000)
  const m=Math.floor((diff%3600000)/60000)
  if(h<24)return{label:h+'h '+m+'m',urgent:h<2}
  return{label:Math.floor(h/24)+'d',urgent:false}
}

function Home(){
  const[user,setUser]=useState(null)
  const[showAdmin,setShowAdmin]=useState(false)
  const[auctions,setAuctions]=useState([])
  const[activeAuctions,setActiveAuctions]=useState([])
  const[selCat,setSelCat]=useState('')
  const[userCity,setUserCity]=useState('Ponta Grossa')
  const[userState,setUserState]=useState('PR')
  const[userNeighborhood,setUserNeighborhood]=useState('')
  const[showBusca,setShowBusca]=useState(false)
  const[buscaTab,setBuscaTab]=useState('tudo')
  const[searchCity,setSearchCity]=useState('')
  const[allCities,setAllCities]=useState([])
  const[filteredCities,setFilteredCities]=useState([])
  const[loading,setLoading]=useState(true)
  const[sponsors,setSponsors]=useState({})
  const[userLat,setUserLat]=useState(null)
  const[userLng,setUserLng]=useState(null)
  const[activeSponsorAds,setActiveSponsorAds]=useState([])
  const[lightboxImg,setLightboxImg]=useState(null)
  const[isSponsor,setIsSponsor]=useState(false)
  const navigate=useNavigate()

  useEffect(()=>{
    checkUser(); detectLocation(); loadBrazilianCities(); requestUserGPS()
  },[])
  useEffect(()=>{ if(user){loadAuctions();loadSponsors()} },[user,userCity])
  useEffect(()=>{
    const n=new Date()
    const f=auctions.filter(a=>(a.status==='active'||!a.status)&&(a.tipo==='anuncio'||!a.ends_at||new Date(a.ends_at)>n))
    const sN=f.filter(a=>userNeighborhood&&a.neighborhood&&a.neighborhood.toLowerCase().trim()===userNeighborhood.toLowerCase().trim())
    const oN=f.filter(a=>!(userNeighborhood&&a.neighborhood&&a.neighborhood.toLowerCase().trim()===userNeighborhood.toLowerCase().trim()))
    setActiveAuctions([...sN,...oN])
  },[auctions,userNeighborhood])
  useEffect(()=>{
    if(searchCity.length>=2){
      setFilteredCities(allCities.filter(c=>c.nome.toLowerCase().includes(searchCity.toLowerCase())).slice(0,50))
    } else setFilteredCities([])
  },[searchCity,allCities])

  const requestUserGPS=()=>{
    const cached=localStorage.getItem('cb_neighborhood')
    if(cached)setUserNeighborhood(cached)
    const fetchBairro=async(lat,lng)=>{
      try{
        const res=await fetch('https://nominatim.openstreetmap.org/reverse?lat='+lat+'&lon='+lng+'&format=json&addressdetails=1',{headers:{'Accept-Language':'pt-BR,pt;q=0.9'}})
        const d=await res.json()
        const addr=d.address||{}
        const b=addr.suburb||addr.neighbourhood||addr.quarter||addr.residential||addr.district||addr.village||addr.hamlet||''
        if(b){setUserNeighborhood(b);localStorage.setItem('cb_neighborhood',b)}
      }catch(e){}
    }
    const ipFB=()=>fetch('https://ipapi.co/json/').then(r=>r.json()).then(d=>{if(d.latitude&&d.longitude)fetchBairro(d.latitude,d.longitude)}).catch(()=>{})
    if(!navigator.geolocation){ipFB();return}
    const wId=navigator.geolocation.watchPosition(
      pos=>{setUserLat(pos.coords.latitude);setUserLng(pos.coords.longitude);fetchBairro(pos.coords.latitude,pos.coords.longitude);navigator.geolocation.clearWatch(wId)},
      ()=>navigator.geolocation.getCurrentPosition(pos=>fetchBairro(pos.coords.latitude,pos.coords.longitude),()=>ipFB(),{enableHighAccuracy:false,timeout:10000,maximumAge:60000}),
      {enableHighAccuracy:true,timeout:15000,maximumAge:0}
    )
  }

  const loadBrazilianCities=async()=>{
    try{const r=await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome');setAllCities(await r.json())}catch(e){}
  }
  function haversineKm(la1,lo1,la2,lo2){const R=6371;const dL=(la2-la1)*Math.PI/180;const dl=(lo2-lo1)*Math.PI/180;const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dl/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))}
  const loadSponsors=async()=>{
    const{data}=await supabase.from('sponsors').select('*').eq('city',userCity)
    if(data){const map={};const ads=[];data.forEach(s=>{map[s.slot]=s;if(s.status==='active'){if(!userLat||!s.lat||haversineKm(userLat,userLng,s.lat,s.lng)<=2)ads.push(s)}});setSponsors(map);setActiveSponsorAds(ads)}
  }
  const checkUser=async()=>{
    const{data:{session}}=await supabase.auth.getSession()
    if(!session){navigate('/');return}
    setUser(session.user)
    const{data:sp}=await supabase.from('sponsors').select('id').eq('email',session.user.email).limit(1)
    if(sp&&sp.length>0)setIsSponsor(true)
  }
  const detectLocation=async()=>{
    try{const r=await fetch('https://ipapi.co/json/');const d=await r.json();if(d.city){setUserCity(d.city);setUserState(d.region_code||'BR')}}catch(e){}
  }
  const loadAuctions=async()=>{
    setLoading(true)
    const{data}=await supabase.from('auctions').select('*').eq('city',userCity).order('created_at',{ascending:false})
    if(data)setAuctions(data)
    setLoading(false)
  }
  const handleCitySelect=city=>{setUserCity(city.nome);setUserState(city.microrregiao.mesorregiao.UF.sigla);setUserNeighborhood('');setShowBusca(false);setSearchCity('')}
  const handleLogout=async()=>{await supabase.auth.signOut();navigate('/')}
  const handleBus=()=>{
const q=encodeURIComponent('horário de ônibus '+(userNeighborhood||userCity))
window.open('https://www.google.com/search?q='+q,'_blank')
}
  const handleShare=(e,item)=>{
    e.stopPropagation()
    const url=window.location.origin+'/leilao/'+item.id
    if(navigator.share)navigator.share({title:item.title,url}).catch(()=>{})
    else navigator.clipboard.writeText(url).then(()=>alert('Link copiado!')).catch(()=>alert('Link: '+url))
  }

  const handleBuscaApply=(scope)=>{
const catMap={automoveis:'automoveis',imoveis:'imoveis',eletronicos:'eletronicos',celulares:'celulares',moveis:'moveis',leiloes:'leilao',tudo:''}
setSelCat(catMap[buscaTab]||'')
setShowBusca(false)
}

const catList=[
{v:'tudo',l:'🔎 Tudo'},
{v:'automoveis',l:'🚗 Automóveis'},
{v:'imoveis',l:'🏠 Imóveis'},
{v:'eletronicos',l:'💻 Eletrônicos'},
{v:'celulares',l:'📱 Celulares'},
{v:'moveis',l:'🛋️ Móveis'},
{v:'leiloes',l:'🔨 Leilões'},
]

const anuncios=activeAuctions.filter(a=>(a.tipo==='anuncio'||!a.ends_at)&&(selCat===''||a.category===selCat))
  const leiloes=activeAuctions.filter(a=>a.tipo!=='anuncio'&&a.ends_at&&(selCat===''||a.category===selCat))
  const isAdmin=user&&user.email==='dicatop0001@gmail.com'
  const showAdminBtn=isAdmin||isSponsor

  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#1e3a8a 0%,#1e40af 40%,#1a56db 100%)',paddingBottom:'80px'}}>
      <style>{css}</style>

      <div className='cb-header'>
        <img src='/logo-conecty.png' alt='Conecty Bairro' className='cb-logo' />
        <div className='cb-city-row'>
<p className='cb-city'>{userCity}{userNeighborhood?' • '+userNeighborhood:''}</p>
<button className='cb-busca-btn' onClick={()=>setShowBusca(true)}>🔍 BUSCA</button>
</div>
      </div>

      <div className='cb-blue'>

        <div className='cb-cols'>
          <div>
            <div className='cb-col-head' style={{background:'rgba(249,115,22,0.85)'}}>ANÚNCIOS</div>
            <div className='cb-strip'>
              {loading?(
                <div style={{color:'rgba(255,255,255,0.7)',fontSize:'12px',padding:'10px'}}>Carregando...</div>
              ):anuncios.length===0?(
                <div style={{color:'rgba(255,255,255,0.6)',fontSize:'12px',padding:'10px'}}>Nenhum anúncio</div>
              ):anuncios.map(item=>(
                <div key={item.id} className='cb-card' onClick={()=>navigate('/leilao/'+item.id)}>
                  <div style={{position:'relative'}}>
                    <div className='cb-badge' style={{background:'rgba(249,115,22,0.92)'}}>ANÚNCIO</div>
                    {item.images&&item.images[0]?(
                      <img src={item.images[0]} alt='' className='cb-card-img' onError={e=>{e.target.style.display='none'}}/>
                    ):(
                      <div style={{height:'155px',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',fontSize:'28px'}}>🖼️</div>
                    )}
                  </div>
                  <div className='cb-card-body'>
                    <p className='cb-card-title'>{item.title}</p>
                    <p className='cb-card-price' style={{color:'#f97316'}}>R$ {parseFloat(item.current_price||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</p>
                  </div>
                  <button className='cb-share' onClick={e=>handleShare(e,item)} title='Compartilhar'>🔗</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className='cb-col-head' style={{background:'rgba(22,163,74,0.85)'}}>LEILÕES</div>
            <div className='cb-strip'>
              {loading?(
                <div style={{color:'rgba(255,255,255,0.7)',fontSize:'12px',padding:'10px'}}>Carregando...</div>
              ):leiloes.length===0?(
                <div style={{color:'rgba(255,255,255,0.6)',fontSize:'12px',padding:'10px'}}>Nenhum leilão</div>
              ):leiloes.map(item=>{
                const tl=getTimeLeft(item.ends_at)
                return(
                  <div key={item.id} className='cb-card' onClick={()=>navigate('/leilao/'+item.id)}>
                    <div style={{position:'relative'}}>
                      <div className='cb-badge' style={{background:'rgba(22,163,74,0.92)'}}>LEILÃO</div>
                      {tl&&<div className='cb-timer' style={{background:tl.urgent?'rgba(220,38,38,0.9)':'rgba(30,58,138,0.85)'}}>{tl.label}</div>}
                      {item.images&&item.images[0]?(
                        <img src={item.images[0]} alt='' className='cb-card-img' onError={e=>{e.target.style.display='none'}}/>
                      ):(
                        <div style={{height:'155px',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',fontSize:'28px'}}>🔨</div>
                      )}
                    </div>
                    <div className='cb-card-body'>
                      <p className='cb-card-title'>{item.title}</p>
                      <p className='cb-card-price' style={{color:'#16a34a'}}>R$ {parseFloat(item.current_price||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</p>
                    </div>
                    <button className='cb-share' onClick={e=>handleShare(e,item)} title='Compartilhar'>🔗</button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className='cb-main'>
        
        <button onClick={()=>navigate('/anuncio')}
          style={{width:'100%',padding:'clamp(14px,2.5vw,20px)',marginBottom:'10px',background:'#f97316',color:'#fff',border:'none',borderRadius:'15px',fontSize:'clamp(16px,2.5vw,22px)',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 14px rgba(249,115,22,0.4)'}}>
          📢 CRIAR SEU ANÚNCIO
        </button>
        <button onClick={()=>navigate('/novo')}
          style={{width:'100%',padding:'clamp(14px,2.5vw,20px)',marginBottom:'10px',background:'#16a34a',color:'#fff',border:'none',borderRadius:'15px',fontSize:'clamp(16px,2.5vw,22px)',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 14px rgba(22,163,74,0.4)'}}>
          🔨 CRIAR SEU LEILÃO
        </button>
        <button onClick={handleBus}
          style={{width:'100%',padding:'14px 20px',marginBottom:'14px',background:'linear-gradient(135deg,#1e40af 0%,#3b82f6 50%,#0ea5e9 100%)',color:'#fff',border:'none',borderRadius:'50px',fontSize:'clamp(14px,2.5vw,18px)',fontWeight:'800',cursor:'pointer',boxShadow:'0 4px 18px rgba(59,130,246,0.5)',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
          🚌 Horário Ônibus{userNeighborhood?' '+userNeighborhood:''}
        </button>

        {/* 6 SPONSOR SLOTS */}
        <div className='cb-slots-main'>
          {[1,2,3,4,5,6].map(n=>(
            <SponsorSlot key={n} slotNumber={n} city={userCity} sponsorData={sponsors[n]||null} userEmail={user?.email} onUpdate={loadSponsors}/>
          ))}
        </div>
        {activeSponsorAds.length>0&&(
          <div style={{marginBottom:'14px'}}>
            <h3 style={{color:'#fff',fontSize:'clamp(13px,2vw,17px)',marginBottom:'8px',fontWeight:'800'}}>⭐ Patrocinadores do Seu Bairro</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'10px'}}>
              {activeSponsorAds.map(sp=>(
                <div key={'sp-'+sp.id} className='cb-sp-card' onClick={()=>sp.link_url?window.open(sp.link_url,'_blank'):null}>
                  <div style={{position:'absolute',top:'6px',left:'6px',background:'#f97316',color:'#fff',padding:'2px 7px',borderRadius:'10px',fontSize:'9px',fontWeight:'bold',zIndex:2}}>PATROCINADOR</div>
                  {sp.logo_url&&<div style={{height:'100px',backgroundColor:'#fef9c3',display:'flex',alignItems:'center',justifyContent:'center'}}><img src={sp.logo_url} alt='logo' style={{maxHeight:'90px',maxWidth:'100%',objectFit:'contain'}}/></div>}
                  <div style={{padding:'10px'}}>
                    <h3 style={{margin:'0 0 3px',fontSize:'14px',color:'#92400e',fontWeight:'bold'}}>{sp.sponsor_name||'Patrocinador'}</h3>
                    {sp.offers&&sp.offers.length>0&&<ul style={{margin:'0',paddingLeft:'14px',color:'#78350f'}}>{sp.offers.slice(0,4).map((o,i)=><li key={i} style={{fontSize:'12px'}}>{o}</li>)}</ul>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading&&anuncios.length===0&&leiloes.length===0&&activeSponsorAds.length===0&&(
          <div style={{textAlign:'center',padding:'40px',background:'rgba(255,255,255,0.1)',borderRadius:'15px',color:'#fff'}}>
            <div style={{fontSize:'48px',marginBottom:'12px'}}>🏪</div>
            <p style={{fontSize:'20px',fontWeight:'bold'}}>Nenhum anúncio ativo em {userCity}{userNeighborhood?' • '+userNeighborhood:''}</p>
            <p style={{fontSize:'14px',opacity:0.8,marginTop:'6px'}}>Seja o primeiro!</p>
          </div>
        )}
      </div>
      {showBusca&&(
        <div className='cb-overlay' onClick={()=>setShowBusca(false)}>
          <div className='cb-modal' onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
              <h2 style={{margin:0,fontSize:'19px',color:'#1e3a8a',fontWeight:'900'}}>🔍 Buscar</h2>
              <button onClick={()=>setShowBusca(false)} style={{background:'none',border:'none',fontSize:'22px',cursor:'pointer',color:'#666'}}>×</button>
            </div>
            <p style={{margin:'0 0 8px',fontWeight:'700',color:'#374151',fontSize:'14px'}}>O que você quer buscar?</p>
            <div className='cb-cat-grid'>
              {catList.map(t=>(
                <button key={t.v} onClick={()=>setBuscaTab(t.v)} className={'cb-cat-btn'+(buscaTab===t.v?' active':'')}>
                  {t.l}
                </button>
              ))}
            </div>
            <p style={{margin:'0 0 8px',fontWeight:'700',color:'#374151',fontSize:'14px'}}>📍 Onde buscar?</p>
            <div style={{display:'flex',gap:'8px',marginBottom:'14px'}}>
              <button onClick={()=>handleBuscaApply('scope')}
                style={{flex:1,padding:'10px',borderRadius:'12px',background:'#f0fdf4',border:'2px solid #16a34a',color:'#15803d',fontWeight:'700',fontSize:'13px',cursor:'pointer'}}>
                🏘️ Meu Bairro{userNeighborhood?' ('+userNeighborhood+')':''}
              </button>
              <button onClick={()=>handleBuscaApply('scope')}
                style={{flex:1,padding:'10px',borderRadius:'12px',background:'#eff6ff',border:'2px solid #3b82f6',color:'#1d4ed8',fontWeight:'700',fontSize:'13px',cursor:'pointer'}}>
                🏙️ Cidade ({userCity})
              </button>
            </div>
            <p style={{margin:'0 0 6px',fontWeight:'700',color:'#374151',fontSize:'14px'}}>🌎 Mudar cidade?</p>
            <input value={searchCity} onChange={e=>setSearchCity(e.target.value)} placeholder='Digite a cidade...'
              style={{width:'100%',padding:'10px 12px',border:'2px solid #e2e8f0',borderRadius:'12px',fontSize:'14px',boxSizing:'border-box'}}/>
            {filteredCities.length>0&&(
              <div style={{maxHeight:'160px',overflowY:'auto',border:'1px solid #e2e8f0',borderRadius:'8px',marginTop:'4px'}}>
                {filteredCities.map(city=>(
                  <div key={city.id} onClick={()=>handleCitySelect(city)}
                    style={{padding:'9px 12px',cursor:'pointer',fontSize:'14px',color:'#1e3a8a',borderBottom:'1px solid #f1f5f9',background:'#fff',fontWeight:'500'}}
                    onMouseEnter={e=>e.target.style.background='#eff6ff'}
                    onMouseLeave={e=>e.target.style.background='#fff'}>
                    {city.nome} - {city.microrregiao.mesorregiao.UF.sigla}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {lightboxImg&&(
        <div onClick={()=>setLightboxImg(null)} style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.95)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',cursor:'zoom-out'}}>
          <img src={lightboxImg} alt='Foto ampliada' onClick={e=>e.stopPropagation()} style={{maxWidth:'100vw',maxHeight:'100vh',objectFit:'contain'}}/>
          <button onClick={()=>setLightboxImg(null)} style={{position:'absolute',top:'16px',right:'16px',background:'rgba(255,255,255,0.15)',border:'none',color:'#fff',fontSize:'28px',width:'44px',height:'44px',borderRadius:'50%',cursor:'pointer',fontWeight:'bold'}}>X</button>
        </div>
      )}
      <BottomBar user={user} onLogout={handleLogout} onAdminOpen={()=>setShowAdmin(true)} showAdminBtn={showAdminBtn}/>
      {showAdmin&&<AdminPanel onClose={()=>setShowAdmin(false)}/>}
    </div>
  )
}

export default Home
