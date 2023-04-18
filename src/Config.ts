
export class Config {
    private _localhost: string = "0.0.0.0";
    private _isCombatEnabled: Boolean = false;
    private _usePathFindingPoints: Boolean = false;
    private _shouldBotWonder: Boolean = false;
    private _mcVersion: string = "1.19";
    private _botCount: number = 1;

    public get shouldBotWonder(): Boolean {
        return this._shouldBotWonder;
    }
    
    public get usePathFindingPoints(): Boolean {
        return this._usePathFindingPoints;
    }

    public set usePathFindingPoints(value: Boolean) {
        this._usePathFindingPoints = value;
    }

    public get localhost(): string {
        return this._localhost;
    }

    public get isCombatEnabled(): Boolean {
        return this._isCombatEnabled;
    }

    public get mcVersion(): string {
        return this._mcVersion;
    }

    public get botCount(): number {
        return this._botCount;
    }

    public static generateDefault(): Config {
        return new Config();
    }

}