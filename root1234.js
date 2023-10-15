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
const dbAddress = 'mongodb+srv://JkimH:wjdgns0428@cluster0.0yz15oz.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(dbAddress, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.log(err));

app.get('/', (req, res) => {
  const htmlFilePath = path.resolve('signup.html');
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

import jwt from 'jsonwebtoken';

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 이메일이 이미 데이터베이스에 있는지 확인합니다
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ success: false, message: '이미 가입된 이메일입니다.' });
    }

    // 새로운 사용자 생성 및 저장
    const newUser = new User({ email, password });
    await newUser.save();

    // JWT 토큰 생성
    const token = jwt.sign({ userId: newUser._id }, 'wjdgns');

    // 사용자에게 토큰 전달
    newUser.token = token;

    // Save the newUser object to the database
    await newUser.save();

    res.status(200).json({ success: true, message: '회원 가입이 완료되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 에러입니다.' });
  }
});

const server = app.listen(8070, () => {
  console.log('서버가 8070 포트에서 실행 중입니다.');
});

export default server;

//회원가입 페이지 간단하게 이메일,패스워드만 입력 , 토큰값 생성 완료.
