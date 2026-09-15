import Inquiry from "../models/inquiry.models.js";
import { sendAdminInquiryEmail } from "../utils/emailService.js";

// to submit a query
export const submitInquiry = async (req, res) => {
    try {
        const { fullName, email, phone, subject, message } = req.body;
        if(!fullName || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the required fields"
            })
        }

        const inquiry = await Inquiry.create({
            fullName,
            email,
            phone,
            subject,
            message
        });

        try {
            await sendAdminInquiryEmail({fullName, email, phone, message});
        } catch (emailError) {
            console.error("Failed to notify thr admin via email: ", emailError);
        }

        res.status(201).json({
            success: true,
            inquiry,
            message: "Inquirey submitted successfully!"
        });
    } 
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}