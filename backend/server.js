const bodyParser = require("body-parser");
const express = require("express");
const http = require("http");
const cors = require("cors");
const rsa = require("node-rsa");

const salt_begin =
  "NmqY72z4SJu9fmme8LxESEZCRMFYPzkEkxJXbknhSFSKaTHzG6W4zUPXU4BZZJB4";
const salt_end =
  "QIyqpfQeXJf2eXYqsbWBv8FRZmA8LfAupdtuGEMp7RmMt3G7kuUwv9kS8UT6Dn5S";

const app = express();
const port = process.env.PORT || 3002;

const server = http.createServer(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/keys-rsa", (req, res) => {
  const key = new rsa().generateKeyPair();
  const publicKey = key.exportKey("public");
  const privateKey = key.exportKey("private");
  return res.json({ keys: { publicKey, privateKey } });
});

app.post("/encrypt", (req, res) => {
  if (!req.body.message || !req.body.publicKey) {
    return res
      .sendStatus(404)
      .json({ msg: "please inform public key and message" });
  }

  var publicKey = new rsa();
  publicKey.importKey(req.body.publicKey);
  var encrypted = publicKey.encrypt(
    salt_begin + req.body.message + salt_end,
    "base64"
  );

  return res.json({ encrypted });
});

app.post("/decrypt", (req, res) => {
  if (!req.body.message || !req.body.privateKey) {
    return res
      .sendStatus(404)
      .json({ msg: "please inform public key and message" });
  }

  var privateKey = new rsa();
  privateKey.importKey(req.body.privateKey);
  var decrypted = privateKey.decrypt(req.body.message, "utf8");
  decrypted = decrypted.replace(salt_begin, "").replace(salt_end, "");
  return res.json({ decrypted });
});

/**
 * Server listener.
 */
server.listen(port, () => {
  console.log(`...\n...\n\tServer running at port ${port}\n...\n...`);
});
