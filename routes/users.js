var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

/* GET users listing. */
router.get('/', function(req, res) {
  if(req.session.loggedIn === true){
	res.render('user-page',{
		title:req.session.user.name,
		name:req.session.user.name,
		email:req.session.user.email,
		userID: req.session.user._id
	});
  }
  else{
	res.redirect('/user/login');
  }
});

router.get('/new',function(req,res){
	res.render('user-form',{title:'Create user',name:"",email:"",buttonText:"Join!"});
});

router.post('/new',function(req,res){
	User.create({
		name:req.body.FullName,
		email:req.body.Email,
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
			req.session.user = {"name":user.name,"email":user.email,"_id":user._id};
			req.session.loggedIn = true;
			res.redirect('/user');
				
		}
	});
	
});

router.get('/edit',function(req,res){
	if(req.session.loggedIn !== true){
		res.redirect('/user/login');
	}
	else{
		res.render('user-form',{
			title:'Edit profile',
			_id:req.session.user._id,
			name:req.session.user.name,
			email:req.session.user.email,
			buttonText:'Save'
		});
	}
});

router.post('/edit',function(req,res){
	if(req.session.user._id){
		User.findById(req.session.user._id,function(err,user){
			if(err){
				console.log(err);
				res.redirect('/user?error=finding');
			}
			else{
				user.name = req.body.FullName;
				user.email = req.body.Email;
				user.save(function(err){
					if(!err){
						console.log('User updated: ' + req.body.FullName);
						req.session.user.name = req.body.FullName;
						req.session.user.email = req.body.Email;
						res.redirect('/user');
					}
				})
			}
		})
	}
});

router.get('/delete',function(req,res){
	res.render('user-delete-form',{
		title:"Delete account",
		_id:req.session.user._id,
		name:req.session.user.name,
		email:req.session.user.email
	});
});

var clearSession = function(session,callback){
	session.destroy();
	callback();
};

router.post('/delete',function(req,res){
	console.log(req.body._id);
	if(req.body._id){
		User.findByIdAndRemove(req.body._id,function(err,user){
			if(err){
				console.log(err);
				return res.redirect('/user?error=deleting');
			}
			console.log("User deleted: ",user);
			clearSession(req.session,function(){
				res.redirect('/');
			});
		});
	}
	
});

router.get('/login',function(req,res){
	res.render('login-form',{title:'Log in'});
});

router.post('/login',function(req,res){
	if(req.body.Email){
		User.findOne({'email':req.body.Email},'_id name email',function(err,user){
			if(!err){
				if(!user){
					res.redirect('/user/login?404=user');
				}
				else{
					req.session.user = {
						"name": user.name,
						"email":user.email,
						"_id":user._id
					};
					req.session.loggedIn = true;
					console.log('Logged in user: ' + user);
					User.update({_id:user._id},{$set:{lastLogin:Date.now()}},function(){
						res.redirect('/user');
					});
					
				}
			}
			else{
				res.redirect('/user/login?404=error');
			}
		})
	}
	else{
		res.redirect('/user/login?404=error');
	}
});

router.get('/logout',function(){
	
});
module.exports = router;
