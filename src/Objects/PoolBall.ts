import p5 from 'p5';
import { Vector2D } from '../types';

// Spritesheets for each ball
import ball1Sprite from '../public/balls/1ball.png';
import ball2Sprite from '../public/balls/2ball.png';
import ball3Sprite from '../public/balls/3ball.png';
import ball4Sprite from '../public/balls/4ball.png';
import ball5Sprite from '../public/balls/5ball.png';
import ball6Sprite from '../public/balls/6ball.png';
import ball7Sprite from '../public/balls/7ball.png';
import ball8Sprite from '../public/balls/8ball.png';
import ball9Sprite from '../public/balls/9ball.png';
import ball10Sprite from '../public/balls/10ball.png';
import ball11Sprite from '../public/balls/11ball.png';
import ball12Sprite from '../public/balls/12ball.png';
import ball13Sprite from '../public/balls/13ball.png';
import ball14Sprite from '../public/balls/14ball.png';
import ball15Sprite from '../public/balls/15ball.png';
import cueBallSprite from '../public/balls/cueball.png';

export class PoolBall {
    public position: Vector2D;
    public velocity: Vector2D;
    public mass: number = 0.66 * 15;
    public radius: number = 15;
    protected image: p5.Image | null = null;
    protected spritesheet: p5.Image | null = null;
    public isCueBall: boolean;
    protected frameIndex: number = 0;
    protected totalFrames: number = 15;
    public ballType: number;
    private lastFrameTime: number = 0;
    private frameDelay: number = 100; // Base time delay (ms) between frames
    public isSunk: boolean = false;
    
    constructor(x: number, y: number, mass: number, ballType: number, isCueBall: boolean) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.isCueBall = isCueBall;
        this.ballType = ballType;
        this.updateSize(15);
    }

    protected updateSize(radius: number){
        this.radius = radius;
        this.mass = 0.66 * this.radius;
    }

    /** Preloads images and spritesheets */
    public preload(p: p5): void {
        this.spritesheet = p.loadImage(this.getSpriteSheet());
    }

    /** Returns correct spritesheet for the ball type */
    private getSpriteSheet(): string {
        switch (this.ballType) {
            case 0: return cueBallSprite;
            case 1: return ball1Sprite;
            case 2: return ball2Sprite;
            case 3: return ball3Sprite;
            case 4: return ball4Sprite;
            case 5: return ball5Sprite;
            case 6: return ball6Sprite;
            case 7: return ball7Sprite;
            case 8: return ball8Sprite;
            case 9: return ball9Sprite;
            case 10: return ball10Sprite;
            case 11: return ball11Sprite;
            case 12: return ball12Sprite;
            case 13: return ball13Sprite;
            case 14: return ball14Sprite;
            case 15: return ball15Sprite;
            default: throw new Error(`Invalid ball type: ${this.ballType}`);
        }
    }

    /** Applies rolling friction */
    public applyFriction(): void {
        const friction = 0.01;
        this.velocity.x *= 1 - friction;
        this.velocity.y *= 1 - friction;
    }

    /** Applies a force to the ball */
    public applyForce(force: Vector2D): void {
        this.velocity.x += force.x / this.mass;
        this.velocity.y += force.y / this.mass;
    }

    /** Updates the ball's position and animation */
    public update(p: p5): void {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.applyFriction();

        const currentTime = p.millis(); // Get current time in milliseconds
        if (currentTime - this.lastFrameTime >= this.frameDelay) {
            this.lastFrameTime = currentTime; // Update last frame time
            const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);

            if (speed > 0.1) {
                // Calculate the angle of velocity
                const angle = p.atan2(this.velocity.y, this.velocity.x);
                
                // Map the angle to a frame index. 0 to 2*PI range for a full rotation.
                this.frameIndex = Math.floor((angle + p.PI) / (2 * p.PI) * this.totalFrames);

                // Adjust frame delay based on speed, faster speeds will update frames quicker
                const speedFactor = Math.min(1, speed / 10); // Speed factor based on velocity
                this.frameDelay = 200 * (1 - speedFactor); // Decrease frame delay with speed
            }
        }
    }

    /** Renders the ball with sprite animation */
    public draw(p: p5): void {
        p.noStroke();

        if (this.spritesheet) {
            const frameWidth = this.spritesheet.width / this.totalFrames;
            const frameHeight = this.spritesheet.height;

            p.image(
                this.spritesheet,
                this.position.x, this.position.y,
                this.radius * 2, this.radius * 2,
                frameWidth * this.frameIndex, 0,
                frameWidth, frameHeight
            );
        }
    }

    /** Handles rendering during gameplay */
    public render(p: p5, timePlayed: number): void {
        this.draw(p);
    }

    /** Handles mouse dragging interaction */
    public handleMouseDragged(p: p5): void {
        if (this.isCueBall) {
            this.position.x = p.mouseX;
            this.position.y = p.mouseY;
        }
    }

    public setPosition(x: number, y: number){
        this.position = { x, y };
    }

    public getPosition(): Vector2D{
        return this.position;
    }
}
