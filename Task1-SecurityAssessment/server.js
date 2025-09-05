const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const users = [];

app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  users.push({ username, email, passwordPlain: password });
  res.send({ message: "User created (insecure)" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username && username.includes("' OR '1'='1")) {
    return res.send({ message: "Bypassed login" });
  }
  const u = users.find(
    (u) => u.username === username && u.passwordPlain === password
  );
  if (!u) return res.status(401).send({ error: "Invalid" });
  res.send({ message: "Logged in" });
});

app.post("/echo", (req, res) => {
  const { text } = req.body;
  res.send(`<p>You said: ${text}</p>`);
});

app.get("/profile", (req, res) => {
  res.send(users);
});

app.listen(3000, () => console.log("Task1 app running http://localhost:3000"));
