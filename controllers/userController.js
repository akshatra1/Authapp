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

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          message: "new password and confirm new password dosen't match",
        });
      } else {
        const salt = await bcrypt.gensalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await userModel.findByIdAndUpdate(req.user._id, {
          $Set: { password: newHashPassword },
        });
      }
    } else {
      res.send({ status: "failed", message: "All field are required" });
    }
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await userModel.findOne({ email: email });
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userID: user._id }, secret, {
          expiresIn: "15m",
        });
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;

        console.log(link);

        //send Email
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "password Reset Link",
          html: `<a href=${link}>Click Here</a>to reset your password`,
        });

        res.send({
          status: "success",
          message: "please check your email",
          info: info,
        });
      } else {
        res.send({
          status: "failed",
          message: "email dosen't exist , enter valid email",
        });
      }
    } else {
      res.send({ status: "failed", message: "please enter email" });
    }
  };

  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await userModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      jwt.verify(token, new_secret);
      if (password && password_confirmation) {
        if (password === password_confirmation) {
          res.send({
            status: "failed",
            message: "new password and confirmation password dosen no match",
          });
        } else {
          const salt = await bcrypt.gensalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          await userModel.findByIdAndUpdate(req._id, {
            $Set: { password: newHashPassword },
          });
        }
      }
    } catch (error) {
      res.send({ status: "failed", message: "Invalid Token" });
    }
  };
}
export default UserController;
