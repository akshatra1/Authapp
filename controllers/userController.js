import userModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class UserController {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, tc } = req.body;
    const user = await userModel.findOne({ email: email });
    if (user) {
      res.send({ status: "failed", message: "Email already exists" });
    } else {
      if (name && email && password_confirmation && tc) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashpassword = await bcrypt.hash(password, salt);
            const doc = new userModel({
              name: name,
              email: email,
              password: hashpassword,
              tc: tc,
            });
            await doc.save();
            const saved_user = await userModel.findOne({ email: email });
            //Generate JWT Token
            const token = jwt.sign(
              { userID: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );

            res.status(201).send({
              status: "Success",
              message: "registration success",
              token: token,
            });
          } catch (error) {
            console.log(error);
            res.send({ status: "failed", message: "unable to register" });
          }
        } else {
          res.send({ status: "failed", message: "password dosen't match" });
        }
      } else {
        res.send({ status: "failed", message: "all field are required" });
      }
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await userModel.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            // generate JWT Token
            const token = jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );

            res.send({
              status: "sucess",
              message: "Login Success",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: " email or password is not valid",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "you are not registered user",
          });
        }
      } else {
        res.send({ status: "failed", message: "all field are required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to Login" });
    }
  };
}
export default UserController;
