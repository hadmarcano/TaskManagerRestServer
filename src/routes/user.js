const express = require("express");
const User = require("../models/user");
const auth = require('../middleware/auth');
const router = new express.Router();

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    await user.save();
    res.status(201).send( { user, token } );

  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req,res) =>{
  const {email,password} = req.body;

  try{

    const user = await User.findByCredentials(email,password);

    if(user === {}){
      return res.status(400).send('Unable to connect');
    }

    const token = await user.generateAuthToken();

    res.send( { user, token } );

  } catch(e){

    res.status(400).send({'error':'Unable to Login'});

  }
  
});

router.get("/users/me", auth,  async (req, res) => {
  
  res.send(req.user);
  
});

router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/users/:id", async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "age", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(400).send({ Error: "Invalid update" });
  }

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send();
    }

    updates.forEach((update) => (user[update] = req.body[update]));

    await user.save();

    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete("/users/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findByIdAndDelete(_id);

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
