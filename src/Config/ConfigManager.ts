import * as fs from 'fs';
import { Config } from "./Config";


export class ConfigManager {

    private static configManagerInstance: ConfigManager;
    private config!: Config;
    private _pathFindingPoints: any;


    public get pathFindingPoints(): any {
        return this._pathFindingPoints;
    }

    private constructor() {
        this.loadConfig();
        if (this.config.usePathFindingPoints) {
            this.loadPathFindingPoints();
        }
    }

    private loadConfig(): void {
        console.log("Loading Config")
        try {
            const jsonFile = JSON.parse(JSON.stringify(require("../../Config/BotConfig.json")));
            this.config = Object.assign(new Config(), jsonFile);
        } catch {
            console.error('No Config. Generating Default Config')
            this.config  = Config.generateDefault();
            fs.writeFile("../Config/BotConfig.json", JSON.stringify(this.config, null, 2), (err: any) => {
                if (err) {
                    console.log("Write Error:")
                    console.log(err);
                }
            })
        }

        if (!this.config.shouldBotWonder && !this.config.usePathFindingPoints) {
            console.warn("shouldBotWonder and usePathFindingPoints are disabled. Bots that use pathfinding will not move on their own")
        }

        if (this.config.shouldBotWonder && this.config.usePathFindingPoints) {
            console.warn("shouldBotWonder and usePathFindingPoints are both enabled. Bots will prioritise path points over wondering")
        }
    }

    private loadPathFindingPoints(): void {
        try {
            this._pathFindingPoints = JSON.parse(JSON.stringify(require("../../Config/PathFindingPoints.json")))
        } catch {
            console.error("PathFindingPoints.json does not exist in Configs. Disabling path finding points")
            this.config.usePathFindingPoints = false;
        }
    }

    public getConfig(): Config {
        return this.config;
    }

    public static getInstance(): ConfigManager {
        if (!this.configManagerInstance)  {
            this.configManagerInstance = new ConfigManager();
        }
        return this.configManagerInstance;
    }
}