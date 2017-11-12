var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    db.collection('articles').find().toArray(function (err, result) {
        if (err) return next(err);
        //add hyperlink url
        result.forEach(function (art) {
            art.url = './article/' + art._id;
        });

        res.render('index', { page_title: config.site_title, user: req.user, arts: result, mailto: config.admin[0].email });
    });
});

module.exports = router;