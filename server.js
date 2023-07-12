const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
const corsOptions = {
  origin: "http://localhost:8081",
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
const secretKey = "your-secret-key";

// Example user object (replace with your own user database or API)
const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "user", password: "user123", role: "user" },
];

// Store refresh tokens (replace with your own storage solution)
const refreshTokens = [];

// Generate JWT token
function generateToken(user, expiresIn) {
  return jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn });
}

// Generate refresh token
function generateRefreshToken() {
  const refreshToken = jwt.sign({}, secretKey, { expiresIn: "7d" });
  refreshTokens.push(refreshToken);
  return refreshToken;
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

// Login endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  console.log("user", user);
  console.log("isMatch", bcrypt.compareSync(user.password, password));

  if (!user || !bcrypt.compareSync(user.password, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = generateToken(user, "15m");
  const refreshToken = generateRefreshToken();
  res.json({ token, refreshToken });
});
// Protected endpoint example
app.get("/api/my-profile", authenticateToken, (req, res) => {
  res.json({
    message: "Protected endpoint accessed successfully",
    user: req.user,
  });
});

// Refresh token endpoint
app.post("/api/refresh-token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const token = generateToken(user, "15m");
    res.json({ token });
  });
});

require("./app/routes/turorial.routes")(app);

require("./app/routes/user.routes")(app); // users route

app.listen(8081, () => {
  console.log("Server is running on http://localhost:8081");
});
