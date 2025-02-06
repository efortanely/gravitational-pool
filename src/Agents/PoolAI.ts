import { Physics } from "../GameLogic/Physics";
import { PoolBall } from "../Objects/PoolBall";
import { PoolTable } from "../Objects/PoolTable";
import { Vector2D } from "../types";

export class PoolAI {
    private physics: Physics;
    private balls: PoolBall[];
    private cueBall: PoolBall;
    private poolTable: PoolTable;
    private lastMoveTime: number;
    private myBallType: number = 0; // 1 for solids, 2 for stripes

    constructor(physics: Physics, balls: PoolBall[], cueBall: PoolBall, poolTable: PoolTable) {
        this.physics = physics;
        this.balls = balls;
        this.cueBall = cueBall;
        this.poolTable = poolTable;
        this.lastMoveTime = 0;
        this.determineBallType();
    }

    private determineBallType(): void {
        const remainingSolids = this.balls.filter(ball => ball.ballType === 1).length;
        const remainingStripes = this.balls.filter(ball => ball.ballType === 2).length;
        if (remainingSolids !== remainingStripes) {
            this.myBallType = remainingSolids > remainingStripes ? 1 : 2;
        }
    }

    public ballsStopped(): boolean {
        const threshold = 0.3;
        const cueBallThreshold = 0.1;
        return this.balls.every(ball => 
            (ball.isCueBall && Math.abs(ball.velocity.x) <= cueBallThreshold && Math.abs(ball.velocity.y) <= cueBallThreshold) || 
            (!ball.isCueBall && Math.abs(ball.velocity.x) <= threshold && Math.abs(ball.velocity.y) <= threshold)
        );
    }

    public update(timePlayed: number): void {
        if (timePlayed - this.lastMoveTime >= 1 && this.ballsStopped()) {
            this.makeMove();
            this.lastMoveTime = timePlayed;
        }
    }

    public makeMove(): void {
        this.determineBallType();
        const { targetBall, pocket } = this.findBestShot();
        if (!targetBall || !pocket) return;

        const force = this.calculateForceToHitBall(targetBall, pocket, this.balls);
        this.physics.applyForceToCueBall(force);
    }

    private findBestShot(): { targetBall: PoolBall | null, pocket: Vector2D | null } {
        let bestScore = Infinity;
        let bestBall = null;
        let bestPocket = null;

        for (const ball of this.balls) {
            if (ball.isCueBall || !this.isValidTarget(ball)) continue;

            for (const pocket of this.poolTable.pockets) {
                const score = this.evaluateCompleteShot(ball, pocket);
                if (score < bestScore) {
                    bestScore = score;
                    bestBall = ball;
                    bestPocket = pocket;
                }
            }
        }

        return { targetBall: bestBall, pocket: bestPocket };
    }

    private isValidTarget(ball: PoolBall): boolean {
        if (ball.ballType === 8) {
            return this.balls.every(b => !b.isCueBall && b.ballType !== 8 && 
                                      (this.myBallType === 0 || b.ballType !== this.myBallType));
        }
        return this.myBallType === 0 || ball.ballType === this.myBallType;
    }

    private evaluateCompleteShot(ball: PoolBall, pocket: Vector2D): number {
        const distanceToPocket = this.calculateDistance(ball.getPosition(), pocket);
        const cueToBall = this.calculateDistance(this.cueBall.getPosition(), ball.getPosition());
        
        // Check for obstacles
        const obstacleScore = this.balls.reduce((score, otherBall) => {
            if (otherBall === ball || otherBall === this.cueBall) return score;
            const distanceToShot = this.calculatePointLineDistance(
                otherBall.getPosition(),
                ball.getPosition(),
                this.cueBall.getPosition()
            );
            return score + (distanceToShot < otherBall.radius * 3 ? 100 : 0);
        }, 0);

        // Evaluate angle difficulty
        const angleToShot = Math.abs(Math.atan2(
            pocket.y - ball.getPosition().y,
            pocket.x - ball.getPosition().x
        ) - Math.atan2(
            ball.getPosition().y - this.cueBall.getPosition().y,
            ball.getPosition().x - this.cueBall.getPosition().x
        ));

        const baseScore = distanceToPocket + cueToBall + (angleToShot * 50);
        const priorityScore = ball.ballType === 8 ? (this.isValidTarget(ball) ? 0 : 1000) : 0;

        return baseScore + obstacleScore + priorityScore;
    }

