import React, { useState, useCallback } from 'react'
import { geminiService } from '@services/gemini/geminiService'

interface ApiKeySetupProps {
  onKeySet: () => void
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeySet }) => {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!key.trim()) return

    setLoading(true)
    setError('')

    try {
      geminiService.init({ apiKey: key.trim() })
      // Quick smoke test
      await geminiService.chat([], 'Say "OK" in one word.')
      onKeySet()
    } catch {
      setError('Invalid API key or network error. Check your key and try again.')
      setLoading(false)
    }
  }, [key, onKeySet])

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-4">
      <div className="text-center">
        <div className="text-3xl mb-2">🤖</div>
        <p className="text-sm font-semibold text-industrial-dark">Connect Gemini AI</p>
        <p className="text-xs text-gray-500 mt-1">
          Get a free key at{' '}
          <span className="text-blue-500 font-medium">aistudio.google.com</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="Paste your Gemini API key..."
          className="w-full text-xs border border-industrial-gray rounded px-3 py-2 focus:outline-none focus:border-blue-500"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={!key.trim() || loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-xs font-medium py-2 rounded transition-colors"
        >
          {loading ? 'Connecting...' : 'Connect'}
        </button>
      </form>
    </div>
  )
}
