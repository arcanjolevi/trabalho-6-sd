const bodyParser = require("body-parser");
const express = require("express");
const http = require("http");
const cors = require("cors");
const rsa = require("node-rsa");

const app = express();
const port = process.env.PORT || 3002;

const server = http.createServer(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

function getDate() {
  var date = new Date(),
    day = date.getDate().toString(),
    dayF = day.length == 1 ? "0" + day : day,
    month = (date.getMonth() + 1).toString(),
    monthF = month.length == 1 ? "0" + month : month,
    yearF = date.getFullYear();
  return dayF + "/" + monthF + "/" + yearF;
}

function sign(req) {
  var privateKey = new rsa();
  privateKey.importKey(req.body.privateKey);
  var signature =
    "ASSINADO POR:\nNOME: \n" +
    req.body.name +
    "\nE-MAIL: \n" +
    req.body.email +
    "\nDATA: \n" +
    getDate();
  var encrypted = privateKey.encryptPrivate(signature, "base64");
  return encrypted + "\n" + req.body.message;
}

function checkSignature(req) {
  var publicKey = new rsa();
  publicKey.importKey(req.body.publicKey);
  var signature = req.body.message.substr(0, req.body.message.indexOf("\n"));
  var decrypted = publicKey.decryptPublic(signature, "utf8");
  return decrypted;
}

app.post("/sign-document", (req, res) => {
  if (
    !req.body.message ||
    !req.body.privateKey ||
    !req.body.name ||
    !req.body.email
  ) {
    return res
      .sendStatus(404)
      .json({ msg: "please inform all necessary data" });
  }

  const signed = sign(req);

  return res.json({ signed });
});

app.post("/verify-document", (req, res) => {
  if (!req.body.message || !req.body.publicKey) {
    return res
      .sendStatus(404)
      .json({ msg: "please inform public key and message" });
  }

  const decrypted = checkSignature(req);

  return res.json({ decrypted });
});

/**
 * Server listener.
 */
server.listen(port, () => {
  console.log(`...\n...\n\tServer running at port ${port}\n...\n...`);
});
