import React, { useState, useCallback } from 'react'
import { geminiService } from '@services/gemini/geminiService'

interface SuggestTabProps {
  currentDiagram?: unknown
}

export const SuggestTab: React.FC<SuggestTabProps> = ({ currentDiagram }) => {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string | null>(null)
  const [error, setError] = useState('')

  const getSuggestions = useCallback(async () => {
    setLoading(true)
    setError('')
    setSuggestions(null)

    const diagramJson = currentDiagram
      ? JSON.stringify(currentDiagram, null, 2)
      : JSON.stringify({ note: 'Empty motor control project' })

    try {
      const result = await geminiService.suggestComponents(diagramJson)
      setSuggestions(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions')
    } finally {
      setLoading(false)
    }
  }, [currentDiagram])

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      <p className="text-xs text-gray-500">
        Get AI-powered component and circuit suggestions based on your current design.
      </p>

      <button
        onClick={getSuggestions}
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-xs font-medium py-2 rounded transition-colors"
      >
        {loading ? 'Thinking...' : '💡 Get Suggestions'}
      </button>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 rounded p-2">{error}</div>
      )}

      {suggestions && (
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs font-medium text-gray-700 mb-1">Suggestions:</p>
          <div className="text-xs text-gray-700 bg-gray-50 rounded p-3 leading-relaxed whitespace-pre-wrap">
            {suggestions}
          </div>
        </div>
      )}
    </div>
  )
}
