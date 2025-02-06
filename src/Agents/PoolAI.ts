import { Physics } from "../GameLogic/Physics";
import { PoolBall } from "../Objects/PoolBall";
import { Vector2D } from "../types";

export class PoolAI {
    private physics: Physics;
    private balls: PoolBall[];
    private cueBall: PoolBall;

    constructor(physics: Physics, balls: PoolBall[], cueBall: PoolBall) {
        this.physics = physics;
        this.balls = balls;
        this.cueBall = cueBall;
    }

    public makeMove(): void {
        const targetBall = this.chooseTargetBall();
        const force = this.calculateForce(targetBall);
        this.physics.applyForceToCueBall(force);
    }

    private chooseTargetBall(): PoolBall {
        // Improved AI: Pick the best ball to sink based on distance and potential to sink.
        let bestBall: PoolBall | null = null;
        let bestScore = Infinity;

        this.balls.forEach(ball => {
            if (!ball.isCueBall) {
                const score = this.evaluateShot(ball);
                if (score < bestScore) {
                    bestScore = score;
                    bestBall = ball;
                }
            }
        });

        return bestBall!;
    }

    private evaluateShot(ball: PoolBall): number {
        // A basic heuristic considering distance and the possibility of sinking the ball.
        const distance = this.calculateDistance(this.cueBall.getPosition(), ball.getPosition());
        
        // Evaluate the ball's angle and its potential to be sunk (simplified)
        const angle = Math.atan2(ball.getPosition().y - this.cueBall.getPosition().y,
            ball.getPosition().x - this.cueBall.getPosition().x);
        
        return distance * (1 + Math.abs(angle)); // Higher values indicate harder shots
    }

    private calculateDistance(a: Vector2D, b: Vector2D): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }

    private calculateForce(targetBall: PoolBall): Vector2D {
        // Improved force calculation considering angle and distance
        const dx = targetBall.getPosition().x - this.cueBall.getPosition().x;
        const dy = targetBall.getPosition().y - this.cueBall.getPosition().y;

        const distance = this.calculateDistance(this.cueBall.getPosition(), targetBall.getPosition());
        const forceMultiplier = Math.min(1, 1 / distance);  // Limit force for long distances

        return {
            x: dx * forceMultiplier,
            y: dy * forceMultiplier
        };
    }
}
