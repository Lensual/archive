# Archive

以记笔记目的为主的轻量级博客，使用Markdown语法。

正在开发中。。。

[个人站点](https://archive.lensual.space)

# How To Use

## Depend
* NodeJS
* MongoDB

## Step
1. install depends
2. run `git clone https://github.com/Lensual/archive.git`
3. edit `config.json`
4. run `node server.js`

## config.json
* `db_uri` MongoDB地址 "mongodb://[username[:password]@]localhost[:27017]/archive_db"
* `session_maxAge` Cookie超时时间 默认 600000ms (10mins)

## systemd daemon
1. `sudo wget -O /lib/systemd/system/archive.service https://raw.githubusercontent.com/Lensual/archive/master/`
2. replace $NODE_HOME `sed -i "s#\$NODE_HOME#$NODE_HOME#g" /lib/systemd/system/archive.service`
3. `systemctl enable archive.service`
4. `systemctl start archive.service`
