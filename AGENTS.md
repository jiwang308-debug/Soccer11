# AGENTS.md - Soccer11

## Project Overview
Two-player soccer duel game - real-time web-based game.

## Build Commands

```bash
# Development server (if using a setup like Vite)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Lint/Format Commands

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check (if using TypeScript)
npm run typecheck
```

## Test Commands

```bash
# Run all tests
npm test

# Run single test file
npm test -- path/to/test.spec.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Code Style Guidelines

### Project Type
- Web-based game (HTML5 Canvas/WebGL)
- Likely TypeScript/JavaScript

### File Organization
```
/src
  /game         # Core game logic (entities, physics, rules)
  /input        # Keyboard/controller input handling
  /rendering    # Canvas/WebGL rendering
  /network      # Multiplayer networking (if applicable)
  /utils        # Shared utilities
  /types        # TypeScript type definitions
/tests          # Test files mirroring src structure
```

### Naming Conventions
- **Files**: kebab-case (e.g., `ball-physics.ts`)
- **Classes**: PascalCase (e.g., `BallPhysics`, `PlayerController`)
- **Functions/Variables**: camelCase (e.g., `updatePosition`, `isScoring`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `MAX_SPEED`)
- **Private members**: Leading underscore discouraged; prefer private keyword

### Imports
- Group imports: external libs → internal modules → types
- Use absolute imports with path aliases (e.g., `@/game/ball`)
- Avoid deep relative imports (../../..)

### TypeScript Guidelines
- Enable strict mode
- Avoid `any` - use `unknown` with type guards
- Explicit return types on exported functions
- Prefer interfaces over type aliases for objects

### Game-Specific Conventions
- Use fixed timestep for physics (e.g., 60 ticks/second)
- Separate update logic from rendering
- Use object pooling for frequently created/destroyed entities
- Store game state in centralized state object

### Error Handling
- Use custom error classes for game-specific errors
- Log errors with context (game state, timestamp)
- Fail fast on initialization errors
- Graceful degradation for non-critical failures

### Comments
- JSDoc for public APIs
- Inline comments for complex game logic
- Avoid obvious comments (e.g., `// increment counter`)

## Development Priorities
1. Core game loop (update + render)
2. Player movement and controls
3. Ball physics and possession
4. Shooting and tackling mechanics
5. Goal detection and scoring
6. UI and game states (menu, playing, game over)

## External Resources
- No Cursor rules found
- No Copilot instructions found
- Project spec: See README.md
