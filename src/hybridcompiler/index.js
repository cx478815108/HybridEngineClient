const ProjectLoader = require('./utils/ProjectLoader');
const Compiler      = require('./compiler');
const Organizer     = require('./organizer');

const testJSON = {
    "workDirectory": "/Users/feelings/FrontEnd/Token小程序/helloworld",
    "entryJS"      : "index.js",
    "entryHTML"    : "index.html",
    "entryCSS"     : "index.css"
}

class Hybrid{
    build(configJSON){
        const json = testJSON;

        // 加载工程信息
        const loader = new ProjectLoader(json);
        
        // 工具预编译
        const organizer = new Organizer();
        organizer.build(loader)
        .then(()=>{
            const compiler = new Compiler();
            return compiler.build(json);
        })
        .then(()=>{
            console.log("编译完成");
        })
        .catch((error=>{
            console.log(error);
        }));
    }
}

const hybrid = new Hybrid();
hybrid.build();
module.exports = hybrid;
