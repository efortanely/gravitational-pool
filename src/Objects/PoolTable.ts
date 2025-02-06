import p5 from "p5";
import { Vector2D, ViewportSize } from "../types";
import { PoolBall } from "./PoolBall";

export class PoolTable {
    private viewportSize: ViewportSize;
    private tableColor: string = "#2E8B57"; // Green pool table
    private pockets: Vector2D[]; // List of pocket positions
    private pocketRadius = 50;

    constructor(viewportSize: ViewportSize) {
        this.viewportSize = viewportSize;
        this.pockets = [
            { x: this.pocketRadius, y: this.pocketRadius }, // Top-left pocket
            { x: this.viewportSize.width - this.pocketRadius, y: this.pocketRadius }, // Top-right pocket
            { x: this.pocketRadius, y: this.viewportSize.height - this.pocketRadius }, // Bottom-left pocket
            { x: this.viewportSize.width - this.pocketRadius, y: this.viewportSize.height - this.pocketRadius }, // Bottom-right pocket
            { x: this.viewportSize.width / 2, y: this.pocketRadius }, // Middle-top pocket
            { x: this.viewportSize.width / 2, y: this.viewportSize.height - this.pocketRadius } // Middle-bottom pocket
        ];
    }

    public draw(p: p5): void {
        p.fill(this.tableColor);
        p.rect(0, 0, this.viewportSize.width, this.viewportSize.height);

        // Draw pockets (small circles at pocket locations)
        p.fill(0);
        this.pockets.forEach(pocket => {
            p.circle(pocket.x, pocket.y, 30);
        });
    }

    public updateBallsSinking(balls: PoolBall[], sunkBalls: number, remainingBalls: number) {
        balls.forEach((ball) => {
            if (this.checkIfBallSunk(ball)) {
                if (!ball.isSunk) {
                    sunkBalls++;
                    ball.isSunk = true; // Mark ball as sunk
                    remainingBalls--;
                }
            }
        });
    
        return { sunkBalls, remainingBalls };
    }

    private checkIfBallSunk(ball: PoolBall): boolean {
        // If the ball is the cue ball, it cannot be sunk
        if (ball.isCueBall) {
            return false;
        }
    
        for (let pocket of this.pockets) {
            const distance = Math.sqrt(
                Math.pow(ball.position.x - pocket.x, 2) + Math.pow(ball.position.y - pocket.y, 2)
            );
    
            const bufferMultiplier = 3;
            if (distance < this.pocketRadius * bufferMultiplier) {
                return true; // Ball is sunk
            }
        }
    
        return false;
    }
    
}
