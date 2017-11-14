var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
    req.meta = {
        site_title: config.site_title,
        site_mailto: config.admin[0].email,
        user_name: undefined,
        user_sessionId: undefined,
        page_subTitle: undefined,  //子标题
        page_title: undefined,   //指定页面标题
        art: undefined //article.js
    }
    next();
});

module.exports = router;