const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const userRoutes = require("./api/routes/users");

mongoose
	.connect(
		`mongodb+srv://iabhiyaan:${process.env
			.db_password}@cluster0-x6ydx.mongodb.net/test?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		}
	)
	.then(() => {
		console.log("Mongo DB Connected 🙂😍");
	})
	.catch((e) => {
		console.log("handle error here: ", e.message);
	});
// mongoose.Promise = global.Promise;

app.use(morgan("dev"));

// makes uploads folder accessible for the route.
app.use("/uploads", express.static("uploads"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handling CORS errors
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	if (req.method === "OPTION") {
		res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
		return res.status(200).json({});
	}
	next();
});

// Routes which should handle request
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/users", userRoutes);

app.use((req, res, next) => {
	const error = new Error("Route Not found");
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500).json({
		error: {
			message: error.message
		}
	});
});

module.exports = app;
