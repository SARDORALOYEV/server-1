import { readFileSync, writeFileSync } from "fs";
import http from "http";
import { join } from "path";

const PORT = process.env.PORT || 3000;

function getUsers() {
  const data = readFileSync("./users.json", "utf8");
  return JSON.parse(data);
}

function saveUsers(users) {
  writeFileSync("./users.json", JSON.stringify(users, null, 2));
}

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  // Serve HTML
  if (req.url === "/" && req.method === "GET") {
    const html = readFileSync(join("./public", "index.html"), "utf8");
    res.setHeader("Content-Type", "text/html");
    return res.end(html);
  }

  // GET /users
  if (req.url === "/users" && req.method === "GET") {
    return res.end(JSON.stringify(getUsers()));
  }

  // POST /signup
  if (req.url === "/signup" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const { name, email, password } = JSON.parse(body);
        if (!name || !email || !password) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: "All fields required" }));
        }

        const users = getUsers();
        if (users.find(u => u.email === email)) {
          res.statusCode = 409;
          return res.end(JSON.stringify({ error: "User already exists" }));
        }

        const newUser = {
          id: users.length ? users[users.length - 1].id + 1 : 1,
          name,
          email,
          password
        };
        users.push(newUser);
        saveUsers(users);

        res.end(JSON.stringify({ message: "Signup successful", user: newUser }));
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // POST /login
  if (req.url === "/login" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const { email, password } = JSON.parse(body);
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
          res.statusCode = 401;
          return res.end(JSON.stringify({ error: "Invalid credentials" }));
        }
        res.end(JSON.stringify({ message: "Login successful", user }));
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // 404
  res.statusCode = 404;
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
