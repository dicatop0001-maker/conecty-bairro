import { useState } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'
import './styles.css'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLogin, setIsLogin] = useState(true)
    const [isForgot, setIsForgot] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState({ text: '', type: '' })
    const navigate = useNavigate()

  const showMsg = (text, type) => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 4000)
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/home')
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data?.user?.identities?.length === 0) {
          showMsg('Este e-mail ja esta cadastrado. Faca login.', 'err')
          setIsLogin(true)
        } else {
          showMsg('Conta criada! Verifique seu e-mail para confirmar.', 'ok')
          setIsLogin(true)
        }
      }
    } catch (error) {
      showMsg(error.message || 'Erro ao acessar', 'err')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!forgotEmail) { showMsg('Digite seu e-mail.', 'err'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin + '/home'
      })
      if (error) throw error
      showMsg('Link de recuperacao enviado! Verifique seu e-mail.', 'ok')
      setIsForgot(false)
    } catch (error) {
      showMsg(error.message || 'Erro ao enviar', 'err')
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', padding: '16px 20px',
    border: '2px solid var(--gray-300)',
    borderRadius: '12px', fontSize: '16px',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.2s', outline: 'none',
    boxSizing: 'border-box'
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FF6B35 0%, #004E89 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '-50%', right: '-20%',
        width: '600px', height: '600px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%', filter: 'blur(80px)'
      }} />
      <div style={{
        position: 'absolute', bottom: '-30%', left: '-10%',
        width: '500px', height: '500px',
        background: 'rgba(0,78,137,0.3)',
        borderRadius: '50%', filter: 'blur(100px)'
      }} />
      <div className="animate-scale-in" style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        padding: '48px', borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        width: '100%', maxWidth: '480px',
        position: 'relative', zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            overflow: 'hidden', borderRadius: '16px',
            border: '2px solid #e2e8f0', lineHeight: 0
          }}>
            <img src="/logo-conecty.png" alt="Conecty" style={{ display: 'block', width: '100%' }} />
          </div>
        </div>

        {msg.text && (
          <div style={{
            padding: '12px 16px',
            background: msg.type === 'ok' ? '#f0fdf4' : '#fef2f2',
            border: '1px solid ' + (msg.type === 'ok' ? '#bbf7d0' : '#fecaca'),
            borderRadius: '12px', fontSize: '14px', fontWeight: '600',
            color: msg.type === 'ok' ? '#166534' : '#dc2626',
            marginBottom: '16px'
          }}>{msg.text}</div>
        )}

        {isForgot ? (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', textAlign: 'center', color: 'var(--gray-900)', marginBottom: '6px' }}>
              Recuperar Senha
            </h2>
            <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--gray-600)', marginBottom: '24px' }}>
              Digite seu e-mail e enviaremos um link para criar uma nova senha.
            </p>
            <form onSubmit={handleForgotPassword}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '8px' }}>E-mail</label>
                <input type="email" placeholder="seu@email.com" value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={inp}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                  required />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '16px',
                background: loading ? 'var(--gray-400)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-display)',
                cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '12px'
              }}>
                {loading ? 'Enviando...' : 'Enviar Link de Recuperacao'}
              </button>
              <button type="button" onClick={() => setIsForgot(false)} style={{
                width: '100%', padding: '14px',
                background: 'white', color: 'var(--primary)',
                border: '2px solid var(--primary)',
                borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                fontFamily: 'var(--font-display)', cursor: 'pointer'
              }}>
                Voltar ao login
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '800',
              textAlign: 'center', color: 'var(--gray-900)', marginBottom: '6px'
            }}>
              {isLogin ? 'Bem vindo ao seu bairro!' : 'Criar nova conta'}
            </h2>
            <p style={{
              textAlign: 'center', fontSize: '14px', fontWeight: '500',
              color: 'var(--gray-600)', marginBottom: '28px', fontStyle: 'italic'
            }}>
              {isLogin ? 'aqui tem de tudo, até o horário do seu ônibus!' : 'Preencha os dados para se cadastrar'}
            </p>

            <form onSubmit={handleAuth} style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '8px' }}>E-mail</label>
                <input type="email" placeholder="seu@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inp}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                  required />
              </div>

              <div style={{ marginBottom: isLogin ? '8px' : '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '8px' }}>Senha</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...inp, paddingRight: '52px' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '20px',
                      color: 'var(--gray-500)', padding: '4px', lineHeight: '1'
                    }}>
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                  <button type="button" onClick={() => setIsForgot(true)}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--primary)', fontSize: '13px',
                      fontWeight: '600', cursor: 'pointer',
                      textDecoration: 'underline', padding: 0
                    }}>
                    Esqueci minha senha
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '18px',
                background: loading ? 'var(--gray-400)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-display)',
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(255,107,53,0.3)'
              }}>
                {loading ? 'Aguarde...' : (isLogin ? 'ENTRAR' : 'CRIAR CONTA')}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '16px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--gray-300)' }} />
              <span style={{ color: 'var(--gray-500)', fontSize: '14px', fontWeight: '500' }}>ou</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--gray-300)' }} />
            </div>

            <button onClick={() => setIsLogin(!isLogin)} style={{
              width: '100%', padding: '16px',
              background: 'white', color: 'var(--primary)',
              border: '2px solid var(--primary)',
              borderRadius: '12px', fontSize: '16px', fontWeight: '600',
              fontFamily: 'var(--font-display)', cursor: 'pointer',
              transition: 'all 0.2s', marginBottom: '8px'
            }}
              onMouseEnter={(e) => (e.target.style.background = 'var(--primary)', e.target.style.color = 'white')}
              onMouseLeave={(e) => (e.target.style.background = 'white', e.target.style.color = 'var(--primary)')}>
              {isLogin ? 'Criar nova conta' : 'Ja tenho conta'}
            </button>

            <button onClick={() => navigate('/home')} style={{
              width: '100%', padding: '14px',
              background: 'transparent', color: 'var(--gray-500)',
              border: '1px dashed var(--gray-300)',
              borderRadius: '12px', fontSize: '14px', fontWeight: '500',
              fontFamily: 'var(--font-display)', cursor: 'pointer', transition: 'all 0.2s'
            }}
              onMouseEnter={(e) => e.target.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.target.style.borderColor = 'var(--gray-300)'}>
              Continuar sem login (só visualizar)
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--gray-600)', marginTop: '24px', lineHeight: '1.6' }}>
              Ao continuar, voce concorda com nossos<br/>
              <span style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Termos de Uso</span> e{' '}
              <span style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Politica de Privacidade</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
