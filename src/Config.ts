
export class Config {
    private _localhost: string = "0.0.0.0";
    private _isCombatEnabled: Boolean = false;
    private _usePathFindingPoints: Boolean = false;
    private _shouldBotWonder: Boolean = false;

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

    public static generateDefault(): Config {
        return new Config();
    }

}