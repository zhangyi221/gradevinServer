{
    module.exports = {
        "apps":
        [{
            "name": "www",
            "script": "./bin/www --no-daemon",
            "env": {
                "NODE_ENV": "production"
            },
            "env_production": {
                "NODE_ENV": "production"
            }
        }]
    }
}