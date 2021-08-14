const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task");
const {
  userOne,
  userOneId,
  userTwo,
  taskTwo,
  setupDatabase,
} = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should create task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "from my test",
    })
    .expect(201);
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test("Should get the task for user one", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200);
  //   console.log(response);
  expect(response).not.toBeNull();
  expect(response.body.length).toBe(2);
});

test("shouldn't delete othe user tasks", async () => {
  const response = await request(app)
    .delete(`/tasks/${taskTwo._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .expect(401);
  const task = await Task.findById(taskTwo._id);
  expect(task).not.toBeNull();
  expect(task._id).toEqual(taskTwo._id);
});
