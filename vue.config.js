// 2020/09/28 新增该文件， 解决使用域名访问时报错： Invalid Host header
module.exports = {
    devServer: {
        host: '0.0.0.0',
        hot: true,
        disableHostCheck: true,
    },
}
