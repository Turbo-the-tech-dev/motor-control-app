import React, { useState, useCallback } from 'react'
import { geminiService } from '@services/gemini/geminiService'

const EXAMPLES = [
  'DOL motor starter with start/stop buttons and overload protection',
  'Star-delta starter with 5 second transition timer',
  'Forward/reverse motor control with interlocking',
  'Conveyor belt with emergency stop and pilot light',
]

interface GenerateTabProps {
  onDiagramGenerated?: (diagram: unknown) => void
}

export const GenerateTab: React.FC<GenerateTabProps> = ({ onDiagramGenerated }) => {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState('')

  const generate = useCallback(async () => {
    const text = description.trim()
    if (!text || loading) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const diagram = await geminiService.generateDiagram(text)
      setResult(JSON.stringify(diagram.rungs, null, 2))
      onDiagramGenerated?.(diagram)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }, [description, loading, onDiagramGenerated])

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      <p className="text-xs text-gray-500">
        Describe the motor control circuit in plain English.
      </p>

      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="e.g. Star-delta starter with 5 second timer and overload protection..."
        rows={4}
        className="w-full text-xs border border-industrial-gray rounded px-2 py-2 resize-none focus:outline-none focus:border-blue-500"
      />

      <button
        onClick={generate}
        disabled={!description.trim() || loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-xs font-medium py-2 rounded transition-colors"
      >
        {loading ? 'Generating...' : '⚡ Generate Ladder Logic'}
      </button>

      {/* Examples */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Examples:</p>
        <div className="flex flex-col gap-1">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => setDescription(ex)}
              className="text-left text-xs text-blue-500 hover:text-blue-700 hover:underline truncate"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 rounded p-2">{error}</div>
      )}

      {result && (
        <div className="flex-1 overflow-auto">
          <p className="text-xs text-green-600 font-medium mb-1">✓ Diagram generated</p>
          <pre className="text-xs bg-gray-50 rounded p-2 overflow-auto max-h-48 text-gray-700">
            {result}
          </pre>
        </div>
      )}
    </div>
  )
}
