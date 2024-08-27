const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");

const sourceDir = "./src-tauri/target/release";
const targetDir = "./release/portable";
const bundleSourceDir = path.join(sourceDir, "bundle");
const releaseDir = "./release";

// 要收集的文件和文件夹列表
const itemsToCollect = ["Crosshair Studio.exe", "readme.md", "readme_cn.md", "LICENSE", "crosshairs", "icons"];

// 创建目标目录，如果不存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 复制文件和文件夹
itemsToCollect.forEach((item) => {
  const sourcePath = path.join(sourceDir, item);
  const targetPath = path.join(targetDir, item);

  if (fs.existsSync(sourcePath)) {
    if (fs.lstatSync(sourcePath).isDirectory()) {
      fse.copySync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
    console.log(`Copied ${item} to ${targetPath}`);
  } else {
    console.error(`Source item ${item} does not exist`);
  }
});

// 复制 bundle/msi 和 bundle/nsis 中的 .msi 和 .exe 文件
const copyFilesFromDir = (sourceDir, targetDir, extensions) => {
  if (fs.existsSync(sourceDir)) {
    const files = fs.readdirSync(sourceDir);
    files.forEach((file) => {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied ${file} to ${targetPath}`);
      }
    });
  } else {
    console.error(`Source directory ${sourceDir} does not exist`);
  }
};

const msiDir = path.join(bundleSourceDir, "msi");
const nsisDir = path.join(bundleSourceDir, "nsis");

copyFilesFromDir(msiDir, releaseDir, [".msi"]);
copyFilesFromDir(nsisDir, releaseDir, [".exe"]);
