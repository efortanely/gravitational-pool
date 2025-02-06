import { Level } from "./Level";
import { Physics } from '../../GameLogic/Physics';
import { PoolBall } from '../../Objects/PoolBall';
import { Vector2D, ViewportSize } from '../../types';
import p5 from 'p5';

export class PlayableLevel extends Level {
    private physics: Physics;
    public balls: PoolBall[] = [];
    private initialMousePosition: Vector2D = { x: 0, y: 0 };
    private isMousePressed: boolean = false;

    constructor(seed: number, viewportSize: ViewportSize) {
        super(seed);
        this.physics = new Physics(viewportSize);

        this.createObjectBalls();
        this.balls.forEach(ball => this.physics.addBall(ball));
    }

    private createObjectBalls(): void {
        const positions = this.generateRackPositions();

        let colorIndex = 0;

        // Cue Ball
        const cueBall = new PoolBall(
            positions.cueBallPosition.x, 
            positions.cueBallPosition.y, 
            10, // Corrected size
            0,
            true
        );
        this.balls.push(cueBall);

        // Rack Balls
        for (let i = 0; i < positions.rackPositions.length; i++) {
            const pos = positions.rackPositions[i];

            let ball = new PoolBall(pos.x, pos.y, 10, i + 1, false);
            if (i === 7) { // 8-ball in center of triangle
                ball = new PoolBall(pos.x, pos.y, 40, i + 1, false);
            }

            this.balls.push(ball);
            colorIndex++;
        }
    }
    
    private generateRackPositions(): { rackPositions: Vector2D[], cueBallPosition: Vector2D } {
        const positions: Vector2D[] = [];
        const ballRadius = 15; // Radius of each ball
        const ballDiameter = ballRadius * 2;
        
        // Starting position for the rack (apex ball)
        const rackStartX = 400;
        const rackStartY = 300;
        
        // Generate positions for 5 rows (1-5 balls per row)
        for (let row = 0; row < 5; row++) {
            const ballsInRow = row + 1;
            
            for (let ball = 0; ball < ballsInRow; ball++) {
                // Calculate positions using equilateral triangle geometry
                // Each row is offset by ballDiameter * cos(30°) ≈ ballDiameter * 0.866
                // Balls within row are offset by ballDiameter
                const x = rackStartX + (row * ballDiameter * 0.866);
                // Center each row and offset balls within row
                const rowWidth = (ballsInRow - 1) * ballDiameter;
                const y = rackStartY + (ball * ballDiameter) - (rowWidth / 2);
                
                positions.push({ x, y });
            }
        }
    
        // Define cue ball position
        const cueBallPosition: Vector2D = {
            x: rackStartX - 200, // Place cue ball 200 pixels left of the rack
            y: rackStartY        // Same vertical position as rack apex
        };
    
        return {
            rackPositions: positions,
            cueBallPosition: cueBallPosition
        };
    }

    public handleMousePressed(p: p5): void {
        if (p.touches.length > 0) {
            this.initialMousePosition = { 
                x: (p.touches[0] as Touch).clientX, 
                y: (p.touches[0] as Touch).clientY 
            };
        } else {
            this.initialMousePosition = { 
                x: p.mouseX, 
                y: p.mouseY 
            };
        }
        this.isMousePressed = true;
    }
    
    public handleMouseReleased(p: p5): void {
        if (this.isMousePressed) {
            let deltaX, deltaY;
    
            if (p.touches.length > 0) {
                // Use touch positions
                deltaX = (p.touches[0] as Touch).clientX - this.initialMousePosition.x;
                deltaY = (p.touches[0] as Touch).clientY - this.initialMousePosition.y;
            } else {
                // Use mouse positions
                deltaX = p.mouseX - this.initialMousePosition.x;
                deltaY = p.mouseY - this.initialMousePosition.y;
            }

            const forceMultiplier = 0.5;
    
            const force = { 
                x: -deltaX * forceMultiplier, 
                y: -deltaY * forceMultiplier
            };
    
            if (Math.abs(force.x) > 0.5 || Math.abs(force.y) > 0.5) {
                this.physics.applyForceToCueBall(force);
            }
    
            this.isMousePressed = false;
        }
    }
    
    public handleMouseDragged(p: p5): void {
        if (this.isMousePressed) {
            let mouseX, mouseY;
    
            if (p.touches.length > 0) {
                // Use touch positions
                mouseX = (p.touches[0] as Touch).clientX;
                mouseY = (p.touches[0] as Touch).clientY;
            } else {
                // Use mouse positions
                mouseX = p.mouseX;
                mouseY = p.mouseY;
            }
    
            // Calculate displacement to visualize drag (no force applied here)
            const displacement = {
                x: this.initialMousePosition.x - mouseX,
                y: this.initialMousePosition.y - mouseY
            };
    
            // Visualize the direction of force (cue stick) as a line
            p.stroke(0);
            p.line(mouseX, mouseY, this.initialMousePosition.x, this.initialMousePosition.y);
    
            // Optionally, display a circle or something at the end of the line to indicate where force is being applied
            p.fill(255, 0, 0);
            p.circle(mouseX, mouseY, 5); // Small red circle to mark mouse position
        }
    }     
    
    public render(p: p5, timePlayed: number): void {
        const green = '#008000';
        p.background(green);
        this.physics.update(p);
    
        // Render all balls (cue ball + object balls)
        for (const ball of this.balls) {
            ball.update(p);
            ball.draw(p);
        }
    }
}
