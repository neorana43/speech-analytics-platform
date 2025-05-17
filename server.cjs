const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@example.com" && password === "admin123") {
    return res.status(200).json({
      token: "mock-jwt-token",
      user: {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
      },
    });
  }

  return res.status(401).json({ error: "Invalid email or password" });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API running at http://localhost:${PORT}`);
});
