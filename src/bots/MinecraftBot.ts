import {Bot, Player, createBot} from "mineflayer";
import {Entity} from 'prismarine-entity'

import {IndexedData} from "minecraft-data";
import {Console} from "inspector";


export class MinecraftBot {
    protected mcVersion: string;
    protected botName: string;
    private server: string;

    protected mcData!: IndexedData;
    protected mineflayerBot!: Bot;

    constructor(botName: string, server: string, mcVersion: string) {
        this.botName = botName;
        this.server = server;
        this.mcVersion = mcVersion;
    }

    public async connectBot(): Promise<void> {
        if (!this.mineflayerBot) {
            this.mineflayerBot = createBot({
                host: this.server, // minecraft server ip
                username: this.botName, // minecraft username
                version: this.mcVersion,
                checkTimeoutInterval: 100 * 1000
            });

            console.log(this.botName + " is connecting");

            this.mineflayerBot.on('playerJoined', () => this.onJoin());
            this.mineflayerBot.on('physicTick', async () => this.tick());
            this.mineflayerBot.on('chat', (username, message) => {
                this.onChat(username, message)
            })
            this.mineflayerBot.on('kicked', (err) => {
                console.log(this.botName + " was kicked: \n Attempting rejoin" + err);
                this.onKick()
            });
            this.mineflayerBot.on('error', (err) => {
                console.log(this.botName + ": Had an issue. Error Trace: ");
                console.log(err);

                console.log("Attempt Reconnect for bot: " + this.botName);
                this.connectBot()
            });
        }
    }

    protected onKick(): void {
        this.connectBot()
    }

    protected tick(): void {
    }

    protected onChat(username: string, message: string): void {
    }

    protected onJoin(): void {
        this.mcData = require('minecraft-data')(this.mineflayerBot.version)
    }


    protected getNearestPlayer(range: number): Entity | null {
        const player: Entity | null = this.mineflayerBot.nearestEntity((entity) => {
            if (entity.type == 'player' && entity.position.distanceTo(this.mineflayerBot.entity.position) <= range) {
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


