import mailSender from '../utils/mailSender';

const contactUs = async (req, res) => {
  try {
    const { email, firstName, lastName, message, phoneNo, countryCode } =
      req.body;

    await mailSender(
      email,
      'Your Data send successfully',
      'Your Data send successfully'
    );

    return res.status(200).json({
      success: false,
      message: 'Your Data send successfully',
    });
  } catch (error) {
    console.log('error occur', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};
