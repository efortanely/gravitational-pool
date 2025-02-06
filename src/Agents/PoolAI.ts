import { Physics } from "../GameLogic/Physics";
import { PoolBall } from "../Objects/PoolBall";
import { PoolTable } from "../Objects/PoolTable";
import { Vector2D } from "../types";

export class PoolAI {
    private physics: Physics;
    private balls: PoolBall[];
    private cueBall: PoolBall;
    private poolTable: PoolTable;
    private lastMoveTime: number; // Store the time of the last move

    constructor(physics: Physics, balls: PoolBall[], cueBall: PoolBall, poolTable: PoolTable) {
        this.physics = physics;
        this.balls = balls;
        this.cueBall = cueBall;
        this.poolTable = poolTable;
        this.lastMoveTime = 0; // Initialize to 0, meaning no move has been made yet
    }

    public ballsStopped(): boolean {
        const threshold = 0.3
        const cueBallThreshold = 0.1
        return this.balls.every(ball =>(ball.isCueBall && ball.velocity.x <= cueBallThreshold && ball.velocity.y <= cueBallThreshold) || (!ball.isCueBall && ball.velocity.x <= threshold && ball.velocity.y <= threshold));
    }
    
    public update(timePlayed: number): void {
        // Make a move every second
        console.log("Update called with timePlayed:", timePlayed); // Debugging
        if (timePlayed - this.lastMoveTime >= 1 && this.ballsStopped()) {
            console.log("Making move..."); // Debugging
            this.makeMove();
            this.lastMoveTime = timePlayed; // Update the last move time to the current time
        }
    }

    public makeMove(): void {
        console.log("Making a move..."); // Debugging
        const targetBall = this.chooseTargetBall();
        if (!targetBall) {
            console.error("No valid target ball found!"); // Debugging
            return; // Exit if no valid target ball
        }
        console.log("Target Ball: ", targetBall); // Debug the selected target ball

        const pocket = this.choosePocket(targetBall);
        if (!pocket) {
            console.error("No valid pocket found!"); // Debugging
            return; // Exit if no valid pocket
        }
        console.log("Pocket: ", pocket); // Debugging the chosen pocket

        // Calculate the optimal force and direction to hit the target ball towards the chosen pocket
        const force = this.calculateForceToHitBall(targetBall, pocket);
        console.log("Calculated Force: ", force); // Debug the calculated force
        this.physics.applyForceToCueBall(force);
    }

    private chooseTargetBall(): PoolBall | null {
        let bestBall: PoolBall | null = null;
        let bestScore = Infinity;

        this.balls.forEach(ball => {
            if (!ball.isCueBall) {
                const score = this.evaluateShot(ball);
                console.log(`Evaluating shot for ball at (${ball.getPosition().x}, ${ball.getPosition().y}) with score: ${score}`); // Debugging
                if (score < bestScore) {
                    bestScore = score;
                    bestBall = ball;
                }
            }
        });

        if (!bestBall) {
            console.error("No valid target ball found!"); // Debug
        }

        return bestBall;
    }

    private choosePocket(targetBall: PoolBall): Vector2D | null {
        // For simplicity, let's assume we pick a random pocket closest to the target ball
        // In a real scenario, this could be based on strategy or game rules
        const pockets: Vector2D[] = this.poolTable.pockets;
        let closestPocket: Vector2D | null = null;
        let minDistance = Infinity;

        pockets.forEach(pocket => {
            const distance = this.calculateDistance(targetBall.getPosition(), pocket);
            if (distance < minDistance) {
                minDistance = distance;
                closestPocket = pocket;
            }
        });

        return closestPocket;
    }

    private evaluateShot(ball: PoolBall): number {
        if (ball.ballType === 8 && this.balls.length > 2){
            return Infinity;
        }

        const distance = this.calculateDistance(this.cueBall.getPosition(), ball.getPosition());
        const angle = Math.atan2(ball.getPosition().y - this.cueBall.getPosition().y,
            ball.getPosition().x - this.cueBall.getPosition().x);
        
        console.log(`Evaluating shot for ball at (${ball.getPosition().x}, ${ball.getPosition().y}), distance: ${distance}, angle: ${angle}`); // Debugging
        
        return distance * (1 + Math.abs(angle)); // Higher values indicate harder shots
    }

    private calculateForceToHitBall(targetBall: PoolBall, pocket: Vector2D): Vector2D {
        // Calculate the vector from the target ball to the pocket (desired direction for the target ball)
        const dxToPocket = pocket.x - targetBall.getPosition().x;
        const dyToPocket = pocket.y - targetBall.getPosition().y;
    
        // Normalize the direction vector to the pocket
        const distanceToPocket = this.calculateDistance(targetBall.getPosition(), pocket);
        const directionToPocket = {
            x: dxToPocket / distanceToPocket,
            y: dyToPocket / distanceToPocket
        };
    
        // Calculate the vector from the cue ball to the target ball
        const dxToTargetBall = targetBall.getPosition().x - this.cueBall.getPosition().x;
        const dyToTargetBall = targetBall.getPosition().y - this.cueBall.getPosition().y;
    
        // Normalize the direction vector to the target ball
        const distanceToTargetBall = this.calculateDistance(this.cueBall.getPosition(), targetBall.getPosition());
        const directionToTargetBall = {
            x: dxToTargetBall / distanceToTargetBall,
            y: dyToTargetBall / distanceToTargetBall
        };
    
        // Calculate the required force direction (cue ball should hit the target ball towards the pocket)
        const forceDirection = {
            x: directionToTargetBall.x,
            y: directionToTargetBall.y
        };
    
        // Normalize the force direction vector
        const forceMagnitude = Math.min(distanceToPocket / 10, 2) * 600; // Adjust force magnitude as needed
        const forceDistance = Math.sqrt(forceDirection.x * forceDirection.x + forceDirection.y * forceDirection.y);
        const normalizedForceDirection = {
            x: forceDirection.x / forceDistance,
            y: forceDirection.y / forceDistance
        };
    
        // Calculate the force components
        const forceX = normalizedForceDirection.x * forceMagnitude;
        const forceY = normalizedForceDirection.y * forceMagnitude;
    
        console.log(`Calculated Force to Hit Ball Towards Pocket: x: ${forceX}, y: ${forceY}`); // Debugging
        return { x: forceX, y: forceY };
    }

    private calculateDistance(a: Vector2D, b: Vector2D): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
}
