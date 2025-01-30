import { Vector2D } from '../types';
import { PoolBall } from './PoolBall'

export class PoolTable {
    width: number;
    height: number;
    pockets: Vector2D[];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.pockets = [
            { x: 0, y: 0 },
            { x: width/2, y: 0 },
            { x: width, y: 0 },
            { x: 0, y: height },
            { x: width/2, y: height },
            { x: width, y: height }
        ];
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Draw table
        ctx.fillStyle = '#076324';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw pockets
        this.pockets.forEach(pocket => {
            ctx.beginPath();
            ctx.arc(pocket.x, pocket.y, 20, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.closePath();
        });
    }

    checkCollisions(ball: PoolBall) {
        // Wall collisions
        const position = ball.getPosition();
        const velocity = ball.getVelocity();

        if (position.x - ball.getRadius() < 0 || position.x + ball.getRadius() > this.width) {
            velocity.x *= -0.9;
        }
        if (position.y - ball.getRadius() < 0 || position.y + ball.getRadius() > this.height) {
            velocity.y *= -0.9;
        }

        // Keep ball in bounds
        const pos = ball.getPosition();
        ball.setPosition(
            Math.max(ball.getRadius(), Math.min(this.width - ball.getRadius(), pos.x)),
            Math.max(ball.getRadius(), Math.min(this.height - ball.getRadius(), pos.y))
        );
    }
}