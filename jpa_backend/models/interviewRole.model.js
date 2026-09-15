import mongoose from "mongoose";

const interviewRoleschema = new mongoose.Schema({
    roleName: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    questionCount: {
        type: String,
        required: true
    },
    csvFileUrl: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true});

export default mongoose.model("InterviewRole", interviewRoleschema);