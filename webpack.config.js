const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
	externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
	externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
	mode: "production",
	entry: {
		app: "./server.js",
	},
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
};
