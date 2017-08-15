#基础image
FROM node
#镜像创建者信息
MAINTAINER Zhangyi <yid@163.com>

RUN mkdir -p /home/project

ENV NODE_ENV production
#安装依赖
COPY package.json /home/projec/
RUN npm install

#将当期目录全部保存到工作目录
COPY . /home/project/

#映射到宿主机器的端口
EXPOSE 8000
CMD ["npm","start"]
#CMD ["pm2","start", "./bin/www","--no-daemon"]