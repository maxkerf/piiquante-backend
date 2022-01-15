const fs = require("fs");
const Sauce = require("../models/Sauce");

const LIKE = 1;
const DISLIKE = -1;
const UNLIKE = 0;
const UNDISLIKE = UNLIKE;
const AUTHORIZED_EXTENSIONS = ["jpg", "jpeg", "png"];

/* INPUT CHECKS */

/**
 * Check if the image file input is valid or not.
 *
 * If it is not valid, send a response with a 400 (bad request) to the client.
 * @param {Object} file The file to check.
 * @param {Object} res The response object of the express app.
 * @returns {boolean} Boolean true if it is valid, false if not.
 */
const checkImage = (file, res) => {
	let isValid = true;
	let message;

	// check if the file exists
	if (!file) {
		isValid = false;
		message = "Image requise.";
	}
	// check if the file type is correct
	else if (
		!AUTHORIZED_EXTENSIONS.find(
			extension => file.mimetype.split("/")[1] === extension
		)
	) {
		isValid = false;
		message = `Image invalide (extensions autorisées : ${AUTHORIZED_EXTENSIONS.join(
			"/"
		)}).`;

		// remove the image already saved by multer from the temporary dir
		fs.unlink(`images/tmp/${file.filename}`, error => {
			if (error) console.error(error);
		});
	}

	if (!isValid) res.status(400).json({ message });

	return isValid;
};

/**
 * Check if the like status input is valid or not.
 *
 * If it is not valid, send a response with a 400 (bad request) to the client.
 * @param {*} data The data to check.
 * @param {Object} res The response object of the express app.
 * @returns {boolean} Boolean true if it is valid, false if not.
 */
const checkLikeStatus = (data, res) => {
	let isValid = true;
	let message;

	// check if the data value is not empty or undefined
	if (data === "" || data === undefined) {
		isValid = false;
		message = "L'état du like est requis.";
	}
	// check if the data type is correct
	else if (typeof data !== "number") {
		isValid = false;
		message = "L'état du like doit être un nombre.";
	}
	// check if the data value is correct
	else if (!(data >= -1 && data <= 1)) {
		isValid = false;
		message = "L'état du like doit être compris entre -1 et 1.";
	}

	if (!isValid) res.status(400).json({ message });

	return isValid;
};

/* REQUESTS */

/**
 * Get all the sauces from the database.
 *
 * If an error occured, send a 500 (internal server error) code to the client.
 *
 * If everything goes well, send a 200 (OK) code to the client with the desired data.
 * @param {*} req
 * @param {*} res
 */
exports.getAllSauces = (req, res) => {
	Sauce.find()
		.then(sauces => res.status(200).json(sauces))
		.catch(error => res.status(500).json(error));
};

/**
 * Create a sauce and store it in the database.
 *
 * If an error is detected (checkings, etc.), send a 400 (bad request) code to the client.
 *
 * If everything goes well, send a 201 (created) code to the client.
 * @param {*} req
 * @param {*} res
 * @returns If an error occured or is detected, stop the process by catching the error or returning the function.
 */
exports.createSauce = async (req, res) => {
	if (!checkImage(req.file, res)) return;

	const sauceObject = req.body.sauce ? JSON.parse(req.body.sauce) : {};
	const filename = req.file.filename;

	// replace or specify the user id of the sauce in creation by/with the user id of the decoded token
	sauceObject.userId = res.locals.userId;
	sauceObject.imageUrl = `${req.protocol}://${req.get(
		"host"
	)}/images/${filename}`;

	try {
		await Sauce.create({
			...sauceObject,
			likes: 0,
			dislikes: 0,
			usersLiked: [],
			usersDisliked: [],
		});

		// move the image from the temporary dir to the images dir
		const oldPath = `images/tmp/${filename}`;
		const newPath = `images/${filename}`;
		fs.rename(oldPath, newPath, error => {
			if (error) console.error(error);
		});

		res.status(201).json({ message: "Sauce enregistrée !" });
	} catch (error) {
		// remove the image already saved by multer from the temporary dir
		fs.unlink(`images/tmp/${filename}`, error => {
			if (error) console.error(error);
		});

		res.status(400).json(error);
	}
};

/**
 * Get one sauce from the database.
 *
 * The process of getting the sauce is already done in the "router.param("id")" function in the sauces routes file (routes/sauce.js).
 *
 * Send a 200 (OK) code to the client with the desired data.
 * @param {*} req
 * @param {*} res
 */
exports.getOneSauce = (req, res) => {
	res.status(200).json(res.locals.sauce);
};

/**
 * Update a sauce stored in the database.
 *
 * If an error is detected (checkings, etc.), send a 400 (bad request) code to the client.
 *
 * If everything goes well, send a 200 (OK) code to the client.
 * @param {*} req
 * @param {*} res
 * @returns If an error occured or is detected, stop the process by catching the error or returning the function.
 */
