import {WorkerManager} from "./WorkerManager";

//Set working directory
process.chdir("./build")

const workerManager = WorkerManager.getInstance();
workerManager.startWorkers()
