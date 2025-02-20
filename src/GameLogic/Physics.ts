import p5 from "p5";
import { PoolBall } from "../Objects/PoolBall";
import { Vector2D, ViewportSize } from "../types";

// Physics engine to handle ball interactions
export class Physics {
    public balls: PoolBall[] = [];
    private maxForce: number = 150; // Maximum force for cue ball hit
    private viewportSize: ViewportSize;
    private gravitationalConstant: number = 0.5; // Adjust this value to control the strength of gravity
    private lagForGravityFrameCount: number = 200;

    constructor(viewportSize: ViewportSize, balls: PoolBall[] = []) {
        this.balls = balls;
        this.viewportSize = viewportSize;
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

    public update(p: p5, frame: number): void {
        // Apply gravitational force between all pairs of balls
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                const ball1 = this.balls[i];
                const ball2 = this.balls[j];
                
                // Skip gravitational force after a certain number of frames
                if(ball1.getCollisionFrame() !== null && (ball1.getCollisionFrame() as number + this.lagForGravityFrameCount) > frame
                    && ball2.getCollisionFrame() !== null && (ball2.getCollisionFrame() as number + this.lagForGravityFrameCount) > frame)
                    continue;

                // Calculate gravitational force
                const gravitationalForce = this.calculateGravitationalForce(ball1, ball2);

                // Apply gravitational force to both balls
                ball1.applyForce(gravitationalForce);
                ball2.applyForce({ x: -gravitationalForce.x, y: -gravitationalForce.y });
            }
        }

        // Check for ball collisions
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                const ball1 = this.balls[i];
                const ball2 = this.balls[j];

                // Ball collision detection and resolution
                this.resolveCollision(ball1, ball2);
                ball1.setCollisionFrame(frame);
                ball2.setCollisionFrame(frame);
            }
        }

        this.resolveWallCollisions();

        // Update balls
        for (const ball of this.balls) {
            ball.update(p);
        }
    }

    // Calculate gravitational force between two balls
    private calculateGravitationalForce(ball1: PoolBall, ball2: PoolBall): Vector2D {
        const dx = ball2.getPosition().x - ball1.getPosition().x;
        const dy = ball2.getPosition().y - ball1.getPosition().y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0)
            return { x: 0, y: 0 };

        // Calculate gravitational force magnitude
        const forceMagnitude = (this.gravitationalConstant * ball1['mass'] * ball2['mass']) / (distance * distance);

        // Calculate force components
        const forceX = forceMagnitude * (dx / distance);
        const forceY = forceMagnitude * (dy / distance);

        return { x: forceX, y: forceY };
    }

    // Resolve elastic collision between two balls
    private resolveCollision(ball1: PoolBall, ball2: PoolBall): void {
        const dx = ball1.getPosition().x - ball2.getPosition().x;
        const dy = ball1.getPosition().y - ball2.getPosition().y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Prevent balls from sticking to each other
        const minDistance = ball1['radius'] + ball2['radius'];
        if (distance < minDistance) {
            // Move the balls apart
            const overlap = 0.5 * (distance - minDistance);
            ball1.setPosition(ball1.getPosition().x - overlap * (dx / distance), ball1.getPosition().y - overlap * (dy / distance));

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
                const scaling = 2;
                const impulse = scaling * (2 * velocityAlongNormal) / (ball1['mass'] + ball2['mass']);

                // Apply impulse to each ball
                ball1.applyForce({ x: -impulse * ball2['mass'] * normal.x, y: -impulse * ball2['mass'] * normal.y });
                ball2.applyForce({ x: impulse * ball1['mass'] * normal.x, y: impulse * ball1['mass'] * normal.y });
            }
        }
    }

    private resolveWallCollisions(): void {
        for (const ball of this.balls) {
            const position = ball.getPosition();
            const radius = ball['radius'];
            const diameter = 2 * radius;
            const diff = 1;
    
            // Left and right wall collision
            if (position.x - diff < 0) {  // Left side
                ball.setPosition(diff, position.y);  // Move to the right side
                ball['velocity'].x *= -1;  // Reflect velocity
            } else if (position.x + diameter > this.viewportSize.width) {  // Right side
                ball.setPosition(this.viewportSize.width - diameter, position.y);  // Move to the left side
                ball['velocity'].x *= -1;  // Reflect velocity
            }
    
            // Top and bottom wall collision
            if (position.y - diff < 0) {  // Top side
                ball.setPosition(position.x, diff);  // Move down
                ball['velocity'].y *= -1;  // Reflect velocity
            } else if (position.y + diameter > this.viewportSize.height) {  // Bottom side
                ball.setPosition(position.x, this.viewportSize.height - diameter);  // Move up
                ball['velocity'].y *= -1;  // Reflect velocity
            }
        }
    }

    // Method to get the velocity of a ball (assuming it's calculated or tracked)
    public getBallVelocity(ball: PoolBall): number {
        // Example: Calculate the speed from the velocity vector (you may already have something similar)
        const velocityX = ball.velocity.x; // assuming velocity.x is the horizontal speed
        const velocityY = ball.velocity.y; // assuming velocity.y is the vertical speed

        // Calculate the magnitude of the velocity vector (Euclidean distance)
        return Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    }
}