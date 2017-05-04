var express = require('express'); //requiring express library
var app = express();
var redis = require('ioredis');
var mongoose = require('mongoose');
var mongoose_redis = require('mongoose-with-redis');

//schema
var db=require('./schema/employeeSchema.js');
var bodyparser=require('body-parser');


var config = require('config.json')('./config/development.json');
 


var redis_client = redis.createClient({host:config.redis.host,port:config.redis.port});
 
     redis_client.on('connect', function() {
          console.log('Connected to redis cache');
     });
     redis_client.on('error', function() {
          console.log('Some error in connecting the redis cache');
     });

	 

/** MongoDB Connection
 * Basic MongoDB Coonection
 *
 */
mongoose.connect('mongodb://'+config.mongodb.host+':'+config.mongodb.post+'/EmployeeDB',function(err){
	if(err){
		console.log("DB Error"+err);
	}else{
    	console.log("MongoDB connected");
	}
});	 
	 
	 
	 
/** The follwing is default config if you pass no cacheOptions.

*/
var cacheOptions = {
  cache: true,
  expires: 60,
  prefix: 'RedisCache'
};
mongoose_redis(mongoose, redis_client, cacheOptions);




/*getEmployeeById function to get apprisal list */

var getEmployeeById=function(fname,callback){
	db.find({fname:fname}).lean().exec(function(err,data){
		if(err){
			  var errjson={
				"error":"Check your connection"
			       }
			   console.log("err"+err);
			   callback(errjson);
		}else {
			if(data==""){
				var datajson1={
					"success":"noting was found"
				}
				callback(datajson1);
			}else{
				console.log("data"+JSON.stringify(data))
			callback(data);
			}
			
		}
	});
};




/**
*get employee Based on Id

*/
app.get('/employee/getDataBasedId/:fname',function(req,res){
	
	// var apprisalId={
	//		"_id":req.query.id
	//} 
	console.log("fname"+req.param("fname"));
	 if (!req.param("fname")) res.status(400).send("Please send a proper title");
        else {
            getEmployeeById(req.param("fname"), function (data) {
                res.status(200).send(data);
            });
        }
})





/**use port 3000 unless there exists a preconfigured port

*/
var port = process.env.port || 3000;

app.listen(port, function () {
        console.log('Listening on port '+port);
 });



