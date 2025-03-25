import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID; // Lấy từ Twilio

// 📩 Gửi OTP qua SMS
export const sendOTP = async (phoneNumber) => {
    try {
        const verification = await twilioClient.verify.v2.services(verifyServiceSid)
            .verifications.create({ to: phoneNumber, channel: "sms" }).then(verification => console.log(verification.sid));;
        return verification.sid;
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP");
    }
};

// ✅ Xác thực OTP
export const verifyOTP = async (phoneNumber, otp) => {
    try {
        const verificationCheck = await twilioClient.verify.v2.services(verifyServiceSid)
            .verificationChecks.create({ to: phoneNumber, code: otp });

        console.log("OTP Verification Status:", verificationCheck.status);
        return verificationCheck.status === "approved";
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return false;
    }
};
