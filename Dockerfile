#基础image
FROM node
#镜像创建者信息
MAINTAINER Zhangyi <yid@163.com>
RUN mkdir -p /home/project
WORKDIR /home/project
ENV NODE_ENV production
#安装依赖
COPY package.json /home/projec/
RUN npm install
####################构建第一次执行,安装依赖########################
#RUN npm install express -gd -save
#RUN npm install express-generator -gd -save
#RUN npm install pm2 -gd -save
#RUN npm config set unsafe-perm true
#RUN npm install pm2-web -gd -save
####################构建第一次执行,安装依赖########################
RUN node -v 
RUN express --version
#将当期目录全部保存到工作目录
COPY . /home/project/
#映射到宿主机器的端口，www(8000),pm2-web(9000)
EXPOSE 8000
EXPOSE 9000
#CMD ["node","./bin/www"]
#CMD ["pm2","start", "./bin/www"]
RUN ["chmod", "+x", "/home/project/docker_start.sh"]
#RUN ["chmod", "+x", "/home/project/ecosystem.config.js"]
#使用脚本启动，可传递环境变量
CMD /bin/bash /home/project/docker_start.sh $NODE_ENV
