var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
    req.usermeta = {
        user: req.user,
        sessionId: req.sessionId
    }
    next();
});

module.exports = router