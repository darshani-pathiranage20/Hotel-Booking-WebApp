import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    console.log('='.repeat(50));
    console.log('🔔 WEBHOOK RECEIVED AT:', new Date().toISOString());
    console.log('='.repeat(50));

    try {
        // Log raw request details
        console.log('📋 Request Method:', req.method);
        console.log('📋 Request URL:', req.url);
        console.log('📋 Content-Type:', req.headers['content-type']);
        
        // Check if body exists
        if (!req.body) {
            console.error('❌ No request body received!');
            return res.status(400).json({ success: false, message: "No body received" });
        }

        console.log('📦 Body type:', typeof req.body);
        console.log('📦 Body is Buffer:', Buffer.isBuffer(req.body));
        
        // Convert raw body to string for verification
        const payload = Buffer.isBuffer(req.body) 
            ? req.body.toString() 
            : JSON.stringify(req.body);
        
        console.log('📄 Payload (first 100 chars):', payload.substring(0, 100));
        
        // Getting headers
        const svixId = req.headers["svix-id"];
        const svixTimestamp = req.headers["svix-timestamp"];
        const svixSignature = req.headers["svix-signature"];

        console.log('🔑 Svix Headers:');
        console.log('  - svix-id:', svixId ? '✅ Present' : '❌ Missing');
        console.log('  - svix-timestamp:', svixTimestamp ? '✅ Present' : '❌ Missing');
        console.log('  - svix-signature:', svixSignature ? '✅ Present' : '❌ Missing');

        if (!svixId || !svixTimestamp || !svixSignature) {
            console.error('❌ Missing required Svix headers');
            return res.status(400).json({ success: false, message: "Missing svix headers" });
        }

        const headers = {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        };

        // Check if webhook secret exists
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        console.log('🔐 Webhook Secret:', webhookSecret ? '✅ Present' : '❌ Missing');
        console.log('🔐 Secret starts with whsec_:', webhookSecret?.startsWith('whsec_') ? '✅ Yes' : '❌ No');
        
        if (!webhookSecret) {
            console.error('❌ CLERK_WEBHOOK_SECRET is not set in environment variables');
            return res.status(500).json({ success: false, message: "Webhook secret not configured" });
        }

        // Create a Svix instance with Clerk webhook secret
        const whook = new Webhook(webhookSecret);
        
        let evt;
        try {
            console.log('🔍 Attempting to verify webhook...');
            evt = whook.verify(payload, headers);
            console.log('✅ Webhook verified successfully!');
        } catch (err) {
            console.error('❌ Webhook verification failed!');
            console.error('Error:', err.message);
            console.error('Stack:', err.stack);
            return res.status(400).json({ success: false, message: "Webhook verification failed: " + err.message });
        }

        // Getting data from verified event
        const { data, type } = evt;
        
        console.log('📋 Event Details:');
        console.log('  - Type:', type);
        console.log('  - User ID:', data.id);
        console.log('  - Email:', data.email_addresses?.[0]?.email_address);

        // Check MongoDB connection
        const mongoose = (await import('mongoose')).default;
        console.log('🗄️  MongoDB Status:', mongoose.connection.readyState);
        console.log('   0=disconnected, 1=connected, 2=connecting, 3=disconnecting');

        if (mongoose.connection.readyState !== 1) {
            console.error('❌ MongoDB is not connected!');
            return res.status(500).json({ success: false, message: "Database not connected" });
        }

        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name && data.last_name 
                ? `${data.first_name} ${data.last_name}`.trim() 
                : data.email_addresses[0].email_address.split('@')[0],
            image: data.image_url || 'https://via.placeholder.com/150',
        }

        console.log('💾 User data prepared:', JSON.stringify(userData, null, 2));

        // Switch case for different events 
        switch (type) {
            case "user.created": {
                console.log('🆕 Attempting to create new user in database...');
                try {
                    const newUser = await User.create(userData);
                    console.log('✅ SUCCESS! User created in database:');
                    console.log('   - ID:', newUser._id);
                    console.log('   - Email:', newUser.email);
                    console.log('   - Username:', newUser.username);
                } catch (dbError) {
                    console.error('❌ Database error while creating user:');
                    console.error('   Error:', dbError.message);
                    console.error('   Code:', dbError.code);
                    throw dbError;
                }
                break;
            }

            case "user.updated": {
                console.log('🔄 Attempting to update user in database...');
                const updatedUser = await User.findByIdAndUpdate(data.id, userData, { new: true });
                if (updatedUser) {
                    console.log('✅ User updated:', updatedUser._id);
                } else {
                    console.log('⚠️  User not found for update:', data.id);
                }
                break;
            }

            case "user.deleted": {
                console.log('🗑️  Attempting to delete user from database...');
                const deletedUser = await User.findByIdAndDelete(data.id);
                if (deletedUser) {
                    console.log('✅ User deleted:', deletedUser._id);
                } else {
                    console.log('⚠️  User not found for deletion:', data.id);
                }
                break;
            }    
        
            default:
                console.log('⚠️  Unhandled event type:', type);
                break;
        }
        
        console.log('✅ WEBHOOK PROCESSED SUCCESSFULLY');
        console.log('='.repeat(50));
        return res.status(200).json({ success: true, message: "Webhook received" });

    } catch (error) {
        console.error('❌ FATAL ERROR IN WEBHOOK HANDLER:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.log('='.repeat(50));
        return res.status(500).json({ success: false, message: error.message });
    }
}

export default clerkWebhooks;