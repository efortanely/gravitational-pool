import p5 from 'p5';
import { Vector2D } from '../types';
import cueBallImage from '../public/cue.png'; // Cue ball image
import verticalGif from '../public/8_ball_vert.gif';
import horizontalGif from '../public/8_ball_horizont.gif';
import stillBallImage from '../public/8_ball.png'; // Stationary image

export class PoolBall {
    protected position: Vector2D;
    public velocity: Vector2D;
    public mass: number;
    public radius: number;
    protected color: string;
    protected image: p5.Image | null = null;

    protected verticalGif: p5.Image | null = null;
    protected horizontalGif: p5.Image | null = null;

    protected isGifPlaying: boolean = false;
    protected isCueBall: boolean;
    protected speedFactor: number = 0.2; // Controls gif frame rate

    constructor(x: number, y: number, mass: number, color: string, isCueBall: boolean) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.mass = mass;
        this.radius = Math.sqrt(mass) * 5; // Scale radius with mass
        this.color = color;
        this.isCueBall = isCueBall;
    }

    /** Preloads images and gifs */
    public preload(p: p5): void {
        if (this.isCueBall) {
            this.image = p.loadImage(cueBallImage) as p5.Image;
        } else {
            // Load gifs as images
            this.verticalGif = p.loadImage(verticalGif) as p5.Image;
            this.horizontalGif = p.loadImage(horizontalGif) as p5.Image;
            this.image = p.loadImage(stillBallImage) as p5.Image; // Load still image
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

        // Determine if gif should play based on speed
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        this.isGifPlaying = speed >= 0.1;
    }

    /** Renders the ball */
    public draw(p: p5): void {
        p.noStroke();

        if (this.isCueBall && this.image) {
            p.image(this.image, this.position.x, this.position.y, this.radius * 2, this.radius * 2);
            return; // If it's the cue ball, just draw its image and exit
        }

        if (!this.isGifPlaying) {
            // If it's not moving fast enough to play a gif, render the still image
            if (this.image) {
                p.image(this.image, this.position.x, this.position.y, this.radius * 2, this.radius * 2);
            }
            return;
        }

        // Choose which gif to display based on the ball's movement direction
        const isMovingHorizontally = Math.abs(this.velocity.x) > Math.abs(this.velocity.y);
        const gif = isMovingHorizontally ? this.horizontalGif : this.verticalGif;

        if (gif) {
            p.image(gif, this.position.x, this.position.y, this.radius * 2, this.radius * 2);
        }
    }

    /** Getters and Setters */
    public setPosition(x: number, y: number): void {
        this.position = { x, y };
    }

    public getPosition(): Vector2D {
        return this.position;
    }

    public getVelocity(): Vector2D {
        return this.velocity;
    }

    public getMass(): number {
        return this.mass;
    }

    public getRadius(): number {
        return this.radius;
    }
}