const express = require('express');
const router = express.Router();

router.get("/new-pass", function (req, res) {
    res.render("new-pass");
});


module.exports = router;


