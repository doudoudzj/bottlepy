const locales = require('./locales/index')
const localesConfig = require('./locales/localesConfig')

module.exports = {
    title: 'Bottle',
    description: 'Python Web Framework',
    locales: locales,
    head: [
        ['meta', { name: 'renderer', content: 'webkit' }],
        ['meta', { name: 'force-rendering', content: 'webkit' }],
        ['meta', { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge, chrome=1' }],
        ['meta', { name: 'author', content: 'Jackson Dou' }],
        ['meta', { name: 'keywords', content: 'Bottle, Python Web Framework' }],
        // ['meta', { name: 'baidu-site-verification', content: '' }],
        // ['meta', { name: 'google-site-verification', content: '' }],
        ['meta', { name: 'description', content: 'Bottle is a fast, simple and lightweight WSGI micro web-framework for Python.' }],
        ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
        ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
        ['link', { rel: 'icon', href: '/favicon.ico' }]
    ],
    themeConfig: {
        repo: 'doudoudzj/bottlepy',
        docsBranch: 'main',
        docsDir: 'docs/', // 文档源文件存放在仓库中的目录名
        editLinks: true,
        locales: localesConfig
    },
    plugins: [
        ['@vuepress/plugin-back-to-top', true]
        // [
        //     '@vuepress/google-analytics',
        //     {
        //         ga: 'UA-28162642-12'
        //     }
        // ]
    ]
}
