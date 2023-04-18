import { MovementBot } from "./MovementBot";
import { Entity } from 'prismarine-entity'
import { plugin as pvp, TimingSolver }  from "mineflayer-pvp";

export class CombatBot extends MovementBot {
    private readonly botAggresionRange = 10;
    private isCombatEnabled: Boolean;
    private inCombat: Boolean;
    

    constructor(botName: string, server: string, mcVersion: string) {
        super(botName, server, mcVersion)
        this.isCombatEnabled = false;
        this.inCombat = false;
    }

    public connectBot(): void {
        super.connectBot();
        this.mineflayerBot.loadPlugin(pvp);
    }

    protected tick(): void {
        if (this.isCombatEnabled) {
            const player : Entity | null = this.getNearestPlayer(this.botAggresionRange);
            if (player != null) {
                this.attack(player)
                this.inCombat = true;
                this.isMoving = true;
            } else if (this.inCombat && player == null) {
                this.inCombat = false;
                this.isMoving = false;
                this.mineflayerBot.pvp.forceStop();
                console.log("player out of range")
            }
        } 

        if (!this.inCombat) {
            super.tick();
        }
    }

    public attack(player: Entity): void {
        this.mineflayerBot.pvp.attack(player);
    }
    
    protected onChat(username: string, message: string): void {
        if (message == 'start') {
            this.isCombatEnabled = true;
        }

        if (message == 'stop') {
            this.isCombatEnabled = false;
            this.isMoving = false; 
            this.inCombat = false
            this.mineflayerBot.pvp.forceStop();
        }
    }
}