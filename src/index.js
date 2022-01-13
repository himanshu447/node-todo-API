// @ts-check
require('./db/mongoose');
const express = require('express');
const userRouter = require('./router/user');
const todoRouter = require('./router/todo');

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(todoRouter);


app.listen(process.env.PORT, () => {
    console.log('Server Start on', process.env.PORT);
});