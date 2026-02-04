import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res)=>{
    try {
        // create a Svix instance with cleak webhook secret.
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        
        // getting headers
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // verifying header - req.body is now a Buffer, so convert to string
        await whook.verify(req.body.toString(), headers);

        // Getting data from request body
        const { data, type } = JSON.parse(req.body.toString());

        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + " " + data.last_name,
            image: data.image_url,
            recentSearchedCities: [],
        }

        // switch case for diffrent events 
        switch (type) {
            case "user.created": {
                await User.create(userData);
                break;
            }

            case "user.updated": {
                await User.findByIdAndUpdate(data.id, userData);
                break;
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                break;
            }    
        
            default:
                break;
        }
        res.json({success: true, message: "Webhook Received"})



    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

export default clerkWebhooks;