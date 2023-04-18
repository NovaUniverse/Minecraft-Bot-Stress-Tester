import { BotManager } from './BotManager';
import { ConfigManager } from './configManager';

var config = ConfigManager.getInstance().getConfig();
const botManager = new BotManager("localhost", config.mcVersion);

botManager.launchBots(config.botCount);

