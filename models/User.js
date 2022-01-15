const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
	email: {
		type: String,
		required: true,
		lowercase: true,
		unique: true,
		maxLength: 50,
		// same regex as the one used in type="email" from W3C (found on https://emailregex.com/)
		match:
			/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
	},
	password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
