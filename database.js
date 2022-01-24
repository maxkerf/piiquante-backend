const mongoose = require("mongoose");

mongoose
	.connect(process.env.MONGO_DB_KEY)
	.then(() => console.log("Connected to MongoDB ✔"))
	.catch(error => {
		console.error("Failed to connect to MongoDB ✖");
		console.error(error);
	});

// handle errors after initial connection was established
mongoose.connection.on("error", console.error);
