const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("./models/Product");

router.get("/", (req, res, next) => {
	Product.find()
		.select("name price _id")
		.then((docs) => {
			if (docs) {
				const response = {
					count: docs.length,
					products: docs.map((doc) => {
						return {
							_id: doc._id,
							name: doc.name,
							price: doc.price,
							request: {
								type: "GET",
								url: `http://localhost:3000/products/${doc._id}`
							}
						};
					})
				};
				res.status(200).json(response);
			}
		})
		.catch((err) => console.log(err));
});

router.post("/", (req, res, next) => {
	const createdProduct = new Product({
		_id: mongoose.Types.ObjectId(),
		name: req.body.name,
		price: req.body.price
	});
	createdProduct
		.save()
		.then((result) => {
			res.status(201).json({
				message: "Products are created successfully",
				createdProduct: {
					_id: result._id,
					name: result.name,
					price: result.price,
					request: {
						type: "GET",
						url: `http://localhost:3000/products/${result._id}`
					}
				}
			});
		})
		.catch((error) => res.status(500).json({ error }));
});

router.get("/:productId", (req, res, next) => {
	const id = req.params.productId;
	Product.findById(id)
		.select("name price _id")
		.exec()
		.then((doc) => {
			if (doc) {
				res.status(200).json({
					product: doc,
					request: {
						type: "GET",
						description: "Get All Products",
						url: `http://localhost:3000/products`
					}
				});
			} else {
				res.status(404).json({ message: "No data found for this id" });
			}
		})
		.catch((error) => res.status(500).json({ error }));
});

router.patch("/:productId", (req, res, next) => {
	const id = req.params.productId;
	const updatedOps = {};

	for (const ops of req.body) {
		updatedOps[ops.propName] = ops.value;
	}
	Product.update({ _id: id }, { $set: updatedOps })
		.exec()
		.then(() => {
			res.status(200).json({
				message: "Product Updated Successfully",
				request: {
					type: "GET",
					url: `http://localhost:3000/products/${id}`
				}
			});
		})
		.catch((error) => {
			res.status(500).json(error);
		});
});

router.delete("/:productId", (req, res, next) => {
	const id = req.params.productId;
	Product.remove({ _id: id })
		.exec()
		.then((result) => {
			res.status(200).json({
				message: "Product Deleted",
				request: {
					type: "POST",
					url: "http://localhost:3000/products",
					body: {
						name: "String",
						price: "Number"
					}
				}
			});
		})
		.catch((error) => {
			res.status(500).json(error);
		});
});

module.exports = router;
