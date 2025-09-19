import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function SimpleLogin() {
  const { signInWithEmail, signInWithGoogle, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    console.log('🔍 SimpleLogin: Auth state changed', { isAuthenticated, loading })
    if (isAuthenticated && !loading) {
      console.log('✅ SimpleLogin: Redirecting to dashboard')
      navigate('/dashboard')
    }
  }, [isAuthenticated, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signInWithEmail(formData.email, formData.password)
  }

  const handleGoogleLogin = async () => {
    await signInWithGoogle()
  }

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Login</h1>

      {/* Google Login */}
      <button
        onClick={handleGoogleLogin}
        style={{
          width: '100%',
          padding: '12px',
          margin: '10px 0',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Login with Google
      </button>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <span>OR</span>
      </div>

      {/* Email Login Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginTop: '5px'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginTop: '5px'
            }}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Login
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/simple-signup">Don't have account? Signup here</Link>
      </div>
    </div>
  )
}

export default SimpleLogin