import mongoose from "mongoose";
import "dotenv/config";


const dbconnection = async () => {
    try {
       await mongoose.connect(process.env.MONGODB_URL);
       console.log(' Connected to MongoDB');
    
    } catch (error) {
        console.error('Error connection to mongoDB :', error.message);
        process.exit(1); // Exit if database connection fails
    }
}

export default dbconnection;