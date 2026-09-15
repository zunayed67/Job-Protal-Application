import mongoose from "mongoose";

const interviewCompanySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    logo: {
        type: String
    },
    questionsCount: {
        type : String,
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

export default mongoose.model("InterviewCompany", interviewCompanySchema);