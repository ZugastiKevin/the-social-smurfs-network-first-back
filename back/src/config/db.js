const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
console.log(process.env.MONGODB_CONNECTION);
mongoose.connect(
  process.env.MONGODB_CONNECTION, { 
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }
)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log("Failed to connect to MongoDB", err));
