const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.tutorials = require("./tutorial.model.js")(mongoose);
db.blogs = require("./blog.model.js")(mongoose);

db.users = require("./user.model.js")(mongoose);

module.exports = db;
