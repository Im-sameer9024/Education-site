import JWT from 'jsonwebtoken';
import 'dotenv/config.js';

export const AccessTokenGenerator = (payload) => {
  return JWT.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '24h',
  });
};

export const RefreshTokenGenerator = (payload) => {
  return JWT.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};
