import express from 'express';
import { Login, SendOtp, Signup } from '../controllers/AuthController.js';

const router = express.Router();

router.post('/send-otp', SendOtp);
router.post('/register', Signup);
router.post('/login', Login);

export default router;
