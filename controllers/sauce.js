const fs = require("fs");

const Sauce = require("../models/Sauce");

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
	if (req.file) {
		const sauceObject = {
			...JSON.parse(req.body.sauce),
			imageUrl: `${req.protocol}://${req.get("host")}/images/${
				req.file.filename
			}`,
		};

		// delete the previous image from the storage before sauce update
		Sauce.findOne({ _id: req.params.id })
			.then(sauce => {
				const filename = sauce.imageUrl.split("/images/")[1];

				fs.unlink(`images/${filename}`, () => {
					Sauce.updateOne({ _id: req.params.id }, sauceObject)
						.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
						.catch(error => res.status(400).json({ error }));
				});
			})
			.catch(error => res.status(500).json({ error }));
	} else {
		const sauceObject = { ...req.body };

		Sauce.updateOne({ _id: req.params.id }, sauceObject)
			.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
			.catch(error => res.status(400).json({ error }));
	}
};

exports.deleteSauce = (req, res) => {
	Sauce.findOne({ _id: req.params.id })
		.then(sauce => {
			const filename = sauce.imageUrl.split("/images/")[1];

			fs.unlink(`images/${filename}`, () => {
				Sauce.deleteOne(sauce)
					.then(() => res.status(200).json({ message: "Sauce supprimée !" }))
					.catch(error => res.status(400).json({ error }));
			});
		})
		.catch(error => res.status(500).json({ error }));
};
