const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const middleware = require('../middleware');

router.get('/', (req, res) => {
    Campground.find({}, (err, allCampgrounds) => {
        if(err) {
            console.log(err);
        } else {
            res.render('campground/index', {campgrounds: allCampgrounds});
        }
    });
});

router.get('/new', middleware.isLoggedIn, (req, res) => {
    res.render('campground/new');
});

router.post('/', middleware.isLoggedIn, (req, res) => {
    Campground.create(req.body.campground, (err, campground) => {
        if(err) {
            console.log(`Could not add campground: ${campground}`);
        }
        campground.author.id = req.user._id;
        campground.author.username = req.user.username;
        campground.save();
    });

    res.redirect('/campgrounds');
});

router.get('/:id', (req, res) => {
    Campground.findById(req.params.id).populate('comments').exec((err, campground) => {
        if(err) {
            console.log(err);
        } else {
            res.render('campground/show', {campground: campground});
        }
    });
});

router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        res.render('campground/edit', {campground: campground});
    });
});

router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.updateOne({ _id: req.params.id }, req.body.campground, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect('/campgrounds');
        } else {
            res.redirect('/campgrounds/'+ req.params.id);
        }
    });
});

router.delete("/:id", middleware.checkCampgroundOwnership, async(req, res) => {
    try {
        await Campground.deleteOne({ _id: req.params.id }, (err) => {
            if (err) {
                console.log(err);
            }
        });
    } catch (error) {
        console.log(error.message);
    }
    res.redirect("/campgrounds");
});

module.exports = router;