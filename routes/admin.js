var express = require('express');
var router = express.Router();
var uuidv4 = require('uuid/v4');

router.auth = function (req, res, next) {
    //if have sessionId then query uesr from DB
    if (req.cookies.sessionId) {
        req.sessionId = req.cookies.sessionId;
        return db.collection('sessions').findOne({ id: req.sessionId }, function (err, result) {
            if (err) return next(err);
            if (result) {
                req.user = result.user;
                res.cookie("sessionId", req.sessionId, { maxAge: 600000 });   //update sessionId
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
    req.sessionId = uuidv4();
    db.collection('sessions').insert({ id: req.sessionId }, function (err, result) {
        if (err) return next(err);
        res.cookie("sessionId", req.sessionId, { maxAge: config.session_maxAge });   //default for 600000 10 minute
        return next();
    });
}

router.get('/login', function (req, res, next) {
    if (req.user) return res.status(301).location('../').end();   //if already login
    res.render('login', {
        page_title: "login - " + config.site_title,
        sitemeta: req.sitemeta,
        usermeta: req.usermeta
    });
});

router.post('/login', function (req, res, next) {
    if (req.user) return res.status(301).location('../').end();   //if already login
    for (var i in config.admin) {
        if (req.body.user == config.admin[i].name && req.body.password == config.admin[i].pwd) {
            //update session
            return db.collection('sessions').update({ id: req.sessionId }, { $set: { user: config.admin[i].name } }, function (err, result) {
                if (err) return next(err);
                res.json({ status: "success" });
            });
        }
    }
    //failed
    res.json({ status: "failed" });
});

module.exports = router;