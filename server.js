const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception Shutting Down!!');
  console.log(err.name, err.message);

  process.exit(1);
});

const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

const db = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connected successfully 😁'));

const port = process.env.PORT || 7000;
const server = app.listen(port, () => {
  console.log(`Your server is running on port ${port}`);
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception... Shutting Down!');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
