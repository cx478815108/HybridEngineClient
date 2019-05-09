import AppDB from "./AppDB";
import fs from 'fs'
import path from 'path';

const fsTool = {
    getChildDirectory(dirPath){
        return fs.readdirSync(dirPath)
        .map((v)=>{
            return path.join(aim_path,v);
        })
        .filter((v)=>{
            return fs.lstatSync(v).isDirectory();
        });
    }
}

class ProjectPage{
    constructor(){
        this.pageFolderName = '';
        this.title          = '';
    }
}

class ProjectConfiguration{
    constructor(configJSON){
        this.identifier    = configJSON['identifier'];
        this.workDirectory = configJSON['directory'];
        this.displayName   = configJSON['displayName'];

        const fileName      = 'tokenhybrid.config.json';
        this.configJSONPath = path.join(this.workDirectory, fileName);

        // 输出目录
        this.distFolderPath     = path.join(this.workDirectory, 'dist');
        // 主页面目录
        this.mainPageFolderPath = path.join(this.workDirectory, 'mainPage');
        // 其他页面目录
        this.otherPageRootPath  = path.join(this.workDirectory, 'otherPages');
        // modal目录
        this.modalPageRootPath  = path.join(this.workDirectory, 'modalPages');

        // 主页面
        this.mainPage = null;
        // 其他页面
        this.otherPages = [];
        // modal 页面
        this.modalPages = [];
        
        // 读取项目信息
        this.readProjectInfo();
    }

    readProjectInfo(){
        if(!this.projectExist()) return ;
        const configJSON = JSON.parse(fs.readFileSync(this.configJSONPath).toString());
        
        // mainPage
        this.mainPage = new ProjectPage();
        this.mainPage.pageFolderName = 'mainPage';
        this.mainPage.title = configJSON.mainPage.title;

        // other pages
        const otherPagePath = path.join(configJSON.workDirectory, 'otherPages');
        const childDirs = fsTool.getChildDirectory(otherPagePath);
    }

    projectExist(){
        return fs.existsSync(this.configJSONPath);
    }
}

class ProjectManager{
    constructor(){
        this.recentProjects = [];
        this.loadRecentProjects();
    }

    loadRecentProjects(){
        const configJSONs = AppDB.getRecentProjectsIndex();
        for(let item of configJSONs){
            const projectConfiguration = new ProjectConfiguration(item);
            this.recentProjects.push(projectConfiguration);
        }
    }

    getRecentProjects(){
        return this.recentProjects;
    }

    static sharedManager(){
        if(!this._manager){
            this._manager = new ProjectManager();
        }
        return this._manager;
    }
}

export default ProjectManager.sharedManager();