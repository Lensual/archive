var express = require('express');
var router = express.Router();
var uuidv4 = require('uuid/v4');

router.auth = function (req, res, next) {
    //if have sessionId then query uid from DB
    if (req.cookies.sessionId) {
        req.sessionId = req.cookies.sessionId;
        return db.collection('sessions').findOne({ id: req.sessionId }, function (err, result) {
            if (err) return next(err);
            if (result) {
                req.uid = result.uid;
                res.cookie("sessionId", req.sessionId, { maxAge: 600000 });   //update sessionId
                return next();
            }
            //not found from DB
            genSessionId(req, res, next);
        });
    }
    //havn't sessionId
    genSessionId(req, res, next);
}

function genSessionId(req, res, next) {
    //generate sessionId
    req.sessionId = uuidv4();
    db.collection('sessions').insert({ id: req.sessionId }, function (err, result) {
        if (err) return next(err);
        res.cookie("sessionId", req.sessionId, { maxAge: 600000 });   //10 minute
        return next();
    });
}

router.get('/', function (req, res, next) {
    if (req.uid) return res.status(301).location('../').end();   //if already login
    res.render('login', { page_title: "login - " + config.site_title });
});

router.post('/', function (req, res, next) {
    if (req.uid) return res.status(301).location('../').end();   //if already login
    db.collection('users').findOne({ name: req.body.user, pwd: req.body.password }, function (err, result) {
        if (result) {
            //success
            db.collection('sessions').update({ id: req.sessionId }, { $set: { uid: result._id } }, function (err, result) {
                if (err) return next(err);
                res.json({ status: "success" });
            });
        } else {
            //root user
            for (var i in config.admin) {
                if (req.body.user == config.admin[i].name && req.body.password == config.admin[i].pwd) {
                    return db.collection('sessions').update({ id: req.sessionId }, { $set: { uid: config.admin[i]._id } }, function (err, result) {
                        if (err) return next(err);
                        res.json({ status: "success" });
                    });
                }
            }
            //failed
            res.json({ status: "failed" });
        }
    });
});

module.exports = router;