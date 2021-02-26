var syntax = "scss", // Syntax: sass or scss;
  gulpVersion = "4"; // Gulp version: 3 or 4
gmWatch = false; // ON/OFF GraphicsMagick watching "img/_src" folder (true/false). Linux install gm: sudo apt update; sudo apt install graphicsmagick

var gulp = require("gulp"),
  sass = require("gulp-sass"),
  browserSync = require("browser-sync"),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglify"),
  cleancss = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  autoprefixer = require("gulp-autoprefixer"),
  notify = require("gulp-notify"),
  rsync = require("gulp-rsync"),
  imageResize = require("gulp-image-resize"),
  imagemin = require("gulp-imagemin"),
  del = require("del");

// Local Server
gulp.task("browser-sync", function () {
  browserSync({
    server: {
      baseDir: "app",
    },
    notify: false,
    // open: false,
    // online: false, // Work Offline Without Internet Connection
    // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
  });
});

// Sass|Scss Styles
gulp.task("styles", function () {
  return gulp
    .src("app/" + syntax + "/**/*." + syntax + "")
    .pipe(sass({ outputStyle: "expanded" }).on("error", notify.onError()))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(autoprefixer(["last 15 versions"]))
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.stream());
});

// JS
gulp.task("scripts", function () {
  return (
    gulp
      .src([
        "app/js/common.js", // Always at the end
        "app/js/components/**/*.js",
      ])
      .pipe(concat("scripts.min.js"))
      //.pipe(uglify()) // Mifify js (opt.)
      .pipe(gulp.dest("app/js"))
      .pipe(browserSync.reload({ stream: true }))
  );
});

// Images @x1 & @x2 + Compression | Required graphicsmagick (sudo apt update; sudo apt install graphicsmagick)
gulp.task("img1x", function () {
  return gulp
    .src("app/img/_src/**/*.*")
    .pipe(imageResize({ width: "50%" }))
    .pipe(imagemin())
    .pipe(gulp.dest("app/img/@1x/"));
});
gulp.task("img2x", function () {
  return gulp
    .src("app/img/_src/**/*.*")
    .pipe(imageResize({ width: "100%" }))
    .pipe(imagemin())
    .pipe(gulp.dest("app/img/@2x/"));
});

// Clean @*x IMG's
gulp.task("cleanimg", function () {
  return del(["app/img/@*"], { force: true });
});

// HTML Live Reload
gulp.task("code", function () {
  return gulp.src("app/*.html").pipe(browserSync.reload({ stream: true }));
});

// Deploy
gulp.task("rsync", function () {
  return gulp.src("app/**").pipe(
    rsync({
      root: "app/",
      hostname: "username@yousite.com",
      destination: "yousite/public_html/",
      // include: ['*.htaccess'], // Includes files to deploy
      exclude: ["**/Thumbs.db", "**/*.DS_Store"], // Excludes files from deploy
      recursive: true,
      archive: true,
      silent: false,
      compress: true,
    })
  );
});

gulp.task("build-html", function () {
  return gulp.src("app/*.html").pipe(gulp.dest("dist/"));
});
gulp.task("build-styles", function () {
  return gulp.src("app/css/**/*.css ").pipe(gulp.dest("dist/css/"));
});
gulp.task("build-scripts", function () {
  return gulp.src("app/js/scripts.min.js").pipe(gulp.dest("dist/js"));
});
gulp.task("build-scripts-pages", function () {
  return gulp.src("app/js/pages/**/*.js").pipe(gulp.dest("dist/js/pages"));
});
gulp.task("build-fonts", function () {
  return gulp.src("app/fonts/**/*.*").pipe(gulp.dest("dist/fonts/"));
});
gulp.task("build-img", function () {
  return gulp.src("app/img/**/*.*").pipe(gulp.dest("dist/img/"));
});
gulp.task("build-icons", function () {
  return gulp.src("app/libs/fontaversome/**/*.*").pipe(gulp.dest("dist/libs/fontaversome/"));
});

gulp.task(
  "build",
  gulp.series(
    "styles",
    "scripts",
    "build-html",
    "build-styles",
    "build-scripts",
    "build-scripts-pages",
    "build-fonts",
    "build-img",
    "build-icons"
  )
);

// If Gulp Version 3
if (gulpVersion == 3) {
  // Img Processing Task for Gulp 3
  gulp.task("img", ["img1x", "img2x"]);

  var taskArr = ["styles", "scripts", "browser-sync"];
  gmWatch && taskArr.unshift("img");

  gulp.task("watch", taskArr, function () {
    gulp.watch("app/" + syntax + "/**/*." + syntax + "", ["styles"]);
    gulp.watch(["libs/**/*.js", "app/js/common.js"], ["scripts"]);
    gulp.watch("app/*.html", ["code"]);
    gmWatch && gulp.watch("app/img/_src/**/*", ["img"]);
  });
  gulp.task("default", ["watch"]);
}

// If Gulp Version 4
if (gulpVersion == 4) {
  // Img Processing Task for Gulp 4
  gulp.task("img", gulp.parallel("img1x", "img2x"));

  gulp.task("watch", function () {
    gulp.watch(
      "app/**/*." + syntax + "",
      gulp.parallel("styles")
    );
    gulp.watch(["libs/**/*.js", "app/js/common.js", "app/js/components/**/*.js"], gulp.parallel("scripts"));
    gulp.watch("app/*.html", gulp.parallel("code"));
    gmWatch && gulp.watch("app/img/_src/**/*", gulp.parallel("img")); // GraphicsMagick watching image sources if allowed.
  });
  gmWatch
    ? gulp.task(
      "dev",
      gulp.parallel("img", "styles", "scripts", "browser-sync", "watch")
    )
    : gulp.task(
      "dev",
      gulp.parallel("styles", "scripts", "browser-sync", "watch")
    );
}
