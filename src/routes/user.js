const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const handlingUploadError = require("../middleware/handlingUploadErrors");
const router = new express.Router();

const upload = multer({
  // dest: "avatars/", // Al eliminar esta opcion Multer ya no guardara los archivos en un directorio, simplemente va a pasar los datos a nuestra funcion para que podamos manejarlos a conveniencia.
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    // if (!file.originalname.endsWith(".pdf")) {
    //   return cb(new Error("Please upload a PDF"));
    // }

    // if (!file.originalname.match(/\.(doc|docx|pdf)$/)) {
    //   return cb(new Error("Please upload a doc,docx or pdf file"));
    // }

    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("Please upload a jpg, jpeg or png file"));
    }

    cb(null, true);
  },
});

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    await user.save();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    if (user === {}) {
      return res.status(400).send("Unable to connect");
    }
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send({ error: "Unable to Login" });
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(200).send();
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send();
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "age", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(400).send({ Error: "Invalid update" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  // const _id = req.user._id;
  try {
    // const user = await User.findByIdAndDelete(_id);

    // if (!user) {
    //   return res.status(404).send();
    // }

    // Instead that code writed before, we can delete an user with the async 'remove()' method of mongoose:
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatars"),
  async (req, res) => {
    try {
      req.user.avatar = req.file.buffer;
      await req.user.save();
      res.send();
    } catch (error) {
      res.status(400).send(error);
    }
  },
  handlingUploadError
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
