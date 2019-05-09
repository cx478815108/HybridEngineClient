import lowdb from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import fs from 'fs-extra';
import { remote, app } from 'electron'
import path from 'path'
 
const APP = process.type === 'renderer' ? remote.app : app // 获取主进程
const STORE_PATH = APP.getPath('userData');
if (process.type !== 'renderer') {
    if (!fs.pathExistsSync(STORE_PATH)) {
      fs.mkdirpSync(STORE_PATH)
    }
}  

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

    saveNewAppTemplate(appTemplate){
        const item = {
            directory   : appTemplate.workDirectory,
            identifier  : appTemplate.identifier,
            displayName : appTemplate.displayName,
        }
        const collections = this.db.get('recentProjects');
        const existedItem = collections.find({ directory: appTemplate.workDirectory });
        
        // 查看是否存在 存在就更新
        if(existedItem.value()){
            existedItem.assign(item).write();
            return ;
        }
        collections.push(item).write();
    }

    /* 获取所有的索引 */
    getRecentProjectsIndex(){
        this.db.read();
        const result = this.db.get('recentProjects').value();
        return result;
    }

    /* 删除所有的索引 */
    removeAllRecentProjectsIndex(){
        this.db.set('recentProjects', []).write();
    }

    /* 根据工程目录删除索引 */
    removeRecentProject(workDirectory){
        this.db.get('recentProjects').remove({ directory}).write();
    }

    static sharedDB(){
        if(!this._data){

            this._data = new AppDB();
        }
        return this._data;
    }
}

export default AppDB.sharedDB();