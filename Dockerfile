#基础image
FROM node
#镜像创建者信息
MAINTAINER Zhangyi <yid@163.com>
RUN mkdir -p /home/project
WORKDIR /home/project
#RUN rm -rf node_modules
ENV NODE_ENV production
#安装依赖
COPY package.json /home/projec/
#RUN npm install express -gd -save
#RUN npm install express-generator -gd -save
#RUN npm install pm2 -gd -save
#RUN npm config set unsafe-perm true
#RUN npm install pm2-web -gd -save
RUN node -v 
RUN express --version
#将当期目录全部保存到工作目录
COPY . /home/project/
RUN npm install
#自定义pm2-web端口配置文件
RUN cp /home/project/pm2-web-config.json /home/node/.config/pm2-web/config.json
#映射到宿主机器的端口
EXPOSE 8000
EXPOSE 8001
#CMD ["node","./bin/www"]
#CMD ["pm2","start", "./bin/www","--no-daemon"]
RUN ["chmod", "+x", "/home/project/docker_start.sh"]
CMD /bin/bash /home/project/docker_start.sh $NODE_ENV
