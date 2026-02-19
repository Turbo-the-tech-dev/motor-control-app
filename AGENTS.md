# AGENTS.md - Motor Control App

Guidelines for agentic coding agents working on this React + TypeScript ladder logic editor.

## Technology Stack

- React 18 + TypeScript 5 + Vite 4
- Vitest for testing
- Redux Toolkit + Zustand for state
- Tailwind CSS + Konva (canvas)
- React-DND for drag-and-drop

---

## Commands

### Development & Build
```bash
npm run dev          # Dev server on port 3000
npm run build        # Type-check + production build
npm run preview     # Preview production build
```

### Testing
```bash
npm run test         # Run all tests (Vitest)
npm run test:ui      # Run with Vitest UI

# Run single test file
npm test -- path/to/file.test.ts

# Run tests matching pattern
npm test -- --grep "component name"
```

### Linting
```bash
npm run lint         # ESLint
npm run typecheck    # TypeScript (noEmit)
npm run format       # Prettier write
```

---

## Code Style

### TypeScript
- Strict mode enabled - avoid `any`, use `unknown`
- Explicit types for function params/returns
- Interface for objects, type for unions

```typescript
interface User {
  id: string
  role: 'admin' | 'editor'
}
function getUser(id: string): Promise<User | null>
```

### Imports
Use path aliases:
```typescript
import { Button } from '@components/Button'
import { useAppSelector } from '@services/store/hooks'
import type { Diagram } from '@types/index'
```

Order: React → external → aliases → relative → type imports

### Naming
- Components: PascalCase (`LadderEditor`)
- Files: `.tsx` = PascalCase, `.ts` = camelCase
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Booleans: `isActive`, `hasPermission`

### React
- Functional components with hooks
- Use `useCallback` for event handlers
- Use `useMemo` for expensive computations
- Destructure props with types

```typescript
interface Props {
  diagram: Diagram
  onChange: (d: Diagram) => void
}
export const LadderEditor: React.FC<Props> = ({ diagram, onChange }) => {}
```

### Error Handling
- Try/catch for async operations
- User-friendly error messages
- Log with console.error

### Tailwind CSS
Custom colors: `industrial-*` (red, orange, gray, dark, light), `ladder-*` (rail, wire, hot)

```typescript
<div className="p-4 bg-industrial-light text-industrial-dark">
```

### Canvas (Konva)
- Use React-Konva for declarative rendering
- Handle pixel ratio for high-DPI
- Cleanup in useEffect return

### Testing
- Test files: `*.test.ts` in same directory
- Use Vitest: `describe`, `it`, `expect`
- Test user interactions, not implementation

---

## Project Structure

```
src/
├── components/    # React components
├── services/      # Redux store, API
├── types/        # TypeScript types
└── utils/        # Utility functions
```

---

## Common Tasks

### Add component
1. Create in `src/components/ComponentName/`
2. Add to relevant panel/canvas

### Typecheck before commit
```bash
npm run typecheck && npm run lint
```
