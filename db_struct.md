# MongoDB

## archive_db 数据库

### articles 表

#### 字段

* title
* content
* url
* date  //Unix timestamp
* modify_date   //Unix timestamp
* authors    //Array
* tags  //Array
* categories  //Array

### users 表

#### 字段

* name
* pwd
* email

### sessions 表

#### 字段

* id    //sessionId
* uid   //user's _id (Objectid)