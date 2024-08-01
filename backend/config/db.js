const mongoose = require('mongoose')

const connectDB = async () => {
  try {
  const conn = await mongoose.connect('mongodb+srv://vinayram35:Secret55@cluster0.det5okb.mongodb.net/sample_mflix', {useNewUrlParser: true})

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

module.exports = connectDB

