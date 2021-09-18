module.exports = {
    // 多语言下拉菜单的标题
    selectText: '选择语言',
    ariaLabel: '选择语言',
    // 该语言在下拉菜单中的标签
    label: '简体中文',
    // 编辑链接文字
    editLinkText: '在 GitHub 上编辑此页',
    lastUpdated: '上次更新',
    // Service Worker 的配置
    serviceWorker: {
        updatePopup: {
            message: '发现新内容可用.',
            buttonText: '刷新'
        }
    },
    // 当前 locale 的 algolia docsearch 选项
    algolia: {},
    nav: [
        { text: '首页', link: '/zh-cn/' },
        { text: '用户指南', link: '/zh-cn/guide/' },
        { text: 'Bottlepy官网', link: 'http://bottlepy.org' }
    ]
    // sidebar: 'auto'
    // sidebar: {
    //     '/zh-cn/': [],
    //     '/zh-cn/nested/': []
    // }
}
