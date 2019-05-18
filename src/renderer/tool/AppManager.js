import fs from 'fs-extra'
import path from 'path'
import AppDB from './AppDB'
import Template from './Template'

class AppManager{

    appTemplateExist(appTemplate){
        return AppDB.appTemplateExist(appTemplate);
    }

    createAppTemplate(appTemplate){       
       // 将模板文件复制到 目标文件夹
       const p = appTemplate;
       const mainPagePath = p.mainPageFolderPath;
       const targetPaths  = [p.entryHTML, p.entryJS, p.entryCSS];
       
       const template = new Template();
       const sources  = [
           template.getHTMLText(), 
           template.getJSText(),
           template.getCSSText()
        ];

       for(let i = 0; i < 3;i++){
           const targetPath = path.join(mainPagePath, targetPaths[i]);
           fs.writeFileSync(targetPath, sources[i]);
       }

       // 写入tokenhybrid.config.json
       const configJSON = p.getMainConfigJSON();
       fs.writeFileSync(p.configJSONPath, JSON.stringify(configJSON, null, 2));

       const mainPageJSON = p.getMainPageJSON();
       fs.writeFileSync(path.join(mainPagePath, 'config.json'), JSON.stringify(mainPageJSON, null,2));

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



