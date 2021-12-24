const fs = require("fs");
const { setUncaughtExceptionCaptureCallback } = require("process");

const Sauce = require("../models/Sauce");

const LIKE = 1;
const DISLIKE = -1;
const UNLIKE = 0;
const UNDISLIKE = 0;
const RESET = 2;

exports.getAllSauces = (req, res) => {
	Sauce.find()
		.then(sauces => res.status(200).json(sauces))
		.catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res) => {
	Sauce.findOne({ _id: req.params.id })
		.then(sauce => res.status(200).json(sauce))
		.catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res) => {
	const sauceObject = JSON.parse(req.body.sauce);
	// replace or specify the user id of the sauce in creation by/with the user id of the decoded token
	sauceObject.usersId = res.locals.tokenUserId;

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

exports.updateSauce = (req, res) => {
	const sauceId = req.params.id;

	if (req.file) {
		const sauceObject = {
			...JSON.parse(req.body.sauce),
			imageUrl: `${req.protocol}://${req.get("host")}/images/${
				req.file.filename
			}`,
		};

		// delete the previous image from the storage before sauce update
		Sauce.findOne({ _id: sauceId })
			.then(sauce => {
				const filename = sauce.imageUrl.split("/images/")[1];

				fs.unlink(`images/${filename}`, () => {
					Sauce.updateOne({ _id: sauceId }, sauceObject)
						.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
						.catch(error => res.status(400).json({ error }));
				});
			})
			.catch(error => res.status(500).json({ error }));
	} else {
		const sauceObject = { ...req.body };

		Sauce.updateOne({ _id: sauceId }, sauceObject)
			.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
			.catch(error => res.status(400).json({ error }));
	}
};

exports.deleteSauce = (req, res) => {
	const sauceId = req.params.id;

	Sauce.findOne({ _id: sauceId })
		.then(sauce => {
			const filename = sauce.imageUrl.split("/images/")[1];

			fs.unlink(`images/${filename}`, () => {
				Sauce.deleteOne({ _id: sauceId })
					.then(() => res.status(200).json({ message: "Sauce supprimée !" }))
					.catch(error => res.status(400).json({ error }));
			});
		})
		.catch(error => res.status(500).json({ error }));
};

exports.likeSauce = (req, res) => {
	const sauceId = req.params.id;
	const likeStatus = req.body.like;
	const userId = res.locals.tokenUserId;

	Sauce.findOne({ _id: sauceId })
		.then(sauce => {
			switch (likeStatus) {
				case LIKE:
					if (!sauce.usersLiked.find(id => id === userId)) {
						sauce.likes++;
						sauce.usersLiked.push(userId);

						if (sauce.usersDisliked.find(id => id === userId)) {
							sauce.dislikes--;
							sauce.usersDisliked.splice(
								sauce.usersDisliked.indexOf(userId),
								1
							);
						}
					} else {
						throw "Sauce déjà likée...";
					}
					break;
				case DISLIKE:
					if (!sauce.usersDisliked.find(id => id === userId)) {
						sauce.dislikes++;
						sauce.usersDisliked.push(userId);

						if (sauce.usersLiked.find(id => id === userId)) {
							sauce.likes--;
							sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
						}
					} else {
						throw "Sauce déjà dislikée...";
					}
					break;
				case UNLIKE:
				case UNDISLIKE:
					if (sauce.usersLiked.find(userLiked => userLiked === userId)) {
						sauce.likes--;
						sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
					} else if (
						sauce.usersDisliked.find(userDisliked => userDisliked === userId)
					) {
						sauce.dislikes--;
						sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
					}
					break;
				case RESET:
					sauce.likes = 0;
					sauce.dislikes = 0;
					sauce.usersLiked = [];
					sauce.usersDisliked = [];
				default:
			}

			Sauce.updateOne({ _id: sauceId }, sauce)
				.then(() => res.status(200).json({ message: "Sauce likée !" }))
				.catch(error => res.status(400).json({ error }));
		})
		.catch(error => res.status(500).json({ error }));
};
