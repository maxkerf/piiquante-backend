const multer = require("multer");

const storage = multer.diskStorage({
	destination: (req, file, callback) => callback(null, "images/tmp"),
	filename: (req, file, callback) => {
		const currentTime = Date.now();
		// generate a random number and transform it into a string to slice it and keep only the decimal part
		const randomNumber = Math.random().toString().slice(2);
		let extension = file.mimetype.split("/")[1];
		if (extension === "jpeg") extension = "jpg";

		callback(null, `sauce_${currentTime}_${randomNumber}.${extension}`);
	},
});

module.exports = multer({ storage }).single("image");
