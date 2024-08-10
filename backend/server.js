const path = require('path');
const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const port = process.env.PORT || 5001;


connectDB();

const app = express();

const cors = require('cors');
global.userId =null;
app.use(cors());
app.use(express.json());
app.use(express.static("public"))
app.use(express.urlencoded({extended : true}))

// app.use('/api/goals', require('./routes/goalRoutes'));
// app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/data', require('./routes/apiRoutes'));
app.use('/admin/login', require('./routes/adminLogin'));
app.use('/admin/logout', require('./routes/adminLogout'));


console.log('user_server.js',userId)


// process.env.NODE_ENV = 'production'
process.env.NODE_ENV = 'development'

// Serve frontend
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../frontend/build')));

//   app.get('*',async (req, res) =>{

//    return res.sendFile(
//       path.resolve(__dirname, '../', 'frontend', 'build', 'index.html')
//     )}
//   );
// } else {
//   app.get('/', (req, res) => res.send('Please set to production'));
// }


app.listen(port, () => console.log(`Server started on port ${port}`));
