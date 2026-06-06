/**
 * Vite 构建信息注入插件
 *
 * 在构建时自动注入：
 *   __APP_VERSION__  — package.json 中的版本号
 *   __GIT_COMMIT__   — 当前 git commit hash（git rev-parse HEAD）
 *   __BUILD_TIME__   — 构建时间 (ISO 8601)
 */
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getGitCommit() {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function getAppVersion() {
  try {
    const pkg = JSON.parse(
      readFileSync(resolve(__dirname, "../package.json"), "utf8")
    );
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export default function buildInfoPlugin() {
  const commit = getGitCommit();
  const buildTime = new Date().toISOString();
  const version = getAppVersion();

  return {
    name: "build-info",
    config() {
      return {
        define: {
          __APP_VERSION__: JSON.stringify(version),
          __GIT_COMMIT__: JSON.stringify(commit),
          __BUILD_TIME__: JSON.stringify(buildTime),
        },
      };
    },
  };
}
