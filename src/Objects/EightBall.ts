import p5 from 'p5';
import { Vector2D } from '../types';
import { PoolBall } from "./PoolBall";

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