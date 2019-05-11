const path = require('path');
const fs   = require('fs-extra');

const fsTool = {
    getChildDirectory(dirPath){
        if(!fs.existsSync(dirPath)) return [];
        return fs.readdirSync(dirPath)
        .map((v)=>{
            return path.join(dirPath, v);
        })
        .filter((v)=>{
            return fs.lstatSync(v).isDirectory();
        });
    },
    getFiles(dirPath, ext){
        if(!fs.existsSync(dirPath)) return [];
        return fs.readdirSync(dirPath)
        .map((v)=>{
            return path.join(dirPath, v);
        })
        .filter((v)=>{
            return path.extname(v) === ext;
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
        this.htmlItems.push({
            path: path.join(cwd, 'mainPage', entryHTML),
            outputPath : mainOutputPath,
            name: 'main.html'
        });

        // modal Pages
        const modalHTMLs = fsTool.getFiles(path.join(cwd, 'mainPage', 'modalPages'), '.html');
        for(let item of modalHTMLs){
            this.htmlItems.push({
                path: item,
                outputPath: path.join(cwd, 'dist', 'mainPage' ,'modalPages'),
                name: path.basename(item)
            });
        }

        const mainCSSPath = path.join(cwd, 'mainPage', entryCSS);
        this.cssItems.push({
            path: mainCSSPath,
            outputPath: mainOutputPath
        });     

        const mainJSPath = path.join(cwd, 'mainPage', entryJS);
        this.jsItems.push({
            path: mainJSPath,
            outputPath: mainOutputPath
        });
        
        const otherPageFolders = fsTool.getChildDirectory(path.join(cwd, 'otherPages'));
        for(let folder of otherPageFolders){
            const folderName = path.basename(folder);
            const outputPath = path.join(cwd, 'dist', 'otherPages', folderName);
            this.htmlItems.push({
                path: path.join(folder, entryHTML),
                outputPath,
                name: "main.html"
            });

            // modal Pages
            const modalHTMLs = fsTool.getFiles(path.join(cwd, 'otherPages', folderName, 'modalPages'), '.html');
            for(let item of modalHTMLs){
                this.htmlItems.push({
                    path: item,
                    outputPath: path.join(outputPath ,'modalPages'),
                    name: path.basename(item)
                });
            }

            this.cssItems.push({
                path: path.join(folder, entryCSS),
                outputPath
            }); 

            this.jsItems.push({
                path: path.join(folder, entryJS),
                outputPath
            });
        }
    }
}

module.exports = ProjectLoader;