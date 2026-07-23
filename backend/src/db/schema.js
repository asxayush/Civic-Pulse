import mongoose from "mongoose"


    const ConnectDB = async() => {
        try {
            await mongoose.connect(process.env.MONGODB_URI)
            console.log("MONGODB CONNECTED SUCCESSFULY");
            
        } catch (error) {
            console.error("MONGODB CONNECTION ERROR", error)
            process.exit(1)
        }
    }

    export default ConnectDB