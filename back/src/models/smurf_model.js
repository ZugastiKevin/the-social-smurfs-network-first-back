const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const smurfSchema = new mongoose.Schema(
  {
    pseudo: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 55,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        };
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      max: 1024,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        };
      },
    },
    name: {
      type: String,
      maxLength: 25,
      trim: true,
    },
    likers: {
      type: [{ _id: String}],
      required: true,
    },
    tokens: [{
      token: {
        type: String,
        required: true,
      }
    }],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

smurfSchema.set('toObject', { virtuals: true });

smurfSchema.set('toJSON', { virtuals: true });

smurfSchema.methods.toJSON = function () {
  const smurf = this;
  const smurfObject = smurf.toObject();

  delete smurfObject.password;
  delete smurfObject.tokens;
  delete smurfObject.avatar;

  return smurfObject;
};

smurfSchema.pre("save", async function(next) {
  const smurf = this;

  if (smurf.isModified("password")) {
    smurf.password = await bcrypt.hash(smurf.password, 8);
  };
  
  next();
});

smurfSchema.methods.generateAuthToken = async function () {
  const smurf = this;
  const token = jwt.sign({ _id: smurf._id.toString() }, process.env.TOKEN_SECRET);
  
  smurf.tokens = smurf.tokens.concat({ token });
  await smurf.save();

  return token;
};

smurfSchema.statics.findByCredentials = async (email, password) => {
  const smurf = await Smurf.findOne({ email });

  if (!smurf) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, smurf.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return smurf;
};

smurfSchema.pre("remove", async function (next) {
  const smurf = this;

  await Resource.deleteMany({ owner: smurf._id });

  next();
});

const Smurf = mongoose.model("Smurf", smurfSchema);

module.exports = Smurf;
