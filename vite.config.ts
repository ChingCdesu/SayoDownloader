require('dotenv').config({path: join(__dirname, '.env')})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { join } from 'path'
import typescript from '@rollup/plugin-typescript'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { builtins } from './script/utils'
import {
    // ensureCwdCrrect,
    esm2cjs,
} from './script/plugins'

const root = join(__dirname, 'src/render')

// https://vitejs.dev/config/
export default defineConfig(env => {
    const isserve = env.command === 'serve'

    return {
        esbuild: {
            jsxFactory: 'h',
            jsxFragment: 'Fragment'
        },
        plugins: [
            vue(),
            vueJsx(),
            ...(isserve ? [
                /**
                 * !!! 开发期将 electron 及相关模块转换成 commonjs 避开 vite 处理
                 */
                esm2cjs([
                    'electron',
                    'electron-store'
                ]),
            ] : []),
        ],
        root,
        base: './', // index.html 中静态资源加载位置
        server: {
            port: +process.env.PORT,
        },
        resolve: {
            alias: {
                '@': join(__dirname, 'src/render'),
                '@main': join(__dirname, 'src/main'),
                '@src': join(__dirname, 'src'),
                '@root': __dirname,
            },
        },
        optimizeDeps: {
            exclude: [
                'electron',
                // 'electron-store', // optional
            ],
        },
        build: {
            outDir: join(__dirname, 'dist/render'),
            emptyOutDir: true,
            minify: !isserve,
            cssCodeSplit: false,
            commonjsOptions: {},
            assetsDir: '', // 相对路径 加载问题
            sourcemap: isserve,
            rollupOptions: {
                plugins: [
                    // typescript({ module: 'ESNext' }),
                    // ensureCwdCrrect(join(root, 'main.ts')),
                ],
                external: [
                    ...builtins(),
                    'electron',
                ],
                output: {
                    format: 'cjs',
                },
            },
        },
    }
})
