import p5 from "p5";

export class ShrinkRay {
    private power: number;
    private shrinkFactor: number = 0.8;

    constructor(power: number) {
        this.power = power;
    }

    public activate(x: number, y: number, level: any): void {
        for (const ball of level.balls) {
            const distance = Math.sqrt((ball.getPosition().x - x) ** 2 + (ball.getPosition().y - y) ** 2);
            if (distance < this.power * 10) {
                ball.updateSize(ball.getRadius() * this.shrinkFactor);
            }
        }
    }

    public getPower(): number {
        return this.power;
    }

    public draw(p: p5, x: number, y: number): void {
        // Visualize the ShrinkRay as a red circle indicating its range
        p.stroke(255, 0, 0);
        p.noFill();
        const radius = this.power * 10; // Adjust radius based on power
        p.circle(x, y, radius * 2); // Draw the activation range
    }
}
