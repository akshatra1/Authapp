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
            res
              .status(201)
              .send({ status: "Success", message: "registration success" });
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
}

export default UserController;
