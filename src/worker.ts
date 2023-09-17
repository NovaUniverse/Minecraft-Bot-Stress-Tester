import {BotManager} from "./BotManager";
const { threadId, parentPort, getEnvironmentData} = require('worker_threads');
import {MessageType} from "./MessageType";
import {Config} from "./Config/Config";


const config: Config = Object.assign(new Config(), getEnvironmentData("config"))
let botManager: BotManager;
parentPort?.on("message", (message: any) => {
    const msg = JSON.parse(message);
    switch (msg.status) {
        case MessageType.START:
            if (msg.message.body.bots) {
                start(msg.message.body.bots);
            }
            break
        case MessageType.CREATE:
            botManager.createBot()
            break
        case MessageType.SEND:

            break
    }
})

function start(botList: Array<string>) {
    botManager = new BotManager("localhost", config.mcVersion, botList);
    sendMessage(MessageType.READY)
}


export function sendMessage(status: MessageType, message: string = "") {
    parentPort?.postMessage(JSON.stringify({status: status, message: message, id: threadId}))
}