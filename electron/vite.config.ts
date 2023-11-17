import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import vue from '@vitejs/plugin-vue'
//htmlplugin
// import {createHtmlPlugin } from 'vite-plugin-html'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: 'electron/main.ts',
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      // Ployfill the Electron and Node.js built-in modules for Renderer process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer: {},
    }),
    // createHtmlPlugin({
    //   minify: true,
    //   /**
    //    * 在这里写entry后，你将不需要在`index.html`内添加 script 标签，原有标签需要删除
    //    * @default src/main.ts
    //    */
    //   // entry: 'src/main.ts',
    //   /**
    //    * 如果你想将 `index.html`存放在指定文件夹，可以修改它，否则不需要配置
    //    * @default index.html
    //    */
    //   // template: 'public/index.html',

    //   /**
    //    * 需要注入 index.html ejs 模版的数据
    //    */
    //   inject: {
    //     data: {
    //       // title: 'index',
    //       injectScript: `<script src="./src/lib/ammo.js"></script>`,
    //     },
    //     tags: [
    //       {
    //         injectTo: 'body-prepend',
    //         tag: 'div',
    //         attrs: {
    //           id: 'tag',
    //         },
    //       },
    //     ],
    //   },
    // }),
  ],
})
