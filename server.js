const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { authenticateToken } = require("./app/middleware/jwt-auth");
const swaggerFile = require("./swagger-output.json");
const { createHashFromString } = require("./app/utils/common-functions");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
dotenv.config();

const app = express();
// Serve static files from the public folder
app.use(express.static("public"));
//app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// Secret key for JWT
const secretKey = process.env.JWT_SECRET;

// Example user object (replace with your own user database or API)
const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "user", password: "user123", role: "user" },
];

// Store refresh tokens (replace with your own storage solution)
const refreshTokens = [];

// Generate JWT token
function generateToken(user, expiresIn) {
  return jwt.sign({ id: user.id, role: user.role }, secretKey, {
    expiresIn: "1d",
  });
}

// Generate refresh token
function generateRefreshToken() {
  const refreshToken = jwt.sign({}, secretKey, { expiresIn: "7d" });
  refreshTokens.push(refreshToken);
  return refreshToken;
}

// Middleware to verify JWT token
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (token == null) {
//     return res.sendStatus(401);
//   }

//   jwt.verify(token, secretKey, (err, user) => {
//     if (err) {
//       return res.sendStatus(403);
//     }
//     req.user = user;
//     next();
//   });
// }

require("./app/routes/auth.routes")(app);
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile)); //swagger doc route
//app.use(authenticateToken);
require("./app/routes/turorial.routes")(app);
require("./app/routes/user.routes")(app); // users route
require("./app/routes/blog.routes")(app);

app.listen(8081, () => {
  console.log("Server is running on http://localhost:8081");
});
