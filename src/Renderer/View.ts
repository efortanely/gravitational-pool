import { Engine } from "../GameLogic/Engine";
import { GameState } from "../types";
import p5 from 'p5';

// View handler for game rendering
export class View {
    private currentState: GameState = GameState.START;

    public getCurrentState(): GameState {
        return this.currentState;
    }

    public setState(state: GameState): void {
        this.currentState = state;
    }

    public render(p: p5): void {
        // Starry background (for START and GAME_OVER screens)
        this.drawStarryBackground(p);

        switch (this.currentState) {
            case GameState.START:
                this.renderStartScreen(p);
                break;
            case GameState.PLAYING:
                // Renders game in Engine.ts
                break;
            case GameState.GAME_OVER:
                this.renderGameOver(p);
                break;
        }
    }

    private renderStartScreen(p: p5): void {
        p.textAlign(p.CENTER);
        p.textSize(48);
        p.fill(255); // White text
        p.text('Gravitational Pool', p.width / 2, p.height / 2 - 50);
        p.textSize(24);
        p.text('Press SPACE to start', p.width / 2, p.height / 2 + 50);
    }

    private renderGameOver(p: p5): void {
        p.textAlign(p.CENTER);
        p.textSize(48);
        p.fill(255); // White text
        p.text('GAME OVER!', p.width / 2, p.height / 2 - 50);
        p.textSize(24);
        p.text('You played for ' + this.getPlayTime() + ' seconds.', p.width / 2, p.height / 2 + 50);
    }

    private drawStarryBackground(p: p5): void {
        p.fill(255, 255, 255, 150); // White with some transparency
        for (let i = 0; i < 100; i++) {
            const x = p.random(p.width);
            const y = p.random(p.height);
            const size = p.random(1, 3);
            p.ellipse(x, y, size, size);
        }
    }

    public setup(p: p5): void {
        p.createCanvas(800, 600);

        // Listen for spacebar press
        p.keyPressed = () => {
            if (p.key === ' ') {
                this.setState(GameState.PLAYING); // Change to playing state when space is pressed
            }
        };
    }

    private getPlayTime(): number {
        // Placeholder method to calculate time; it could be based on frames or another timing mechanism
        return Math.floor(Math.random() * 100); // Just a random number for demonstration
    }
}