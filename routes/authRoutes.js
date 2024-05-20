const express = require("express");
const router = express.Router();
const cors = require("cors");
const {
  test,
  registerUser,
  loginUser,
  getProfile,
  eventRegister,
  attendence,
} = require("../controllers/authcontroller");
const cookieParser = require("cookie-parser");

router.use(cookieParser());
router.use(
    cors({
        credentials: true,
        // origin: 'https://www.zorphix.live'
        // origin: 'http://localhost:3000'
        origin: 'https://nexus-frontend-azure.vercel.app/'
    })
)

router.get("/", test);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/eventRegister", eventRegister);
// router.get('/profile', getProfile);
router.post("/attendence", attendence);

module.exports = router;
