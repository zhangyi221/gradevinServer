{
    module.exports = {
        "apps":
        [{
            "name": "www",
            "script": "./bin/www",
            "watch": true,
            "env": {
                "NODE_ENV": "production"
            },
            "env_production": {
                "NODE_ENV": "production"
            }
        }, {
            "name": "PM2-WEB",
            "script": "pm2-web"
        }]
    }
}