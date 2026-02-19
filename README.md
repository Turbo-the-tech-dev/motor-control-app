# Motor Control Designer

Professional ladder logic editor for industrial motor control applications.

## Features

- **Visual Ladder Logic Editor**: Canvas-based drag-and-drop interface
- **Component Library**: Comprehensive industrial components (contactors, overloads, timers, pilot devices)
- **Circuit Simulation**: Real-time circuit evaluation and debugging
- **Professional Tools**: Address management, wire numbering, validation
- **Standards Compliance**: IEC 61131-3 and industry standards support

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher (bundled with Node.js)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Turbo-the-tech-dev/motor-control-app.git
cd motor-control-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Type-check and build for production (output: `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with Vitest browser UI |
| `npm run lint` | Lint TypeScript/TSX files with ESLint |
| `npm run typecheck` | Run TypeScript type checking without emitting files |
| `npm run format` | Format all files with Prettier |

## Project Structure

```
motor-control-app/
├── src/
│   ├── components/     # React UI components
│   ├── services/       # Business logic and state management
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── assets/         # Static assets
├── public/             # Static public files
├── tests/              # Test files
├── index.html          # HTML entry point
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 18 + TypeScript |
| Canvas Rendering | Konva.js / react-konva |
| State Management | Redux Toolkit + Zustand |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Drag & Drop | react-dnd |
| Build Tool | Vite |
| Testing | Vitest |

## Path Aliases

The following import aliases are configured in `tsconfig.json` and `vite.config.ts`:

```ts
@/           → src/
@components/ → src/components/
@services/   → src/services/
@types/      → src/types/
@utils/      → src/utils/
@assets/     → src/assets/
```

## Contributing

1. Fork the repository and create a feature branch
2. Run `npm run lint` and `npm run typecheck` before committing
3. Add tests for new features
4. Open a pull request against `master`

## License

MIT License - see LICENSE file for details.
