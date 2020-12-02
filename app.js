const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');
const User = require('./models/user');

const indexRoutes = require('./routes/index');
const campgroundRoutes = require('./routes/campgrounds');
const commentRoutes = require('./routes/comments');

//* App setup
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(require('express-session')({
    secret: 'The wild fox hunts gracefully',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

//* Database setup
const dbUrl = 'mongodb://localhost/yelp_camp';
const dbOptions = {
    keepAlive: 1,
    useUnifiedTopology: true,
    useNewUrlParser: true,
};
mongoose.connect(dbUrl, dbOptions).then(() => console.log('Connected to database...'));

//* Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//* Middlewares
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

//* Routes
app.use(indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

app.listen(app.get('port'), process.env.IP, () => console.log(`Server running in port ${app.get('port')}`));
