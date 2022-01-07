const fs = require("fs");

const Sauce = require("../models/Sauce");

const LIKE = 1;
const DISLIKE = -1;
const UNLIKE = 0;
const UNDISLIKE = UNLIKE;

/**
 * Add a like to a sauce and add the user who liked it to the list of the users who liked it.
 * @param {Sauce} sauce The sauce to like.
 * @param {string} userId The id of the user who liked the sauce.
 */
const like = (sauce, userId) => {
	sauce.likes++;
	sauce.usersLiked.push(userId);
};

/**
 * Add a dislike to a sauce and add the user who disliked it to the list of the users who disliked it.
 * @param {Sauce} sauce The sauce to dislike.
 * @param {string} userId The id of the user who disliked the sauce.
 */
const dislike = (sauce, userId) => {
	sauce.dislikes++;
	sauce.usersDisliked.push(userId);
};

/**
 * Remove a like from a sauce and remove the user who unliked it from the list of the users who liked it.
 * @param {Sauce} sauce The sauce to unlike.
 * @param {string} userId The id of the user who unliked the sauce.
 */
const unlike = (sauce, userId) => {
	sauce.likes--;
	sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
};

/**
 * Remove a dislike from a sauce and remove the user who undisliked it from the list of the users who disliked it.
 * @param {Sauce} sauce The sauce to undislike.
 * @param {string} userId The id of the user who undisliked the sauce.
 */
const undislike = (sauce, userId) => {
	sauce.dislikes--;
	sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
};

/**
 * Check if the user has already liked the given sauce or not.
 * @param {Sauce} sauce
 * @param {string} userId
 * @return {boolean} Boolean true if the sauce is already liked by the user, false if not.
 */
const hasLiked = (sauce, userId) => {
	return sauce.usersLiked.find(id => id === userId);
};

/**
 * Check if the user has already disliked the given sauce or not.
 * @param {Sauce} sauce
 * @param {string} userId
 * @return {boolean} Boolean true if the sauce is already disliked by the user, false if not.
 */
const hasDisliked = (sauce, userId) => {
	return sauce.usersDisliked.find(id => id === userId);
};

exports.getAllSauces = (req, res) => {
	Sauce.find()
		.then(sauces => res.status(200).json(sauces))
		.catch(error => res.status(400).json({ error }));
};

exports.createSauce = (req, res) => {
	const sauceObject = JSON.parse(req.body.sauce);
	// replace or specify the user id of the sauce in creation by/with the user id of the decoded token
	sauceObject.userId = res.locals.userId;

	const sauce = new Sauce({
		...sauceObject,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${
			req.file.filename
		}`,
		likes: 0,
		dislikes: 0,
		usersLiked: [],
		usersDisliked: [],
	});

	sauce
		.save()
		.then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
		.catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res) => {
	res.status(200).json(res.locals.sauce);
};

exports.updateSauce = (req, res) => {
	const sauce = res.locals.sauce;

	if (req.file) {
		const sauceObject = {
			...JSON.parse(req.body.sauce),
			imageUrl: `${req.protocol}://${req.get("host")}/images/${
				req.file.filename
			}`,
		};

		// delete the previous image from the storage before sauce update
		const filename = sauce.imageUrl.split("/images/")[1];

		fs.unlink(`images/${filename}`, () => {
			Sauce.updateOne({ _id: sauce._id }, sauceObject)
				.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
				.catch(error => res.status(500).json({ error }));
		});
	} else {
		const sauceObject = { ...req.body };

		Sauce.updateOne({ _id: sauce._id }, sauceObject)
			.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
			.catch(error => res.status(500).json({ error }));
	}
};

exports.deleteSauce = (req, res) => {
	const sauce = res.locals.sauce;

	const filename = sauce.imageUrl.split("/images/")[1];

	fs.unlink(`images/${filename}`, () => {
		Sauce.deleteOne({ _id: sauce._id })
			.then(() => res.status(200).json({ message: "Sauce supprimée !" }))
			.catch(error => res.status(500).json({ error }));
	});
};

exports.likeSauce = (req, res) => {
	const userId = res.locals.userId;
	const sauce = res.locals.sauce;
	const likeStatus = req.body.like;

	switch (likeStatus) {
		case LIKE:
			if (hasLiked(sauce, userId))
				return res.status(400).json({ message: "Sauce déjà likée..." });
			else if (hasDisliked(sauce, userId)) undislike(sauce, userId);

			like(sauce, userId);
			break;

		case DISLIKE:
			if (hasDisliked(sauce, userId))
				return res.status(400).json({ message: "Sauce déjà dislikée..." });
			else if (hasLiked(sauce, userId)) unlike(sauce, userId);

			dislike(sauce, userId);
			break;

		case UNLIKE:
		case UNDISLIKE:
			if (hasLiked(sauce, userId)) unlike(sauce, userId);
			else if (hasDisliked(sauce, userId)) undislike(sauce, userId);
			break;

		default:
	}

	Sauce.updateOne({ _id: sauce._id }, sauce)
		.then(() => res.status(200).json({ message: "Sauce likée !" }))
		.catch(error => res.status(500).json({ error }));
};
