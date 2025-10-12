import mongoose from 'mongoose';
import mailSender from '../utils/mailSender';

const OtpModel = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 300,
  },
});

//----------function to send email before to save otp model -----------

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      'Verification Email from studyNotion',
      otp
    );

    console.log('Email sent successfully', mailResponse);
  } catch (error) {
    console.log('Error occur while sending mail in otp schema', error);
  }
}

OtpModel.pre('save', async function (next) {
  await sendVerificationEmail(this.email, this.otp);
  next();
});

const Otp = mongoose.model('Otp', OtpModel);
export default Otp;
