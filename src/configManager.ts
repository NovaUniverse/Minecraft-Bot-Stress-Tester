import * as fs from 'fs';
import { Config } from "./Config";
import { json } from "stream/consumers";


export class ConfigManager {

    private static configManagerInstance: ConfigManager;
    private config!: Config;
    


    private constructor() {
        this.loadConfig();
    }
    
    private loadConfig(): void {
        console.log("Loading Config")
        try {
            const jsonFile = JSON.parse(JSON.stringify(require("./Config/BotConfig.json")));
            this.config = Object.assign(new Config(), jsonFile);
        } catch {
            console.error('No Config. Generating Default Config')
            this.config  = Config.generateDefault();
            fs.writeFileSync("./src/Config/BotConfig.json", JSON.stringify(this.config, null, 2))
    
        }

    }

    public static getInstance(): ConfigManager {
        if (!this.configManagerInstance)  {
            this.configManagerInstance = new ConfigManager();
        }
        return this.configManagerInstance;
    }
}