#!/bin/sh
NODE_ENV=$1
echo $NODE_ENV
pm2 start ./bin/www --env $NODE_ENV 
#多应用启动（www和pm2-web）
#pm2 start /home/project/ecosystem.config.js --env production