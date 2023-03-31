const express = require("express");
const { getUsersByUsername, createUser } = require("../db");
const { requireUser } = require("./utils");
const router = express.Router();
const jwt = require("jsonwebtoken");

//POST api/users/register
router.post("/register", async (req, res, next) => {
  const {
    firstName,
    lastName,
    username,
    password,
    addressLineOne,
    addressLineTwo,
    city,
    state,
    country,
    postalCode,
    email,
  } = req.body;
  try {
    const _user = await getUsersByUsername(username);

    if (_user) {
      next({
        name: "UserExistsError",
        message: `User ${username} is already taken.`,
      });
    }

    if (password.length < 8) {
      next({
        name: "PasswordError",
        message: "Password Too Short!",
      });
    }
    const user = await createUser({
      firstName,
      lastName,
      username,
      password,
      addressLineOne,
      addressLineTwo,
      city,
      state,
      country,
      postalCode,
      email,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );

    res.send({
      message: "thank you for signing up",
      token,
      user,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

//POST /api/users/login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password to login",
    });
  }

  try {
    const user = await getUsersByUsername(username);
    if (user && user.password == password) {
      const id = user.id;
      const username = user.username;
      const token = jwt.sign({ id, username }, process.env.JWT_SECRET, {
        expiresIn: "168h",
      });

      res.send({ message: "you're logged in!", token, user });
    } else {
      next({
        name: "InvalidCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//GET /api/users/me

router.get("/me", requireUser, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
