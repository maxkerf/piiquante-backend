const express = require("express");
const router = express.Router();

const authorize = require("../middleware/authorize");
const multer = require("../middleware/multer-config");

const sauceController = require("../controllers/sauce");

router.get("/", authorize, sauceController.getAllSauces);
router.get("/:id", authorize, sauceController.getOneSauce);
router.post("/", authorize, multer, sauceController.createSauce);
router.put("/:id", authorize, multer, sauceController.updateSauce);
router.delete("/:id", authorize, sauceController.deleteSauce);

module.exports = router;
