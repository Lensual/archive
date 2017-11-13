var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;
var Busboy = require('busboy');

router.get('/edit(/:id)?', [function (req, res, next) {
    if (!req.params.id) return next();  //goto render
    //find
    db.collection('articles').findOne({ _id: ObjectId(req.params.id) }, function (err, result) {
        if (err) return next(err);
        if (result) {
            res.article = result;
        }
        next()
    });
}, function (req, res, next) {
    //render
    if (res.article) {
        var page_title = res.article.title + " - " + config.site_title;
    } else {
        var page_title = 'new article -' + config.site_title;
    }
    res.render('article-edit', {
        page_title,
        title: res.article.title,
        content: res.article.content,
        sitemeta: req.sitemeta,
        usermeta: req.usermeta
    });
}]);

router.post('/edit(/:id)?', [function (req, res, next) {
    //auth
    if (!req.user) return res.status(401).json({ status: "failed" }).end();
    if (!req.query.upload) return next();   //goto insert
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
        req.body.title = req.body.filename;
        req.body.content = req.body.data;
        next();
    });
    return req.pipe(busboy);

}, function (req, res, next) {
    if (req.params.id) { return next(); }   //goto update
    //insert
    db.collection('articles').insert(
        {
            title: req.body.title,
            content: req.body.content,
            date: Math.round(new Date().getTime() / 1000),  //Unix Timestamp
            modify_date: Math.round(new Date().getTime() / 1000),
            authors: [{ author: req.usermeta.user }],
            tags: [{ tag: "defaultTag" }],
            categories: [{ categroy: "defaultCategroy" }]
        }
        , function (err, result) {
            if (err) return next(err);
            res.json({ status: "success" });
        });
}, function (req, res, next) {
    //update
    db.collection('articles').update({ _id: ObjectId(req.params.id) }, {
        $set: {
            title: req.body.title,
            content: req.body.content,
            modify_date: Math.round(new Date().getTime() / 1000),
        }
    }, function (err, result) {
        if (err) return next(err);
        res.json({ status: "success" });
    })
}]);

router.get('/:id', function (req, res, next) {
    db.collection('articles').findOne({ _id: ObjectId(req.params.id) }, function (err, result) {
        if (err) return next(err);
        //render markdown
        var marked = require('marked');
        var content_marked = marked(result.content);

        res.render('article', {
            page_title: result.title + " - " + config.site_title,
            sitemeta: req.sitemeta,
            usermeta: req.usermeta,
            content: content_marked
        });
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