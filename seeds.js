var mongoose = require("mongoose");
var Comment = require("./models/comment");
var Campground = require("./models/campground");

var data = [
    {
        name: "Cloud's Rest",
        image: "https://farm4.staticflickr.com/3541/3802455097_85490befa2.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
        name: "Dessert Mesa",
        image: "https://farm4.staticflickr.com/3191/3061337059_36c9457ab6.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
        name: "Canyon Floor",
        image: "https://farm1.staticflickr.com/756/21043112059_788cbc12ed.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
];

function seedDB() {
    // Remove all campgrounds
    Campground.remove({}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("removed campgrounds!");
            Comment.remove({}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("removed comments!");
                    // add a few campgrounds
                    data.forEach(function (seed) {
                        Campground.create(seed, function (err, campground) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("added a campground");
                                // create a comment
                                Comment.create({
                                    text: "This place is great, but I wish there was internet",
                                    author: "Homer"
                                }, function (err, comment) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        campground.comments.push(comment._id);
                                        campground.save();
                                        console.log("Created new comment");
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }
    });
};

module.exports = seedDB;