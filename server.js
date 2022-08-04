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

function getDate() {
  var date = new Date(),
    day = date.getDate().toString(),
    dayF = day.length == 1 ? "0" + day : day,
    month = (date.getMonth() + 1).toString(),
    monthF = month.length == 1 ? "0" + month : month,
    yearF = date.getFullYear();
  return dayF + "/" + monthF + "/" + yearF;
}

function sign(req, message, name, email) {
  var privateKey = new rsa();
  privateKey.importKey(req.body.privateKey);
  var signature =
    "ASSINADO POR:\nNOME: " +
    name +
    "\nE-MAIL: " +
    email +
    "\nDATA: " +
    getDate();
  var encrypted = privateKey.encryptPrivate(signature, "base64");
  return encrypted + "\n" + message;
}

function checkSignature(req) {
  var publicKey = new rsa();
  publicKey.importKey(req.body.publicKey);
  var signature = req.body.message.substr(0, req.body.message.indexOf("\n"));
  var decrypted = publicKey.decryptPublic(signature, "utf8");
  return decrypted;
}

app.post("/sign-document", (req, res) => {
  if (!req.body.message || !req.body.privateKey) {
    return res
      .sendStatus(404)
      .json({ msg: "please inform public key and message" });
  }

  const signed = sign(req);

  return res.json({ signed });
});

/**
 * Server listener.
 */
server.listen(port, () => {
  console.log(`...\n...\n\tServer running at port ${port}\n...\n...`);
});
