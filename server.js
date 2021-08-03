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

//账号，密码，权限
var userList={
};
var allow = '1';//软删除
var power = '1';//权限
//数据库--------------------------------
console.log('数据库连接中...');
//创建连接池
const pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : '835207',
    database : 'user'
});
pool.getConnection((err,mysqlConn)=>{
    if(err){
        console.log(`数据库连接失败，err=${err}`);
    }
    else{
        console.log('mysql数据库连接成功');
        mysqlConn.query('select * from userdata', (err2, res) => {
        if (err2) {
            console.log('查询数据库失败');
        } else {
            //查询到结果
            for(var i in res){
                //记录账号密码
                //判断是否可用，软删除，allow = 1为可用
                if(res[i].allow == 1)
                    userList[res[i].id] = {user:res[i].name,pwd:res[i].pwd};
            }
            console.log('数据库读取账号密码成功！');
            console.log(userList);
            mysqlConn.destroy();
        }
      });
    }
});
//-------------------------------------
//ws服务--------------------------------
console.log('websocket服务创建中...');
var server = ws.createServer((conn)=>{
    //收到消息
    console.log("用户尝试连接");
    conn.on('text',(str)=>{
        console.log(str);
        //console.log(typeof(str));
        //测试
        // if(str == "你好")
        //     conn.sendText("你好呀");

        var data = JSON.parse(str);//接收数据
        //登录---------------------------------------------------
        //这样登录验证会使每次比对都发送验证是否成功，应该修改
        //应该设置一个参数，作为验证，并且返回给客户端
        if(data.type == 'login'){
            for(var i in userList){
                //判断账号密码是否正确
                if(data.name == userList[i].user && data.pwd == userList[i].pwd){
                    conn.sendText('登录成功！');
                    console.log(`${data.name}已登录！`);
                    return;//登录成功则退出循环
                }else{
                    conn.sendText("账号或密码错误！");
                    continue;//验证失败则继续下次循环，防止输错一次就不验证
                }
            }   
        }
        //登录end-------------------------------------------------------
        //注册-------------------------------------------------
        if(data.type == 'register'){
            //判断是否有账号，有则发送该用户已注册
            var isRegister = 1;
            for(var i in userList){
                if(data.name == userList[i].user){
                    conn.sendText('该用户已注册，请勿重复注册！');
                    console.log(`${data.name}已注册，请勿重复注册！`);
                    isRegister = 0;
                    return;
                }
            }  
            if(isRegister){
                //如果没注册过，则将其写入数据库
                pool.getConnection((err,mysqlConn)=>{
                    if(err){
                        console.log(`数据库连接失败，err=${err}`);
                    }
                    else{
                        console.log('mysql数据库连接成功');
                        var sqlLan = `insert into userdata (name ,pwd,allow,power) values (?,?,?,?)`;
                        var sqltest = `select * from userdata`;
                        var sqlValues = [data.name,data.pwd,allow,power];
                        console.log(sqlValues);
                        //测试用sqltest
                        mysqlConn.query(sqltest,(err,res)=>{
                            if(err){
                                console.log('数据库插入失败');
                                registerOk = 0;
                            }
                            else{
                                console.log(`${data.name}注册成功！`);
                                conn.sendText('注册成功！');
                                mysqlConn.destroy();
                            }
                        });
                    }
                });
            }
        }
        //注册end----------------------------------------------------------
        
        
    });
    conn.on("close",  (code, reason)=>{
        console.log("关闭连接")
    });
    conn.on("error",  (code, reason)=>{
        console.log("异常关闭")
    });
}).listen(9511);
console.log('websocket服务创建成功!');
//广播方法-----------------------------------
function boardcast(str){
    server.connections.forEach(function(conn){
        conn.sendText(str);
    })
}
//广播end--------------------------------------