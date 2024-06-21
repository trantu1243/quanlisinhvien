const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config()

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const monhocRouter = require('./routes/monhoc');
const heDTRouter = require('./routes/heDT');
const khoahocRouter = require('./routes/khoahoc');
const khoaRouter = require('./routes/khoa');
const lopRouter = require('./routes/lop');
const sinhvienRouter = require('./routes/sinhvien');
const diemRouter = require('./routes/diem');

const { generateDiemData, generateSinhvienData } = require('./fakedata');
const User = require('./models/User');
const diem = require('./models/diem');


const app = express();
const port = 3000;

mongoose.connect(process.env.AZURE_COMOSDB_URL);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: 'quanlisinhvien_secret',
  resave: false,
  saveUninitialized: true,
}));

// Routes
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/monhoc', monhocRouter);
app.use('/heDT', heDTRouter);
app.use('/khoahoc', khoahocRouter);
app.use('/khoa', khoaRouter);
app.use('/lop', lopRouter);
app.use('/sinhvien', sinhvienRouter);
app.use('/diem', diemRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

async function test(){
  const username = 'admin123';
  const password = 'admin@036203';

  const user = new User({ username, password });
  await user.save();
}

// Run the script
// generateDiemData();

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

module.exports = app;
