import { Level } from "./Level";
import { Physics } from '../../GameLogic/Physics'
import { PoolBall } from '../../Objects/PoolBall';
import { EightBall } from '../../Objects/EightBall';
import { Vector2D, ViewportSize } from '../../types';
import p5 from 'p5';

export class PlayableLevel extends Level {
    private physics: Physics;
    public balls: PoolBall[] = [];
    private initialMousePosition: Vector2D = { x: 0, y: 0 };
    private isMousePressed: boolean = false;

    constructor(seed: number, viewportSize: ViewportSize){
        super(seed);
        this.physics = new Physics(viewportSize);

        this.createObjectBalls();
        this.balls.forEach(ball => this.physics.addBall(ball));
    }

    private createObjectBalls(): void {
        // Arrange the balls in a triangle rack formation
        const positions = this.generateRackPositions();
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FF8800', '#FF44BB', '#00AAFF', '#660000', '#111111', '#FF3366', '#339933', '#FF9933']; // Ball colors
        let colorIndex = 0;

        const cueBall = new PoolBall(positions['cueBallPosition'].x, positions['cueBallPosition'].y, 10, '#FFFFFF', true);
        this.balls.push(cueBall);

        for (let i = 0; i < 15; i++) {
            const pos = positions["rackPositions"][i];
            const color = colors[colorIndex % colors.length];
            let ball = new PoolBall(pos.x, pos.y, 10, color, false);
            
            if (i == 8){
                ball = new EightBall(pos.x, pos.y, 10, 'black');
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
        // Save the initial position of the mouse when it's pressed
        this.initialMousePosition = { x: p.mouseX, y: p.mouseY };
        console.log('Mouse pressed at', this.initialMousePosition);
        this.isMousePressed = true;
    }
    
    public handleMouseReleased(p: p5): void {
        if (this.isMousePressed) {
            // Calculate the displacement of the mouse from the initial position
            const deltaX = p.mouseX - this.initialMousePosition.x;
            const deltaY = p.mouseY - this.initialMousePosition.y;
    
            // Create force vector based on mouse movement, inverted to simulate pulling back the cue stick
            const force = { 
                x: -deltaX * 0.1, // Adjust the scale factor (0.1) for appropriate force
                y: -deltaY * 0.1
            };
    
            // Apply force to the cue ball through physics engine
            this.physics.applyForceToCueBall(force);
    
            console.log(`Force applied: (${force.x}, ${force.y})`);
    
            // Reset mouse pressed state after release
            this.isMousePressed = false;
        }
    }
    
    public handleMouseDragged(p: p5): void {
        if (this.isMousePressed) {
            // Calculate displacement to visualize drag (no force applied here)
            const displacement = {
                x: this.initialMousePosition.x - p.mouseX,
                y: this.initialMousePosition.y - p.mouseY
            };
    
            // Visualize the direction of force (cue stick) as a line
            p.stroke(0);
            p.line(p.mouseX, p.mouseY, this.initialMousePosition.x, this.initialMousePosition.y);
    
            // Optionally, display a circle or something at the end of the line to indicate where force is being applied
            p.fill(255, 0, 0);
            p.circle(p.mouseX, p.mouseY, 5); // Small red circle to mark mouse position
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