const express = require('express');
const router = express.Router();

router.get("/missions", function (req, res) {
     res.render("missions");
 });


module.exports = router;