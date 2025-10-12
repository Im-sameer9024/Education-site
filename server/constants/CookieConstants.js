import 'dotenv/config.js';

export const options = {
  httpOnly: true,
  expires: new Date(Date.now() + 60 * 60 * 1000),
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  secure: process.env.NODE_ENV === 'production' ? true : false,
};
