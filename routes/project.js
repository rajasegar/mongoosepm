// project routes
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Project = mongoose.model('Project');

router.get('/new',function(req,res){
	res.render('project-form',{title:'New Project'})
});

router.post('/new',function(req,res){
	Project.create({
		projectName:req.body.txtProjectName,
		createdBy:req.session.user._id,
		createdOn:Date.now()
	},function(err,project){
		if(err){
			console.log(err);
			if(err.code === 11000){
				res.redirect('/project/new?exists=true');
			}
			else{
				res.redirect('/?error=true');
			}
		}
		else{
			// Success
			console.log("Project created and saved: " + project);
			res.redirect('/user');
		}
	});
});

router.get('/:id',function(req,res){
	console.log("Finding project _id: " + req.params.id);
	if(req.session.loggedIn !== true){
		res.redirect('/user/login');
	}else{
		if(req.params.id){
			Project.findById(req.params.id)
				.populate('createdBy','name email')
				.exec(function(err,project){
				if(err){
					console.log(err);
					res.redirect('/user?404=project');
				}
				else{
					console.log(project);
					res.render('project-page',{
						title:project.projectName,
						projectName:project.projectName,
						tasks:project.tasks,
						createdBy_name:project.createdBy.name,
						createdBy_email:project.createdBy.email,
						projectID:req.params.id
					});
				}
			});
		}
		else{
			res.redirect('/user')
		}
	}
});

router.get('/edit/:id',function(){
	
});

router.post('/edit/:id',function(){
	
});

router.get('/delete/:id',function(){
	
});

router.post('/delete/:id',function(){
	
});

router.get('/byuser/:userid',function(req,res){
	console.log("Getting user projects");
	if(req.params.userid){
		Project.findByUserID(
			req.params.userid,function(err,projects){
				if(!err){
					console.log(projects);
					res.json(projects);
				}
				else{
					console.log(err);
					res.json({"status":"error","error":"Error finding projects"});
				}
			});
			
		
	}
	else{
		console.log("No user id supplied");
		res.json({"status":"error","error":"No user id supplied"});
	}
});

router.get('/new_task/:id',function(req,res){
	res.render('task-form',{
		title:'New Project Task',
		name:"",
		desc:"",
		buttonText:"Create Task"
	});
});

router.post('/new_task/:id',function(req,res){
	console.log("Finding project _id: " + req.params.id);
	if(req.session.loggedIn !== true){
		res.redirect('/user/login');
	}else{
		if(req.params.id){
			Project.findById(req.params.id,function(err,project){
				if(err){
					console.log(err);
					res.redirect('/user?404=project');
				}
				else{
					
					console.log(project);
					project.tasks.push({
						taskName:req.body.txtName,
						taskDesc:req.body.txtDesc,
						createdBy:req.session.user._id
					});
					project.save(function(err,project){
						if(err){
							console.log('Oh dear',err);
						}else {
							console.log('Task saved: ' + req.body.txtName);
							res.redirect('/project/' + req.params.id)
						}
					});
					
				}
			});
		}
		else{
			res.redirect('/user')
		}
	}
});

router.get('/:id/task/edit/:taskID',function(req,res){
	console.log(req.params.id);
	Project.findById( req.params.id, 'tasks modifiedOn',
		function (err, project) {
		if(!err){
			console.log(project.tasks); // array of tasks
			var thisTask = project.tasks.id(req.params.taskID);
			console.log(thisTask); // individual task document
			res.render('task-form',{
				title:'Update Project Task',
				name:thisTask.taskName,
				desc:thisTask.taskDesc,
				buttonText:"Update Task"
			});
	}});
})

module.exports = router;