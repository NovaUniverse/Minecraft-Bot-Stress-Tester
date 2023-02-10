
export class Config {
    private localhost: string = "0.0.0.0";
    private isCombatEnabled: Boolean = false;
    private usePathFindingPoints: Boolean = false;

    public static generateDefault(): Config {
        return new Config();
    }

}