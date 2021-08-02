const mysql = require('mysql');
console.log('数据库连接中...');
//创建连接池
const pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : '835207',
    database : 'user'
});
var name = 'wang';
var pwd = '12345';
var allow = '1';
var power = '1';
var sql = 'select * from testuser';
var insert = `insert into userdata (name ,pwd,allow,power) values (?,?,?,?)`;
var insertValues = [name,pwd,allow,power];
//insert into userdata (name,alexa) values("xiao","1111")'
pool.getConnection((err,conn)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log('连接数据库成功');
        conn.query(insert,insertValues,(err,res)=>{
            if(err){
                console.log(`访问数据表失败${err}`);
            }
            else{
                console.log('数据表访问成功');
                console.log(res);
            }
        });
    }
});