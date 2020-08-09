/*====== Config =========*/
const broker_port = 1883;
const apiRest_port = 5332;
const mongoURL = {
	host: "127.0.0.1",
	port: 27017
};
const dbName = "Esp32Manager";
// Topics
const BASE_TOPIC = "Esp32Manager";
const LOGIN_TOPIC = `${BASE_TOPIC}/login`;
const CONFIG_TOPIC = `${BASE_TOPIC}/config`;
const SENSORS_TOPIC = `${BASE_TOPIC}/sensors`;
const verbose = true;
const predictionSize = 20;
/*====== /Config =========*/

/*======= Broker ==============*/
// Documentation https://github.com/moscajs/aedes/blob/master/docs/Examples.md
const aedes = require("aedes")();
const broker = require("net").createServer(aedes.handle);
broker.listen(broker_port, _ => console.log("Mqtt broker ready !"));
const mqtt = require("mqtt");
const mqtt_client = mqtt.connect(`mqtt://127.0.0.1:${broker_port}`);
mqtt_client.on("connect", _ => console.log("mqtt client connected"));
/*======= /Broker =============*/

/*======== APIRest ===========*/
const express = require("express");
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const crypto = require("crypto");
/*========= ML ===================*/
const { exec } = require('child_process');
/*========= /ML ==================*/
app.use((_, res, next) => { //Pour éviter les problèmes de CORS/REST
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");
	res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE");
	next();
});

app.listen(apiRest_port, _ => console.log(`Server listening on port ${apiRest_port} !`));
/*======== /APIRest ============*/

/*======== Mongo ===============*/
const mongodb = require("mongodb");
const client = new mongodb.MongoClient(`mongodb://${mongoURL.host}:${mongoURL.port}/`, { useNewUrlParser: true });
/*========= /Mongo =============*/

