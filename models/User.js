const mongoose =require('mongoose');
const bycrypt= require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const userSchema = mongoose.Schema({
    name:{
        type: String,
        maxlength:50
    },
    email:{
        type: String,
        trim:true, //space 없애주는 역할
        unique:1 //중복 없게
    },
    password:{
        type:String,
        minlength:5
    },
    lastname:{
        type:String,
        maxlength:50
    },
    role:{
        type: Number,
        default :0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp:{
        type:Number
    }
})
//저장하기 전에 
userSchema.pre('save',function(next){
    var user = this;
    //비밀번호를 암호화 시킨다.
    if(user.isModified('password')){
    bycrypt.genSalt(saltRounds,function(err,salt){
        if(err) return next(err)
        bycrypt.hash(user.password,salt,function(err,hash){
            if(err) return next(err)
            user.password = hash
            next()
        })
    })
    }else{
        next()
        //비밀번호를 바꾸는게 아니라 다른거를 바꿀 때는
    }
})
 
userSchema.methods.comparePassword = function(plainPassword,cb){
    bycrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
            cb(null,isMatch);
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this;
    //jsonwebtoken을 이용해서 토큰 생성하기
    var token = jwt.sign(user._id.toHexString(),'secretToken')
    user.token = token
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

const User = mongoose.model('User',userSchema)
module.exports={ User }