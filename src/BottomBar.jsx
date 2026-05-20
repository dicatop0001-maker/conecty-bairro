import { useNavigate } from 'react-router-dom'
import Notifications from './Notifications'

function BottomBar({ user, onLogout, onAdminOpen }) {
  const navigate = useNavigate()

  const btnStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    background: 'none',
    border: 'none',
    color: '#cce0ff',
    cursor: 'pointer',
    fontSize: 'clamp(9px, 2vw, 12px)',
    fontWeight: '600',
    padding: '6px 10px',
    borderRadius: '8px',
    transition: 'background 0.15s'
  }

  const iconStyle = {
    fontSize: 'clamp(18px, 4vw, 22px)',
    lineHeight: '1'
  }

  const hoverIn = (e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }
  const hoverOut = (e) => { e.currentTarget.style.background = 'none' }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
      borderTop: '2px solid rgba(255,255,255,0.15)',
      zIndex: 1000,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)'
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '4px 8px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <button style={btnStyle} onClick={() => navigate('/meus-leiloes')} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <span style={iconStyle}>🔨</span>
          <span>Meus Leilões</span>
        </button>
        <button style={btnStyle} onClick={() => navigate('/meus-anuncios')} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <span style={iconStyle}>📢</span>
          <span>Meus Anúncios</span>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Notifications user={user} bottomBar />
        </div>
        <button style={{ ...btnStyle, color: '#94a3b8' }} onClick={() => onAdminOpen && onAdminOpen()} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <span style={iconStyle}>⚙️</span>
          <span>Admin</span>
        </button>
        <button style={{ ...btnStyle, color: '#fca5a5' }} onClick={onLogout} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }} onMouseLeave={hoverOut}>
          <span style={iconStyle}>🚪</span>
          <span>Sair</span>
        </button>
      </nav>
    </div>
  )
}

export default BottomBar
