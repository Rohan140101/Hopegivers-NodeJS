const express = require('express');
const router = express.Router();

router.get("/forget-pass", function (req, res) {
    res.render("forget-pass.ejs");
});


module.exports = router;