// pass = "3Ikp0jYgwlBPtYVH"

import mongoose from "mongoose";

export async function ConnectToDB()
{
    try 
    {
        await mongoose.connect("mongodb+srv://dotasararishabh:3Ikp0jYgwlBPtYVH@cluster0.ihjm7rv.mongodb.net/snippet-store?retryWrites=true&w=majority&appName=Cluster0", {});
        console.log("[INFO] MongoDB Connection: Success");
    }
    catch (error:any) 
    {
        console.error("[ERROR] MongoDB Connection:", error);
    }
}
