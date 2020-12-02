const mongoose = require('mongoose');
const Comment = require('./comment');

var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
});

campgroundSchema.pre('deleteOne', async function() {
    await Comment.deleteMany({
        _id: {
            $in: this.comments
        }
    });
});

module.exports = mongoose.model('Campground', campgroundSchema);