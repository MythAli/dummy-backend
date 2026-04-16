const sha256 = require("js-sha256").sha256;
const { generateLogInData } = require("./helpers/generateLogInData.js");
const { fetchData } = require("../../db/main.js");
const { UserType } = require("../../helpers/constants.js");

const loginHandler = async (req, res) => {
  // Recieving client information:
  const data = req.body;
  const email = data.email?.toLowerCase();
  const password = data.password;
  const userType = data.table === 1 ? UserType.STUDENT : UserType.CLUB;
  const tableName =
    userType === UserType.STUDENT ? "student_users" : "club_users";
  const inpHashPassword = sha256(password); // Hashing password

  // Comparing with database:
  try {
    const query = `SELECT id, email, password FROM ${tableName} WHERE email = $1`;
    const dbData = await fetchData(query, [email]);

    if (!dbData.rows.length || !(dbData.rows[0].password === inpHashPassword)) {
      return res
        .status(401)
        .json({ error: "Your email or password are incorrect" });
    }

    //Create and assign a token:
    const logInData = generateLogInData(dbData.rows[0].id, email, userType);

    res.json(logInData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = loginHandler;
