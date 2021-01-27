const express = require('express')
require('dotenv').config()
const app = express();
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cartRouter = require('./routes/shoppingCarts')
const userRouter = require('./routes/users')


mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})

const db = mongoose.connection
db.on('error', (error)=>console.error(error))
db.once('open', ()=>console.log("Connected to the database"))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json())

app.use('/shoppingCarts', cartRouter)
app.use('/users', userRouter)
app.listen(3000, ()=> console.log('Server Started..'))
