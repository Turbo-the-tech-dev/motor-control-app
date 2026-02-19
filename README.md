# Motor Control Designer

Professional ladder logic editor for industrial motor control applications.

## Features

- **Visual Ladder Logic Editor**: Canvas-based drag-and-drop interface
- **Component Library**: Comprehensive industrial components (contactors, overloads, timers, pilot devices)
- **Circuit Simulation**: Real-time circuit evaluation and debugging
- **Professional Tools**: Address management, wire numbering, validation
- **Standards Compliance**: IEC 61131-3 and industry standards support

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Architecture

The application follows a modular architecture:

- **Presentation Layer**: React components with Canvas API for rendering
- **Business Logic**: Simulation engine and component validation
- **Data Layer**: TypeScript models for ladder elements and projects

## Project Structure

```
src/
├── components/     # React UI components
├── services/       # Business logic and state management
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── assets/         # Static assets
```

## Technology Stack

- React 18 + TypeScript
- Canvas API (Konva.js)
- Redux Toolkit for state management
- Tailwind CSS for styling
- Vite for development and building

## Contributing

1. Follow the existing code conventions
2. Run `npm run lint` and `npm run typecheck` before committing
3. Add tests for new features
4. Update documentation as needed

## License

MIT License - see LICENSE file for details.