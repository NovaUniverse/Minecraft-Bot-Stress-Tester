import { Bot, createBot } from "mineflayer";
import { pathfinder } from "mineflayer-pathfinder";
import { Vec3 } from 'vec3';
import { BotManager } from './BotManager';

export class MinecraftBot {
    private botName: string;
    private server: string;
    private mineflayerBot!: Bot; 
    private isMoving: Boolean;

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
            this.mineflayerBot.on('physicTick', () => this.tick());
            this.mineflayerBot.on('error', (err) => console.log(err));

        };
    }

    public tick() {
        if (!this.isMoving) {
            this.moveToNearestPathPoint()
        }
        
    }

    private moveToNearestPathPoint() {
        
    }

    private getPathClosestPoint(): Vec3 {
        const currentPos: Vec3 = this.mineflayerBot.entity.position;
        const pathPoints = BotManager.getPathFindingPoints();
        let closestPoint: Vec3 = currentPos.clone();
        Object.keys(pathPoints).forEach(key => {
            const cordsArray: Array<number> = pathPoints[key];
            const xPos: number = cordsArray[0];
            const yPos: number = cordsArray[1];
            const zPos: number = cordsArray[2];
            
            const cords: Vec3 = new Vec3(xPos, yPos, zPos);

            if (closestPoint == null) {
                closestPoint = cords
            } else if (currentPos.distanceTo(cords) < currentPos.distanceTo(closestPoint)) {
                closestPoint = cords;
            }
        })

        return closestPoint
    
    }


}


