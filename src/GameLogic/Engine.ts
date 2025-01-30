import { Physics } from './Physics';
import { PoolBall, EightBall } from '../Objects/PoolBall';
import { Vector2D, GameState, ViewportSize } from '../types';
import { View } from '../Renderer/View';
import p5 from 'p5';

// Main game engine
export class Engine {
    private physics: Physics;
    private view: View;
    private p5Instance: p5;
    private balls: PoolBall[] = [];
    private cueBall: PoolBall;
    private initialMousePosition: Vector2D = { x: 0, y: 0 };
    private isMousePressed: boolean = false;
    private viewportSize = { width: 800, height: 600 };

    constructor() {
        const eightBall = new EightBall(400, 300);
        this.physics = new Physics(this.viewportSize);
        this.view = new View(this.viewportSize);

        // Create cue ball (white ball)
        this.cueBall = new PoolBall(300, 500, 10, '#FFFFFF'); // White cue ball
        this.balls.push(this.cueBall);

        // Create 15 numbered object balls
        this.createObjectBalls();

        this.balls.push(eightBall);
        this.balls.forEach(ball => this.physics.addBall(ball));

        // Create p5 instance
        this.p5Instance = new p5(p => {
            p.setup = () => {
                this.view.setup(p); // Call the setup method in View to set up key press handler
            };
            p.draw = () => this.draw(p);
            p.mousePressed = () => this.handleMousePressed(p);
            p.mouseReleased = () => this.handleMouseReleased(p);
            p.mouseDragged = () => this.handleMouseDragged(p);
        });
    }

    private createObjectBalls(): void {
        // Arrange the balls in a triangle rack formation
        const positions = this.generateRackPositions();
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FF8800', '#FF44BB', '#00AAFF', '#660000', '#111111', '#FF3366', '#339933', '#FF9933']; // Ball colors
        let colorIndex = 0;

        for (let i = 0; i < 15; i++) {
            const pos = positions[i];
            const color = colors[colorIndex % colors.length];
            const ball = new PoolBall(pos.x, pos.y, 10, color);
            this.balls.push(ball);
            colorIndex++;
        }
    }

    private generateRackPositions(): Vector2D[] {
        const positions: Vector2D[] = [];
        const radius = 30; // Radius of each ball
        let row = 0;

        // Arrange balls in a triangular rack formation
        for (let i = 0; i < 15; i++) {
            const x = 400 + (radius * row);  // X position for the current row
            const y = 100 + (radius * (i - row) * 0.8); // Y position with some vertical offset

            positions.push({ x, y });

            if (i === row + 1) row++; // Move to next row after adding a ball
        }

        return positions;
    }

    private handleMousePressed(p: p5): void {
        this.initialMousePosition = { x: p.mouseX, y: p.mouseY };
        console.log('Mouse pressed at', this.initialMousePosition);
        this.isMousePressed = true;
    }

    private handleMouseReleased(p: p5): void {
        if (this.isMousePressed) {
            const deltaX = p.mouseX - this.initialMousePosition.x;
            const deltaY = p.mouseY - this.initialMousePosition.y;

            const force = { x: -deltaX * 0.1, y: -deltaY * 0.1 }; // Invert the direction for pulling the cue stick back
            this.physics.applyForceToCueBall(force);

            console.log(`Force applied: (${force.x}, ${force.y})`);

            this.isMousePressed = false;
        }
    }

    private handleMouseDragged(p: p5): void {
        if (this.isMousePressed) {
            const displacement = {
                x: this.initialMousePosition.x - p.mouseX,
                y: this.initialMousePosition.y - p.mouseY
            };

            // Visualize the drag by drawing a line or force direction (optional)
            p.stroke(0);
            p.line(p.mouseX, p.mouseY, this.initialMousePosition.x, this.initialMousePosition.y);
        }
    }

    private draw(p: p5): void {
        const green = '#008000';
        p.background(green);
        this.physics.update();

        // Render all balls (cue ball + object balls) when in PLAYING state
        if (this.view.getCurrentState() === GameState.PLAYING) {
            for (const ball of this.balls) {
                ball.draw(p);
            }
        }

        // Render the game state through the view handler
        this.view.render(p);
    }
}