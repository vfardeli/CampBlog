var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var request = require("request");
var geocoder = require("geocoder");
var multer = require("multer");

var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: 'dizw7w3rr',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// INDEX - show all campgrounds
router.get("/", function (req, res) {
    var noMatch;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}, function(err, allCampgrounds){
            if(err){
               console.log(err);
            } else {
                if (allCampgrounds.length === 0) {
                    noMatch = "No campgrounds match that query, please try again.";
                }
                // res.status(200).json(allCampgrounds);
                res.render("campgrounds/index", { campgrounds: allCampgrounds, page: "campgrounds", noMatch: noMatch });
            }
        });
    } else {
        // Get all campgrounds from the DB
        Campground.find({}, function (err, allCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", { campgrounds: allCampgrounds, page: "campgrounds", noMatch: noMatch });
            }
        });
    }
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function (req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
        var campgroundImage = result.secure_url;
        // get the data from the form and add it to the campgrounds array
        var campgroundName = req.body.name;
        var campgroundPrice = req.body.price;
        var campgroundDescription = req.body.description;
        var author = {
            id: req.user._id,
            username: req.user.username
        };
        geocoder.geocode(req.body.location, function (err, data) {
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            var location = data.results[0].formatted_address;
            var newCampground = { name: campgroundName, price: campgroundPrice, 
                image: campgroundImage, description: campgroundDescription, 
                author: author, location: location, lat: lat, lng: lng };
            // Create a new campground and save it to the DB
            Campground.create(newCampground, function (err, newlyCreated) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect('back');
                } else {
                    // redirect back to campground page
                    res.redirect("/campgrounds/" + newlyCreated._id);
                }
            });
        });
        
    });
});

// SHOW - shows more info about one campground
router.get("/:id", function (req, res) {
    // find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            // render show template with that campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/edit", { campground: foundCampground });
        }
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function (req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        geocoder.geocode(req.body.location, function (err, data) {
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            var location = data.results[0].formatted_address;
            req.body.campground.lat = lat;
            req.body.campground.lng = lng;
            req.body.campground.location = location;
            req.body.campground.image = result.secure_url;
            // find and update the correct campground
            Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    // redirect somewhere (the show page)
                    res.redirect("/campgrounds/" + updatedCampground._id);
                }
            });
        });
    });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    // find and delete the correct campground
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            // redirect to the campgrounds page
            req.flash("success", "Successfully delete the campground");
            res.redirect("/campgrounds");
        }
    });
}); 

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;