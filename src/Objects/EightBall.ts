import p5 from 'p5';
import { PoolBall } from './PoolBall'; // Import PoolBall class
import { Vector2D } from '../types';

export class EightBall extends PoolBall {
    constructor(x: number, y: number, mass: number, color: string) {
        // Calls the constructor of PoolBall, setting isCueBall to false (this is not the cue ball)
        super(x, y, mass, color, false);
    }

    /** Custom behavior for the EightBall (if needed) */
    public customBehavior(): void {
        // You can add any specific logic for the EightBall here (e.g., when it falls into a pocket)
        console.log("Eight Ball is moving!");
    }

    /** Override the draw method if any specific rendering is needed for EightBall */
    public draw(p: p5): void {
        // Optionally, modify how the EightBall is drawn
        super.draw(p); // Calls the PoolBall's draw method (handles gif or image rendering)
    }
}
