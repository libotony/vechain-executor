import vue from '@vitejs/plugin-vue2'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueResolver } from 'unplugin-vue-components/resolvers'

export default {
    plugins: [
        vue(),
        Components({
            dirs: ['src'],
            extensions: ['vue'],
            dts: true,
            deep: true,
            resolvers: [
                BootstrapVueResolver()
            ]
        })
    ]
}