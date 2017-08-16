#!/bin/sh
pm2 start NODE_ENV=production ./bin/www -i 2
pm2 start pm2-web --config pm2-web-config.json