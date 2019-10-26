var express    = require("express"),
         app   = express(),
    bodyParser = require("body-parser"),
    mongoose  = require("mongoose"),
    methodOverride=require("method-override"),
    expressSanitizer = require("express-sanitizer");
    
//{ useNewUrlParser: true }
mongoose.connect("mongodb://localhost:27017/blog_app",{ useNewUrlParser: true });

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
//sanitizer must come after the parser
app.use(expressSanitizer());
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
  title : String,
  image : String,
  body : String,
  created : {type : Date , default : Date.now}
});
var Blog = mongoose.model("Blog",blogSchema);



// Blog.create({
//     title : "Test Blog",
//     image : "https://cdn.pixabay.com/photo/2015/03/26/09/54/pug-690566__340.jpg",
//     body : "HELLO THIS IS A BLOG POST"
// });



//RESTFUL ROUTES


//INDEX
app.get("/",function(req, res) {
  res.redirect("/blogs"); 
});
app.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs){
      if (err) {
          console.log("ERROR");
      } else{
            res.render("index",{blogs:blogs}); 
      }
    });
});


//NEW 
app.get("/blogs/new",function(req,res){
    res.render("new");
});

//CREATE
app.post("/blogs",function(req,res){
   req.body.blog.body = req.sanitize(req.body.blog.body);
   //create blog
   Blog.create(req.body.blog,function(err,newBlog){
       if(err){
           console.log("ERROR HAS OCCURED");
           res.render("new");
       }
       else{
           res.redirect("/blogs");
       }
   });
    
});

//SHOW

app.get("/blogs/:id",function(req, res) {
    Blog.findById(req.params.id,function(err,foundBlog){
      if(err){
          res.redirect("/blogs");
      }  else{
        res.render("show",{blog: foundBlog})    
      }
      
    });  
});

//EDIT
app.get("/blogs/:id/edit",function(req, res) {
    Blog.findById(req.params.id,function(err,blog){
        if(err){
            console.log("ERROR");
        }
        else{
            res.render("edit",{blog:blog});
        }
    });
    

});

//UPDATE
app.put("/blogs/:id",function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,blog){
        if(err){
            res.redirect("/blogs")
        }else{
            res.redirect("/blogs/"+req.params.id)
        }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id",function(req,res){
    var id = req.params.id;
    Blog.findByIdAndRemove(id,function(err){
        if(err){
            console.log(err);
            res.redirect("/blogs");
        }else{
            console.log("no error");
            res.redirect("/blogs");
        }    
    });
    
});

app.listen(process.env.PORT,process.env.IP,function(){
   console.log("SERVER IS RUNNING"); 
});

