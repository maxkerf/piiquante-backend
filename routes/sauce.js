const express = require("express");
const router = express.Router();

const auth = require("../middleware/authorize");
const multer = require("../middleware/multer");

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
router.param("id", (req, res, next, sauceId) => {
	Sauce.findOne({ _id: sauceId })
		.then(sauce => {
			// when the "_id" string is long enough (24 characters here), if no sauce is found, then "findOne()" returns null
			if (sauce === null) throw "Sauce introuvable...";

			res.locals.sauce = sauce;

			next();
		})
		.catch(error => {
			res.status(400).json({ error });
		});
});

module.exports = router;
