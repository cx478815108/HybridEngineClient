const vfs    = require('vinyl-fs');
const zip    = require('gulp-zip');

const src = ['/Users/feelings/FrontEnd/Token小程序/helloworld/dist/**/main.js',
'/Users/feelings/FrontEnd/Token小程序/helloworld/dist/**/config.json',
'/Users/feelings/FrontEnd/Token小程序/helloworld/dist/**/production.json'];
vfs.src(src)
    .pipe(zip('production.zip'))
    .pipe(vfs.dest('/Users/feelings/FrontEnd/Token小程序/helloworldDist'));