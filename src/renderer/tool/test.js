// https://github.com/sindresorhus/gulp-zip
// https://github.com/haoxins/gulp-file-include 
// 单独的抽HTMLHit JSHint 出来

var map = require('map-stream');
var vfs = require('vinyl-fs');
 
var log = function(file, cb) {
  console.log(String(file.contents));
  cb(null, file);
};
 
vfs.src('/Users/feelings/FrontEnd/engineclient/db.json')
  .pipe(map(log))