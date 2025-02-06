import { PoolBall } from "../../Objects/PoolBall";
import { Level } from "./Level";
import p5 from 'p5';

export class EndScreen extends Level {

    constructor(seed: number){
        super(seed);
    }

    handleMousePressed(p: p5): void {
    }

    handleMouseReleased(p: p5): void {

    }
    
    handleMouseDragged(p: p5): void {

    }

    public render(p: p5, timePlayed: number): void{
        p.background(0, 0, 20); // Very dark blue, almost black

        this.drawStarryBackground(p);

        p.textAlign(p.CENTER);
        p.textSize(48);
        p.fill(255); // White text
        p.text('GAME OVER!', p.width / 2, p.height / 2 - 50);
        p.textSize(24);
        p.text('You played for ' + timePlayed + ' seconds.', p.width / 2, p.height / 2 + 50);
    }
}