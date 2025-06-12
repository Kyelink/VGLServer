import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGO_URI,{
            dbName:process.env.MONGO_DBNAME
        });
        console.log("connected to DB "+connection.host);
    } catch (error) {
        console.log("cannot connect to DB, reason : " + error);
        process.exit(1);
    }
}