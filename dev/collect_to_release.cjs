const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const archiver = require("archiver");

// ── 读取构建配置 ──
const pkg = require("../package.json");
const tauriConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src-tauri/tauri.conf.json"), "utf8"));
const cargoToml = fs.readFileSync(path.resolve(__dirname, "../src-tauri/Cargo.toml"), "utf8");

const productName = tauriConf.package.productName;
const pkgVersion = pkg.version;

// 从 Cargo.toml 提取 crate name（即 release 目录下的 exe 名称）
const crateNameMatch = cargoToml.match(/^name\s*=\s*"([^"]+)"/m);
const crateName = crateNameMatch ? crateNameMatch[1] : "crosshair-studio";

// ── 路径常量 ──
const sourceDir = "./src-tauri/target/release";
const targetDir = "./release/portable";
const bundleSourceDir = path.join(sourceDir, "bundle");
const releaseDir = "./release";

// 辅助：匹配文件名（忽略大小写）
const matchFilename = (filename, pattern) => filename.toLowerCase() === pattern.toLowerCase();

// ── 清空 releaseDir ──
if (fs.existsSync(releaseDir)) {
  fse.emptyDirSync(releaseDir);
}

// ── 收集主程序及资源 ──
const itemsToCollect = [`${crateName}.exe`, "readme.md", "readme_cn.md", "LICENSE", "crosshairs", "locales", "icons"];

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

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

// ── 从 bundle 产物中复制安装包 ──
const copyFilesFromDir = (sourceDir, targetDir, extensions) => {
  if (fs.existsSync(sourceDir)) {
    const files = fs.readdirSync(sourceDir);
    files.forEach((file) => {
      const ext = path.extname(file).toLowerCase();
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

copyFilesFromDir(path.join(bundleSourceDir, "msi"), releaseDir, [".msi"]);
copyFilesFromDir(path.join(bundleSourceDir, "nsis"), releaseDir, [".exe"]);

// ── 扫描 release 目录中的安装包文件（精确匹配当前版本） ──
const bundleFiles = fs.readdirSync(releaseDir).filter((file) => {
  const ext = path.extname(file).toLowerCase();
  if (ext !== ".msi" && ext !== ".exe") return false;
  // 排除便携版 exe（在 targetDir 中，不在这里）
  // 只保留文件名中包含版本号的（安装包）
  return file.includes(pkgVersion);
});

const msiFile = bundleFiles.find((f) => f.endsWith(".msi"));
const nsisFile = bundleFiles.find((f) => f.endsWith(".exe"));

console.log(`Detected MSI: ${msiFile || "(none)"}`);
console.log(`Detected NSIS: ${nsisFile || "(none)"}`);

// ── 压缩工具函数 ──
async function zipDir(sourceDir, outPath) {
  const output = fs.createWriteStream(outPath);
  const arch = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(`Compression finished, totally ${arch.pointer()} bytes.`);
  });
  arch.on("error", (err) => { throw err; });
  arch.pipe(output);
  arch.directory(sourceDir, false);
  await arch.finalize();
}

async function zipFile(sourcePath, outPath) {
  const output = fs.createWriteStream(outPath);
  const arch = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(`Compression finished, totally ${arch.pointer()} bytes.`);
  });
  arch.on("error", (err) => { throw err; });
  arch.pipe(output);
  arch.append(fs.createReadStream(sourcePath), { name: path.basename(sourcePath) });
  await arch.finalize();
}

// ── 打包便携版 ──
const portable = path.resolve(targetDir);
zipDir(portable, path.resolve(releaseDir, `${productName}_${pkgVersion}_x64_windows_10_portable.zip`))
  .then(() => fse.removeSync(portable))
  .catch((err) => console.error(err));

// ── 打包 MSI（文件名精确锁定构建产物） ──
if (msiFile) {
  const msi = path.resolve(releaseDir, msiFile);
  zipFile(msi, path.resolve(releaseDir, `${productName}_${pkgVersion}_x64_windows_10_msi.zip`))
    .then(() => fse.removeSync(msi))
    .catch((err) => console.error(err));
} else {
  console.warn("No MSI file found, skipping MSI packaging");
}

// ── 打包 NSIS（文件名精确锁定构建产物） ──
if (nsisFile) {
  const nsis = path.resolve(releaseDir, nsisFile);
  zipFile(nsis, path.resolve(releaseDir, `${productName}_${pkgVersion}_x64_windows_10_nsis.zip`))
    .then(() => fse.removeSync(nsis))
    .catch((err) => console.error(err));
} else {
  console.warn("No NSIS installer found, skipping NSIS packaging");
}
