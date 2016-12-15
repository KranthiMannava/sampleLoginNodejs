/*
 * Manage Session in Node.js and ExpressJS
 * Author : kranthi
 * Version : 0.0.1
*/
var express		=	require('express');
var session		=	require('express-session');
var bodyParser  	= 	require('body-parser');
var pg = require('pg');

var app			=	express();

//PostgreSQL Connection

var conString = "postgres://postgres:postgres@172.16.5.184:5432/test";
var client = new pg.Client(conString);
client.connect();

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));

var sess;
app.use(express.static('public'));
app.get('/',function(req,res){
	sess=req.session;
	if(sess.email!=null)
	{
		res.redirect('/admin');
	}
	else{
	res.render('login.html');
	}
});

app.post('/process_post', function (req, res) {
sess=req.session;
sess.email=req.body.email;	
   // Prepare output in JSON format
   	 var query =client.query({
			name: 'insert ',
			text: "select username, password from users where username=$1 and password=$2",
			values: [req.body.email, req.body.password]
		});
	
	//can stream row results back 1 at a time
	console.log(query);
	query.on('row', function(row) {
		console.log(row);
		res.redirect('/admin');
		//res.sendFile( __dirname + "/" + "sample.html" );
	});
})

app.get('/process_post/getCurrentUser',function(req,res){
	sess=req.session;
	console.log("getuser function()");
	response = {
			  
			  user:sess.email
				
		   };
			console.log(response);
		   
		   res.send(JSON.stringify(response));
	

});


app.get('/admin',function(req,res){
	sess=req.session;
	if(sess.email!=null)	
	{
		res.sendFile( __dirname + "/" + "sample.html" );
	}
	else
	{
		res.redirect('/');
	}

});


app.post('/process_post/add_project',  function (req, res) {
   // Prepare output in JSON format
   if(sess.email!=null)
   {
	var query =client.query({
    name: 'insert beatle',
    text: "INSERT INTO project(\"projectName\", status_id, address,username) values($1, $2, $3,$4)",
    values: [req.body.projectName, req.body.status, req.body.address,sess.email]
	});
	
	//can stream row results back 1 at a time
	query.on('row', function(row) {
		console.log(row);

	});
	response = {
      projectName:req.body.projectName,
      address:req.body.address,
	  status:req.body.status,
	  user:sess.email
		
   };
	console.log(response);
   
   res.send(JSON.stringify(response));
   }
   else
   {
	res.sendFile( __dirname + "/" + "login.html" );
   }

})
app.get('/process_post/logout',function(req,res){
	
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		}
		else
		{
			res.redirect('/');
		}
	});

});
app.listen(3000,function(){
	console.log("App Started on PORT 3000");
});
