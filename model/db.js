// Bring Mongoose into the project
var mongoose = require('mongoose');
var creationInfo = require('./creationInfo');
var modifiedOn = require('./modifiedOn');
// Build the connection string
var dbURI = "mongodb://localhost/MongoosePM";

// Create the database connection
mongoose.connect(dbURI);

mongoose.connection.on('connected',function(){
	
	console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error',function(err){
	console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected',function(){
	console.log('Mongoose disconnected');
});

process.on('SIGINT',function(){
	mongoose.connection.close(function(){
		console.log('Mongoose disconnected through app termination');
		process.exit(0);
		
	});
});

/****************************************************
	USER SCHEMA
	***********************************************/
var userSchema = new mongoose.Schema({
	name:String,
	email:{type:String,unique:true},
	createdOn:{type:Date,default:Date.now},
	lastLogin:Date
});

userSchema.plugin(modifiedOn);

// Build the User model
mongoose.model('User',userSchema);

var lengthValidator = function(val){
	if(val && val.length >= 5){
		return true;
	}
	return false;
};
var validateLength = [lengthValidator,'Too short'];
/************************************************
	TASK SCHEMA
************************************************/
var taskSchema = new mongoose.Schema({
	taskName:{type:String,required:true,validate:validateLength},
	taskDesc:String,
	createdOn:{type:Date,default:Date.now},
	createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
	assignedTo:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
});

taskSchema.plugin(modifiedOn);
/****************************************************
	PROJECT SCHEMA
****************************************************/
var projectSchema  = new mongoose.Schema({
	projectName:{type:String,unique:true,required:true},
	createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
	contributors:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
	tasks:[taskSchema]
	
});

projectSchema.plugin(creationInfo);
projectSchema.plugin(modifiedOn);

projectSchema.statics.findByUserID = function(userid,callback){
	this.find({createdBy:userid},'_id projectName',{sort:'modifiedOn'},callback);
};


// Build the Project model
mongoose.model('Project',projectSchema);