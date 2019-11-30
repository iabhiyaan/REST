const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	try {
      // grab token from --req.headers not from --req.body
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.jwtSecret);
		// Adding a new field
		req.userDara = decoded;
		next();
	} catch (error) {
		res.status(401).json({
			message: "Auth Failed"
		});
	}
};
