//-------------capture payment -----------------------

import mongoose from 'mongoose';
import Course from '../models/CourseModel';
import { instance } from '../config/razorpay';
import User from '../models/UserModel';
import mailSender from '../utils/mailSender';

const capturePayment = async (req, res) => {
  try {
    //--------get course id and user id---------
    const { courseId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if(!user){
      return res.json({
        success: false,
        message: 'User not found',
      })
    }

    //---------validation------------

    if (!courseId) {
      return res.json({
        success: false,
        message: 'Please Provide valid course Id',
      });
    }

    //----------valid courseId
    let course;
    try {
      course = await Course.findById(courseId);
      if (!course) {
        return res.json({
          success: false,
          message: 'Could not find the course',
        });
      }

      //---------user already pay or exits ---------

      if (course.studentsEnrolled.includes(user._id)) {
        return res.json({
          success: false,
          message: 'You have already enrolled in this course',
        });
      }
    } catch (error) {
      console.error('Error occur in valid course Details', error);
      return res.json({
        success: false,
        message: 'Something went wrong',
      });
    }

    //---------order create---------

    const amount = course.price;
    const currency = 'INR';

    const options = {
      amount: amount * 100,
      currency: currency,
      receipt: Math.random(Date.now()).toString(),
      notes: {
        courseId: courseId,
        userId: userId,
      },
    };

    //--------- order create -------

    try {
      //------------ initiate payment using razorpay ----------
      const paymentResponse = await instance.orders.create(options);
      console.log('payment response', paymentResponse);
      return res.status(200).json({
        success: true,
        message: 'Payment initiated successfully',
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        thumbnail: course.thumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (error) {
      console.log('error occur in order create try catch', error);
      return res.json({
        success: false,
        message: 'Something went wrong',
      });
    }
  } catch (error) {
    console.log('error occur in capture payment', error);
    return res.json({
      success: false,
      message: 'Something went wrong',
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const webhookSecret = '12345678';
    const signature = req.headers['x-razorpay-signature'];

    const shasum = crypto.createHmac('sha256', webhookSecret);

    shasum.update(JSON.stringify(req.body));

    const digest = shasum.digest('hex');

    if (signature === digest) {
      console.log('payment is authorized');

      const { courseId, userId } = req.body.payload.payment.entity.notes;

      try {
        //-------- find the course and enrolled student in enrolled -----

        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId },
          {
            $push: { studentsEnrolled: userId },
          },
          { new: true }
        );

        if(!enrolledCourse){
            return res.json({
                success:false,
                message:'Course not found'
            })
        }

        // find the student and update the course enrolled in student 


        const enrolledStudent = await User.findOneAndUpdate(
            {_id:userId},
            {
                $push:{
                    courses: courseId
                }
            },
            {new:true}
        )

        //---------------- mail send confirmations-------------

        const emailResponse = await mailSender(
            enrolledStudent.email,
            "Congratulation You are Enrolled in course",
            "You are successfully enrolled in course"
        )

        console.log("email reaponse",emailResponse);

      } catch (error) {

        console.log('error occur in verify payment', error);
        return res.json({
          success: false,
          message: 'Something went wrong when  put the student in course',
        });
      }
    }else{
        return res.status(400).json({
            success:false,
            message:'Payment is not authorized'
        })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    })
  }
};
