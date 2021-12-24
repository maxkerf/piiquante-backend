const express = require("express");
const router = express.Router();

const authorize = require("../middleware/authorize");
const multerConfig = require("../middleware/multer-config");

const sauceController = require("../controllers/sauce");

router.get("/", authorize.token, sauceController.getAllSauces);
router.get("/:id", authorize.token, sauceController.getOneSauce);
router.post("/", authorize.token, multerConfig, sauceController.createSauce);
router.put(
	"/:id",
	authorize.token,
	authorize.sauce,
	multerConfig,
	sauceController.updateSauce
);
router.delete(
	"/:id",
	authorize.token,
	authorize.sauce,
	sauceController.deleteSauce
);
router.post("/:id/like", authorize.token, sauceController.likeSauce);

module.exports = router;
