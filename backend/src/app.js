import express from "express"
import cookieParser from "cookie-parser"

const app = express()

//BASIC EXPRESS SERVER SETUP
app.use(express.json({limit : "16kb"}))// backend accepts some data
app.use(express.urlencoded({extended: true}, {limit: "16kb"}))//users can save some data

app.use (cookieParser())

app.get('/', (req, res) => {
  res.send('Hello World')
})


export default app