const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/user");

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Juan",
  email: "juan.arango@gmail.com",
  password: "Juan12345!",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const nonExistentUser = {
  name: "Failure",
  email: "failure@gmail.com",
  password: "Fail12345!",
};

// Applies to all tests in this file
beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Prueba",
      email: "pruebajest@gmail.com",
      password: "prueba12345!",
    })
    .expect(201);

  // Assert that the  database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: "Prueba",
      email: "pruebajest@gmail.com",
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe("prueba12345!");
});

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  // Assertions: Fetch the user from the database
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();
  // Assert that the token in response matches users second token
  expect(response.body).toMatchObject({
    user: {
      name: user.name,
      email: user.email,
    },
    token: user.tokens[1].token,
  });

  expect(user.password).not.toBe(userOne.password);
});

test("Should not login nonexistent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: nonExistentUser.email,
      password: nonExistentUser.password,
    })
    .expect(400);
});

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile from unauthenticate user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete account for user", async () => {
  const response = await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert that the user has been deleted from database
  const user = await User.findById(response.body._id);
  expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Shoud upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatars", "tests/fixtures/profile-pic.jpg")
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
  const response = await request(app)
    .patch("/users/me")
    .set("authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Juancito",
    })
    .expect(200);

  // Assert that the name has changed in database
  const user = await User.findById(response.body._id);
  expect(user.name).toBe("Juancito");
});

test("Should not update invalid user fields", async () => {
  const response = await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: "Venezuela",
    })
    .expect(400);

  // Assert that the location don't exist for the user

  expect(response.body.Error).not.toBeNull();
});
