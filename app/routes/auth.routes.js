const dotenv = require("dotenv");
dotenv.config();
const { createHashFromString } = require("./../utils/common-functions");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Secret key for JWT
const secretKey = process.env.JWT_SECRET;

// Store refresh tokens (replace with your own storage solution)
const refreshTokens = [];

module.exports = (app) => {
  const users = [
    {
      username: "admin",
      password: "admin",
    },
  ];
  // Login endpoint
  app.post("/api/login", (req, res) => {
    // #swagger.tags = ['Auth']
    const dbUser = users.find((u) => u.username === req.body.username);
    const hash = createHashFromString(req.body.password);

    if (!dbUser || !bcrypt.compareSync(dbUser.password, hash)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = generateToken(dbUser, "15m");
    const refreshToken = generateRefreshToken();
    res.json({ token, refreshToken });
  });
  // Protected endpoint example
  app.get("/api/my-profile", (req, res) => {
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
};

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
