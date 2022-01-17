const mongoose = require("mongoose");

const sauceSchema = mongoose.Schema({
	userId: { type: String, required: true, immutable: true },
	name: {
		type: String,
		required: [true, "Le nom est requis."],
		maxLength: [50, "Le nom ne doit pas excéder 50 caractères."],
		match: [/^[a-zA-Z]*$/, "Le nom est invalide."],
	},
	manufacturer: {
		type: String,
		required: true,
		maxLength: 50,
		match: /^[a-zA-Z]*$/,
	},
	description: {
		type: String,
		required: true,
		maxLength: 500,
	},
	mainPepper: {
		type: String,
		required: true,
		maxLength: 50,
		match: /^[a-zA-Z]*$/,
	},
	imageUrl: { type: String, required: true },
	heat: { type: Number, required: true, min: 1, max: 10 },
	likes: { type: Number, required: true },
	dislikes: { type: Number, required: true },
	usersLiked: { type: [String], required: true },
	usersDisliked: { type: [String], required: true },
});

/**
 * Add a like to the sauce and add the user who liked it to the list of the users who liked it.
 * @param {string} userId The id of the user who liked the sauce.
 */
sauceSchema.methods.like = function (userId) {
	this.likes++;
	this.usersLiked.push(userId);
};

/**
 * Add a dislike to the sauce and add the user who disliked it to the list of the users who disliked it.
 * @param {string} userId The id of the user who disliked the sauce.
 */
sauceSchema.methods.dislike = function (userId) {
	this.dislikes++;
	this.usersDisliked.push(userId);
};

/**
 * Remove a like from the sauce and remove the user who unliked it from the list of the users who liked it.
 * @param {string} userId The id of the user who unliked the sauce.
 */
sauceSchema.methods.unlike = function (userId) {
	this.likes--;
	this.usersLiked.splice(this.usersLiked.indexOf(userId), 1);
};

/**
 * Remove a dislike from the sauce and remove the user who undisliked it from the list of the users who disliked it.
 * @param {string} userId The id of the user who undisliked the sauce.
 */
sauceSchema.methods.undislike = function (userId) {
	this.dislikes--;
	this.usersDisliked.splice(this.usersDisliked.indexOf(userId), 1);
};

/**
 * Check if the user has already liked the sauce or not.
 * @param {string} userId
 * @return {boolean} Boolean true if the sauce is already liked by the user, false if not.
 */
sauceSchema.methods.hasLiked = function (userId) {
	return this.usersLiked.find(id => id === userId);
};

/**
 * Check if the user has already disliked the given sauce or not.
 * @param {string} userId
 * @return {boolean} Boolean true if the sauce is already disliked by the user, false if not.
 */
sauceSchema.methods.hasDisliked = function (userId) {
	return this.usersDisliked.find(id => id === userId);
};

module.exports = mongoose.model("Sauce", sauceSchema);
