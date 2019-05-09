import fs from 'fs-extra'
import path from 'path'
import AppDB from './AppDB'

class AppManager{
    constructor(){
        
    }

    appTemplateExist(appTemplate){
        return AppDB.appTemplateExist(appTemplate);
    }

    createAppTemplate(appTemplate){       
       // 将模板文件复制到 目标文件夹
       const p = appTemplate;
       const mainPagePath = p.mainPageFolderPath;
       const targetPaths  = [p.entryHTML, p.entryJS, p.entryCSS];
       const sourceNames  = ['index.html','index.js','index.css'];
       const templatePath = path.resolve(__dirname, '../assets/template/');
       for(let i = 0; i < 3;i++){
           const targetPath = path.join(mainPagePath,targetPaths[i]);
           const sourcePath = path.join(templatePath, sourceNames[i]);
           fs.copySync(sourcePath, targetPath);
       }

       // 写入tokenhybrid.config.json
       const configJSON = p.getMainConfigJSON();
       fs.writeFileSync(p.configJSONPath, JSON.stringify(configJSON, 4));

       AppDB.saveNewAppTemplate(appTemplate);
       return true;
    }

    static sharedManager(){
        if(!this.manager) {
            this.manager = new AppManager();
        }
        return this.manager;
    }
}

export default AppManager.sharedManager();



