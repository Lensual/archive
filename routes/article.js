var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;

router.get('/:id', function (req, res, next) {
    db.collection('articles').findOne({ "_id": ObjectId(req.params.id) }, function (err, result) {
        if (err) next(err);
        res.render('article', {
            site_title: result.title + " - " + config.site_title,
            content: result.content
        });
    });
});

module.exports = router;