const HTMLDocument = require('./dom/HTMLDocument');
const map = require('map-stream');
const vfs = require('vinyl-fs');

class Hybrid{
    constructor(){

    }

    build(configJSON){
        const text = '';
        const document = this.buildDocument(text);
    }

    buildDocument(text){
        const document = new HTMLDocument();
        document.create(text);
        return document;
    }
}

const hybrid = new Hybrid();
