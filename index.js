import { readFileSync, writeFileSync } from "fs";
import http from "http";

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

  if (req.url === "/users" && req.method === "GET") {
    return res.end(JSON.stringify(getUsers()));
  }

  if (req.url === "/users" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      const newUser = JSON.parse(body);
      const users = getUsers();

      newUser.id = users.length ? users[users.length - 1].id + 1 : 1;
      users.push(newUser);

      saveUsers(users);
      res.end(JSON.stringify({ message: "User added", user: newUser }));
    });

    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
