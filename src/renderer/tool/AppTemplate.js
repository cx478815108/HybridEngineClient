import path from 'path'
import fs   from 'fs-extra'

/* App编译模型 */
class AppTemplate{
    constructor(json){
        this.mainTitle     = json['title'];
        this.identifier    = json['identifier'];
        this.workDirectory = json['workDirectory'];
        this.displayName   = json['displayName'];
        this.entryHTML     = json['entryHTML'];
        this.entryJS       = json['entryJS'];
        this.entryCSS      = json['entryCSS'];

        const fileName = 'tokenhybrid.config.json';
        this.configJSONPath = path.join(this.workDirectory, fileName);

        // 输出目录
        this.distFolderPath     = path.join(this.workDirectory, 'dist');
        
        // 主页面目录
        this.mainPageFolderPath = path.join(this.workDirectory, 'mainPage');
        
        // 其他页面目录
        this.otherPageRootPath  = path.join(this.workDirectory, 'otherPages');
        
        // modal目录
        this.modalPageRootPath  = path.join(this.workDirectory, 'mainPage', 'modalPages');

        // assests Path 
        this.assetsPath = path.join(this.workDirectory, 'assets');

        this.ensurePath();
    }

    getMainConfigJSON(){
        // 字段必须一一写
        const json = {
            "bundle.identifier": this.identifier,
            "displayName"      : this.displayName,
            "workDirectory"    : this.workDirectory,
            "entryJS"          : this.entryJS,
            "entryHTML"        : this.entryHTML,
            "entryCSS"         : this.entryCSS,
        }
        return json;
    }

    getMainPageJSON(){
        // 字段必须一一写
        const json = {
            "title"        : this.mainTitle,
            "navBar.style" : 'white',
            "navBar.color" : 'rgb(255,255,255)',
        }
        return json;
    }

    ensurePath(){
        fs.ensureDirSync(this.workDirectory);

        if(!fs.statSync(this.workDirectory).isDirectory()){
            return false;
        }

        const paths = [
            this.assetsPath,
            this.mainPageFolderPath, 
            this.distFolderPath,
            this.modalPageRootPath,
            this.otherPageRootPath
        ];
        for(let p of paths){
            fs.ensureDirSync(p);
        }
        return true;
    }

    static templateFromConfigJSON(configJSON){
        const template = new AppTemplate();
        
    }
}

export default AppTemplate;
