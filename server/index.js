import express from 'express';
import 'dotenv/config.js';
import DatabaseConnect from './config/database.js';
import cloudinaryConnect from './config/cloudinary.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
//---------------------------- routes ------------------------
import UserRoutes from './routes/User.js';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  })
);

//--------db Connection ----------------

DatabaseConnect();
cloudinaryConnect();

//----------------- mounted routes ---------------

app.use('/api', UserRoutes);

app.get('/api', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`StudyNotion server is on port ${port}`);
});
