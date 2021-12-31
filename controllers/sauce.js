const fs = require("fs");

const Sauce = require("../models/Sauce");

const LIKE = 1;
const DISLIKE = -1;
const UNLIKE = 0;
const UNDISLIKE = UNLIKE;

const like = (sauce, userId) => {
	sauce.likes++;
	sauce.usersLiked.push(userId);
};

const dislike = (sauce, userId) => {
	sauce.dislikes++;
	sauce.usersDisliked.push(userId);
};

const unlike = (sauce, userId) => {
	sauce.likes--;
	sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
};

const undislike = (sauce, userId) => {
	sauce.dislikes--;
	sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
};

const hasLiked = (sauce, userId) => {
	return sauce.usersLiked.find(id => id === userId);
};

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
	sauceObject.userId = res.locals.tokenUserId;

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
	res.status(200).json(req.sauce);
};

exports.updateSauce = (req, res) => {
	if (req.file) {
		const sauceObject = {
			...JSON.parse(req.body.sauce),
			imageUrl: `${req.protocol}://${req.get("host")}/images/${
				req.file.filename
			}`,
		};

		// delete the previous image from the storage before sauce update
		const filename = req.sauce.imageUrl.split("/images/")[1];

		fs.unlink(`images/${filename}`, () => {
			Sauce.updateOne(req.sauce, sauceObject)
				.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
				.catch(error => res.status(400).json({ error }));
		});
	} else {
		const sauceObject = { ...req.body };

		Sauce.updateOne(req.sauce, sauceObject)
			.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
			.catch(error => res.status(400).json({ error }));
	}
};

exports.deleteSauce = (req, res) => {
	const filename = req.sauce.imageUrl.split("/images/")[1];

	fs.unlink(`images/${filename}`, () => {
		Sauce.deleteOne(req.sauce)
			.then(() => res.status(200).json({ message: "Sauce supprimée !" }))
			.catch(error => res.status(400).json({ error }));
	});
};

exports.likeSauce = (req, res) => {
	const sauce = req.sauce;
	const likeStatus = req.body.like;
	const userId = res.locals.tokenUserId;

	switch (likeStatus) {
		case LIKE:
			if (hasLiked(sauce, userId))
				return res.status(400).json({ error: "Sauce déjà likée..." });
			else if (hasDisliked(sauce, userId)) undislike(sauce, userId);

			like(sauce, userId);
			break;

		case DISLIKE:
			if (hasDisliked(sauce, userId))
				return res.status(400).json({ error: "Sauce déjà dislikée..." });
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
		.catch(error => res.status(400).json({ error }));
};
