var express = require('express');
var router = express.Router();
var participant = require('../models/participants.js');

var verifyIeeeMember = (req,res,next)=>{
    var cookie = req.cookies.IEEE;
    if(cookie === undefined){
        res.send({message : 'access denied!!'})
    }else if(cookie === process.env.COOKIE_VALUE){
        next();
    }
}

/* GET users listing. */
router.get('/wegotyou',(req,res)=>{
    var cookie = req.cookies.IEEE;
    var code = cookie != undefined && cookie === process.env.COOKIE_VALUE ? 0 : 1;
    message = cookie != undefined && cookie === process.env.COOKIE_VALUE? 'You are a verified IEEE member, go ahead !':'You are not verified IEEE member, please authenticate yourself before any action.';
    res.render('users',{
        message : message,
        code : code
    });
});

router.post('/wegotyou', (req, res)=>{
  participant.find({}).select('name email contact timestamp ieeeSection emailSent invalidEmail whoMailed institute').sort({timestamp:-1}).exec((err,users)=>{
    if(err){
        console.log(err);
      res.send({code : 1, users : 'Something is not right :|'})
    }else{
      res.send({code : 0, users : users})
      }
  })
});

router.post('/mailedUpdate/',verifyIeeeMember, (req, res)=>{
    // console.log("hkjnijw");
    participant.update({email : req.body.email},{whoMailed : req.body.whoMailed},(err,data)=> {
        if(err)
            throw err;
        else
        {
            participant.find({}).select('name email contact timestamp ieeeSection emailSent invalidEmail whoMailed institute').sort({timestamp: -1}).exec((err, users) => {
                if(err) {
                    res.send({code: 1, users: 'Something is not right :|'})
                }else{
                    // console.log(users);
                    res.send({code: 0, users: users})
                }
            })
        }
    });
});

router.post('/update',verifyIeeeMember, (req, res)=>{
    participant.update({email : req.body.email},{emailSent : true},(err,data)=> {
        if(err)
            throw err;
        else
        {
            participant.find({}).select('name email contact timestamp ieeeSection emailSent invalidEmail whoMailed institute').sort({timestamp: -1}).exec((err, users) => {
                if(err) {
                    res.send({code: 1, users: 'Something is not right :|'})
                }else{
                    res.send({code: 0, users: users})
                }
            })
        }
    });
});

router.post('/invalidEntry',verifyIeeeMember, (req, res)=> {
    participant.update({email: req.body.email}, {invalidEmail: true}, (err, data) => {
    if(err)
    throw err;
else
{
    participant.find({}).select('name email contact timestamp ieeeSection emailSent invalidEmail whoMailed institute').sort({timestamp: -1}).exec((err, users) => {
        if(err) {
            res.send({code: 1, users: 'Something is not right :|'})
        }else{
            res.send({code: 0, users: users})
                }
            })
        }
    });
});

router.post('/resetStatus',verifyIeeeMember, (req, res)=>{
    participant.update({email : req.body.email},{invalidEmail : false,emailSent : false},(err,data)=> {
    if(err)
        throw err;
    else
    {
    participant.find({}).select('name email contact timestamp ieeeSection emailSent invalidEmail whoMailed institute').sort({timestamp: -1}).exec((err, users) => {
        if(err) {
            res.send({code: 1, users: 'Something is not right :|'})
        }else{
            res.send({code: 0, users: users})
                }
            })
        }
    });
});

router.post('/verifyPassword', (req, res)=>{
    if(req.query.p === process.env.USER_PASSWORD){
        res.cookie(process.env.COOKIE_NAME,
            process.env.COOKIE_VALUE, {
                maxAge: 86400000 // for 1 day
        });
        res.send({code : 0, message : 'Access granted !!'});
    }else{
        res.send({code : 1, message : 'Sorry access denied!!'});
    }
});

module.exports = router;

