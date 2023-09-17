import { Movements, goals, pathfinder } from "mineflayer-pathfinder";
import { MinecraftBot } from "./MinecraftBot";
import { Vec3 } from 'vec3';
import { ConfigManager } from "../Config/ConfigManager";
import {Console} from "inspector";


export class MovementBot extends MinecraftBot {

    private readonly BOTTRAVELRANGE: number = 45;
    private readonly WANDERCOOLDOWN: number = 2
    private maxWonderDistance = 12;
    private lastReachedPoint!: Vec3;
    private useSetPathPoints: Boolean;
    private doWonder: Boolean;
    private onWanderCooldown: Boolean;
    private _isMoving: Boolean;


    constructor(botName: string, server: string, mcVersion: string) {
        super(botName, server, mcVersion)
        this._isMoving = false;
        this.useSetPathPoints = ConfigManager.getInstance().getConfig().usePathFindingPoints
        this.doWonder = ConfigManager.getInstance().getConfig().shouldBotWonder;
        this.onWanderCooldown = false;

    }

    protected get isMoving(): Boolean {
        return this._isMoving;
    }

    protected set isMoving(value: Boolean) {
        this._isMoving = value;
    }

    public async connectBot(): Promise<void> {
        super.connectBot();
        this.mineflayerBot.loadPlugin(pathfinder);
        this.mineflayerBot.on("goal_reached", () => this.onPathFinderGoalFinish())
    }

    protected onPathFinderGoalFinish(): void {
        this.isMoving = false;
        this.startWanderCooldown()
    }

    protected onJoin(): void {
        super.onJoin()
        this.mineflayerBot.pathfinder.setMovements(new Movements(this.mineflayerBot));
    }


    protected tick(): void {

        if (this.useSetPathPoints && !this.isMoving) {
            console.log(this.botName + ":Attempting to move")
            this.isMoving = true;
            this.moveToNearestPathPoint();
        } else if (!this.isMoving && !this.onWanderCooldown && this.doWonder) {
            this.wander();
            this.isMoving = true;
        }
    }

    private wander(): void {
        const randomXOffset = Math.floor(Math.random()  * (this.maxWonderDistance - this.maxWonderDistance*-1) + this.maxWonderDistance*-1);
        const randomYOffset = Math.floor(Math.random() * (this.maxWonderDistance - this.maxWonderDistance*-1) + this.maxWonderDistance*-1);
        const currentPos = this.mineflayerBot.entity.position.clone();
        this.mineflayerBot.pathfinder.setGoal(new goals.GoalNearXZ(currentPos.x + randomXOffset, currentPos.y + randomYOffset, 0.5));
        this.onWanderCooldown = true;

    }

    private async startWanderCooldown() {
        await new Promise(resolve => {setTimeout(resolve, this.WANDERCOOLDOWN * 1000)})
        this.onWanderCooldown = false;
    }


    private moveToNearestPathPoint(): void {
        const movePoint: Vec3 = this.getPathRandomClosestPoint();
        if (this.mineflayerBot.pathfinder.movements == null || undefined) {
            this.mineflayerBot.pathfinder.setMovements(new Movements(this.mineflayerBot));
            console.log("Updating Movement")
        }
        this.lastReachedPoint = movePoint.clone();
        this.mineflayerBot.pathfinder.setGoal(new goals.GoalNear(movePoint.x, movePoint.y, movePoint.z, 0.5));
        console.log(this.botName + " is moving to : " + movePoint.clone());
    }

    private getPathRandomClosestPoint(): Vec3 {
        const currentPos: Vec3 = this.mineflayerBot.entity.position;
        const pathPoints = ConfigManager.getInstance().pathFindingPoints;
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
            }else if (currentPos.distanceTo(cords) <= this.BOTTRAVELRANGE) {
                closestPoints.push(cords);
            }

        })

        let randomNumber = Math.floor(Math.random() * closestPoints.length);

        return closestPoints[randomNumber];
    }

}