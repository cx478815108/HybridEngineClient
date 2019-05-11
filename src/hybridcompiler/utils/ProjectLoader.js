const path = require('path');
const fs   = require('fs-extra');

const fsTool = {
    getChildDirectory(dirPath){
        return fs.readdirSync(dirPath)
        .map((v)=>{
            return path.join(dirPath, v);
        })
        .filter((v)=>{
            return fs.lstatSync(v).isDirectory();
        });
    }
}

class ProjectLoader{
    constructor(configJSON){
        this.configJSON = configJSON;
        this.htmlItems  = [];
        this.cssItems   = [];
        this.jsItems    = [];

        this.makePathInfo();
    }

    getHTMLItems(){
        return this.htmlItems;
    }
    
    getCSSItems(){
        return this.cssItems;
    }

    getJsItems(){
        return this.jsItems;
    }

    makePathInfo(){
        const cwd          = this.configJSON.workDirectory;
        const entryHTML    = this.configJSON.entryHTML;
        const entryCSS     = this.configJSON.entryCSS;
        const entryJS      = this.configJSON.entryJS;
        
        const mainOutputPath = path.join(cwd, 'dist', 'mainPage');
        
        const mainHTMLPath = path.join(cwd, 'mainPage', entryHTML);
        const mainHTMLItem = {
            path: mainHTMLPath,
            outputPath: mainOutputPath
        };
        this.htmlItems.push(mainHTMLItem);

        const mainCSSPath = path.join(cwd, 'mainPage', entryCSS);
        const mainCSSItem = {
            path: mainCSSPath,
            outputPath: mainOutputPath
        };   
        this.cssItems.push(mainCSSItem);     

        const mainJSPath = path.join(cwd, 'mainPage', entryJS);
        const mainJSItem = {
            path: mainJSPath,
            outputPath: mainOutputPath
        };
        this.jsItems.push(mainJSItem);
        
        const otherPageFolders = fsTool.getChildDirectory(path.join(cwd, 'otherPages'));
        for(let folder of otherPageFolders){
            const folderName = path.basename(folder);
            const outputPath = path.join(cwd, 'dist', 'otherPages', folderName);
            const htmlItem = {
                path: path.join(folder, entryHTML),
                outputPath
            }
            this.htmlItems.push(htmlItem);

            const cssItem = {
                path: path.join(folder, entryCSS),
                outputPath
            }
            this.cssItems.push(cssItem); 

            const jsItem = {
                path: path.join(folder, entryJS),
                outputPath
            };
            this.jsItems.push(jsItem);
        }
    }
}

module.exports = ProjectLoader;