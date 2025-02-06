import { EndScreen } from "./Levels/EndScreen";
import { Level } from "./Levels/Level";
import { PlayableLevel } from "./Levels/PlayableLevel";
import { StartScreen } from "./Levels/StartScreen";
import { GameState } from "../types";
import p5 from 'p5';
import { PoolBall } from "../Objects/PoolBall";
// import { ShrinkRay } from "../Objects/ShrinkRay";
import { PoolTable } from "../Objects/PoolTable";

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
    private sunkBalls: number = 0;
    private totalBalls: number = 15;
    // private shrinkRay: ShrinkRay;
    private poolTable: PoolTable;

    constructor() {
        this.gameState = GameState.START;
        // this.shrinkRay = new ShrinkRay(5);
        this.poolTable = new PoolTable(this.viewportSize);
    
        this.levels = [
            new StartScreen(this.seed),
            new PlayableLevel(this.seed, this.viewportSize),
            new EndScreen(this.seed)
        ];
    
        this.p5Instance = new p5(p => {
            p.setup = () => {
                p.createCanvas(this.viewportSize.width, this.viewportSize.height);
                p.textFont('Arial');
                this.poolTable.draw(p);
            };

            p.preload = () => {
                let balls: PoolBall[] = (this.levels[1] as PlayableLevel).balls;        
                balls.forEach(ball => ball.preload(p));
            };
    
            p.draw = () => {
                if (this.gameState === GameState.PLAYING) {
                    if (this.isFirstPlayFrame) {
                        this.lastFrameCount = p.frameCount;
                        this.isFirstPlayFrame = false;
                    }
                    this.playTimeFrames += p.frameCount - this.lastFrameCount;
                }
                this.lastFrameCount = p.frameCount;
                
                const currentLevel = this.levels[this.currentLevelIdx];
                const playTimeSeconds = Math.floor(this.playTimeFrames / 60);

                // If all balls are sunk, transition to the End Screen
                if ((this.levels[this.currentLevelIdx] as PlayableLevel).remainingBalls <= 0) {
                    this.changeLevel(2); // Move to the "EndScreen" level
                }

                currentLevel.render(p, playTimeSeconds);
            };
    
            p.mousePressed = () => {
                console.log("current level", this.currentLevelIdx);
                if (this.currentLevelIdx === 0){
                    this.changeLevel(1);
                }

                const currentLevel = this.levels[this.currentLevelIdx];
                currentLevel.handleMousePressed(p);
            };

            p.mouseReleased = () => {
                const currentLevel = this.levels[this.currentLevelIdx];
                currentLevel.handleMouseReleased(p);
            }

            p.mouseDragged = () => {
                const currentLevel = this.levels[this.currentLevelIdx];
                currentLevel.handleMouseDragged(p);
            }
    
            p.keyPressed = () => {
                // if (p.key === 's') {
                //     this.shrinkRay.activate(p.mouseX, p.mouseY, this.levels[this.currentLevelIdx] as PlayableLevel);
                // }

                if (p.key === ' ') {
                    this.changeLevel(1);
                }

                if (p.key == 'q') {
                    this.changeLevel(2);
                }
            };
        });
    }

    public changeLevel(index: number): void {
        if (index >= 0 && index < this.levels.length) {
            this.currentLevelIdx = index;
            this.gameState = index === 1 ? GameState.PLAYING : 
                            index === 2 ? GameState.GAME_OVER : GameState.START;
            
            if (this.gameState === GameState.PLAYING) {
                this.isFirstPlayFrame = true;
                this.sunkBalls = 0;
                (this.levels[this.currentLevelIdx] as PlayableLevel).remainingBalls = this.totalBalls; // Reset ball count
            }
        }
    }

    public getPlayTimeSeconds(): number {
        return Math.floor(this.playTimeFrames / 60);
    }
}