var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
    req.sitemeta = {
        site_title: config.site_title,
        site_mailto: config.admin[0].email
    }
    next();
});

module.exports = router