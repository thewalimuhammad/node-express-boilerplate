const jwt = require('jsonwebtoken');
const { refreshTokenModel } = require('../models');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7, authHeader.length)
    : authHeader;
  try {
    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ message: 'Not authorized, token failed' });
  }

  if (!token) {
    res.status(401).send({ message: 'Not authorized, no token' });
  }
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = async (userId) => {
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    },
  );

  await refreshTokenModel.create({
    token: refreshToken,
    userId: userId,
    expiresAt: new Date(
      Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRES_IN) * 1000,
    ),
  });

  return refreshToken;
};
module.exports = { authMiddleware, generateToken, generateRefreshToken };
