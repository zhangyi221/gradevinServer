# gradevinServer
部署说明

# nodejs安装
wget https://nodejs.org/dist/v8.3.0/node-v8.3.0-linux-x64.tar.xz
xz -d node-v8.3.0-linux-x64.tar.xz
sudo tar xf node-v8.3.0-linux-x64.tar -C /usr/local/
sudo mv node-v8.3.0-linux-x64/ nodejs
export PATH=/usr/local/nodejs/bin:$PATH
node -v

# express安装
sudo npm install express -gd -save
sudo npm install express-generator -gd -save
express --version

# 获取代码
git clone https://github.com/zhangyi221/gradevinServer.git
更新最新代码
git fetch origin master //查看
git merge origin/master  //合并

# 环境用户变量(可选)
修改.bashrc
ls -la
vim .bashrc
export NODE_ENV=production  //设置
echo $NODE_ENV  //查看

# 安装依赖插件（项目根目录）
sudo npm install -save

# 安装pm2
sudo npm install -g pm2
pm2 start ./bin/www -i 2

简单指令
列举进程：pm2 list
退出程序：pm2 stop <app_name|id|all>
重起应用：pm2 restart
程序信息：pm2 describe id|all
监控：pm2 monit
实时集中log处理: pm2 logs
API:pm2 web (端口：9615 )

# pm2图形化插件
sudo npm install -g pm2-web
如果权限错，执行npm config set unsafe-perm true
pm2 start pm2-web
/home/ubuntu/.config/pm2-web/config.json  用户目录下可设置配置
{
    "www": {
        "host": "localhost",
        "address": "0.0.0.0",
        "port": 9000
    }                         
}
# 开机自动启动
pm2 save
pm2 startup ubuntu
返回指令黏贴到控制台，执行

# jenkins继续集成工具安装
sudo apt-get update
sudo apt-get install docker-ce
sudo service docker start
sudo docker run hello-world
下载jenkins镜像
sudo docker pull jenkins:latest
mkdir -p /var/jenkins_node
mkdir -p /var/jenkins_home
sudo chown -R 1000 jenkins_node
sudo chown -R 1000 jenkins_home
sudo docker run -d --name jenkins_node -p 8080:8080 -p 50000:50000 -v /var/jenkins_node:/var/jenkins_home --restart=always  jenkins:latest

#将项目安装在PM2中，并使用enkins的可持续集成方法（简单）
jenkins构建环境脚本
pm2 stop www \
cd /var/jenkins_node/workspace/node \
cp -p -rf /var/jenkins_node/workspace/node/* /home/ubuntu/gradevinServer \
cd /home/ubuntu/gradevinServer \
npm install -save \
pm2 start ./bin/www

注：其他jenkins建立用户，安装Publish Over SSH插件，配置与服务器rsa认证，创建项目等其他操作请参考网络上的攻略
推荐看下http://www.jianshu.com/p/052a2401595a

#将项目安装在docker容器中Container，并使用jenkins的可持续集成方法（配置非常繁琐不建议，除非你有一定docker基础）
项目根目录Dockerfile, 下载镜像，使用容器，更新代码，自动部署，需配合jenkins的"构建环境"脚本使用
项目根目录docker_start.sh,启动脚本（可选，如启动有多参数，多变量）
项目根目录ecosystem.config.js，多项目启动（可选，不建议）
jenkins构建环境脚本
sudo docker stop node || true \
    && sudo docker rm node || true \
    && sudo docker build /var/jenkins_node/workspace/node  -t node --rm  \
    && sudo docker run -d --name node -p 8000:8000 -p 9000:9000 -v /home/ubuntu/docker_logs/pm2:/root/.pm2/logs/ -v /home/ubuntu/docker_logs/npm:/root/.npm/_logs/ -v /home/ubuntu/docker_logs:/home/logs --restart=always node
停止node容器
删除node容器
通过Dockerfile构建新的容器
启动，绑定端口，添加共享卷，自动重启


简单docker指令
sudo docker start XXX
sudo docker stop XXX
sudo docker logs XXX
sudo docker exec -i -t XXXXX /bin/bash

清理镜像和容器指令
sudo docker images
sudo docker rmi $(sudo docker images | grep "^<none>" | awk "{print $3}")   删除none的镜像
sudo docker ps -as 查看运行中的docker
sudo docker rm -f 删除