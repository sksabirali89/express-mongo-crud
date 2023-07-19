const bcrypt = require("bcryptjs");
const createHashFromString = (str) => {
  const saltRounds = 12;
  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(str, salt);
};

exports.createHashFromString = createHashFromString;
