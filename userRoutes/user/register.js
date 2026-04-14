const sha256 = require("js-sha256").sha256;

const { generateLogInData } = require("../../helpers/generateLogInData.js");
const { fetchData, changeData } = require("../../db/main.js");

const registerHandler = async (req, res) => {
  // Recieving client information:
  const data = req.body;

  const email = data.email && data.email.toLowerCase();
  const password = data.password;
  const firstName = data.firstName && data.firstName.toLowerCase();
  const lastName = data.lastName && data.lastName.toLowerCase();

  // Hashing password
  const hashedPassword = sha256(password);

  try {
    // Comparing used emails:
    const dbData = await fetchData(
      `SELECT email FROM users WHERE email='${email}';`,
    );

    if (dbData.rows && dbData.rows.length)
      return res.send({
        data: "The inputed email has already been used before, please try something else!",
      });

    //Registering account:
    await changeData(`
        INSERT INTO users (email, first_name, last_name, password) VALUES ('${email}', '${firstName}', '${lastName}', '${hashedPassword}');
    `);

    //Create and assign a token:
    const logInData = generateLogInData(email);

    res.json(logInData);
  } catch (err) {
    return res.send({
      error: err,
    });
  }
};

module.exports = registerHandler;
