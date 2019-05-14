const testJSON = {
    "workDirectory": "/Users/feelings/FrontEnd/Token小程序/helloworld",
    "entryJS"      : "index.js",
    "entryHTML"    : "index.html",
    "entryCSS"     : "index.css"
}

const hybridcompiler = require('hybridcompiler')
hybridcompiler.build(testJSON, (percent)=>{
    console.log("完成"+percent);
});