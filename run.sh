#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display help menu
show_help() {
    echo -e "${BLUE}Gravitational Pool Project Manager${NC}"
    echo "Usage: ./pool-manager.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup            - Install dependencies and setup project"
    echo "  dev              - Start development server"
    echo "  dev_pipeline     - Run clean, setup, build, and dev commands"
    echo "  build            - Build production version"
    echo "  serve            - Serve built files"
    echo "  clean            - Remove build artifacts and dependencies"
    echo "  help             - Show this help message"
}

# Function to check if Node.js and npm are installed
check_prerequisites() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
        exit 1
    fi
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}npm is not installed. Please install npm first.${NC}"
        exit 1
    fi
}

# Setup function
setup() {
    echo -e "${BLUE}Setting up Gravitational Pool project...${NC}"
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
        npm install --save-dev ts-loader webpack-dev-server http-server
        tsc --project tsconfig.json
        
        # Update package.json scripts if needed
        if ! grep -q "\"serve\":" package.json; then
            sed -i '/\"scripts\": {/a \    \"serve\": \"http-server ./dist\",' package.json
        fi
        echo -e "${GREEN}Setup complete!${NC}"
    else
        echo -e "${BLUE}Dependencies already installed. Use 'clean' command to reset if needed.${NC}"
    fi
}

# Development server function
dev() {
    echo -e "${BLUE}Starting development server...${NC}"
    if [ ! -d "node_modules" ]; then
        echo "Dependencies not found. Running setup first..."
        setup
    fi
    npm start
}

# Build function
build() {
    echo -e "${BLUE}Building production version...${NC}"
    if [ ! -d "node_modules" ]; then
        echo "Dependencies not found. Running setup first..."
        setup
    fi
    npm run build
    echo -e "${GREEN}Build complete! Files are in dist/ directory${NC}"
}

# Serve function
serve() {
    echo -e "${BLUE}Serving built files...${NC}"
    if [ ! -d "dist" ]; then
        echo "Built files not found. Running build first..."
        build
    fi
    npm run serve
}

# Clean function
clean() {
    echo -e "${BLUE}Cleaning build artifacts...${NC}"
    if [ -d "dist" ]; then
        echo "Removing dist directory..."
        rm -rf dist
    fi
    if [ -d "node_modules" ]; then
        echo "Removing node_modules..."
        rm -rf node_modules
    fi
    echo -e "${GREEN}Clean complete! Run setup command to reinstall dependencies.${NC}"
}

# Run dev pipeline: clean, build, and dev
dev_pipeline() {
    echo -e "${BLUE}Running pipeline for dev build: clean, setup, build, dev...${NC}"
    clean
    setup
    build
    dev
}

# Main script execution
check_prerequisites

# Handle command line argument
case "$1" in
    "setup")
        setup
        ;;
    "dev")
        dev
        ;;
    "build")
        build
        ;;
    "serve")
        serve
        ;;
    "clean")
        clean
        ;;
    "dev_pipeline")
        dev_pipeline
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac