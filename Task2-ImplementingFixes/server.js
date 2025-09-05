import express from "express";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

let users = [];

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!validator.isEmail(email))
    return res.status(400).send({ error: "Invalid email" });
  if (!validator.isStrongPassword(password, { minLength: 8, minNumbers: 1 }))
    return res.status(400).send({ error: "Weak password" });
  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, email, passwordHash: hashed });
  res.send({ message: "User created" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const u = users.find((u) => u.username === username);
  if (!u) return res.status(401).send({ error: "Invalid" });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).send({ error: "Invalid" });
  const token = jwt.sign({ id: username }, "secret", { expiresIn: "1h" });
  res.send({ token });
});

app.get("/profile", (req, res) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer "))
    return res.status(401).send({ error: "Missing token" });
  try {
    const payload = jwt.verify(auth.slice(7), "secret");
    const u = users.find((u) => u.username === payload.id);
    if (!u) return res.status(404).send({ error: "Not found" });
    res.send({ profile: { username: u.username, email: u.email } });
  } catch (e) {
    return res.status(401).send({ error: "Invalid token" });
  }
});

app.post("/echo", (req, res) => {
  const { text } = req.body;
  res.send(`<p>You said: ${validator.escape(String(text))}</p>`);
});

app.listen(3001, () => console.log("Task2 app running http://localhost:3001"));
