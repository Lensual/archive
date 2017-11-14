var express = require('express');
var router = express.Router();
var uuidv4 = require('uuid/v4');

router.auth = function (req, res, next) {
    //if have sessionId then query uesr from DB
    if (req.cookies.sessionId) {
        req.meta.user_sessionId = req.cookies.sessionId;
        return db.collection('sessions').findOne({ id: req.meta.user_sessionId }, function (err, result) {
            if (err) return next(err);
            if (result) {
                req.meta.user_name = result.user;
                res.cookie("sessionId", req.meta.user_sessionId, { maxAge: 600000 });   //update sessionId
                return next();
            }
            //not found from DB
            newSession(req, res, next);
        });
    }
    //havn't sessionId
    newSession(req, res, next);
}

function newSession(req, res, next) {
    //generate sessionId
    req.meta.user_sessionId = uuidv4();
    db.collection('sessions').insert({ id: req.meta.user_sessionId }, function (err, result) {
        if (err) return next(err);
        res.cookie("sessionId", req.meta.user_sessionId, { maxAge: config.session_maxAge });   //default for 600000 10 minute
        return next();
    });
}

router.get('/', function (req, res, next) {
    if (!req.meta.user_name) return res.status(302).location('/admin/login').end();   //if not login
    res.render('admin', { meta: req.meta })
});

router.get('/login', function (req, res, next) {
    if (req.meta.user_name) return res.status(302).location('..').end();   //if already login
    req.meta.page_subTitle = "login";
    res.render('login', { meta: req.meta });
});

router.post('/login', function (req, res, next) {
    if (req.meta.user_name) return res.status(302).location('..').end();   //if already login
    for (var i in config.admin) {
        if (req.body.user == config.admin[i].name && req.body.password == config.admin[i].pwd) {
            //update session
            return db.collection('sessions').update({ id: req.meta.user_sessionId }, { $set: { user: config.admin[i].name } }, function (err, result) {
                if (err) return next(err);
                res.status(302).location('/').end();
            });
        }
    }
    //failed
    res.json({ status: "failed" });
});

router.get('/logout', function (req, res, next) {
    if (!req.meta.user_name) return res.status(302).location('/').end();   //if not login
    db.collection('sessions').remove({ id: req.meta.user_sessionId }, function (err, result) {
        res.status(302).location('/').end();
    });
});

module.exports = router;