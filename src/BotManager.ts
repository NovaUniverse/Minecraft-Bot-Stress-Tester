import { MinecraftBot } from './bots/MinecraftBot';
import { MovementBot } from './bots/MovementBot';

export class BotManager {
    private server: string;
    private bots: Array<MinecraftBot>;
    private mcVersion: string;
    

    constructor(server: string, mcVersion: string) {
        this.bots = new Array<MinecraftBot>();
        this.server = server;
        this.mcVersion = mcVersion
    }

    //Create a certain amount of bots and attempt to connect to server
    public async launchBots(amount: number) {
        for (let i = 0; i < amount;  i++) {
            let bot = new MovementBot("bot" + this.bots.length, this.server, this.mcVersion)
            bot.connectBot();
            this.bots.push(bot);
            await BotManager.sleep(8)
        }
    }

    public static sleep(secounds: number) {
        return new Promise(resolve => setTimeout(resolve, secounds * 1000))
    }
}
