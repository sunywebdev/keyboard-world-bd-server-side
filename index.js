const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

var admin = require("firebase-admin");

var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

//To select ID from MongoDB
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

//MongoDB linking
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@keyboard-world-bd.gf2ar.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

//Verify with user token
async function verifyToken(req, res, next) {
	if (req.headers?.authorization?.startsWith("Bearer ")) {
		const token = req.headers.authorization.split(" ")[1];
		try {
			const decodedUser = await admin.auth().verifyIdToken(token);
			req.decodedEmail = decodedUser?.email;
		} catch {}
	}
	next();
}

async function run() {
	try {
		await client.connect();

		//DB Folder and Subfolder
		const database = client.db("Keyboard-World-BD");
		const productsCollection = database.collection("products");
		const usersCollection = database.collection("users");
		const reviewsCollection = database.collection("reviews");
		const ordersCollection = database.collection("orders");
		const blogCollection = database.collection("blogs");

		/* -------- post new data ------------- */

		//To add new user when login or signup
		app.post("/users", async (req, res) => {
			const newuser = req.body;
			console.log("Request from UI ", newuser);
			const result = await usersCollection.insertOne(newuser);
			console.log("Successfully Added New User ", result);
			res.json(result);
		});
		//To add new user when login or signup
		app.post("/products", async (req, res) => {
			const newProduct = req.body;
			console.log("Request from UI ", newProduct);
			const result = await productsCollection.insertOne(newProduct);
			console.log("Successfully Added New User ", result);
			res.json(result);
		});

		//To post new reviews
		app.post("/reviews", async (req, res) => {
			const newReviews = req.body;
			console.log("Request from UI ", newReviews);
			const result = await reviewsCollection.insertOne(newReviews);
			console.log("Successfully Added New reviews ", result);
			res.json(result);
		});

		//To post new blog
		app.post("/blogs", async (req, res) => {
			const newBlog = req.body;
			console.log("Request from UI ", newBlog);
			const result = await blogCollection.insertOne(newBlog);
			console.log("Successfully Added New Blog ", result);
			res.json(result);
		});

		//To post new order
		app.post("/orders", async (req, res) => {
			const newOrder = req.body;
			console.log("Request from UI ", newOrder);
			const result = await ordersCollection.insertOne(newOrder);
			console.log("Successfully Added New Order ", result);
			res.json(result);
		});

		//To update or replace users data when login or signup
		app.put("/users", async (req, res) => {
			console.log(req.body);
			const user = req.body;
			const filter = { email: user?.email };
			console.log("Request to replace or add user", user);
			const options = { upsert: true };
			const updateuser = {
				$set: {
					email: user?.email,
					userName: user?.userName,
					displayName: user?.displayName,
					photoURL: user?.photoURL,
				},
			};
			const result = await usersCollection.updateOne(
				filter,
				updateuser,
				options,
			);
			res.json(result);
			console.log("Successfully replaced or added user", result);
		});

		//To update or replace users role
		app.put("/users/pageRole", verifyToken, async (req, res) => {
			const user = req.body;
			console.log("Decoded email", req.decodedEmail);
			const requester = req.decodedEmail;
			if (requester) {
				const requesterAccount = await usersCollection.findOne({
					email: requester,
				});
				if (requesterAccount.userRole === "Admin") {
					const filter = { email: user?.email };
					console.log("Request to replace or add Role", user);
					const options = { upsert: true };
					const updateuser = {
						$set: {
							userRole: user?.userRole,
						},
					};
					const result = await usersCollection.updateOne(
						filter,
						updateuser,
						options,
					);
					res.json(result);
					console.log("Successfully replaced or added user", result);
				} else {
					res
						.status(403)
						.json({ message: "You don't have access to make new Admin" });
				}
			}
		});

		//To update or replace users data
		app.put("/users/updateUsers", async (req, res) => {
			console.log(req.body);
			const user = req.body;
			const filter = { email: user?.email };
			console.log("Request to replace or add user", user);
			const options = { upsert: true };
			const updateuser = {
				$set: {
					gender: user?.gender,
					age: user?.age,
					contact: user?.contact,
					address: user?.address,
				},
			};
			const result = await usersCollection.updateOne(
				filter,
				updateuser,
				options,
			);
			res.json(result);
			console.log("Successfully replaced or added user", result);
		});

		// To store/update single product data
		app.put("/products/:id", async (req, res) => {
			const id = req.params.id;
			console.log("Request to update ", id);
			const productId = { _id: ObjectId(id) };
			const updatedReq = req.body;
			console.log("Comming form UI", updatedReq);
			const options = { upsert: true };
			const updateProduct = {
				$set: {
					productId: updatedReq?.productId,
					productPhoto: updatedReq?.productPhoto,
					productName: updatedReq?.productName,
					productPrice: updatedReq?.productPrice,
					productReviewCount: updatedReq?.productReviewCount,
					productReviewStar: updatedReq?.productReviewStar,
					productInfo1: updatedReq?.productInfo1,
					productInfo2: updatedReq?.productInfo2,
					productInfo3: updatedReq?.productInfo3,
					productInfo4: updatedReq?.productInfo4,
					productLongDetails: updatedReq?.productLongDetails,
				},
			};
			const result = await productsCollection.updateOne(
				productId,
				updateProduct,
				options,
			);
			res.json(result);
			console.log("Updated Successfully", result);
		});

		//To update or replace website roles
		app.put("/orders/:id", async (req, res) => {
			const id = req.params.id;
			console.log("Request to update ", id);
			const orderId = { _id: ObjectId(id) };
			const updatedReq = req.body;
			console.log("Comming form UI", updatedReq);
			const options = { upsert: true };
			const updateStatus = {
				$set: {
					status: "Shipped",
				},
			};
			const result = await ordersCollection.updateOne(
				orderId,
				updateStatus,
				options,
			);
			res.json(result);
			console.log("Updated Successfully", result);
		});

		/* -------- show all data ------------- */
		//To load single user data by email for role
		app.get("/users/:email", async (req, res) => {
			const email = req.params.email;
			console.log("from UI", email);
			const filter = { email: email };
			console.log("Request to find ", filter);
			const user = await usersCollection.findOne(filter);
			let isAdmin = false;
			if (user?.userRole === "Admin") {
				isAdmin = true;
			}
			res.json({ admin: isAdmin });
			console.log("Found one", user);
		});

		//To load single user data by email
		app.get("/singleUsers", async (req, res) => {
			const user = req.query;
			const filter = { email: user?.email };
			console.log("from UI", filter);
			console.log("Request to find ", filter);
			const result = await usersCollection.findOne(filter);
			res.send(result);
			console.log("Found one", result);
		});
		//To load single user order by email
		app.get("/myOrders", async (req, res) => {
			const user = req.query;
			const filter = { userName: user?.userName };
			console.log("from UI", filter);
			const result = ordersCollection.find(filter);
			const orders = await result.toArray();
			res.json(orders);
			console.log("Found one", orders);
		});

		//To Show all users from DB
		app.get("/users", async (req, res) => {
			console.log(req.query);
			const get = usersCollection.find({});
			console.log("Request to find users");
			users = await get.toArray();
			res.send(users);
			console.log("Found all users", users);
		});

		//To Show all blogs from DB
		app.get("/blogs", async (req, res) => {
			console.log(req.query);
			const get = blogCollection.find({});
			console.log("Request to find blogs");
			blogs = await get.toArray();
			res.send(blogs);
			console.log("Found all users", blogs);
		});

		//To Show all reviews from DB
		app.get("/reviews", async (req, res) => {
			console.log(req.query);
			const get = reviewsCollection.find({});
			console.log("Request to find reviews");
			reviews = await get.toArray();
			res.send(reviews);
			console.log("Found all users", reviews);
		});

		//To Show all orders from DB
		app.get("/orders", async (req, res) => {
			console.log(req.query);
			const get = ordersCollection.find({});
			console.log("Request to find orders");
			orders = await get.toArray();
			res.send(orders);
			console.log("Found all orders", orders);
		});

		//To Show all products from DB
		app.get("/products", async (req, res) => {
			console.log(req.query);
			const get = productsCollection.find({});
			console.log("Request to find products");
			products = await get.toArray();
			res.send(products);
			console.log("Found all products", products);
		});
		//To Show all reviews from DB
		app.get("/reviews", async (req, res) => {
			console.log(req.query);
			const get = reviewsCollection.find({});
			console.log("Request to find reviews");
			reviews = await get.toArray();
			res.send(reviews);
			console.log("Found all reviews", reviews);
		});
		//To Delete user reviews one by one
		app.delete("/reviews/:id", async (req, res) => {
			const id = req.params.id;
			console.log("Request to delete ", id);
			const deleteId = { _id: ObjectId(id) };
			const result = await reviewsCollection.deleteOne(deleteId);
			res.send(result);
			console.log("review Successfully Deleted", result);
		});
		//To Delete blogs one by one
		app.delete("/blogs/:id", async (req, res) => {
			const id = req.params.id;
			console.log("Request to delete ", id);
			const deleteId = { _id: ObjectId(id) };
			const result = await blogCollection.deleteOne(deleteId);
			res.send(result);
			console.log("blog Successfully Deleted", result);
		});

		//To load single products data by id
		app.get("/products/:id", async (req, res) => {
			const id = req.params.id;
			console.log("Request to find ", id);
			const productId = { _id: ObjectId(id) };
			const result = await productsCollection.findOne(productId);
			res.send(result);
			console.log("Found one", result);
		});
		//To Delete user products one by one
		app.delete("/products/:id", async (req, res) => {
			const id = req.params.id;
			console.log("Request to delete ", id);
			const deleteId = { _id: ObjectId(id) };
			const result = await productsCollection.deleteOne(deleteId);
			res.send(result);
			console.log("Successfully Deleted", result);
		});

		app.delete("/orders/:id", async (req, res) => {
			const id = req.params.id;
			console.log("Request to delete ", id);
			const deleteId = { _id: ObjectId(id) };
			const result = await ordersCollection.deleteOne(deleteId);
			res.send(result);
			console.log("Successfully Deleted", result);
		});
	} finally {
		//await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Keyboard World BD Server is running just fine");
});

app.listen(port, () => {
	console.log("Keyboard World BD Server running on port :", port);
});
