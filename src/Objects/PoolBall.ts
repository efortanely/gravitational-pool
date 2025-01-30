import p5, { Vector } from 'p5';
import { Vector2D, BallState } from '../types';

export class PoolBall {
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

    // TODO fix: this is too strong
    public applyCentripetalForce(): void {
        const friction = 0.1;
        const velocity = this.getVelocity();
        const centripetalForce = { x: -friction * velocity.x, y: -friction * velocity.y };
        this.velocity.x += centripetalForce.x;
        this.velocity.y += centripetalForce.y;
    }

    public applyForce(force: Vector2D): void {
        console.log("Applying force", force);
        this.velocity.x += force.x / this.mass;
        this.velocity.y += force.y / this.mass;
        console.log("New velocity", this.velocity);
    }

    public update(): void {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        console.log("Updating ball position to", this.position);
        
        // Add friction
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
    }

    public draw(p: p5): void {
        p.noStroke();
        p.fill(this.color);
        p.circle(this.position.x, this.position.y, this.radius * 2);
        console.log("Drawing ball at", this.position);
    }

    public setPosition(x: number, y: number): void {
        this.position = { x, y };
    }

    public getPosition(): Vector2D {
        return this.position;
    }

    public getVelocity(): Vector2D {
        return this.velocity;
    }

    public getMass(): number {
        return this.mass;
    }

    public getRadius(): number {
        return this.radius;
    }
}

// Special class for the 8 ball with stronger gravitational pull
export class EightBall extends PoolBall {
    private readonly gravitationalMultiplier: number = 10;

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

    public draw(p: p5): void {
        p.fill(this.color);
        p.circle(this.position.x, this.position.y, this.radius * 2);
        console.log("Drawing ball at", this.position);
        // put white border around
        p.stroke(255);
    }
}