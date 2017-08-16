#!/bin/sh
pm2 start ./bin/www -i 2
pm2 start pm2-web