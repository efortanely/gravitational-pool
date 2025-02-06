import { Level } from "./Level";
import p5 from 'p5';

export class StartScreen extends Level {
    constructor(seed: number){
        super(seed);
    }

    handleMousePressed(p: p5): boolean {
        // Empty implementation required by abstract class
        return false;
    }
    
    handleMouseReleased(p: p5): void {
        // Empty implementation required by abstract class
    }

    handleMouseDragged(p: p5): void {
        // Empty implementation required by abstract class
    }

    public render(p: p5, timePlayed: number): void {
        // Clear the background first with a dark color
        p.background(0, 0, 20); // Very dark blue, almost black
        
        // Draw the starry background
        this.drawStarryBackground(p);

        // Set text properties
        p.textAlign(p.CENTER, p.CENTER); // Align both horizontally and vertically
        p.noStroke(); // Remove text outline
        
        // Draw title
        p.textSize(48);
        p.textFont('Comic Sans MS');
        p.fill(255); // White text
        p.text('Gravitational Pool', p.width / 2, p.height / 2 - 50);
        
        // Draw instruction text
        p.textSize(24);
        // Make the "Press SPACE to start" text pulse
        const pulseAmount = (Math.sin(p.frameCount * 0.05) + 1) / 2; // Value between 0 and 1
        const alpha = p.lerp(150, 255, pulseAmount);
        p.fill(255, alpha);
        p.text('Press SPACE to start', p.width / 2, p.height / 2 + 50);
    }
}