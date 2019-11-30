const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");

router.post("/signup", (req, res, next) => {
	const { email, password } = req.body;

	User.find({ email }).then((user) => {
		if (user.length >= 1) {
			return res.status(409).json({
				message: "User already exists!"
			});
		} else {
			bcrypt.hash(password, 10, (err, hash) => {
				if (err) {
					return res.status(500).json({
						error: err
					});
				} else {
					const newUser = new User({
						_id: mongoose.Types.ObjectId(),
						email,
						password: hash
					});
					newUser
						.save()
						.then((result) => {
							console.log(result);
							return res.status(201).json({
								message: "User Created Successfully"
							});
						})
						.catch((error) => {
							console.log(error);
							return res.status(500).json({ error });
						});
				}
			});
		}
	});
});

router.post("/login", (req, res, next) => {
	const { email, password } = req.body;
	User.find({ email })
		.exec()
		.then((user) => {

			if (user.length < 1) {
				return res.status(401).json({ message: "Incorrect Email ☹😒" });
			}
			bcrypt.compare(password, user[0].password, (err, result) => {
				// this err is checked if somehow, it could not make comparison.
				if (err) return res.status(401).json({ message: "Email Failed" });
				if (result) {
					const token = jwt.sign({ email: user[0].email, _id: user[0]._id }, process.env.jwtSecret, {
						expiresIn: "1h"
					});
					return res.status(200).json({
						message: "Auth Successful",
                  token
                  // This --token is used to verify the user and is used again at middleware/checkAuth.js
					});
				}
				return res.status(401).json({ message: "Incorrect Password" });
			});
		})
		.catch((error) => {
			console.log(error);
			res.status(500).json({ error });
		});
});

router.delete("/:userId", (req, res, next) => {
	User.remove({ _id: req.params.userId })
		.exec()
		.then((user) =>
			res.status(200).json({
				message: "User deleted"
			})
		)
		.catch((error) => res.status(500).json({ error }));
});
module.exports = router;
