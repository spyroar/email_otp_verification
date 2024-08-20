const express = require('express'); 
const mongoose = require('mongoose'); 
const bodyParser = require('body-parser'); 
const dotenv = require('dotenv');

dotenv.config();

const app = express();
 app.use(bodyParser.json());
 const authRoutes = require('./routes/auth');
mongoose.connect(process.env.MONGO_URI)
 .then(() => console.log('MongoDB connected')) 
 .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;


app.use('/api/auth', authRoutes);
app.listen(PORT, () => 
    { console.log(`Server running on port ${PORT}`)
     }) ;