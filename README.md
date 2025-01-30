# Gravitational Pool Game

A unique twist on the classic pool game where balls interact through gravitational forces instead of traditional collision physics. The 8-ball has a stronger gravitational pull, creating an interesting gameplay dynamic where players must account for gravitational effects while planning their shots.

## Core Mechanics
- Balls attract each other through gravitational forces
- The 8-ball has stronger gravitational pull
- Physics simulation using p5.js

## Prerequisites
- Node.js
- npm

## Setup Scripts

Make the scripts executable:
```bash
chmod +x run.sh
```

## Quick Start

0. Debugging:
```bash
./run.sh dev_pipeline
```
This will run clean, setup, build, and dev sequentially. Easy peasy!

1. Initial Setup:
```bash
./run.sh setup
```
This will install all necessary dependencies and development tools.

2. Development Mode:
```bash
./run.sh dev
```
This starts the development server with hot reloading at `http://localhost:9000`

3. Build Project:
```bash
./run.sh build
```
Creates optimized production build in `dist` directory

4. Serve Built Files:
```bash
./run.sh serve
```
Serves the built files at `http://localhost:8080`

5. Clean Project:
```bash
./run.sh clean
```
Removes built files and node_modules for clean slate

## Project Structure
```
gravitational-pool/
├── run.sh             # Bash script
├── public/            # Static files
│   └── index.html
├── src/              # Source code
│   └── index.ts      # Main game logic
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── webpack.config.js # Webpack configuration
```

## Development

The game uses:
- TypeScript for type safety
- p5.js for rendering and animation
- Webpack for bundling
- npm scripts for build processes

To modify the game:
1. Main game logic is in `src/index.ts`
2. Physics calculations are in the `Physics` class
3. Ball behavior is defined in `PoolBall` and `EightBall` classes
4. Rendering is handled by the `View` class

## Build Process

The build process:
1. Compiles TypeScript to JavaScript
2. Bundles all dependencies
3. Optimizes code for production
4. Creates output in `dist` directory

## Troubleshooting

If you encounter issues:

1. Missing dependencies:
```bash
./scripts/setup.sh
```

2. Build errors:
```bash
./scripts/clean.sh
./scripts/setup.sh
```

3. Server not starting:
- Check if ports 9000 or 8080 are available
- Ensure all dependencies are installed
- Check console for error messages

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request