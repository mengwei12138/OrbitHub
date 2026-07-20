import type { Plugin } from 'vite';

/**
 * Vite 插件：将 import.meta.glob 产物中的 object key 从 /src/ 前缀重写为 @/ 别名
 *
 * 背景：
 *   Vite 的 resolve.alias 能处理静态 import 语句中的 @/ 别名，
 *   但 import.meta.glob 返回的 object key 仍然是 /src/ 绝对路径。
 *
 * 原理：
 *   glob 编译后产出形如：
 *     { "/src/pages/home/index.tsx": () => import(...) }
 *   本插件只替换 object key 位置的 "/src/"（后面紧跟 ":），
 *   不影响静态资源路径（如图片 URL 赋值 = "/src/images/xx.png"）。
 */
export default function globAliasPlugin(): Plugin {
  // 精确匹配 glob 编译后的 object key："/src/..." 后面紧跟 ":"
  // 这是 JS 对象属性 key 的语法特征，不会误匹配变量赋值中的静态资源路径
  const GLOB_KEY_RE = /"\/src\/(?<path>[^"]*)":/gu;

  return {
    name: 'vite-plugin-glob-alias',
    enforce: 'post',

    transform(code, id) {
      if (id.includes('node_modules')) return null;
      if (!code.includes('"/src/')) return null;

      const transformed = code.replace(GLOB_KEY_RE, '"@/$<path>":');
      if (transformed === code) return null;

      return { code: transformed, map: null };
    },
  };
}
