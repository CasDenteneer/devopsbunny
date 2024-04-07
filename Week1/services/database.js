const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URL);
const db = client.db(process.env.DB_NAME);

module.exports = {

    db: db,
    client: client

};