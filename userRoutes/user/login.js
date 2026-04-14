const sha256 = require("js-sha256").sha256;

const { generateLogInData } = require("../../helpers/generateLogInData.js");
const { fetchData } = require("../../db/main.js");

const loginHandler = async (req, res) => {
  // Recieving client information:
  const data = req.body;

  const email = data.email && data.email.toLowerCase();
  const password = data.password;

  // Hashing password:
  const inpHashPassword = sha256(password);

  // Comparing with database:
  try {
    const dbData = await fetchData(
      `SELECT email, password FROM users WHERE email='${email}';`,
    );
    if (!dbData.rows.length || !(dbData.rows[0].password === inpHashPassword)) {
      throw new Error("Your email or password are incorrect!");
    }

    //Create and assign a token:
    const logInData = generateLogInData(email);

    res.json(logInData);
  } catch (err) {
    res.json({ error: err.message });
  }
};

module.exports = loginHandler;
