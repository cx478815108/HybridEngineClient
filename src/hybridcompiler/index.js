const ProjectLoader = require('./utils/ProjectLoader');
// const Compiler      = require('./compiler');

const fs   = require("fs-extra")
const path = require('path');

const vfs         = require('vinyl-fs');
const fileinclude = require('gulp-file-include');
const rename      = require("gulp-rename");

const postcss  = require("postcss")
const atImport = require("postcss-import")

const rollup      = require('rollup');
const commonjs    = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const rollupJSON  = require('rollup-plugin-json');

const testJSON = {
    "bundle.identifier": "helloworld",
    "displayName": "helloworld",
    "workDirectory": "/Users/feelings/FrontEnd/Token小程序/helloworld",
    "entryJS": "index.js",
    "entryHTML": "index.html",
    "entryCSS": "index.css"
}


class Hybrid{
    constructor(){

    }

    build(configJSON){
        const json = testJSON;
        
        // 工具预编译
        const loader = new ProjectLoader(testJSON);
        this.buildTargetFiles(loader);

        // const compiler = new Compiler();
        // compiler.startCompile(json);
    }

    buildTargetFiles(loader){
        // 拷贝config.json
        this.processConfigJSONs(loader.getPageConfigJSONs())
        .then(()=>{
            // 处理html文件
            return this.processHTMLFiles(loader.getHTMLItems());
        })
        .then(()=>{
            // 处理 css 文件
            return this.processCSSFiles(loader.getCSSItems());
        })
        .then(()=>{
            // 处理js 文件
            return this.processJSFiles(loader.getJsItems());
        })
        .catch((error)=>{
            console.log("出错了",error);
        });
    }

    processConfigJSONs(configJSONs){
        return new Promise((resolve, reject)=>{
            for(let item of configJSONs){
                vfs.src(item.path).pipe(vfs.dest(item.outputPath));
            }
            resolve();
        })
    }

    processHTMLFiles(htmlItems){
        return new Promise((resolve, reject)=>{
            for(let item of htmlItems){
                if(!fs.existsSync(item.path)){
                    return reject(`${item.path} 不存在`);
                }

                vfs.src(item.path)
                    .pipe(fileinclude({
                        prefix: '@@',
                        basepath: '@file'
                    }))
                    .pipe(rename(function (path) {
                        if(item.name.endsWith('.html')){
                            item.name = item.name.replace('.html','');
                        }
                        path.basename = item.name;
                      }))
                    .pipe(vfs.dest(item.outputPath));
            }

            resolve();
        });
    }

    processCSSFiles(cssItems){
        return new Promise((resolve, reject)=>{
            const processCSS = postcss().use(atImport());
            let tasks = [];
            for(let item of cssItems){
                const css = fs.readFileSync(item.path, "utf8");
                const task = processCSS.process(css, {from: item.path});
                tasks.push(task);
            }

            Promise.all(tasks)
            .then((results)=>{
                for(let i = 0; i < results.length; i++){
                    const item = cssItems[i];
                    const css  = results[i];
                    fs.ensureDirSync(item.outputPath);
                    const outputPath = path.join(item.outputPath, 'main.css');
                    fs.writeFileSync(outputPath, css);
                }
                resolve();
            }).catch(reject);
        });
        
    }

    processJSFiles(jsItems){
        return new Promise((resolve, reject)=>{
            const tasks   = [];
            const options = [];
            for(let item of jsItems){
                const option = {
                    input: item.path,
                    output: {
                        file: path.join(item.outputPath, 'main.js'),
                        format: 'cjs'
                    },
                    plugins: [ 
                        rollupJSON(),
                        nodeResolve({
                            mainFields: ['module', 'main'],
                        }),
                        commonjs()
                     ]
                }

                options.push(option);
                tasks.push(rollup.rollup(option));
            }

            Promise.all(tasks)
            .then((bundles)=>{
                const finalTasks = [];
                for(let i = 0; i < bundles.length; i++){
                    const bundle = bundles[i];
                    const option = options[i];
                    finalTasks.push(bundle.write(option.output));
                }

                return Promise.all(finalTasks);
            })
            .then(resolve)
            .catch(reject);
        });
    }
}

const hybrid = new Hybrid();
hybrid.build();
