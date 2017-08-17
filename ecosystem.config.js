/**
 * 参考http://pm2.keymetrics.io/docs/usage/application-declaration/
 * 可配置PM2多应用启动（一条指令）
 */
{
    module.exports = {
        "apps":
        [{
            "name": "www",
            "script": "./bin/www",
            "env": {
                "NODE_ENV": "production"
            },
            "env_production": {
                "NODE_ENV": "production"
            }
        },
        {
            "name": "pm2-web",
            "script": "pm2-web",
        }]
    }
}