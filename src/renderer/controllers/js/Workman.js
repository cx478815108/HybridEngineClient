import chokidar from 'chokidar'
import path from 'path';
import fs from 'fs';
import hybridcompiler from "hybridcompiler";
import MobileDebugger from '../../../debug/MobileDebugger'

const RemoteCode = {
    refresh:10,
    runCode:11
}

export default class Workman{
    constructor(configJSON){
        this.watcher        = null;
        this.iPhoneConected = false;
        this.configJSON     = configJSON;
        this.cwd            = configJSON.workDirectory;
    }

    watchProject(process){
        const self = this;
        const cwd  = this.cwd;
        process = process || console.log;
        return new Promise((resolve, reject)=>{
            const mainPage   = path.join(cwd, 'mainPage');
            const otherPages = path.join(cwd, 'otherPages');
            const projJSON   = path.join(cwd, 'tokenhybrid.config.json');
            const ignored    = {ignored: /(^|[\/\\])\../};   
            const callBack   = (event, path)=>{
                self.automaticWork()
                .then(()=>{
                    process(`编译并刷新完毕...`);
                }).catch((error)=>{
                    process(error);
                })
            };       
            self.watcher = chokidar.watch([mainPage, otherPages, projJSON], ignored);
            self.watcher
            .on('change', callBack)
            .on('unlink', callBack)
            .on('unlinkDir', callBack)
            .on('error', reject)
            .on('ready', resolve);
        });
    }

    compileProject(process){
        return new Promise((resolve, reject)=>{
            const jsonText = fs.readFileSync(path.join(this.cwd, 'tokenhybrid.config.json'));
            const json     = JSON.parse(jsonText);
            hybridcompiler.build(json, process)
            .then(resolve)
            .catch(reject);
        });
    }

    stopWatch(){
        if(this.watcher){
            this.watcher.close();
        }
    }

    transportFile(){
        return new Promise((resolve, reject)=>{
            const zipFile = path.join(this.cwd, 'production', 'production.zip');
            if(!fs.existsSync(zipFile)){
                throw new Error(`${zipFile}不存在`);  
            }
            MobileDebugger.transportFile(zipFile)
            .then(resolve)
            .catch(reject);
        });
    }

    automaticWork(){
        return new Promise((resolve, reject)=>{
            this.compileProject()
            .then(()=>{
                return this.transportFile();
            })
            .then(()=>{
                this.sendRefreshCommond();
                resolve();
            })
            .catch(reject);
        });
    }

    sendRefreshCommond(){
        MobileDebugger.transportMessage('刷新命令',{
            code:RemoteCode.refresh,
            data:this.configJSON
        });
    }

    sendRunCodeCommand(code){
        if(typeof code !== 'string' || code.length <= 0) return ;
        MobileDebugger.transportMessage('刷新命令',{
            code:RemoteCode.runCode,
            data:code
        });
    }

    destroy(){
        this.stopWatch();
        MobileDebugger.closeServer();
    }
}
