var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/new',function(req,res){
	res.render('user-form',{title:'Create user',buttonText:"Join!"});
});

router.post('/new',function(req,res){
	User.create({
		name:req.body.FullName,
		email:req.body.Email,
		modifiedOn:Date.now(),
		lastLogin:Date.now()
	},function(err,user){
		if(err){
			console.log(err);
			if(err.code === 11000){
				res.redirect('/user/new?exists=true');
			}
			else {
				res.redirect('/?error=true');
			}
		}
		else{
			// Success
			console.log("User created and saved: " + user);
		}
	});
	
});

router.get('/edit',function(){
	
});

router.post('/edit',function(){
	
});

router.get('/delete',function(){
	
});

router.post('/delete',function(){
	
	
});

router.get('/login',function(){
	
});

router.post('/login',function(){
	
});

router.get('/logout',function(){
	
});
module.exports = router;
