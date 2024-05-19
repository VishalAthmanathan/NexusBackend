const mongo = require('mongoose');
const dotenv = require('dotenv').config();

const DB_URL = 'mongodb+srv://vishalathmanathan:user%40123@cluster0.k4almpa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongo.connect(DB_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("MongoDB Connected");
})
.catch((error) => {
    console.log(error);
})

const userSchema = new mongo.Schema({
    zorid: String,
    fullName: String,
    degree: String,
    year: String,
    dept: String,
    college: String,
    contactNo: Number,
    email: {
        type: String,
        unique: true
    },
    password: String,
    xcoders: String,
    thesis_precized: String,
    coin_quest: String,
    algo_rhythms: String,
    flip_it: String,
    vituoso: String,
    plutus: String,
}, { timestamps: true })


const UserInfo = mongo.model("UserInfo", userSchema);

module.exports = UserInfo;