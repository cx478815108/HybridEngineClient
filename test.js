const testJSON ={
  "bundle.identifier": "test",
  "displayName": "计算器",
  "workDirectory": "/Users/feelings/FrontEnd/Token小程序/helloworld",
  "entryJS": "index.js",
  "entryHTML": "index.html",
  "entryCSS": "index.css"
}

const fs = require('fs');
const path = require('path');
const hybrid = require('hybridcompiler');
const log = (text)=>{
  console.log(text);
}
hybrid.build(testJSON, null, log).then(()=>{
    const cwd = testJSON.workDirectory;
    const zipFile = path.join(cwd, 'production', 'production.zip');
    const result = fs.existsSync(testJSON.workDirectory);
    console.log("编译完成",result);
})
.catch((err)=>{
    console.log("出错了",err);
})