exports.updateSauce = async (req, res) => {
	// first, good to know that a sauce can be updated following two different ways:
	// - without the image file => JSON received in the request & parsed by express.json() (req.body)
	// - with the image file => multipart/form-data received in the request & parsed by multer (req.file & req.body)

	const sauce = res.locals.sauce;
	// extract the content-type, for "multipart/form-data" the content-type is followed by the boundary part which does not interest us here
	const contentType = req.headers["content-type"].split(";")[0];

	// WITH THE IMAGE FILE
	if (contentType === "multipart/form-data") {
		if (!checkImage(req.file, res)) return;

		const sauceObject = req.body.sauce ? JSON.parse(req.body.sauce) : {};
		const filename = req.file.filename;
		const oldFilename = sauce.imageUrl.split("/images/")[1];

		sauceObject.imageUrl = `${req.protocol}://${req.get(
			"host"
		)}/images/${filename}`;
		// those props can be modified but not by this way, delete them if there are specified in the request
		delete sauceObject.likes;
		delete sauceObject.dislikes;
		delete sauceObject.usersLiked;
		delete sauceObject.usersDisliked;

		Object.assign(sauce, sauceObject);

		try {
			await sauce.save();

			// remove the old image
			fs.unlink(`images/${oldFilename}`, error => {
				if (error) console.error(error);
			});

			// remove the image already saved by multer from the temporary dir
			const oldPath = `images/tmp/${filename}`;
			const newPath = `images/${filename}`;
			fs.rename(oldPath, newPath, error => {
				if (error) console.error(error);
			});

			res.status(200).json({ message: "Sauce modifiée !" });
		} catch (error) {
			// remove the image from the temporary dir
			fs.unlink(`images/tmp/${filename}`, error => {
				if (error) console.error(error);
			});

			res.status(400).json(error);
		}
	}
	// WITHOUT THE IMAGE FILE
	else {
		const sauceObject = { ...req.body };
		// those props can be modified but not by this way, delete them if there are specified in the request
		delete sauceObject.imageUrl;
		delete sauceObject.likes;
		delete sauceObject.dislikes;
		delete sauceObject.usersLiked;
		delete sauceObject.usersDisliked;

		Object.assign(sauce, sauceObject);

		sauce
			.save()
			.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
			.catch(error => res.status(400).json(error));
	}
};

/**
 * Delete a sauce stored in the database.
 *
 * If an error occured, send a 500 (internal server error) code to the client.
 *
 * If everything goes well, send a 200 (OK) code to the client.
 * @param {*} req
 * @param {*} res
 */
exports.deleteSauce = (req, res) => {
	const sauce = res.locals.sauce;
	const filename = sauce.imageUrl.split("/images/")[1];

	// delete the sauce only if the image file is deleted
	fs.unlink(`images/${filename}`, error => {
		if (error) console.error(error);

		Sauce.deleteOne({ _id: sauce._id })
			.then(() => res.status(200).json({ message: "Sauce supprimée !" }))
			.catch(error => res.status(500).json(error));
	});
};

/**
 * Like a sauce stored in the database.
 *
 * If an error is detected (checkings, etc.), send a 400 (bad request) code to the client.
 *
 * If everything goes well, send a 200 (OK) code to the client.
 * @param {*} req
 * @param {*} res
 * @returns If an error occured or is detected, stop the process by catching the error or returning the function.
 */
exports.likeSauce = (req, res) => {
	const userId = res.locals.userId;
	const sauce = res.locals.sauce;
	const likeStatus = req.body.like;
	let message;

	if (!checkLikeStatus(likeStatus, res)) return;

	try {
		switch (likeStatus) {
			case LIKE:
				if (sauce.hasLiked(userId)) throw Error("Sauce déjà likée...");
				else if (sauce.hasDisliked(userId)) sauce.undislike(userId);

				sauce.like(userId);
				message = "Sauce likée !";
				break;

			case DISLIKE:
				if (sauce.hasDisliked(userId)) throw Error("Sauce déjà dislikée...");
				else if (sauce.hasLiked(userId)) sauce.unlike(userId);

				sauce.dislike(userId);
				message = "Sauce dislikée !";
				break;

			case UNLIKE:
			case UNDISLIKE:
				if (sauce.hasLiked(userId)) {
					sauce.unlike(userId);
					message = "Sauce unlikée !";
				} else if (sauce.hasDisliked(userId)) {
					sauce.undislike(userId);
					message = "Sauce undislikée !";
				} else {
					throw Error("Sauce pas likée ni dislikée...");
				}
				break;

			default:
		}
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}

	sauce
		.save()
		.then(() => res.status(200).json({ message }))
		.catch(error => res.status(400).json(error));
};
