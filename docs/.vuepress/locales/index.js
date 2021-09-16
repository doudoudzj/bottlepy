module.exports = {
    // 键名是该语言所属的子路径
    // 作为特例，默认语言可以使用 '/' 作为其路径。
    '/': {
        lang: 'en-US', // 将会被设置为 <html> 的 lang 属性
        title: 'Bottle',
        description: 'Bottle is a fast, simple and lightweight WSGI micro web-framework for Python.'
    },
    '/zh-cn/': {
        lang: 'zh-CN',
        title: 'Bottle',
        description: 'Python Web Framework'
    }
}
