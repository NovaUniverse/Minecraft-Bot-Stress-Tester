import {setEnvironmentData, Worker} from "worker_threads";
import {ConfigManager} from "./Config/ConfigManager";
import {MessageType} from "./MessageType";
import {WorkerStates} from "./WorkerStates";

export class WorkerManager {

    private static workerManagerInstance: WorkerManager;
    protected _threads: number;
    private workers: Array<Worker>;
    private workerStates: Map<Worker, WorkerStates>;
    private allocateList: Map<Number, Array<String>>;

    public get threads(): number {
        return this._threads;
    }

    public set threads(value: number) {
        this._threads = value;
    }

    private constructor() {
        this._threads = 2
        this.workers = [];
        this.workerStates = new Map();
        this.allocateList = new Map();
        setEnvironmentData("config", ConfigManager.getInstance().getConfig())
    }

    private setupParentListeners(worker: Worker) {
        worker.on("message", (message) => this.handleWorkerMessages(message))
    }

    private async handleWorkerMessages(message: string) {
        const msg = JSON.parse(message);
        switch (msg.status) {
            case MessageType.READY:
                const worker = this.workers.find(worker => worker.threadId == msg.id);
                if (worker) {
                    this.workerStates.set(worker, WorkerStates.READY)
                    console.log(worker.threadId + " is ready")
                    if (Array.from(this.workerStates.values()).every((x) => x == WorkerStates.READY)) {
                        console.log("starting bots")
                        this.startBots();
                    }
                }
                break
        }
    }

    public startWorkers() {
        for (let i = 0; i < this.threads; i++) {
            console.log("creating thread: " + i)
            const worker = new Worker("./worker.js");
            this.workers.push(worker);
            this.workerStates.set(worker, WorkerStates.START)
            this.allocateList.set(worker.threadId, []);
            this.setupParentListeners(worker)
        }

        this.prepareBotList()
        this.workers.forEach((worker: Worker) => {
            let bots = this.allocateList.get(worker.threadId)
            this.sendWorkerMessage(worker, MessageType.START, {body: {
                    bots: bots
                }})
        })


    }


    private async startBots() {
        for (let currentThread = 1; currentThread <= this.workers.length; currentThread++) {
            const worker = this.workers.find(worker => worker.threadId == currentThread)
            if (worker) {
                const botList = this.allocateList.get(worker.threadId);
                console.log(worker.threadId + ": Creating Bots")
                if (botList) {
                    for (let bot = 0; bot < botList?.length; bot ++) {
                        this.sendWorkerMessage(worker, MessageType.CREATE)
                        await WorkerManager.sleep(5)
                    }
                }
            }
        }
    }
    private prepareBotList() {
        const bots = 10
        const botNames: Array<String> = [];
        for (let i = 0; i < bots; i++) {
            botNames.push(`Bot${i}`)
        }
        //Balances bot tasks across threads
        let currentThread: number = 1
        botNames.forEach((botName) => {
            const workerList =  this.allocateList.get(currentThread);
            if (workerList && workerList.length <= 5) {
                console.log(currentThread +": Adding allocated bot name")
                workerList.push(botName)
            }
            //Checks if at the last thread and start back to 1
            currentThread++
            if (currentThread > this.threads) currentThread = 1
        })
    }


    private sendWorkerMessage(worker: Worker, status: MessageType, message: object = {}) {
        worker.postMessage(JSON.stringify({status: status, message: message}))
    }

    public static sleep(secounds: number) {
        return new Promise(resolve => setTimeout(resolve, secounds * 1000))
    }

    public static getInstance(): WorkerManager {
        if (!this.workerManagerInstance) {
            this.workerManagerInstance = new WorkerManager();
        }
        return this.workerManagerInstance;
    }
}