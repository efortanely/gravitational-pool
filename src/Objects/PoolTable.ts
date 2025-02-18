import p5 from "p5";
import { Vector2D, ViewportSize } from "../types";
import { PoolBall } from "./PoolBall";

export class PoolTable {
    private viewportSize: ViewportSize;
    private tableColor: string = "#2E8B57"; // Green pool table
    public pockets: Vector2D[];
    private pocketDiameter = 30;

    constructor(viewportSize: ViewportSize) {
        this.viewportSize = viewportSize;
        this.pockets = [
            { x: this.pocketDiameter/2, y: this.pocketDiameter/2 }, // Top-left pocket
            { x: this.viewportSize.width - this.pocketDiameter/2, y: this.pocketDiameter/2 }, // Top-right pocket
            { x: this.pocketDiameter/2, y: this.viewportSize.height - this.pocketDiameter/2 }, // Bottom-left pocket
            { x: this.viewportSize.width - this.pocketDiameter/2, y: this.viewportSize.height - this.pocketDiameter/2 }, // Bottom-right pocket
            { x: this.viewportSize.width / 2, y: this.pocketDiameter/2 }, // Middle-top pocket
            { x: this.viewportSize.width / 2, y: this.viewportSize.height - this.pocketDiameter/2 } // Middle-bottom pocket
        ];
    }

    public draw(p: p5): void {
        p.fill(this.tableColor);
        p.rect(0, 0, this.viewportSize.width, this.viewportSize.height);

        // Draw pockets (small circles at pocket locations)
        p.fill(0);
        this.pockets.forEach(pocket => {
            p.circle(pocket.x, pocket.y, this.pocketDiameter);
        });
    }

    public updateBallsSinking(balls: PoolBall[], sunkBalls: number, remainingBalls: number) {
        balls.forEach((ball) => {
            if (this.checkIfBallSunk(ball)) {
                if (!ball.isSunk) {
                    sunkBalls++;
                    ball.isSunk = true; // Mark ball as sunk
                    balls.splice(balls.indexOf(ball), 1);
                    remainingBalls--;
                }
            }
        });
    
        return { sunkBalls, remainingBalls, balls };
    }

    private checkIfBallSunk(ball: PoolBall): boolean {
        // Cue ball cannot be sunk
        if (ball.isCueBall) {
            return false;
        }
    
        const pocketRadius = this.pocketDiameter / 2;
        
        for (const pocket of this.pockets) {
            const dx = ball.position.x - pocket.x;
            const dy = ball.position.y - pocket.y;
            const distanceSquared = dx * dx + dy * dy;
    
            if (distanceSquared <= (ball.radius + pocketRadius) ** 2) {
                return true;
            }
        }
    
        return false;
    }
}