/*==== Setup ========*/
client.connect((err, mongoClient) => {
	if (err) throw err;

	const db = client.db(dbName);

	if (verbose)
		db.listCollections().toArray().then(collInfos => console.log("Collections in the db : ", collInfos));

	/*============================= Broker subscribers ===================*/
	aedes.subscribeAndParse = (topic, callback) => {
		aedes.subscribe(topic, (packet, cb) => {
			const jsn = JSON.parse(packet.payload.toString('utf8'));
			if (verbose)
				console.log(new Date().toISOString(), topic, jsn);
			callback(jsn);
			cb();
		}, _ => verbose && console.log(`AEDES : Subscribed to ${topic}`));
	};

	aedes.subscribeAndParse(LOGIN_TOPIC, async payload => {
		const { mac } = payload;
		db.collection("login")
			.updateOne({ mac }, { $set: { lastLogin: new Date().toISOString() } }, { upsert: true });
		const result = await db.collection("config")
			.find({ mac }, { _id: 0 }).toArray();
		if (result.length) {
			if (verbose)
				console.log("config sent ", result[0]);
			mqtt_client.publish(CONFIG_TOPIC, JSON.stringify(result[0]));
		}
	});

	aedes.subscribeAndParse(SENSORS_TOPIC, payload => db.collection("sensors").insertOne(payload));
	/*============================= /Broker subscribers ===================*/

	/*======================= APIRest routes ==========================*/
	app.get("/getESPSensors", async (_, res) => {
		try {
			const result = await db.collection("sensors")
				.aggregate([
					{ $sort: { _id: -1 } },
					{ $addFields: { ISOdata: { $toDate: "$_id" } } },
					{
						$group: {
							_id: "$mac",
							readings: {
								$push: { time: "$ISOdata", sensors: "$sensors", leds: "$leds" }
							}
						}
					},
					{ $project: { mac: "$_id", _id: 0, readings: { $slice: ["$readings", 20] } } }
				]).toArray();
			res.status(200).json(result);
		} catch (err) {
			console.error("Error getESPSensors ! : ", err);
			res.status(500).json({ err });
		}
	});

	app.get("/getUnconfiguredESPS", async (_, res) => {
		try {
			const result = await db.collection("login")
				.aggregate([{
					$lookup: {
						from: "config",
						localField: "mac",
						foreignField: "mac",
						as: "esps"
					}
				}, { $match: { "esps": { $eq: [] } } }, {
					$project: {
						"esps": 0,
						"_id": 0
					}
				}]).toArray();
			res.status(200).json(result);
		} catch (err) {
			console.error("Error getUnconfiguredESPS ! : ", err);
			res.status(500).json({ err });
		}
	});

	app.get("/getConfigs", async (_, res) => {
		try {
			const result = await db.collection("config").find().toArray();
			res.status(200).json(result);
		} catch (err) {
			console.error("Error getConfigs ! : ", err);
			res.status(500).json({ err });
		}
	});

	app.post("/toggleLed", async (req, res) => {
		const { mac } = req.body;
		try {
			Promise.all(req.body.leds.map(led => new Promise(async (resolve, reject) => {
				try {
					await db.collection("config")
						.updateOne({ mac, "leds.name": led.name }, { $set: { "leds.$.value": led.value } }, { upsert: true });
					mqtt_client.publish(CONFIG_TOPIC, JSON.stringify(req.body));
					resolve();
				} catch (error) {
					reject(error);
				}
			})));
			res.status(200).json({ msg: "ok" });
		} catch (err) {
			console.error("Error toggleLed ! : ", err);
			res.status(500).json({ err });
		}
	});

	app.delete("/deleteConfig", async (req, res) => {
		const { mac } = req.body;
		try {
			await db.collection("config").deleteOne({ mac });
			mqtt_client.publish(CONFIG_TOPIC, JSON.stringify({ mac, clear: true }));
			res.status(200).json({ msg: "ok" });
		} catch (err) {
			console.error("Error deleteConfig !", err);
			res.status(500).json({ err });
		}
	});

	app.post("/saveConfig", async (req, res) => {
		const { mac, update_time, sensors, leds, isMother } = req.body;
		try {
			await db.collection("config")
				.updateOne({ mac }, { $set: { update_time, sensors, leds, isMother } }, { upsert: true });
			mqtt_client.publish(CONFIG_TOPIC, JSON.stringify({ mac, clear: true }));
			const result = await db.collection("config").find({ mac }, { _id: 0 }).toArray();
			if (result.length)
				mqtt_client.publish(CONFIG_TOPIC, JSON.stringify(result[0]));
			res.status(200).json({ msg: "ok" });
		} catch (err) {
			console.error("Error saveConfig !", err);
			res.status(500).json({ err });
		}
	});

	// Only login possible atm
	// user: admin
	// pwd: password
	app.post("/login", async (req, res) => {
		try {
			const pwd = crypto.createHash("sha256").update(req.body.pwd, 'utf8').digest("base64");
			console.log({ user: req.body.user, pwd });
			const result = await db.collection("user_login").find({ user: req.body.user, pwd }, { $exists: true }).toArray();
			console.log(result);
			if (result.length)
				res.status(200).send({ token: result[0]._id, user: req.body.user, pwd, statusCode: 200 });
			else
				res.status(404).send({ statusCode: 404 });
		} catch (err) {
			console.error("Error login !", err);
			res.status(500).json({ err });
		}
	});

	app.get("/getPredictions/:mac", async (req, res) => {
		try {
			const { mac } = req.params;
			const result = await db.collection("sensors")
				.aggregate([
					{ $match: { mac } },
					{ $sort: { _id: -1 } },
					{ $group: { _id: "$mac", values: { $push: { $concatArrays: ["$sensors", "$leds"] } } } },
					{ $project: { mac: "$_id", _id: 0, values: { $slice: ["$values", predictionSize] } } }
				]).toArray();
			let nanValues = false;
			const dataset = result[0].values.map(resl => {
				const obj = {};
				resl.forEach(val => {
					obj[val.name] = val.value;
					nanValues |= isNaN(val.value);
				});
				return obj;
			});
			if (nanValues)
				res.status(200).json({ pred: 1.0 });
			else {
				const pred = await new Promise((resolve, reject) => {
					const df = JSON.stringify(dataset).replace(/"/g, '\\"');
					exec(`python "${__dirname}/../machine learning/pred.py" ${df}`, (err, stdout) => {
						if (err) {
							console.error(err);
							return reject(err);
						}
						resolve(JSON.parse(stdout).pred);
					});
				});
				res.status(200).json({ pred: pred.reduce((n, r) => n + r / predictionSize, 0) });
			}
		} catch (err) {
			console.error(err);
			res.status(500).json({ pred: 1.0, errorMessage: err });
		}
	});

	app.put("/printDebugMessage", async (_, res) => {
		mqtt_client.publish(CONFIG_TOPIC, `{"__debug":true}`);
		res.status(200).end();
	});

	/*======================= /APIRest routes ==========================*/

	/*===== Misc ===== */
	process.on("exit", _ => {
		if (mongoClient && mongoClient.isConnected()) {
			console.log("Closing mongodb connection !");
			mongoClient.close();
		}
	});
	/*===== /Misc ===== */
});
/*==== /Setup ========*/