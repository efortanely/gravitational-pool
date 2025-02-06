import p5 from 'p5';

export abstract class Level {
    private seed: number = 0;

    constructor(seed: number){
        this.seed = seed;
    }

    abstract render(p: p5, timePlayed: number): void;
    abstract handleMousePressed(p: p5): void;
    abstract handleMouseReleased(p: p5): void;
    abstract handleMouseDragged(p: p5): void;

    protected drawStarryBackground(p: p5): void {
        p.noStroke();
        p.fill(255, 255, 255, 150); // White with some transparency
        p.randomSeed(this.seed); // Set random seed for consistency
        const ticks = p.frameCount;

        if (ticks % 60 === 0) {
            this.seed += 1;
        }

        for (let i = 0; i < 50; i++) {
            const x = p.random(p.width);
            const y = p.random(p.height);
            const size = p.random(1, 3);
            p.ellipse(x, y, size, size);
        }
    }
}