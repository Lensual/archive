var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;
var Busboy = require('busboy');
var art = require('../models/article')

router.get('/edit(/:id)?', [function (req, res, next) {
    if (!req.params.id) return next();  //goto render
    //find
    db.collection('articles').findOne({ _id: ObjectId(req.params.id) }, function (err, result) {
        if (err) return next(err);
        if (result) {
            req.meta.art = result;
        }
        next()
    });
}, function (req, res, next) {
    if (!req.meta.art.title) {
        req.meta.page_subTitle = 'new article';
    }
    //render
    res.render('article-edit', { meta: req.meta });
}]);

router.post('/edit(/:id)?', [function (req, res, next) {
    //auth
    if (!req.meta.user_name) return res.status(401).json({ status: "failed" }).end();
    req.meta.art = art();
    if (!req.query.upload) {
        //normal method
        //parse meta.art
        req.meta.art.title = req.body.title;
        req.meta.art.content = req.body.content;
        req.meta.art.date = req.body.date;
        req.meta.art.modify_date = Math.round(new Date().getTime() / 1000)
        req.meta.art.author = req.meta.user_name;
        req.meta.art.tags = req.body.tags.split(',');
        return next();   //goto insert
    }
    //upload method
    //parse file to body
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        var data = '';
        req.body = { filename, mimetype, data }
        file.on('data', function (data) {
            req.body.data += data;
        });
    });
    busboy.on('finish', function () {
        req.meta.art.title = req.body.filename;
        req.meta.art.content = req.body.data;
        next();
    });
    return req.pipe(busboy);

}, function (req, res, next) {
    if (req.params.id) { return next(); }   //goto update
    //insert
    db.collection('articles').insert(
        {
            title: req.meta.art.title,
            content: req.meta.art.content,
            date: req.meta.art.date,  //Unix Timestamp
            modify_date: Math.round(new Date().getTime() / 1000),
            authors: [{ author: req.meta.user_name }],
            tags: req.meta.art.tags
            // categories: [{ categroy: "defaultCategroy" }]
        }
        , function (err, result) {
            if (err) return next(err);
            res.json({ status: "success" });
        });
}, function (req, res, next) {
    //update
    db.collection('articles').update({ _id: ObjectId(req.params.id) }, {
        $set: {
            title: req.meta.art.title,
            content: req.meta.art.content,
            date: req.meta.art.date,
            modify_date: req.meta.art.modify_date,
            authors: req.meta.art.authors,
            tags: req.meta.art.tags
        }
    }, function (err, result) {
        if (err) return next(err);
        res.json({ status: "success" });
    })
}]);

router.get('/:id', function (req, res, next) {
    db.collection('articles').findOne({ _id: ObjectId(req.params.id) }, function (err, result) {
        if (err) return next(err);
        req.meta.art = result;
        //render markdown
        var marked = require('marked');
        req.meta.art.content_marked = marked(result.content);
        res.render('article', { meta: req.meta });
    });
});

router.get('/raw/:id', function (req, res, next) {
    db.collection('articles').findOne({ _id: ObjectId(req.params.id) }, function (err, result) {
        if (err) return next(err);
        res.contentType('text/plain');
        res.send(result.content);
    });
});

module.exports = router;