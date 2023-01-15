const express = require("express");
const auth = require("../middleware/auth_middleware");
const Smurf = require("../models/smurf_model");
const router = new express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const smurfs = await Smurf.find();
    if (!smurfs) {
      return res.status(404).send();
    };
    res.send(smurfs);
  } catch (err) {
    res.status(500).send();
  };
});

router.get("/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const smurf = await Smurf.findById(_id);
    if (!smurf) {
      return res.status(404).send();
    };
    res.send(smurf);
  } catch (e) {
    res.status(500).send();
  };
});

module.exports = router;
