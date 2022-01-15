const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authorize");
const multer = require("../middlewares/multer");

const Sauce = require("../models/Sauce");
const sauceCtrl = require("../controllers/sauce");

// the token must be authorized on each sauces route
router.use(auth.token);

router
	.route("/")
	.get(sauceCtrl.getAllSauces)
	.post(multer, sauceCtrl.createSauce);

router
	.route("/:id")
	.get(sauceCtrl.getOneSauce)
	.put(auth.sauce, multer, sauceCtrl.updateSauce)
	.delete(auth.sauce, sauceCtrl.deleteSauce);

router.post("/:id/like", sauceCtrl.likeSauce);

// try to get the sauce on each route that requires it (which has an id, more precisely a sauce id, param) as a middleware before the controller part
router.param("id", async (req, res, next, sauceId) => {
	try {
		const sauce = await Sauce.findById(sauceId);

		if (!sauce) throw { message: "Sauce introuvable..." };

		res.locals.sauce = sauce;

		next();
	} catch (error) {
		res.status(400).json(error);
	}
});

module.exports = router;
