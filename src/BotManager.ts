import { MinecraftBot } from './bots/MinecraftBot';
import { MovementBot } from './bots/MovementBot';
import EventEmitter from "events";

export class BotManager {
    private server: string;
    private bots: Array<MinecraftBot>;
    private mcVersion: string;
    private botList: Array<string>;

    constructor(server: string, mcVersion: string, botList: Array<string>) {
        this.botList = botList;
        this.bots = new Array<MinecraftBot>();
        this.server = server;
        this.mcVersion = mcVersion
    }

    //Create a certain amount of bots and attempt to connect to server
    public async createBot() {
        const bot = new MovementBot(this.botList[this.bots.length], this.server, this.mcVersion)
        bot.connectBot();
        this.bots.push(bot);
    }

}
