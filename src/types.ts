// Vector type for positions and forces
export interface Vector2D {
    x: number;
    y: number;
};

export interface BallState {
    position: Vector2D;
    velocity: Vector2D;
    color: string;
    radius: number;
    mass: number;
}

// Game states enum
export enum GameState {
    START,
    PLAYING,
    GAME_OVER
}