import "dotenv/config.js";
import JWT from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    try {
      const decoded = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      console.log("decoded token is here", decoded);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
    next();
  } catch (error) {
    console.log("error in auth middleware", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//----------- student role ----------------

const isStudent = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "This route is only accessible by student",
      });
    }

    next();
  } catch (error) {
    console.log("Error in student middleware", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


//----------- teacher role ----------------

const isTeacher = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(401).json({
        success: false,
        message: "This route is only accessible by teacher",
      });
    }

    next();
  } catch (error) {
    console.log("Error in teacher middleware", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { auth, isStudent, isTeacher };
