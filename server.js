const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const moongose = require('mongoose');
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// const DB = process.env.DATABASE;
moongose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB Connection sucessfull');
  })
  .catch(err => {
    console.log(err);
  });

const app = require('./app');

// console.log(app.get('env'));
console.log(process.env.NODE_ENV);
const port = 7000;
const server = app.listen(port, () => {
  console.log(`server running on ${port}`);
});
console.log('hello');
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(() => {
    console.log('unhiandled rejection');
    process.exit(1);
  });
});
