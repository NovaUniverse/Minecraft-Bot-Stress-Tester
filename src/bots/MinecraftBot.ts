import { Bot, createBot } from "mineflayer";
import { Movements, goals, pathfinder } from "mineflayer-pathfinder";
import { Vec3 } from 'vec3';
import { BotManager } from './BotManager';
import { IndexedData } from "minecraft-data";

export class MinecraftBot {
    private readonly botTravelRange = 30;
    private botName: string;
    private server: string;
    private isMoving: Boolean;
    private mcData!: IndexedData;
    private lastReachedPoint!: Vec3;
    private mineflayerBot!: Bot; 

    constructor(botnName: string, server: string) {
        this.botName = botnName;
        this.server = server;
        this.isMoving = false
    }

    public connectBot() {
        if (!this.mineflayerBot) {
                this.mineflayerBot = createBot({
                host: this.server, // minecraft server ip
                username: this.botName, // minecraft username
                version: "1.19",
                keepAlive: true,
                logErrors: true,
                hideErrors: false,
            });
            
            this.mineflayerBot.loadPlugin(pathfinder);
            this.mineflayerBot.on('playerJoined', () => this.onJoin());
            this.mineflayerBot.on('physicTick', () => this.tick());
            this.mineflayerBot.on("goal_reached", () => {this.onPathFinderGoalFinish()}) 
            this.mineflayerBot.on('error', (err) =>{
                console.log(this.botName + ": Had an issue. Error Trace: ");
                console.log(err);
            });
        };
    }

    public onPathFinderGoalFinish() {
        this.isMoving = false;
    }

    public onJoin() {
        let mcData = require('minecraft-data')(this.mineflayerBot.version)
    }

    public tick() {
        if (!this.isMoving) {
            this.moveToNearestPathPoint()
            this.isMoving = true
        } 
    }

    private async moveToNearestPathPoint() {
        const movePoint: Vec3 = this.getPathRandomClosestPoint();
        if (this.lastReachedPoint){
            if (this.lastReachedPoint.equals(movePoint)) return;
        }
        this.lastReachedPoint = movePoint.clone();
        this.mineflayerBot.pathfinder.setMovements(new Movements(this.mineflayerBot, this.mcData));
        this.mineflayerBot.pathfinder.setGoal(new goals.GoalNear(movePoint.x, movePoint.y, movePoint.z, 0.5));
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


