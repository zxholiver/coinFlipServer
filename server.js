/**
 * 翻金币服务端
 * 1、用户登录界面，访问数据库（连接池）
 * 2、记录当前用户关卡
 */
//-------------------------------------
const http = require('http');
const mysql = require('mysql');
const ws = require('nodejs-websocket');
//-------------------------------------
// //http服务-----------------------------
// http.createServer((req,res)=>{
//     var 

// }).listen(8080);
// console.log('http服务创建成功！');
// //-------------------------------------

//账号，密码
var userList={
};

//数据库--------------------------------
console.log('数据库连接中...');
//创建连接池
const pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : '835207',
    database : 'user'
});
pool.getConnection((err,conn)=>{
    if(err){
        console.log(`连接失败，err=${err}`);
    }
    else{
        console.log('和mysql数据库连接成功');
        conn.query('select * from userdata', (err2, res) => {
        if (err2) {
            console.log('查询数据库失败');
        } else {
            //查询到结果
            for(var i in res){
                //记录账号密码
                userList[res[i].id] = {user:res[i].name,pwd:res[i].alexa};
                console.log(userList);
            }
            conn.destroy();
        }
      });
    }
});
//-------------------------------------
//ws服务--------------------------------
console.log('websocket服务创建中...');
var server = ws.createServer((conn)=>{
    //收到消息
    conn.on('text',(str)=>{
        console.log(str);
        var data = JSON.parse(str);//接收数据
        //判登录
        if(data.type == 'login'){
            for(var i in userList){
                //判断账号密码是否正确
                if(data.name == userList[i].user && data.pwd == userList[i].pwd){
                    conn.sendText('登录成功！');
                    console.log(`${data.name}已登录！`);
                }
            }   
        }
        //判注册
        if(data.type == 'register'){

        }
    });
}).listen(9511);
console.log('websocket服务创建成功!');
//广播方法
function boardcast(str){
    server.connections.forEach(function(conn){
        conn.sendText(str);
    })
}
//--------------------------------------