    private calculatePointLineDistance(point: Vector2D, lineStart: Vector2D, lineEnd: Vector2D): number {
        const numerator = Math.abs(
            (lineEnd.y - lineStart.y) * point.x -
            (lineEnd.x - lineStart.x) * point.y +
            lineEnd.x * lineStart.y -
            lineEnd.y * lineStart.x
        );
        const denominator = Math.sqrt(
            Math.pow(lineEnd.y - lineStart.y, 2) +
            Math.pow(lineEnd.x - lineStart.x, 2)
        );
        return numerator / denominator;
    }

    private calculateForceToHitBall(targetBall: PoolBall, pocket: Vector2D, allBalls: PoolBall[]): Vector2D {
        const CLUSTER_THRESHOLD = targetBall.radius * 3;
        const OVERLAP_FACTOR = 0.9; // Reduces ghost ball distance to create overlap
        
        const nearbyBalls = allBalls.filter(ball => 
            ball !== targetBall && 
            ball !== this.cueBall &&
            this.calculateDistance(ball.getPosition(), targetBall.getPosition()) < CLUSTER_THRESHOLD
        );
    
        // Calculate direction adjustments for clustered balls
        let adjustedPocket = {...pocket};
        if (nearbyBalls.length > 0) {
            const clusterCenter = nearbyBalls.reduce((acc, ball) => ({
                x: acc.x + ball.getPosition().x,
                y: acc.y + ball.getPosition().y
            }), { x: 0, y: 0 });
            clusterCenter.x /= nearbyBalls.length;
            clusterCenter.y /= nearbyBalls.length;
    
            const spreadAngle = Math.PI / 6;
            const targetToPocket = {
                x: pocket.x - targetBall.getPosition().x,
                y: pocket.y - targetBall.getPosition().y
            };
            const targetToCluster = {
                x: clusterCenter.x - targetBall.getPosition().x,
                y: clusterCenter.y - targetBall.getPosition().y
            };
    
            const crossProduct = targetToPocket.x * targetToCluster.y - targetToPocket.y * targetToCluster.x;
            const rotationAngle = crossProduct > 0 ? -spreadAngle : spreadAngle;
    
            const cos = Math.cos(rotationAngle);
            const sin = Math.sin(rotationAngle);
            adjustedPocket = {
                x: targetBall.getPosition().x + (targetToPocket.x * cos - targetToPocket.y * sin),
                y: targetBall.getPosition().y + (targetToPocket.x * sin + targetToPocket.y * cos)
            };
        }
    
        // Calculate ghost ball with overlap
        const dxToPocket = adjustedPocket.x - targetBall.getPosition().x;
        const dyToPocket = adjustedPocket.y - targetBall.getPosition().y;
        const distanceToPocket = this.calculateDistance(targetBall.getPosition(), adjustedPocket);
        const directionToPocket = {
            x: dxToPocket / distanceToPocket,
            y: dyToPocket / distanceToPocket
        };
    
        const ballDiameter = targetBall.radius * 2;
        const ghostBallPosition = {
            x: targetBall.getPosition().x - directionToPocket.x * (ballDiameter * OVERLAP_FACTOR),
            y: targetBall.getPosition().y - directionToPocket.y * (ballDiameter * OVERLAP_FACTOR)
        };
    
        const dxToGhostBall = ghostBallPosition.x - this.cueBall.getPosition().x;
        const dyToGhostBall = ghostBallPosition.y - this.cueBall.getPosition().y;
        const distanceToGhostBall = this.calculateDistance(this.cueBall.getPosition(), ghostBallPosition);
        const directionToGhostBall = {
            x: dxToGhostBall / distanceToGhostBall,
            y: dyToGhostBall / distanceToGhostBall
        };
    
        const clusterFactor = 1 + (nearbyBalls.length * 0.2);
        const baseForceMagnitude = Math.sqrt(distanceToGhostBall + distanceToPocket) * 300 * clusterFactor;
        
        const dotProduct = directionToGhostBall.x * directionToPocket.x + 
                          directionToGhostBall.y * directionToPocket.y;
        const angleFactor = 1 + (1 - Math.abs(dotProduct)) * 0.5;
    
        const forceMagnitude = Math.min(Math.max(baseForceMagnitude * angleFactor, 200), 1000);
        return {
            x: directionToGhostBall.x * forceMagnitude,
            y: directionToGhostBall.y * forceMagnitude
        };
    }
    
    private calculateDistance(a: Vector2D, b: Vector2D): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
}
