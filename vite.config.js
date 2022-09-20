import vue from '@vitejs/plugin-vue2'
import Components from 'unplugin-vue-components/vite'

export default {
    plugins: [
        vue(),
        Components({
            dirs:['src'],
            extensions: ['vue'],
            dts: true,
            deep: true
        })
    ]
}