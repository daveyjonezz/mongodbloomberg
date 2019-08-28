var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var path = require('path');
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 8080;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoStreetJournal";

mongoose.connect(MONGODB_URI);

// mongoose.connect("mongodb://localhost/mongoStreetJournal", { useNewUrlParser: true });

// Routes
app.get("/api/scrape", function (req, res) {
  axios.get("https://www.wsj.com/").then(function (response) {
    var $ = cheerio.load(response.data);
    $("article").each(function (i, element) {
      var result = {};

      result.title = $(element).children("div").children("h3").children("a").text();
      result.link = $(element).children("div").children("h3").children("a").attr("href");
      result.body = $(element).children("p").text().substring(0, $(element).children("p").text().lastIndexOf(".") + 1)

      db.Article.create(result).then(function (dbArticle) {
        console.log(dbArticle)
      }).catch(function (err) {
        console.log(err)
      })
    });
  })
  res.send("Scrape Complete")
})

app.get("/api/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({saved: false})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/api/saved-articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({saved: true})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/api/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/api/save/:id", function(req,res){
  db.Article.update({_id: req.params.id}, {$set: {saved: true}}, (err, result) => {
    if (err) {
        console.log("Save Failed!!");
        console.log(err);
    }
    res.json(result)
});
})

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get('/saved',function(req,res) {
  res.sendFile(path.join(__dirname+'/public/saved.html'));;
});

app.get('/',function(req,res) {
  res.sendFile(path.join(__dirname+'/public/index.html'));;
});

// Start the server
app.listen(PORT, function () {
  console.log("==> 🌎  Listening on port " + PORT + ". Visit http://localhost:" + PORT + " in your browser.");
});
