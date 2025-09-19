import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function SimpleSignup() {
  const { signUpWithEmail, signInWithGoogle, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    console.log('🔍 SimpleSignup: Auth state changed', { isAuthenticated, loading })
    if (isAuthenticated && !loading) {
      console.log('✅ SimpleSignup: Redirecting to dashboard')
      navigate('/dashboard')
    }
  }, [isAuthenticated, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signUpWithEmail(formData.email, formData.password, {
      firstName: formData.firstName,
      lastName: formData.lastName
    })
  }

  const handleGoogleSignup = async () => {
    console.log('🔘 Google signup button clicked')
    try {
      await signInWithGoogle()
      console.log('🔄 Google OAuth initiated from signup page')
    } catch (error) {
      console.error('❌ Google signup error in SimpleSignup:', error)
    }
  }

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Create Account</h1>

      {/* Google Signup */}
      <button
        onClick={handleGoogleSignup}
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
        Sign up with Google
      </button>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <span>OR</span>
      </div>

      {/* Email Signup Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>First Name:</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
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
          <label>Last Name:</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
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
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Create Account
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/simple-login">Already have account? Login here</Link>
      </div>
    </div>
  )
}

export default SimpleSignup