var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var flash = require("connect-flash");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var mongoose = require("mongoose");
var passport = require("passport");
var seedDB = require("./seeds");
var User = require("./models/user");

// requiring routes
var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost/yelp_camp_v12");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// seedDB();

// PASSPORT CONFIGURATION
app.locals.moment = require("moment");
app.use(require("express-session") ({
    secret: "I like noodles very much!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.errorMessage = req.flash("error");
    res.locals.successMessage = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(3000, function () {
    console.log("The YelpCamp Server has started...");
});