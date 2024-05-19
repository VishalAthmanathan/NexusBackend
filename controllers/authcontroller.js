const UserInfo = require("../database/db");
const { hashPassword, comparePassword } = require("../helpers/auth");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { userInfo } = require("os");

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "zorphix@citchennai.net",
    // user: "vishalathmanathan@gmail.com",
    pass: "jxmiendptheaxapy",
  },
});

const test = (req, res) => {
  res.json("Test is Working");
};

// let newid = "";
// // const newid = Participant.find({}).sort({ timestampField: -1 }).limit(1).id + 1;
// const count = await Participant.countDocuments({}) + 1;

// if (count == 1) {
//     newid = "ZOR20231"
// }
// else {
//     newid = "ZOR2023" + count.toString();
// }
// console.log(newid);
const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      year,
      dept,
      degree,
      college,
      contactNo,
      email,
      password,
    } = req.body;
    //Check All fields
    if (
      !fullName ||
      !college ||
      !degree ||
      !contactNo ||
      !email ||
      !year ||
      !dept
    ) {
      return res.json({
        error: "Please fill all the required fields",
      });
    }
    //Check PASSWORD
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be not less than 6 characters",
      });
    }
    //Check EMAIL
    const checkemail = await UserInfo.findOne({ email });
    if (checkemail) {
      return res.json({
        error: "Email taken already",
      });
    }

    const hashedPassword = await hashPassword(password);

    let newid = "";
    const count = await UserInfo.countDocuments({});
    if (count == 0) {
      newid = "ZOR20231";
    } else {
      await UserInfo.findOne()
        .sort({ createdAt: -1 })
        .then((data) => {
          const nextid = parseInt(data.zorid.slice(7), 10) + 1;
          newid = "ZOR2023" + nextid.toString();
        });
    }

    const user = await UserInfo.create({
      zorid: newid,
      fullName,
      year,
      dept,
      degree,
      college,
      contactNo,
      email,
      password: hashedPassword,
      xcoders: "no",
      thesis_precized: "no",
      coin_quest: "no",
      algo_rhythms: "no",
      plutus: "no",
      flip_it: "no",
      vituoso: "no",
    })
      .then((result) => {
        const registrationSuccessMail = {
          from: "zorphix@citchennai.net",
          to: email,
          subject: "Subject: Welcome to Zorphix!",
          html:
            "<p>Dear " +
            fullName +
            ",<br><br>We are excited to inform you that your signup for Zorphix was successful, and you are now officially a member of our community! Welcome aboard!<br><br>Here is your unique Zorphix ID number:<br>Zorphix ID : " +
            newid +
            "<br>Venue: Chennai Institute of Technology<br><br>If you have any questions, encounter any issues, or need assistance with anything related to Zorphix, please feel free to reach out to our dedicated support team at <a href='mailto:zorphix@citchennai.net'>zorphix@citchennai.net</a>.<br><br>Warm regards,<br>Team Zorphix</p>",
        };

        transporter.sendMail(registrationSuccessMail, (err, info) => {
          if (err) {
            console.log(err);
          }
        });
        console.log("Registration successful");
      })
      .catch((err) => console.log(err));

    return res.json("Success");
  } catch (error) {
    console.log(error);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        error: "Enter the Email and password",
      });
    }
    const user = await UserInfo.findOne({ email });
    if (!user) {
      return res.json({
        error: "User does not exists",
      });
    }
    const passMatch = await comparePassword(password, user.password);
    const secret_key = process.env.JWT_SECRET;
    if (passMatch) {
      // jwt.sign({ email: user.email, id: user._id, name: user.name }, secret_key, {}, (err, token) => {
      //     if (err) throw err;
      //     res.cookie('token', token).json(user);
      // })
      res.send(user);
      console.log(user);
    } else {
      return res.json({
        error: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// const getProfile = (req, res) => {
//     const { token } = req.cookies;
//     if (token) {
//         jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
//             if (err) throw err;
//             res.json(user);
//         })
//     }
//     else {
//         res.json(null)
//     }
// }

const eventRegister = async (req, res) => {
  try {
    const email1 = req.body.email;
    const eventName = req.body.eventName;

    const userData = await UserInfo.findOne({ email: email1 });
    userData[eventName] = "yes";
    const update = await UserInfo.findOneAndUpdate(
      { email: email1 },
      userData,
      {
        new: true,
        runValidators: true,
      }
    );

    const {
      zorid,
      fullName,
      degree,
      year,
      dept,
      college,
      contactNo,
      email,
      password,
      xcoders,
      thesis_precized,
      coin_quest,
      algo_rhythms,
      flip_it,
      vituoso,
      plutus,
    } = userData;

    const client = await auth.getClient(); // create client
    const googleSheets = google.sheets({ version: "v4", auth: client }); //sheet object\
    const spreadsheetId = "1vbxNHfU755JmoXCpBHzR7-cSQW0vFBFJ3ZGNO3QF_Hc";

    rowToUpdate = [
      zorid,
      fullName,
      degree,
      year,
      dept,
      college,
      contactNo,
      email,
      xcoders,
      thesis_precized,
      coin_quest,
      algo_rhythms,
      flip_it,
      vituoso,
      plutus,
    ];

    const checkResponse = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "registered!A:O",
    });

    const values = checkResponse.data.values;
    const rowIndex = values.findIndex((row) => row[0] === rowToUpdate[0]);

    if (rowIndex !== -1) {
      await googleSheets.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: `registered!A${rowIndex + 1}:O${rowIndex + 1}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [rowToUpdate],
        },
      });
    } else {
      await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: `registered!A:O`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [rowToUpdate],
        },
      });
    }

    const eventRegistrationSuccessMail = {
      from: "zorphix@citchennai.net",
      to: email,
      subject: "Registration Confirmation for " + eventName,
      html:
        "<p>Dear " +
        fullName +
        ",<br><br>We are thrilled to confirm your successful registration for the upcoming event, " +
        eventName +
        ". Your participation means a lot to us, and we can't wait to have you join us on this exciting occasion.<br><br>Here are the details you'll need:<br><br>Event Name: " +
        eventName +
        "<br>Venue: Chennai Institute of Technology<br>Date: 20 September 2023<br>Timing: 8:00 AM<br><br>Please mark your calendar for this date and time to ensure you don't miss out on this incredible event. If you have any questions or need further information, please feel free to reach out to our event coordinator at <a href='mailto:zorphix@citchennai.net'>zorphix@citchennai.net</a>.<br><br>Once again, thank you for registering, and we look forward to seeing you there!<br><br>Warm regards,<br>Zorphix<p>",
    };

    transporter.sendMail(eventRegistrationSuccessMail, (err, info) => {
      if (err) {
        console.log(err);
      }
    });

    console.log(update);
    res.send(update);
  } catch (err) {
    console.log(err);
  }
};

const attendence = async (req, res) => {
  try {
    const client = await auth.getClient(); // create client
    const googleSheets = google.sheets({ version: "v4", auth: client }); //sheet object\
    const spreadsheetId = "1vbxNHfU755JmoXCpBHzR7-cSQW0vFBFJ3ZGNO3QF_Hc";

    const zorid = req.body.zorid;
    const email = req.body.email;
    const user = await UserInfo.findOne({ zorid, email });
    const event = [
      "xcoders",
      "thesis_precized",
      "coin_quest",
      "algo_rhythms",
      "flip_it",
      "vituoso",
      "plutus",
    ];
    const rowToUpdate=[zorid, user.fullName, user.year,user.dept,user.college,user.email,user.contactNo,user.xcoders,user.thesis_precized,user.coin_quest, user.algo_rhythms,user.flip_it,user.vituoso,user.plutus];
    const checkResponse=await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "attended!A:O"
    });

    const values = checkResponse.data.values;
    const rowIndex = values.findIndex((row) => row[0] === rowToUpdate[0]);

    if(rowIndex!==-1){
      await googleSheets.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: `attended!A${rowIndex + 1}:O${rowIndex + 1}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [rowToUpdate],
        },
      });
    } else {
      await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: `attended!A:O`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [rowToUpdate],
        },
      });
    }

    for (const key of event) {
      if (user[key] == "yes") {
        await googleSheets.spreadsheets.values.append({
          auth,
          spreadsheetId,
          range: key + "!A:G",
          valueInputOption: "USER_ENTERED",
          resource: {
            values: [
              [
                zorid,
                user.fullName,
                user.year,
                user.dept,
                user.college,
                user.email,
                user.contactNo,
              ],
            ],
          },
        });
      }
    }
    res.send("marked attendence");
  } catch (err) {
    console.log(err);
    res.send("error");
  }
};

module.exports = {
  test,
  registerUser,
  loginUser,
  eventRegister,
  attendence,
};
