/**
 * 构建时注入的全局常量声明
 *
 * 由 plugins/build-info.js 在 Vite 构建时注入，
 * 运行时通过 Vite define 替换为实际值。
 */
declare const __APP_VERSION__: string;
declare const __GIT_COMMIT__: string;
declare const __BUILD_TIME__: string;
