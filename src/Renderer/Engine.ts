import { EndScreen } from "./Levels/EndScreen";
import { Level } from "./Levels/Level";
import { PlayableLevel } from "./Levels/PlayableLevel";
import { StartScreen } from "./Levels/StartScreen";
import { GameState } from "../types";
import p5 from 'p5';

export class Engine {
    private levels: Level[];
    private currentLevelIdx: number = 0;
    private seed: number = 0;
    private gameState: GameState;
    private p5Instance: p5;
    protected viewportSize = { width: 800, height: 600 };
    private playTimeFrames: number = 0;
    private lastFrameCount: number = 0;
    private isFirstPlayFrame: boolean = true;

    constructor() {
        this.gameState = GameState.START;
    
        this.levels = [
            new StartScreen(this.seed),
            new PlayableLevel(this.seed, this.viewportSize),
            new EndScreen(this.seed)
        ];
    
        this.p5Instance = new p5(p => {
            p.setup = () => {
                p.createCanvas(this.viewportSize.width, this.viewportSize.height);
                p.textFont('Arial');
                p.background(0);
            };
            
            p.keyPressed = () => {
                if (p.key === ' ') {
                    this.changeLevel(1);
                }

                if (p.key == 'q') {
                    this.changeLevel(2);
                }
            };
    
            p.draw = () => {
                // Update play time only during PLAYING state
                if (this.gameState === GameState.PLAYING) {
                    if (this.isFirstPlayFrame) {
                        this.lastFrameCount = p.frameCount;
                        this.isFirstPlayFrame = false;
                    }
                    // Add the frame difference to our play time counter
                    this.playTimeFrames += p.frameCount - this.lastFrameCount;
                }
                this.lastFrameCount = p.frameCount;

                const currentLevel = this.levels[this.currentLevelIdx];
                const playTimeSeconds = Math.floor(this.playTimeFrames / 60);
                currentLevel.render(p, playTimeSeconds);
            };
    
            p.mousePressed = () => {
                if (this.currentLevelIdx === 0) {
                    this.changeLevel(1);
                }
                const currentLevel = this.levels[this.currentLevelIdx];
                currentLevel.handleMousePressed(p);
            };
    
            p.mouseReleased = () => {
                const currentLevel = this.levels[this.currentLevelIdx];
                currentLevel.handleMouseReleased(p);
            };
    
            p.mouseDragged = () => {
                const currentLevel = this.levels[this.currentLevelIdx];
                currentLevel.handleMouseDragged(p);
            };
        });
    }

    public changeLevel(index: number): void {
        if (index >= 0 && index < this.levels.length) {
            this.currentLevelIdx = index;
            this.gameState = index === 1 ? GameState.PLAYING : 
                            index === 2 ? GameState.GAME_OVER : GameState.START;
            
            // Reset first frame flag when entering playing state
            if (this.gameState === GameState.PLAYING) {
                this.isFirstPlayFrame = true;
            }
        }
    }

    public getPlayTimeSeconds(): number {
        return Math.floor(this.playTimeFrames / 60);
    }
}