const express = require("express");

const router = express.Router();


const protect =
require("../middleware/auth.middleware");


const authorize =
require("../middleware/role.middleware");



router.get(
"/admin",
protect,
authorize("admin"),
(req,res)=>{

res.json({
    message:"Welcome Admin",
    user:req.user
});

});




router.get(
"/cashier",
protect,
authorize("admin","cashier"),
(req,res)=>{

res.json({
    message:"Welcome Cashier",
    user:req.user
});

});



module.exports = router;