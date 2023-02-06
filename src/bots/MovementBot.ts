import { Movements, goals, pathfinder } from "mineflayer-pathfinder";
import { MinecraftBot } from "./MinecraftBot";
import { Vec3 } from 'vec3';
import { BotManager } from "../BotManager";


export class MovementBot extends MinecraftBot {
    
    private readonly botTravelRange = 45;
    private lastReachedPoint!: Vec3;
    private _isMoving: Boolean;

    constructor(botName: string, server: string) {
        super(botName, server)
        this._isMoving = false;
    }

    protected get isMoving(): Boolean {
        return this._isMoving;
    }
    
    protected set isMoving(value: Boolean) {
        this._isMoving = value;
    }

    public connectBot(): void {
        super.connectBot();
        this.mineflayerBot.loadPlugin(pathfinder);

        this.mineflayerBot.on("goal_reached", () => this.onPathFinderGoalFinish())
    }

    protected onPathFinderGoalFinish(): void {
        this.isMoving = false;
    }

    protected onJoin(): void {
        super.onJoin()
        this.mineflayerBot.pathfinder.setMovements(new Movements(this.mineflayerBot, this.mcData));
    }
    

    protected tick(): void {
        if (!this.isMoving) {
            this.moveToNearestPathPoint();
            this.isMoving = true;
        }
    }


    private moveToNearestPathPoint(): void {
        const movePoint: Vec3 = this.getPathRandomClosestPoint();
        if (this.mineflayerBot.pathfinder.movements == null || undefined) {
            this.mineflayerBot.pathfinder.setMovements(new Movements(this.mineflayerBot, this.mcData));
            console.log("Updating Movement")
        }
        this.lastReachedPoint = movePoint.clone();
        this.mineflayerBot.pathfinder.setGoal(new goals.GoalNear(movePoint.x, movePoint.y, movePoint.z, 0.5));
        console.log()
        console.log(this.botName + " is moving to : " + movePoint);
    }

    private getPathRandomClosestPoint(): Vec3 {
        const currentPos: Vec3 = this.mineflayerBot.entity.position;
        const pathPoints = BotManager.getPathFindingPoints();
        let closestPoints: Array<Vec3> =  new Array<Vec3>();
        Object.keys(pathPoints).forEach(key => {
            const cordsArray: Array<number> = pathPoints[key];
            const xPos: number = cordsArray[0];
            const yPos: number = cordsArray[1];
            const zPos: number = cordsArray[2];
            
            const cords: Vec3 = new Vec3(xPos, yPos, zPos);
            if (this.lastReachedPoint) {
                if (!this.lastReachedPoint.equals(currentPos) && !cords.equals(this.lastReachedPoint)) {
                    closestPoints.push(cords);
                }
            }else if (currentPos.distanceTo(cords) <= this.botTravelRange) {
                closestPoints.push(cords);
            }

        })

        let randomNumber = Math.floor(Math.random() * closestPoints.length);

        return closestPoints[randomNumber];
    }

} 