var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;

router.get('/:id', function (req, res, next) {
    db.collection('articles').findOne({ "_id": ObjectId(req.params.id) }, function (err, result) {
        if (err) next(err);
        //render markdown
        var marked = require('marked');
        var content_marked = marked(result.content);
        
        res.render('article', {
            page_title: result.title + " - " + config.site_title,
            content: content_marked
        });
    });
});

module.exports = router;