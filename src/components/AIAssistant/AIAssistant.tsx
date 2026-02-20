import React, { useState, useCallback } from 'react'
import { geminiService } from '@services/gemini/geminiService'
import { ChatTab } from './ChatTab'
import { GenerateTab } from './GenerateTab'
import { AnalyzeTab } from './AnalyzeTab'
import { SuggestTab } from './SuggestTab'
import { ApiKeySetup } from './ApiKeySetup'

type Tab = 'chat' | 'generate' | 'analyze' | 'suggest'

interface AIAssistantProps {
  currentDiagram?: unknown
  onDiagramGenerated?: (diagram: unknown) => void
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  currentDiagram,
  onDiagramGenerated,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [isReady, setIsReady] = useState(() => geminiService.isReady())

  const handleApiKeySet = useCallback(() => {
    setIsReady(geminiService.isReady())
  }, [])

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'generate', label: 'Generate', icon: '⚡' },
    { id: 'analyze', label: 'Analyze', icon: '🔍' },
    { id: 'suggest', label: 'Suggest', icon: '💡' },
  ]

  return (
    <div className="flex flex-col h-full bg-white border-l border-industrial-gray">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-industrial-dark text-white">
        <span className="text-sm font-semibold">AI Assistant</span>
        <span className="text-xs bg-blue-500 rounded px-1">Gemini</span>
        <div className={`ml-auto w-2 h-2 rounded-full ${isReady ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>

      {!isReady ? (
        <ApiKeySetup onKeySet={handleApiKeySet} />
      ) : (
        <>
          {/* Tab bar */}
          <div className="flex border-b border-industrial-gray">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="block">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' && <ChatTab />}
            {activeTab === 'generate' && (
              <GenerateTab onDiagramGenerated={onDiagramGenerated} />
            )}
            {activeTab === 'analyze' && (
              <AnalyzeTab currentDiagram={currentDiagram} />
            )}
            {activeTab === 'suggest' && (
              <SuggestTab currentDiagram={currentDiagram} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
