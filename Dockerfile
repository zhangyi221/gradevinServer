#基础image
FROM node
#镜像创建者信息
MAINTAINER Zhangyi <yid@163.com>
#切换目录(CD)
WORKDIR /home/project
#将当期目录全部保存到工作目录
COPY . /home/project
RUN npm install
#映射到宿主机器的端口
EXPOSE 3000
CMD ["pm2","start", "./bin/www","--no-daemon"]