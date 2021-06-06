const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Schema, model } = mongoose;
const Task = require("./task");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("age must be a positive number");
        }
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Please enter an Email valid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("The Password don't be contain the (password) word");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual properties for define relationship between
// entities or collections.
// Each time that request:
// await user.populate('tasks').execPopulate()
// in the reality will searching all the task created by
// the user and storage in an array of the propertie user.tasks
// for then be printed

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

// userSchema Methods...

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });

  await user.save();

  return token;
};

// Mongoose admite dos opciones de esquema para transformar objetos
// después de consultar MongoDb: toObject y toJSON.
// En general, puede acceder al objeto devuelto en el transform método toObjecto toJSON

userSchema.methods.toJSON = function () {
  const user = this;
  // - En mongoose:
  //   toObject(): Convierte este documento en un objeto javascript simple,
  //   listo para su almacenamiento en MongoDB. Los búferes se convierten en
  //   instancias de mongodb.Binary para un almacenamiento adecuado.
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

// login user by Schema.statics

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

// hashing the password/plainText before saving.

userSchema.pre("save", async function (next) {
  const user = this;
  const saltRounds = 10;
  try {
    if (user.isModified("password")) {
      const salt = await bcrypt.genSalt(saltRounds);
      user.password = await bcrypt.hash(user.password, salt);
    }
  } catch (e) {
    console.log(e);
  }

  next();
});

// Delete user Tasks whe user is removed

userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = model("User", userSchema);

module.exports = User;
