module.exports = (app) => {
  const tutorials = require("../controllers/tutorial.controller.js");

  //var router = require("express").Router();

  // Create a new Tutorial
  // router.post("/", tutorials.create);

  // // Retrieve all Tutorials
  app.get("/api/tutorials", tutorials.findAll);

  //Create tutorial
  app.post("/api/tutorials", tutorials.create);

  // // Retrieve all published Tutorials
  // router.get("/published", tutorials.findAllPublished);

  // // Retrieve a single Tutorial with id
  // router.get("/:id", tutorials.findOne);

  // // Update a Tutorial with id
  // router.put("/:id", tutorials.update);

  // // Delete a Tutorial with id
  // router.delete("/:id", tutorials.delete);

  // // Delete all tutorials
  // router.delete("/", tutorials.deleteAll);

  // app.use("/api/tutorials", router);
};

// app.post('/api/user/login/',
//     UserValidation.validateUser,
//     UserController.login
// )

// module.exports = app
