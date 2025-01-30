import p5 from 'p5';

// Vector type for positions and forces
type Vector2D = {
    x: number;
    y: number;
};

// Game states enum
enum GameState {
    START,
    PLAYING,
    GAME_OVER
}

// Base class for all pool balls
class PoolBall {
    protected position: Vector2D;
    protected velocity: Vector2D;
    protected mass: number;
    protected radius: number;
    protected color: string;

    constructor(x: number, y: number, mass: number, color: string) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.mass = mass;
        this.radius = Math.sqrt(mass) * 5; // Scale radius with mass
        this.color = color;
    }

    public applyForce(force: Vector2D): void {
        this.velocity.x += force.x / this.mass;
        this.velocity.y += force.y / this.mass;
    }

    public update(): void {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        
        // Add friction
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
    }

    public draw(p: p5): void {
        p.fill(this.color);
        p.circle(this.position.x, this.position.y, this.radius * 2);
    }

    public getPosition(): Vector2D {
        return this.position;
    }

    public getMass(): number {
        return this.mass;
    }
}

// Special class for the 8 ball with stronger gravitational pull
class EightBall extends PoolBall {
    private readonly gravitationalMultiplier: number = 3;

    constructor(x: number, y: number) {
        super(x, y, 20, '#000000'); // Black color, larger mass
    }

    public getGravitationalForce(otherBall: PoolBall): Vector2D {
        const G = 0.5; // Gravitational constant
        const dx = this.position.x - otherBall.getPosition().x;
        const dy = this.position.y - otherBall.getPosition().y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Avoid division by zero and too strong forces when very close
        const minDistance = this.radius + otherBall.getMass();
        if (distance < minDistance) return { x: 0, y: 0 };

        const force = (G * this.mass * otherBall.getMass() * this.gravitationalMultiplier) / (distance * distance);
        
        return {
            x: (force * dx) / distance,
            y: (force * dy) / distance
        };
    }
}

// Physics engine to handle ball interactions
class Physics {
    private balls: PoolBall[] = [];
    private eightBall: EightBall;
    private maxForce: number = 50; // Maximum force for cue ball hit

    constructor(eightBall: EightBall) {
        this.eightBall = eightBall;
    }

    public addBall(ball: PoolBall): void {
        this.balls.push(ball);
    }

    public applyForceToCueBall(force: Vector2D): void {
        if (this.balls.length === 0) 
            return;
        
        // Apply force to cue ball with a cap
        const magnitude = Math.sqrt(force.x * force.x + force.y * force.y);
        if (magnitude > this.maxForce) {
            const scale = this.maxForce / magnitude;
            force.x *= scale;
            force.y *= scale;
        }

        // Apply this force to the cue ball (first ball in array)
        const cueBall = this.balls[0]; // Ensure cue ball is the first ball in the array
        cueBall.applyForce(force);
    }

    public update(): void {
        // Check for ball collisions
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                const ball1 = this.balls[i];
                const ball2 = this.balls[j];

                // Ball collision detection and resolution
                this.resolveCollision(ball1, ball2);
            }
        }

        // Update balls
        for (const ball of this.balls) {
            ball.update();
        }
    }

    // Resolve elastic collision between two balls
    private resolveCollision(ball1: PoolBall, ball2: PoolBall): void {
        const dx = ball1.getPosition().x - ball2.getPosition().x;
        const dy = ball1.getPosition().y - ball2.getPosition().y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Prevent balls from sticking to each other
        const minDistance = ball1['radius'] + ball2['radius'];
        if (distance < minDistance) {
            // Normal and tangent components of velocities
            const normal = { x: dx / distance, y: dy / distance };
            const relativeVelocity = {
                x: ball1['velocity'].x - ball2['velocity'].x,
                y: ball1['velocity'].y - ball2['velocity'].y,
            };

            // Dot product of relative velocity and normal direction
            const velocityAlongNormal =
                relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;

            // If moving towards each other
            if (velocityAlongNormal < 0) {
                // Calculate impulse scalar
                const impulse = (2 * velocityAlongNormal) / (ball1['mass'] + ball2['mass']);

                // Apply impulse to each ball
                ball1.applyForce({ x: -impulse * ball2['mass'] * normal.x, y: -impulse * ball2['mass'] * normal.y });
                ball2.applyForce({ x: impulse * ball1['mass'] * normal.x, y: impulse * ball1['mass'] * normal.y });
            }
        }
    }
}

// Main game engine
class Engine {
    private physics: Physics;
    private view: View;
    private p5Instance: p5;
    private balls: PoolBall[] = [];
    private cueBall: PoolBall;
    private initialMousePosition: Vector2D = { x: 0, y: 0 };
    private isMousePressed: boolean = false;

    constructor() {
        const eightBall = new EightBall(400, 300);
        this.physics = new Physics(eightBall);
        this.view = new View();

        // Create cue ball (white ball)
        this.cueBall = new PoolBall(300, 500, 10, '#FFFFFF'); // White cue ball
        this.balls.push(this.cueBall);

        // Create 15 numbered object balls
        this.createObjectBalls();

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
            const displacement = {
                x: this.initialMousePosition.x - p.mouseX,
                y: this.initialMousePosition.y - p.mouseY
            };

            // Apply force to the cue ball in the opposite direction of the displacement
            const force = { x: -displacement.x, y: -displacement.y };
            this.physics.applyForceToCueBall(force);
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
        p.background(220);
        this.physics.update();

        // Render all balls (cue ball + object balls)
        for (const ball of this.balls) {
            ball.draw(p);
        }

        this.view.render(p);
    }
}

// View handler for game rendering
class View {
    private currentState: GameState = GameState.START;

    public setState(state: GameState): void {
        this.currentState = state;
    }

    public render(p: p5): void {
        switch (this.currentState) {
            case GameState.START:
                this.renderStartScreen(p);
                break;
            case GameState.PLAYING:
                this.renderGame(p);
                break;
            case GameState.GAME_OVER:
                this.renderGameOver(p);
                break;
        }
    }

    private renderStartScreen(p: p5): void {
        p.textAlign(p.CENTER);
        p.text('Press SPACE to start', p.width / 2, p.height / 2);
    }

    private renderGame(p: p5): void {
        // Render all balls
        // The balls are already drawn in the Engine's draw method
    }

    private renderGameOver(p: p5): void {
        p.textAlign(p.CENTER);
        p.text('Game Over', p.width / 2, p.height / 2);
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
}

// Start the game
new Engine();