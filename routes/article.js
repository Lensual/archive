var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;

router.get('/new', function (req, res, next) {
    res.render('article-edit', { page_title: 'new article -' + config.site_title });
});

router.post('/new', function (req, res, next) {
    //auth

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
            res.json(result);
        });
});

router.get('/:id', function (req, res, next) {
    db.collection('articles').findOne({ "_id": ObjectId(req.params.id) }, function (err, result) {
        if (err) return next(err);
        //render markdown
        var marked = require('marked');
        var content_marked = marked(result.content);

        res.render('article', {
            page_title: result.title + " - " + config.site_title,
            content: content_marked
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