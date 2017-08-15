#基础image
FROM node
#镜像创建者信息
MAINTAINER Zhangyi <yid@163.com>
#切换目录(CD)
WORKDIR /home/project
#映射到宿主机器的端口
EXPOSE 3000
CMD ["npm","start"]