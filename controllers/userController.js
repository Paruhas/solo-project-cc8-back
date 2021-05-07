const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User , sequelize } = require("../models");
const AppError = require("../utils/AppError")

const isEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const isPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/

exports.protect = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    };
    if(!token) return res.status(401).json({ message: "you are unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({
      where: {
        id: payload.id
      }
    });
    if(!user) return res.status(401).json({ message: "user not found" });
    
    req.user = user;
    next();
  } catch(err) {
    next(err);
  }
};

exports.protectAdmin = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    };
    if(!token) return res.status(401).json({ message: "you are unauthorized or not Admin" });

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({
      where: {
        id: payload.id,
        roleAdmin: "ADMIN"
      }
    });
    if(!user) return res.status(401).json({ message: "Admin not found" });
    
    req.user = user;
    next();
  } catch(err) {
    next(err);
  }
};

exports.getAllUser = async (req, res, next) => {
  try {
    // const users = await User.findAll();

    const users = await User.findAll({
      attributes: ["id"]
    });
    console.log(users.length);
    console.log(users[users.length-1].dataValues.id + 1);

    res.status(200).json({users})
  } catch(err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  // console.log(req.user);
  res.status(200).json({
    user: {
      id: req.user.id,
      email: req.user.email,
      roleAdmin: req.user.roleAdmin
    }
  });
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findOne({
      where: { id: id }
    });
    res.status(200).json({user})
  } catch(err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { email, password, confirmPassword } = req.body;

    if (!(isEmail.test(email))) {
      throw new AppError(400, "this email is invalid format");
    }
    if (!password || !password.trim()) {
      throw new AppError(400, "password is required");
    };
    if (!confirmPassword || !confirmPassword.trim()) {
      throw new AppError(400, "confirmPassword is required");
    };
    if (password !== confirmPassword) {
      throw new AppError(400, "password and confirmPassword not match");
    };
    if (!(isPassword.test(password))) {
      throw new AppError(400, "this password is invalid format");
    };

    // // ทำให้สร้าง id ต่อจากของเดิมเสมอ
    // const findLastUserId = await User.findAll({
    //   attributes: ["id"]
    // });

    // หาว่ามี email นี้ในระบบไหม ถ้ามีจะไม่ให้ run คำสั่ง sql
    const isHasThisUserInDatabase = await User.findOne({
      where: {
        email: email
      }
    })
    if (isHasThisUserInDatabase) {
      throw new AppError(400, "this email have already taken");
    };

    const hashPassword = await bcrypt.hash(password, +process.env.BCRYPT_SALT);
    const newUser = await User.create(
      {
        // id: findLastUserId[findLastUserId.length-1].dataValues.id + 1,
        email: email,
        password: hashPassword,
        roleAdmin: "USER"
      },{
        transaction: transaction
      });
    const payload = {
      id: newUser.id,
      email: newUser.email,
      roleAdmin: newUser.roleAdmin
    };
    const token = await jwt.sign(
      payload, 
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: +process.env.JWT_EXPIRES_IN
    });
    
    await transaction.commit();
    res.status(201).json({ token });   
  } catch(err) {
    await transaction.rollback();
    if(!(err.errors === undefined)) {
      if (err.errors[0].message === "users.email must be unique") return res.status(400).json({ message: "this email have already taken"});
      if (err.errors[0].message === "Validation isEmail on email failed") return res.status(400).json({ message: "invalid email format"});
    }
    next(err);
  }
};

//*****
exports.login = async (req, res, next) => {
  try {
    const { email ,password } = req.body;

    const loginUser = await User.findOne(
      {
        where: {
          email: email
        }
      });
    
    if(!loginUser) return res.status(400).json({ message: "email or password incorrect"});




    // // เงื่อนไขทำมาสำหรับ user ที่เป็น dummy ติดมากับ database ( user 1 - 3 )
    // if((loginUser.password).length === 5) {
    //   if ( password === loginUser.password) {
    //     const payload = {
    //       id: loginUser.id,
    //       email: loginUser.email,
    //     };
    //     const token = await jwt.sign(
    //       payload, 
    //       process.env.JWT_SECRET_KEY,
    //       {
    //         expiresIn: +process.env.JWT_EXPIRES_IN
    //     });
    //     return res.status(200).json({ message: loginUser.password + " login successful; and get token" , token });
    //   }
    // }




    const isPasswordMatch = await bcrypt.compare(password, loginUser.password);
    if(!isPasswordMatch) return res.status(400).json({ message: "email or password incorrect"});

    const payload = {
      id: loginUser.id,
      email: loginUser.email,
      roleAdmin: loginUser.roleAdmin
    };
    const token = await jwt.sign(
      payload, 
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: +process.env.JWT_EXPIRES_IN
    });
    return res.status(200).json({ token: token });
  } catch(err) {
    next(err);
  }
};

//*****
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !oldPassword.trim()) return res.status(400).json({ message: 'oldPassword is required'});
    if (!newPassword || !newPassword.trim()) return res.status(400).json({ message: 'newPassword is required'});
    if (!confirmNewPassword || !confirmNewPassword.trim()) return res.status(400).json({ message: 'confirmNewPassword is required'});
    if (newPassword !== confirmNewPassword) return res.status(400).json({ message: "newPassword and confirmNewPassword not match"});
    if (!(isPassword.test(newPassword))) return res.status(400).json({ message: "this newPassword is invalid format"});
    
    // // ทำชั่วคราว ถ้าทำ protect AUTH เสร็จต้องมาแก้ด้วย
    // // ต้องปิด
    // const findUser = await User.findOne(
    //   {
    //     where: {
    //       id: id
    //     }
    //   });

    const isOldPasswordCorrect =  await bcrypt.compare(
      oldPassword, 
      req.user.password
      // findUser.password // ต้องปิด บนเปิด
    );
    if (!isOldPasswordCorrect) {
      return res.status(400).json({ message: 'OldPassword is incorrect'})
    };
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message:'password not match'})
    };
    const newHashedPassword = await bcrypt.hash(
      newPassword,
      +process.env.BCRYPT_SALT
    );
    await User.update(
      { password: newHashedPassword },
      // { where: { id: req.user.id } }
      { where: { id: id } } // ต้องปิด บนเปิด
    );
    res.status(200).json({message: 'change password complete'});
  } catch(err) {
    next(err);
  }
};