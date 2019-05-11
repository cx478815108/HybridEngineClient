const VarExtract = require('../utils/VarExtract');

let uid = 0;
const UniqueIdAlloc = ()=>{
    return uid++;
}

const copyJSON = (json)=>{
    return JSON.parse(JSON.stringify(attrs));
}

const TokenInstructions = {
    bind     : "@bind",
    tableData: "t:data",
    for      : "t:for"
}

module.exports = class HTMLNode{
    
    constructor(){
        // 明确指明每个属性
        this.uid              = UniqueIdAlloc();
        this.id               = "";
        this.tagName          = "";
        this.text             = "";
        this.forPath          = "";
        this.component        = "";
        this.bind             = "";
        this.children         = [];
        this.parent           = null;
        this.forKeyPath       = null;
        this.dynamicAttrs     = {};
        this.dynamicAttrsData = {};
        this.textData         = [];
        this.attributes       = {};
        this.clickInfo        = {};
        this.fontStyle        = {};
        this.forLoop          = {};
        this.layout           = {};
        this.style            = {};

        this.isDynamicText = false;
        this.isForNode     = false;
        this.autoHeight    = false;
        this.autoWidth     = false;
        this.stickyX       = false;
        this.stickyY       = false;
        this.static        = true;
    }

    addChildNode(node){
        if(!node) return ;
        node.parent = this;
        this.children.push(node);
    }

    broken(){
        this.parent = null;
        delete(this.parent);
        this.children.forEach((childNode)=>{
            childNode.broken();
        });
    }

    // 检测里面是否有变量
    setText(text){
        this.text = text;
        const list = VarExtract.parse(text);
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if(element.type === 1) {
                this.isDynamicText = true;
                this.static = false;
                break;
            }
        }
    }

    setAttributes(attrs){
        this.attributes = copyJSON(attrs);
    }
}