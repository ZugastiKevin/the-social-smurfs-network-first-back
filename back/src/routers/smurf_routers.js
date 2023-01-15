const express = require('express');
const { sendWelcomeEmail, sendCancelationEmail } = require("../mailler/account");
const auth = require('../middleware/auth_middleware');
const Smurf = require('../models/smurf_model');
const multer = require('multer');
const sharp = require('sharp');
const router = new express.Router();

router.post('/register', async (req, res) => {
  const { pseudo, email, password } = req.body;
  const smurf = new Smurf({ pseudo, email, password });

  try {
    await smurf.save();
    sendWelcomeEmail(smurf.email, smurf.pseudo);
    const token = await smurf.generateAuthToken();
    res.status(201).send({ smurf, token });
  } catch (err) {
    res.status(400).send(err);
  };
});

router.post('/login', async (req, res) => {
  try {
    const smurf = await Smurf.findByCredentials(req.body.email, req.body.password);
    const token = await smurf.generateAuthToken();
    res.send({ smurf, token });
  } catch (err) {
    res.status(400).send();
  };
});

router.post('/logout', auth, async (req, res) => {
  try {
    req.smurf.tokens = req.smurf.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.smurf.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  };
});

router.get('/me', auth, async (req, res) => {
  res.send(req.smurf);
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },

  fileFilter (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    };

    cb(undefined, true);
  }
});

router.post("/me/avatar", auth, upload.single("avatar"), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  req.smurf.avatar = buffer;
  await req.smurf.save();
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

router.delete("/me/avatar", auth, async (req, res) => {
  req.smurf.avatar = undefined;
  await req.smurf.save();
  res.send();
});

router.get("/:id/avatar", async (req, res) => {
  try {
    const smurf = await Smurf.findById(req.params.id);

    if (!smurf || !smurf.avatar) {
      throw new Error();
    };

    res.set("Content-Type", "image/png");
    res.send(smurf.avatar);
  } catch (err) {
    res.status(404).send();
  };
});

router.patch("/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["pseudo", "email", "password", "name"];
  const isValideOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValideOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  };

  try {
    updates.forEach((update) => req.smurf[update] = req.body[update]);
    await req.smurf.save();
    res.send(req.smurf);
  } catch (err) {
    return res.status(500).json({ message: err });
  };
});

router.delete("/me", auth, async (req, res) => {
  try {
    await req.smurf.remove();
    sendCancelationEmail(req.smurf.email, req.smurf.pseudo);
    res.send(req.smurf + "smurf deleted");
  } catch (e) {
    res.status(500).send();
  };
});

// likes
router.patch("/like-smurf/:id", auth, async (req, res) => {
  try {
    const like = await Smurf.findOne({ _id: req.params.id});

    if (!like) {
      return res.status(404).send();
    };

    if (like.likers.find(element => element._id == req.smurf._id)) {
      return res.status(500).send("You already like");
    };

    like.likers.push(req.smurf._id);
    await like.save();
    res.send(like);
  } catch (err) {
    res.status(500).send();
  };
});

router.patch("/unlike-smurf/:id", auth, async (req, res) => {
  try {
    const like = await Smurf.findOne({ _id: req.params.id});

    if (!like) {
      return res.status(404).send();
    };

    if (!like.likers.find(element => element._id == req.smurf._id)) {
      return res.status(500).send("You don't like to withdraw");
    };

    like.likers.pull(req.smurf._id);
    await like.save();
    res.send(like);
  } catch (err) {
    res.status(500).send();
  };
});

module.exports = router;
