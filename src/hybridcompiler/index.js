const ProjectLoader = require('./utils/ProjectLoader');
// const Compiler      = require('./compiler');
const Organizer     = require('./organizer');

const testJSON = {
    "workDirectory": "/Users/feelings/FrontEnd/Token小程序/helloworld",
    "entryJS": "index.js",
    "entryHTML": "index.html",
    "entryCSS": "index.css"
}

class Hybrid{
    build(configJSON){
        const json = testJSON;
        
        // 加载工程信息
        const loader = new ProjectLoader(testJSON);
        
        // 工具预编译
        const organizer = new Organizer();
        organizer.build(loader);

        // const compiler = new Compiler();
        // compiler.startCompile(json);
    }
}

const hybrid = new Hybrid();
hybrid.build();
