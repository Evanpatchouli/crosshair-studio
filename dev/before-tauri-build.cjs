const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");

// 定义路径
const rootPath = path.resolve(__dirname, "../");
const srcTauriPath = path.resolve(rootPath, "src-tauri");
const publicPath = path.resolve(rootPath, "public");
const crosshairsPath = path.resolve(publicPath, "crosshairs");
const srcCrosshairsPath = path.resolve(srcTauriPath, "crosshairs");

// 复制文件和文件夹的通用函数
const copyItem = (source, destination) => {
  if (fs.existsSync(source)) {
    fse.copySync(source, destination, { overwrite: true });
    console.log(`Copied ${source} to ${destination}`);
  } else {
    console.error(`Source item ${source} does not exist`);
  }
};

// 复制 crosshairs 文件夹
const copyCrosshairs = () => {
  copyItem(crosshairsPath, srcCrosshairsPath);
};

// 复制 LICENSE 文件
const copyLicense = () => {
  copyItem(path.resolve(rootPath, "LICENSE"), path.resolve(srcTauriPath, "LICENSE"));
};

// 复制 README 文件
const copyReadme = () => {
  copyItem(path.resolve(rootPath, "README.md"), path.resolve(srcTauriPath, "README.md"));
  copyItem(path.resolve(rootPath, "README_CN.md"), path.resolve(srcTauriPath, "README_CN.md"));
};

// 主函数
const main = () => {
  copyCrosshairs();
  copyLicense();
  copyReadme();
  console.log("All files copied successfully.");
  // 执行 npm run tauri build
  // require('child_process').execSync('tauri build', { stdio: 'inherit' });
};

main();