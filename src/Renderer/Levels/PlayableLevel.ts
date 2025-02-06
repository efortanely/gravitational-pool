import p5 from "p5";
import { PoolAI } from "../../Agents/PoolAI";
import { Physics } from "../../GameLogic/Physics";
import { PoolBall } from "../../Objects/PoolBall";
import { PoolTable } from "../../Objects/PoolTable";
import { Vector2D, ViewportSize } from "../../types";
import { Level } from "./Level";

export class PlayableLevel extends Level {
    private poolTable: PoolTable;
    private physics: Physics;
    public balls: PoolBall[] = [];
    private initialMousePosition: Vector2D = { x: 0, y: 0 };
    private isMousePressed: boolean = false;
    public remainingBalls: number = 10;
    private viewportSize: ViewportSize;
    private sunkBalls: number = 0;
    private totalBalls: number = 10;
    private poolAi: PoolAI;
    
    // AI Control toggle
    private isAIEnabled: boolean = false;
    
    // Turn management
    private isAITurn: boolean = false;

    constructor(seed: number, viewportSize: ViewportSize) {
        super(seed);
        this.viewportSize = viewportSize;

        this.createObjectBalls();
        this.physics = new Physics(viewportSize);
        this.balls.forEach(ball => this.physics.addBall(ball));
        this.poolTable = new PoolTable(viewportSize);
        this.poolAi = new PoolAI(this.physics, this.balls, this.balls[0]);
        this.physics.balls = this.balls;
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

    public toggleAI(): void {
        this.isAIEnabled = !this.isAIEnabled;
        if (this.isAIEnabled) {
            this.isAITurn = true;  // Start with AI's turn if AI is enabled
        }
    }

    public nextTurn(): void {
        if (this.isAITurn && this.isAIEnabled) {
            this.poolAi.makeMove();  // AI makes its move
            console.log('AI Move Made'); // Debugging
        } else {
            // Player's turn, waiting for mouse input
        }
    
        this.isAITurn = !this.isAITurn; // Alternate turns
    }

    public render(p: p5, timePlayed: number): void {
        this.poolTable.draw(p);
        this.physics.update(p);
    
        for (const ball of this.balls) {
            ball.draw(p);
        }
    
        if (this.isAIEnabled && this.isAITurn) {
            // AI takes its turn if enabled and it is the AI's turn
            this.nextTurn();
        }
    
        const result = this.poolTable.updateBallsSinking(this.balls, this.sunkBalls, this.remainingBalls);
        this.sunkBalls = result.sunkBalls;
        this.remainingBalls = result.remainingBalls;
    
        this.poolTable.draw(p);
        this.drawHUD(p, this.isAIEnabled, timePlayed);
    
        this.balls.forEach(ball => ball.draw(p));
    }

    private drawHUD(p: p5, aiEnabled: boolean, elapsedTime: number) {
        // Background for the HUD (semi-transparent)
        p.fill(0, 0, 0, 150); // black with transparency
        p.noStroke();
        p.rect(10, 10, this.viewportSize.width - 20, 100, 15); // rounded corners (adjusted size to fit score and time)
    
        // Balls Sunk
        p.fill(255, 255, 255); // White color for text
        p.textSize(20);
        p.textFont('Comic Sans MS'); // Cute font
        p.textAlign(p.LEFT, p.TOP);
        p.text(`Balls Sunk: ${this.sunkBalls}/${this.totalBalls}`, 20, 20);
    
        // Score
        p.textSize(18);
        p.text(`Score: ${this.sunkBalls * 10}`, 20, 50); // For simplicity, assuming each ball is worth 10 points.
    
        // Time
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = Math.floor(elapsedTime % 60);
        p.textSize(18);
        p.text(`Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`, 20, 80);
    
        // AI Toggle Button Text
        const aiButtonWidth = 140;
        const aiButtonHeight = 40;
        const aiButtonX = this.viewportSize.width - aiButtonWidth - 20;
        const aiButtonY = 20;
    
        p.fill(255, 204, 0); // Light yellow for button background
        p.rect(aiButtonX, aiButtonY, aiButtonWidth, aiButtonHeight, 10); // Rounded corners for button
    
        p.fill(0); // Black text color
        p.textSize(16);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(aiEnabled ? "AI: ON" : "AI: OFF", aiButtonX + aiButtonWidth / 2, aiButtonY + aiButtonHeight / 2);
    }      

    public handleMouseReleased(p: p5): void {
        if (this.isAITurn || this.isAIEnabled) return; // Skip if it's AI's turn or AI is enabled
    
        if (this.isMousePressed) {
            let deltaX, deltaY;
    
            if (p.touches.length > 0) {
                deltaX = (p.touches[0] as Touch).clientX - this.initialMousePosition.x;
                deltaY = (p.touches[0] as Touch).clientY - this.initialMousePosition.y;
            } else {
                deltaX = p.mouseX - this.initialMousePosition.x;
                deltaY = p.mouseY - this.initialMousePosition.y;
            }
    
            console.log('Mouse Released: DeltaX:', deltaX, 'DeltaY:', deltaY); // Debugging
    
            const forceMultiplier = 0.5; // Adjust the multiplier to scale the force
            const force = { 
                x: -deltaX * forceMultiplier, 
                y: -deltaY * forceMultiplier 
            };
    
            if (Math.abs(force.x) > 0.5 || Math.abs(force.y) > 0.5) {
                this.physics.applyForceToCueBall(force);
            }
            this.isMousePressed = false;
        }
    
        // After player has finished their move, trigger the next turn (AI's turn if enabled)
        this.nextTurn();
    }
    
    public handleMouseDragged(p: p5): void {
        if (this.isMousePressed) {
            let mouseX, mouseY;
    
            if (p.touches.length > 0) {
                mouseX = (p.touches[0] as Touch).clientX;
                mouseY = (p.touches[0] as Touch).clientY;
            } else {
                mouseX = p.mouseX;
                mouseY = p.mouseY;
            }
    
            // Visualize the direction of force (cue stick) as a line
            p.stroke(0);
            p.line(mouseX, mouseY, this.initialMousePosition.x, this.initialMousePosition.y);
    
            // Optionally, display a circle or something at the end of the line to indicate where force is being applied
            p.fill(255, 0, 0);
            p.circle(mouseX, mouseY, 5); // Small red circle to mark mouse position
        }
    }

    public handleMousePressed(p: p5): boolean {
        if (this.isAIEnabled || this.isAITurn) return this.isAIEnabled; // Don't allow player to control when it's AI's turn
    
        // Player's mouse press logic here
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
        console.log('Mouse Pressed', this.initialMousePosition); // Debugging
    
        // Check if the AI toggle button was clicked
        const aiButtonWidth = 120;
        const aiButtonHeight = 30;
        const aiButtonX = this.viewportSize.width - aiButtonWidth - 20;
        const aiButtonY = 20;
    
        if (
            p.mouseX > aiButtonX && p.mouseX < aiButtonX + aiButtonWidth &&
            p.mouseY > aiButtonY && p.mouseY < aiButtonY + aiButtonHeight
        ) {
            this.toggleAI(); // Toggle AI state on button click
            console.log('AI Toggled:', this.isAIEnabled); // Debugging
        }
    
        return this.isAIEnabled;
    }
}
