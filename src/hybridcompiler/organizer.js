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

class Organizer{

    build(loader){
        return new Promise((resolve, reject)=>{
            this.processHTMLFiles(loader.getHTMLItems())
            .then(()=>{
                // 处理 css 文件
                return this.processCSSFiles(loader.getCSSItems());
            })
            .then(()=>{
                // 处理js 文件
                return this.processJSFiles(loader.getJsItems());
            })
            .then(resolve)
            .catch(reject);
        });
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

module.exports = Organizer;
