import { BotManager } from './BotManager';
import { ConfigManager } from './configManager';

const botManager = new BotManager("localhost");

//botManager.launchBots(1);

ConfigManager.getInstance();