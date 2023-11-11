const express = require("express");
const redis = require("redis");
const bodyParser = require("body-parser");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  const body = { resultSet, resultGet, resultFlush, resultKeys } = req.query;
  res.render("client", body);
});

app.post("/set", async (req, res) => {
  const { key, value, expire, urlConnection } = req.body;
  const client = getClientRedis(urlConnection);
  await client.connect();
  await client.set(key, value);

  if (expire) client.expire(key, expire);

  client.quit();
  res.redirect(`/?resultSet=Key ${key} inserida com sucesso.`);
});

app.get("/get", async (req, res) => {
  const client = getClientRedis(req.query.urlConnection);
  await client.connect();

  const value = await client.get(req.query.key);
  client.quit();
  res.redirect(`/?resultGet=${value}`);
});

app.post("/flush", async (req, res) => {
  const client = getClientRedis(req.body.urlConnection);
  await client.connect();
  await client.flushDb();
  client.quit();
  res.redirect(`/?resultFlush=Sucesso`);
});

app.get("/keys", async (req, res) => {
  const client = getClientRedis(req.query.urlConnection);
  await client.connect();

  const keys = await client.keys("*");
  let resultKey = "";
  for (let key of keys) resultKey += key + "|";
  client.quit();
  res.redirect(`/?resultKeys=${resultKey}`);
});

const getClientRedis = (urlConnection) => {
  const client = redis.createClient({
    url: urlConnection,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  return client;
};

app.listen(3000, () => console.log("Client inicializado na porta 3000"));
