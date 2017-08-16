#基础image
FROM node
#镜像创建者信息
MAINTAINER Zhangyi <yid@163.com>
RUN mkdir -p /home/project
#RUN rm -rf node_modules
RUN ls
RUN pwd
ENV NODE_ENV production
#安装依赖
COPY package.json /home/projec/
RUN npm install
RUN npm install pm2 -g
RUN node -v 
RUN express --version
#将当期目录全部保存到工作目录
COPY . /home/project/
#映射到宿主机器的端口
EXPOSE 8000
#CMD ["node","./bin/www"]
CMD ["pm2","start", "./bin/www","-i 2 --no-daemon"]
#CMD ["pm2","start","pm2-web"]