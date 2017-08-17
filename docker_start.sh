#!/bin/sh
NODE_ENV=$1
echo $NODE_ENV
#pm2 start ./bin/www --env $NODE_ENV 
pm2 start /home/project/ecosystem.config.js --env $NODE_ENV 