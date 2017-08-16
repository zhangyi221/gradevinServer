#!/bin/sh
NODE_ENV=$1
echo $NODE_ENV
pm2 start ./bin/www --env $NODE_ENV  --no-daemon
pm2 start pm2-web  --no-daemon