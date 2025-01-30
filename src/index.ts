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

    constructor(eightBall: EightBall) {
        this.eightBall = eightBall;
    }

    public addBall(ball: PoolBall): void {
        this.balls.push(ball);
    }

    public update(): void {
        // Update gravitational forces
        for (const ball of this.balls) {
            const force = this.eightBall.getGravitationalForce(ball);
            ball.applyForce(force);
            ball.update();
        }
        this.eightBall.update();
    }
}

// Main game engine
class Engine {
    private physics: Physics;
    private view: View;
    private p5Instance: p5;

    constructor() {
        const eightBall = new EightBall(400, 300);
        this.physics = new Physics(eightBall);
        this.view = new View();
        
        // Create p5 instance
        this.p5Instance = new p5((p: p5) => {
            p.setup = () => this.setup(p);
            p.draw = () => this.draw(p);
        });
    }

    private setup(p: p5): void {
        p.createCanvas(800, 600);
        // Initialize game objects here
    }

    private draw(p: p5): void {
        p.background(220);
        this.physics.update();
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
        // Render game objects here
    }

    private renderGameOver(p: p5): void {
        p.textAlign(p.CENTER);
        p.text('Game Over', p.width / 2, p.height / 2);
    }
}

// Start the game
new Engine();