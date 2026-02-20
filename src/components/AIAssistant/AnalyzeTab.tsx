import React, { useState, useCallback } from 'react'
import { geminiService } from '@services/gemini/geminiService'

interface AnalyzeTabProps {
  currentDiagram?: unknown
}

export const AnalyzeTab: React.FC<AnalyzeTabProps> = ({ currentDiagram }) => {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [error, setError] = useState('')

  const analyze = useCallback(async () => {
    setLoading(true)
    setError('')
    setAnalysis(null)

    const diagramJson = currentDiagram
      ? JSON.stringify(currentDiagram, null, 2)
      : JSON.stringify({ note: 'No diagram loaded - provide a general motor control analysis' })

    try {
      const result = await geminiService.analyzeDiagram(diagramJson)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }, [currentDiagram])

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      <p className="text-xs text-gray-500">
        Gemini will read your current ladder diagram and explain what it does, flag safety issues, and suggest improvements.
      </p>

      {!currentDiagram && (
        <div className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2 text-yellow-700">
          No diagram loaded. Open a project to analyze a specific circuit.
        </div>
      )}

      <button
        onClick={analyze}
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-xs font-medium py-2 rounded transition-colors"
      >
        {loading ? 'Analyzing...' : '🔍 Analyze Current Diagram'}
      </button>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 rounded p-2">{error}</div>
      )}

      {analysis && (
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs font-medium text-gray-700 mb-1">Analysis:</p>
          <div className="text-xs text-gray-700 bg-gray-50 rounded p-3 leading-relaxed whitespace-pre-wrap">
            {analysis}
          </div>
        </div>
      )}
    </div>
  )
}
