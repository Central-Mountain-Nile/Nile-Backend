function requireUser(req, res, next) {
  if (!req.user) {
    res.status(401);
    next({
      name: "MissingUserError",
      message: "You must be logged in to perform this action",
    });
  } else {
    next();
  }
}
function requireStore(req, res, next) {
  if (!req.user.isStore) {
    res.status(401);
    next({
      name: "MissingStoreError",
      message: "You must be registered as a store to perform this action",
    });
  } else {
    next();
  }
}
function requireAdmin(req, res, next) {
  if (!req.user.isAdmin) {
    res.status(401);
    next({
      name: "MissingAdminError",
      message: "You must be registered as an admin to perform this action",
    });
  } else {
    next();
  }
}

module.exports = {
  requireUser,
  requireStore,
  requireAdmin,
};
