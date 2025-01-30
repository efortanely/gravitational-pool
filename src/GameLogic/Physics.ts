import { PoolBall } from "../Objects/PoolBall";
import { Vector2D } from "../types";

// Physics engine to handle ball interactions
export class Physics {
    private balls: PoolBall[] = [];
    private maxForce: number = 50; // Maximum force for cue ball hit

    constructor(balls: PoolBall[] = []) {
        this.balls = balls;
    }

    public addBall(ball: PoolBall): void {
        this.balls.push(ball);
    }

    public applyForceToCueBall(force: Vector2D): void {
        if (this.balls.length === 0) {
            console.error('No balls in the physics engine!');
            return;
        }

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