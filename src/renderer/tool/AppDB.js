import lowdb from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import fs from 'fs-extra';
import { remote, app } from 'electron'
import path from 'path'
 
const APP = process.type === 'renderer' ? remote.app : app // 获取主进程
const STORE_PATH = path.join(APP.getPath('documents'), 'tokenhybrid');
fs.ensureDirSync(STORE_PATH);

class AppDB{
    constructor(){
        const adapter = new FileSync(path.join(STORE_PATH, '/data.json'))
        this.db = lowdb(adapter);
        this.db.defaults({'recentProjects':[]}).write();
    }

    /* 判断是否存在 */
    appTemplateExist(appTemplate){
        return fs.existsSync(appTemplate.configJSONPath);
    }

    saveExistProject(configJSON){
        const item = {
            workDirectory: configJSON.workDirectory,
            identifier   : configJSON["bundle.identifier"],
            displayName  : configJSON.displayName,
        }
        this.saveNewAppTemplate(item);
    }

    saveNewAppTemplate(appTemplate){
        const item = {
            workDirectory : appTemplate.workDirectory,
            identifier  : appTemplate.identifier,
            displayName : appTemplate.displayName,
        }
        const collections = this.db.get('recentProjects');
        const existedItem = collections.find({ workDirectory: appTemplate.workDirectory });
        
        // 查看是否存在 存在就更新
        if(existedItem.value()){
            existedItem.assign(item).write();
            return ;
        }
        collections.push(item).write();
    }

    updateProjectsIndex(list){
        const updatedList = [];
        for(let item of list){
            if(!item.workDirectory) { continue ;}
            const jsonPath = path.join(item.workDirectory, 'tokenhybrid.config.json');
            if(!fs.existsSync(jsonPath)){ continue ;}
            try {
                const json = JSON.parse(fs.readFileSync(jsonPath).toString());
                const index = {
                    workDirectory : json.workDirectory,
                    identifier: json["bundle.identifier"],
                    displayName : json.displayName,
                };
                if(index.workDirectory && index.identifier && index.displayName){
                    updatedList.push(index)
                }
                this.db.set('recentProjects', updatedList).write();
            } catch (error) {}
        }
        return updatedList;
    }

    /* 获取所有的索引 */
    getRecentProjectsIndex(){
        this.db.read();
        const result = this.db.get('recentProjects').value();
        return this.updateProjectsIndex(result);
    }

    /* 删除所有的索引 */
    removeAllRecentProjectsIndex(){
        this.db.set('recentProjects', []).write();
    }

    /* 根据工程目录删除索引 */
    removeRecentProject(workDirectory){
        this.db.get('recentProjects').remove({ workDirectory}).write();
    }

    static sharedDB(){
        if(!this._data){

            this._data = new AppDB();
        }
        return this._data;
    }
}

export default AppDB.sharedDB();