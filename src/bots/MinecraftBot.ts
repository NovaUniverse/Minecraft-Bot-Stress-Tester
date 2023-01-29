import { Bot, Player, createBot } from "mineflayer";
import { Entity } from 'prismarine-entity'
import { Movements, goals, pathfinder } from 'mineflayer-pathfinder';
import { Vec3 } from 'vec3';
import { BotManager } from './BotManager';
import { IndexedData } from "minecraft-data";
import { plugin as pvp, TimingSolver }  from "mineflayer-pvp";
import { getEventListeners } from "events";

export class MinecraftBot {
    private readonly botTravelRange = 45;
    private readonly botAggresionRange = 10;

    private botName: string;
    private server: string;
    private isMoving: Boolean;
    private isCombatEnabled: Boolean;
    private inCombat: Boolean;
    private mcData!: IndexedData;
    private lastReachedPoint!: Vec3;
    private mineflayerBot!: Bot;

    constructor(botnName: string, server: string, isCombatEnabled: Boolean) {
        this.botName = botnName;
        this.server = server;
        this.isMoving = false;
        this.inCombat = false;
        this.isCombatEnabled = isCombatEnabled;
    }

    public connectBot(): void {
        if (!this.mineflayerBot) {
                this.mineflayerBot = createBot({
                host: this.server, // minecraft server ip
                username: this.botName, // minecraft username
                version: "1.19",
            });

            console.log(this.botName + " is connecting")

            this.mineflayerBot.loadPlugin(pathfinder);
            this.mineflayerBot.loadPlugin(pvp);
           
            this.mineflayerBot.on('playerJoined', () => this.onJoin());
            this.mineflayerBot.on('physicTick', () => this.tick());
            this.mineflayerBot.on("goal_reached", () => {this.onPathFinderGoalFinish()})
            this.mineflayerBot.on('chat', (username, message) => {this.onChat(username, message)})
            this.mineflayerBot.on('kicked', (err) => {
                console.log(this.botName + " was kicked: " +  err)
            });
            this.mineflayerBot.on('error', (err) =>{
                console.log(this.botName + ": Had an issue. Error Trace: ");
                console.log(err);
            });
        };

        
    }

    public tick(): void {
        if (this.isCombatEnabled) {
            const player : Entity | null = this.getNearestPlayer();
            if (player != null) {
                this.attack(player)
                this.inCombat = true;
                this.isMoving = true
            } else if (this.inCombat && player == null) {
                this.inCombat = false;
                this.isMoving = false;
                this.mineflayerBot.pvp.forceStop();
                console.log("player out of range")
            }
        } 
        
        if (!this.isMoving && !this.inCombat) {
            this.moveToNearestPathPoint()
            this.isMoving = true
        }

    }

    private attack(player: Entity): void {
        this.mineflayerBot.pvp.attack(player);
    }

    private followPlayer(player: Entity, distanceToMaintan: number) {
        this.mineflayerBot.pathfinder.setGoal(new goals.GoalFollow(player, distanceToMaintan));
    }


    public onChat(username: string, message: string): void {
        if (message == 'start') {
            this.isCombatEnabled = true;
        }

        if (message == 'stop') {
            this.isCombatEnabled = false;
            this.isMoving = false
            this.inCombat = false
            this.mineflayerBot.pvp.forceStop();
        }
    }

    public onPathFinderGoalFinish(): void {
        this.isMoving = false;
    }

    public onJoin(): void {
        this.mcData = require('minecraft-data')(this.mineflayerBot.version)
        this.mineflayerBot.pathfinder.setMovements(new Movements(this.mineflayerBot, this.mcData));
    }

    private async moveToNearestPathPoint(): Promise<void> {
        const movePoint: Vec3 = this.getPathRandomClosestPoint();
        if (this.mineflayerBot.pathfinder.movements == null || undefined) {
            this.mineflayerBot.pathfinder.setMovements(new Movements(this.mineflayerBot, this.mcData));
            console.log("Updating Movement")
        }
        if (this.lastReachedPoint){
            if (this.lastReachedPoint.equals(movePoint)) return;
        }
        this.lastReachedPoint = movePoint.clone();
        this.mineflayerBot.pathfinder.setGoal(new goals.GoalNear(movePoint.x, movePoint.y, movePoint.z, 0.5));
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


    private getNearestPlayer(): Entity | null {
        const player: Entity | null = this.mineflayerBot.nearestEntity((entity) => {
            if (entity.type == 'player' && entity.position.distanceTo(this.mineflayerBot.entity.position) <= this.botAggresionRange) {
                return true
            }
            return false
        });

        return player
    }

    // private getNearbyPlayers(): Array<Entity> {
    //     let entities = new Map(Object.entries(this.mineflayerBot.entities))
    //     let players: Array<Entity> = new Array<Entity>;
    //     for (const entity of entities.values()) {
    //         if (entity.type === 'player') {
    //             players.push(entity as Entity)
    //         }
    //     }   
        
    //     const botPosition = this.mineflayerBot.entity.position;
    //     players.sort((player1, player2) => {
    //         if (player1.position.distanceTo(botPosition) < player2.position.distanceTo(botPosition)) {
    //             return 1
    //         } else if (player1.position.distanceTo(botPosition) > player2.position.distanceTo(botPosition)) {
    //             return -1
    //         } else {
    //             return 0
    //         }
    //     })
    //     return players;
    // }

}


