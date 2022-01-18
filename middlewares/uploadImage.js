const multer = require("multer");

const AUTHORIZED_EXTENSIONS = ["jpg", "jpeg", "png"];

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

const fileFilter = (req, file, callback) => {
	const extension = file.mimetype.split("/")[1];

	if (!AUTHORIZED_EXTENSIONS.includes(extension))
		return callback(
			Error(
				`Image invalide (extensions autorisées : ${AUTHORIZED_EXTENSIONS.join(
					"/"
				)}).`
			)
		);

	callback(null, true);
};

module.exports = (req, res, next) => {
	const upload = multer({ storage, fileFilter }).single("image");

	upload(req, res, error => {
		if (error) return res.status(400).json({ message: error.message });

		next();
	});
};
