const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("./models/Order");
const Product = require("./models/Product");
const checkAuth = require("../middleware/checkAuth");

router.get("/", checkAuth, (req, res, next) => {
	Order.find()
		.select("quantity product")
		.populate("product", "name")
		// This "product" is from Order model i.e It is the column of Order model
		.then((docs) =>
			res.status(200).json({
				count: docs.length,
				orders: docs.map((doc) => {
					return {
						_id: doc._id,
						quantity: doc.quantity,
						product: doc.product,
						request: {
							type: "GET",
							url: `http://localhost:3000/orders/${doc._id}`
						}
					};
				})
			})
		)
		.catch((error) => res.status(500).json({ error }));
});

router.post("/", checkAuth, (req, res, next) => {
	const { quantity, product } = req.body;
	Product.findById(product)
		.then(({ _id }) => {
			if (!_id) {
				res.status(500).json({
					message: "Product Not Found"
				});
			}
			const createdOrder = new Order({
				_id: mongoose.Types.ObjectId(),
				quantity,
				product: _id
			});
			return createdOrder.save();
		})
		.then((result) => {
			res.status(201).json({
				message: "Order Created Successfully",
				createdOrder: {
					_id: result._id,
					quantity: result.quantity,
					product: result.product
				},
				request: {
					type: "GET",
					url: `http://localhost:3000/orders/${result._id}`
				}
			});
		})
		.catch((error) => {
			res.status(500).json({ error });
		});
});

router.get("/:orderId", checkAuth, (req, res, next) => {
	Order.findById(req.params.orderId)
		.select("quantity product")
		.populate("product")
		.then((order) => {
			if (!order) {
				res.status(201).json({
					message: "Order not found"
				});
			}
			res.status(201).json({
				order,
				request: {
					type: "GET",
					description: "GET all orders",
					url: "http://localhost:3000/orders"
				}
			});
		})
		.catch((error) => res.status(500).json({ error }));
});

router.delete("/:orderId", (req, res, next) => {
	const _id = req.params.orderId;
	Order.remove({ _id }).then(() =>
		res.status(200).json({
			message: "Order deleted successfully",
			request: {
				type: "POST",
				url: "http://localhost:3000/orders",
				body: {
					product: "Valid Product ID",
					quantity: "Number"
				}
			}
		})
	);
});

module.exports = router;
