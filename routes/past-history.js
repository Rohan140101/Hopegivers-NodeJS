const express = require('express');
const router = express.Router();

router.get("/past-history", function (req, res) {
    res.render("past-history");
});


module.exports = router;