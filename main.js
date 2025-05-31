import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import User from './user.js';

const app = express();
app.use(express.static(path.resolve('')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Replace this with your MongoDB connection string
const dbAddress = 'mongodb+srv://user id:pw@cluster0.0yz15oz.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(dbAddress, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.log(err));

app.get('/', (req, res) => {
  const htmlFilePath = path.resolve('login.html');
  const cssFilePath = path.resolve('test.css');

  fs.readFile(htmlFilePath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('HTML 파일을 찾을 수 없습니다.');
    } else {
      fs.readFile(cssFilePath, 'utf8', (err, cssData) => {
        if (err) {
          res.writeHead(404);
          res.end('CSS 파일을 찾을 수 없습니다.');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(`<style>${cssData}</style>`);
          res.end(data);
        }
      });
    }
  });
});

app.post('/register', (req, res) => {
  const user = new User(req.body);
  user.save()
    .then((userInfo) => res.status(200).json({ success: true }))
    .catch((err) => res.json({ success: false, err }));
});

app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: '존재하지 않는 아이디입니다.',
      });
    }
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      return res.json({
        loginSuccess: false,
        message: '비밀번호가 일치하지 않습니다',
      });
    }
    user.generateToken()
      .then((user) => {
        res.cookie('x_auth', user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  } catch (err) {
    return res.json({ loginSuccess: false, err });
  }
});

const server = app.listen(8010, () => {
  console.log('서버가 8010 포트에서 실행 중입니다.');
});

export default server;
