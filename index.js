const express = require('express')
const app=express()
const port = 5000;
const mongoose=require('mongoose');
const { auth } = require('./middleware/auth');
const { User }= require("./models/User");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect(config.mongoURI,{
    useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true,useFindAndModify:false
}).then(()=> console.log('MongoDB Connected...'))
.catch(err => console.log(err))


//몽고 디비 연결
app.get('/',(req,res)=> res.send('Hello World!'))

app.post('/api/users/register',(req,res)=>{
    const user= new User(req.body)

    user.save((err,userInfo)=>{
        if(err) return res.json({ success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})
   
app.post('/api/users/login', (req, res) => {

    // console.log('ping')
    //요청된 이메일을 데이터베이스에서 있는지 찾는다.
   
   User.findOne({ email: req.body.email }, function(err, user) {   
    // console.log('user', user)
   
   if (!user) {
   
   return res.json({
   
   loginSuccess: false,
   
   message: "제공된 이메일에 해당하는 유저가 없습니다."
   
   })
   
   }
  
   
    //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
   
   user.comparePassword(req.body.password, function (err, isMatch) {
   
   if (!isMatch)
   
   return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

   
    //비밀번호 까지 맞다면 토큰을 생성하기.
   
   user.generateToken(function(err, user) {
   if (err) return res.status(400).send(err);
    // 토큰을 저장한다. 어디에 ? 쿠키 , 로컳스토리지 
   
   res.cookie("x_auth", user.token)
   .status(200)
   .json({ loginSuccess: true, userId: user._id })
   
   })
   
   })
   
   })
   
   })


app.get('/api/users/auth',auth,(req,res) => {


})

app.listen(port,() => console.log(`Example app listening on port ${port}!`))