import { MinecraftBot } from './MinecraftBot';

export class BotManager {
    private server: string;
    private bots: Array<MinecraftBot>;
    private currentBotCount: number = 1;
    private static pathFindingPoints: any;

    constructor(server: string) {
        this.bots = new Array<MinecraftBot>();
        this.server = server;
        BotManager.pathFindingPoints = JSON.parse(JSON.stringify(require("../Config/PathFindingPoints.json")))
    }

    //Create a certain amount of bots and attempt to connect to server
    public launchBots(amount: number): void {
        for (let i = 0; i < amount;  i++) {
            let bot = new MinecraftBot("bot" + this.currentBotCount, this.server)
            bot.connectBot();
            this.bots.push(bot);
        }
    }

    public static getPathFindingPoints() {
        return this.pathFindingPoints;
    }

}


