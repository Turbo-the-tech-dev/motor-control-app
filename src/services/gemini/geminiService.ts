import { GoogleGenerativeAI } from '@google/generative-ai'
import { SYSTEM_PROMPT, ANALYZE_PROMPT, SUGGEST_PROMPT } from './prompts'

export interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

export interface GeneratedDiagram {
  rungs: unknown[]
  raw: string
}

export interface GeminiServiceConfig {
  apiKey: string
  model?: string
}

class GeminiService {
  private client: GoogleGenerativeAI | null = null
  private modelName = 'gemini-2.0-flash'

  constructor() {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY
    if (envKey && envKey !== 'paste_your_key_here') {
      this.client = new GoogleGenerativeAI(envKey)
    }
  }

  init(config: GeminiServiceConfig): void {
    this.client = new GoogleGenerativeAI(config.apiKey)
    if (config.model) this.modelName = config.model
  }

  isReady(): boolean {
    return this.client !== null
  }

  private getModel() {
    if (!this.client) throw new Error('Gemini not initialized. Add your API key in settings.')
    return this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: SYSTEM_PROMPT,
    })
  }

  async chat(messages: ChatMessage[], newMessage: string): Promise<string> {
    const model = this.getModel()
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history })
    const result = await chat.sendMessage(newMessage)
    return result.response.text()
  }

  async generateDiagram(description: string): Promise<GeneratedDiagram> {
    const model = this.getModel()
    const prompt = `Generate a ladder logic diagram for: "${description}"\n\nRespond with ONLY valid JSON, no markdown code blocks.`
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    try {
      const parsed = JSON.parse(raw)
      return { rungs: parsed.rungs ?? [], raw }
    } catch {
      // Try to extract JSON if model wrapped it anyway
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        return { rungs: parsed.rungs ?? [], raw: match[0] }
      }
      throw new Error('Gemini returned invalid JSON. Try rephrasing your description.')
    }
  }

  async analyzeDiagram(diagramJson: string): Promise<string> {
    const model = this.getModel()
    const result = await model.generateContent(ANALYZE_PROMPT(diagramJson))
    return result.response.text()
  }

  async suggestComponents(diagramJson: string): Promise<string> {
    const model = this.getModel()
    const result = await model.generateContent(SUGGEST_PROMPT(diagramJson))
    return result.response.text()
  }
}

export const geminiService = new GeminiService()
