import { CombatBot } from './bots/CombatBot';
import { MinecraftBot } from './bots/MinecraftBot';
import { MovementBot } from './bots/MovementBot';

export class BotManager {
    private server: string;
    private bots: Array<MinecraftBot>;
    private isCombatEnabled!: Boolean
    private static pathFindingPoints: any;

    constructor(server: string) {
        this.bots = new Array<MinecraftBot>();
        this.server = server;
        this.loadConfig();
       
    }

    //Create a certain amount of bots and attempt to connect to server
    public async launchBots(amount: number) {
        for (let i = 0; i < amount;  i++) {
            let bot = new CombatBot("bot" + this.bots.length, this.server)
            bot.connectBot();
            this.bots.push(bot);
            await BotManager.sleep(8)
        }
    }

    private loadConfig() {
        BotManager.pathFindingPoints = JSON.parse(JSON.stringify(require("./Config/PathFindingPoints.json")))

    }


    public static getPathFindingPoints() {
        return this.pathFindingPoints;
    }

    public static sleep(secounds: number) {
        return new Promise(resolve => setTimeout(resolve, secounds * 1000))
    }
}
