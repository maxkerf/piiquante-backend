/**
 * Show the error in the console between line breaks (easier reading).
 * @param {Object} error The error to show.
 */
exports.showError = error => {
	console.error(); // line break, if added to "console.error(error)" the error is shortened
	console.error(error);
	console.error();
};
