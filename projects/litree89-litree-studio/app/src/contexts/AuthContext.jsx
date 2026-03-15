import React, { createContext, useState, useCallback, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tier, setTier] = useState('free') // free, freemium, god-mode

  // Check if user is logged in (from localStorage/session)
  useEffect(() => {
    const savedUser = localStorage.getItem('litree_user')
    const savedTier = localStorage.getItem('litree_tier')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        setTier(savedTier || 'free')
      } catch (e) {
        console.error('Error parsing saved user:', e)
        localStorage.removeItem('litree_user')
      }
    }
    setLoading(false)
  }, [])

  const signup = useCallback(async (email, password, interests, goals) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, interests, goals })
      })
      
      if (!response.ok) {
        throw new Error('Signup failed')
      }
      
      const data = await response.json()
      setUser(data.user)
      setTier('free')
      localStorage.setItem('litree_user', JSON.stringify(data.user))
      localStorage.setItem('litree_tier', 'free')
      return data.user
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        throw new Error('Login failed')
      }
      
      const data = await response.json()
      setUser(data.user)
      setTier(data.tier || 'free')
      localStorage.setItem('litree_user', JSON.stringify(data.user))
      localStorage.setItem('litree_tier', data.tier || 'free')
      return data.user
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setTier('free')
    localStorage.removeItem('litree_user')
    localStorage.removeItem('litree_tier')
  }, [])

  const upgradeTier = useCallback((newTier) => {
    setTier(newTier)
    localStorage.setItem('litree_tier', newTier)
    if (user) {
      const updated = { ...user, tier: newTier }
      setUser(updated)
      localStorage.setItem('litree_user', JSON.stringify(updated))
    }
  }, [user])

  const value = {
    user,
    loading,
    error,
    tier,
    signup,
    login,
    logout,
    upgradeTier,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
