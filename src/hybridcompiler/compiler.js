const fs           = require('fs-extra');
const path         = require('path');
const HTMLDocument = require('./dom/HTMLDocument');
const Util         = require("./utils/Util");
const DOMAnalyse   = require('./utils/DOMAnalyse');
const Zip          = require('./utils/Zip');
const CommonStore  = require('./utils/CommonStore')
const fsTool       = require('./utils/FSTool');

const testJSON = {
    "bundle.identifier": "helloworld",
    "displayName": "helloworld",
    "workDirectory": "/Users/feelings/FrontEnd/Token小程序/helloworld",
    "entryJS": "index.js",
    "entryHTML": "index.html",
    "entryCSS": "index.css"
}

class Compiler{
    constructor(){

    }

    startCompile(configJSON){
        const cwd                = path.join(configJSON.workDirectory, 'dist');
        const pageFolder         = path.join(cwd, 'mainPage');
        const pageProductionJSON = this.compileSinglePage(pageFolder);
        console.log(pageProductionJSON);
    }

    compileSinglePage(pageFolder){
        const pageConfigJSONPath = path.join(pageFolder, 'config.json');
        const pageConfigJSON = JSON.parse(fs.readFileSync(pageConfigJSONPath).toString());

        const cssPath  = path.join(pageFolder, 'main.css');
        const cssText  = fs.readFileSync(cssPath).toString();
        const cssRules = Util.parseCSSString(cssText);

        const htmlPath = path.join(pageFolder, 'main.html');
        const htmlText = fs.readFileSync(htmlPath).toString();

        const styleStore   = new CommonStore();
        const layoutStore  = new CommonStore();

        const mainPageJSON = this.createPageJSON(htmlText, cssRules, styleStore, layoutStore);
        
        const folders    = path.join(pageFolder, 'modalPages');
        const modalHTMLs = fsTool.getFiles(folders, '.html');
        
        const widgetNodes = {};
        for(let htmlPath of modalHTMLs){
            const modalName = path.basename(htmlPath).split('.')[0];
            const htmlText  = fs.readFileSync(htmlPath).toString();
            const modalJSON = this.createPageJSON(htmlText, cssRules, styleStore, layoutStore);
            widgetNodes[modalName] = modalJSON;
        }

        return {
            rootNode:mainPageJSON,
            widgetNodes,
            styleStore: styleStore.getJSONObj(),
            layoutStore: layoutStore.getJSONObj(),
            config: pageConfigJSON
        }
    }

    createPageJSON(htmlText, cssRules, styleStore, layoutStore){
        // 创建dom
        let document = this.createDOM(htmlText);
        document = this.createRenderTree(document, cssRules)
        // 必须先 processDOMAttributes
        document = this.processDOMAttributes(document, styleStore, layoutStore);
        // 要应用到上一次的 forloop 动态attributes等
        document = this.analyseDOM(document)
        // 对json进行压缩处理
        let zipedTreeJSON = Zip(document.rootNode);
        zipedTreeJSON     = JSON.stringify(zipedTreeJSON);
        return zipedTreeJSON;
    }

    createDOM(htmlText){
        const document = new HTMLDocument();
        document.createDOM(htmlText);
        return document;
    }

    createRenderTree(document, cssRules){
        for (const selectors in cssRules) {
            const selectorList = selectors.split(" ");
            const style = cssRules[selectors];
            
            selectorList.forEach((selector) => {
                // 根据 selector 寻找匹配的nodes 
                const nodes = document.findAll(selector);
                // nodes 将css rules合并进去
                nodes.forEach((node) => {
                    node.addCSSStyle(style);
                });
            });
        }

        return document;
    }

    analyseDOM(document){
        const domAnalyse = new DOMAnalyse();
        domAnalyse.startAnalyse(document);
        return document;
    }

    processDOMAttributes(document, styleStore, layoutStore){
        const rootNode = document.rootNode;
        // 解除循环
        rootNode.broken();
    
        const nodeWalker = (xmlNode, func) => {        
            // 给外界处理
            func(xmlNode);

            // 递归处理
            xmlNode.children.forEach((childNode) => {
                nodeWalker(childNode, func);
            });
        }

        nodeWalker(rootNode, (xmlNode)=>{
            // 开始调整node的属性
            xmlNode.processAttributes();

            if (Object.keys(xmlNode.layout).length) {
                xmlNode.layoutKey = layoutStore.store(xmlNode.layout);
                delete(xmlNode.layout);
            }
            
            if (Object.keys(xmlNode.style).length) {
                xmlNode.styleKey = styleStore.store(xmlNode.style);
                delete(xmlNode.style);
            }

            // 处理完毕
            xmlNode.processFinish();
        });

        return document;
    }
}

(new Compiler).startCompile(testJSON);
module.exports = Compiler;