let gulp = require("gulp");
let tsc = require("gulp-typescript");
let sourcemaps = require("gulp-sourcemaps");
let typescript = require("typescript");
let runSequence = require("run-sequence");
let del = require("del");

let paths = {
    src: "./src/**/*.*",
    srcNoTs: "!./src/**/*.ts",
    tsFiles: "./src/**/*.ts",
    typings: "./typings/index.d.ts",
    typingsFixes: "./typings_fixes/index.d.ts",
    build: "./build",
    tsconfig: "tsconfig.json"
};

let tasks = {
    clear: "clear",
    transpile: "transpile",
    copy: "copy",
    build: "build"
};

gulp.task(tasks.clear, (callback) => {
    return del(paths.build, callback);
});

gulp.task(tasks.transpile, () => {
    let tsProject = tsc.createProject(paths.tsconfig, {
        typescript: typescript
    });

    return gulp.src([paths.tsFiles, paths.typings, paths.typingsFixes])
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .js
        .pipe(sourcemaps.write(".", { sourceRoot: "../src" }))
        .pipe(gulp.dest(paths.build));
});

gulp.task(tasks.copy, () => {
    return gulp.src([paths.src, paths.srcNoTs])
        .pipe(gulp.dest(paths.build));
});

gulp.task(tasks.build, (callback) => {
    runSequence.use(gulp);
    return runSequence(tasks.clear, tasks.transpile, tasks.copy, callback);
});