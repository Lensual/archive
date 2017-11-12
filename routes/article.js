var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;
var Busboy = require('busboy');

router.get('/new', function (req, res, next) {
    res.render('article-edit', { page_title: 'new article -' + config.site_title });
});

router.post('/new', function (req, res, next) {
    //auth
    if (!req.user) return res.status(401).json({ status: "failed" }).end();
    //insert
    db.collection('articles').insert(
        {
            title: req.body.title,
            content: req.body.content,
            date: Math.round(new Date().getTime() / 1000),  //Unix Timestamp
            modify_date: Math.round(new Date().getTime() / 1000),
            authors: [{ author: "system" }],
            tags: [{ tag: "defaultTag" }],
            categories: [{ categroy: "defaultCategroy" }]
        }
        , function (err, result) {
            if (err) return next(err);
            res.json({ status: "success" });
        });
});

router.post('/new/upload', function (req, res, next) {
    //auth
    if (!req.user) return res.status(401).json({ status: "failed" }).end();

    //parse
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        var data = '';
        req.body = { filename, mimetype, data }
        file.on('data', function (data) {
            req.body.data += data;
        });
    });
    busboy.on('finish', function () {
        //insert
        db.collection('articles').insert(
            {
                title: req.body.filename,
                content: req.body.data,
                date: Math.round(new Date().getTime() / 1000),  //Unix Timestamp
                modify_date: Math.round(new Date().getTime() / 1000),
                authors: [{ author: "system" }],
                tags: [{ tag: "defaultTag" }],
                categories: [{ categroy: "defaultCategroy" }]
            }
            , function (err, result) {
                if (err) return next(err);
                res.json({ status: "success" });
            });
    });
    req.pipe(busboy);
});

router.get('/:id', function (req, res, next) {
    db.collection('articles').findOne({ "_id": ObjectId(req.params.id) }, function (err, result) {
        if (err) return next(err);
        //render markdown
        var marked = require('marked');
        var content_marked = marked(result.content);

        res.render('article', {
            page_title: result.title + " - " + config.site_title,
            content: content_marked,
        });
    });
});

router.get('/raw/:id', function (req, res, next) {
    db.collection('articles').findOne({ "_id": ObjectId(req.params.id) }, function (err, result) {
        if (err) return next(err);
        res.contentType('text/plain');
        res.send(result.content);
    });
});


module.exports = router;