const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');

router.get('/new', middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
        } else {
            res.render('comment/new', {campground: campground});
        }
    });
});

router.post('/', middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            req.flash('error', 'Campground not found');
            console.log(err);
            res.redirect('/campgrounds');
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if(err) {
                    console.log(`Could not add comment: ${comment}`);
                    res.redirect('/campgrounds/' + campground._id);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    
                    campground.comments.push(comment);
                    campground.save();
                    req.flash('success', 'Comment created successfully');
                    res.redirect('/campgrounds/' + campground._id);
                }
            }); 
        }
    });
});

router.get('/:comment_id/edit', middleware.checkCommentOwnership, middleware.isLoggedIn, (req, res) => {
    Comment.findById(req.params.comment_id, (err, comment) => {
        if(err) {
            res.redirect('back');
        } else {
            res.render('comment/edit', {campground_id: req.params.id, comment: comment});
        }
    });
});

router.put('/:comment_id', middleware.checkCommentOwnership, middleware.isLoggedIn, (req, res) => {
    Comment.updateOne({ _id: req.params.comment_id }, req.body.comment, (err, comment) => {
        if(err) {
            res.redirect('back');
        } else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

router.delete('/:comment_id', middleware.checkCommentOwnership, middleware.isLoggedIn, (req, res) => {
    Comment.deleteOne({ _id: req.params.comment_id }, (err) => {
        if(err) {
            res.redirect('back');
        } else {
            req.flash('success', 'Comment deleted');
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

module.exports = router;