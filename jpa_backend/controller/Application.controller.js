import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";

// user to apply for a job
export const applyJob = async(req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.id;

        if(!jobId) {
            return res.status(400).json({
                success: false,
                message: "Job ID is required."
            });
        }
        // check job exists or not
        const job = await Job.findById(jobId);
        if(!job) {
            return res.status(404).json({
                success: false,
                message: "Job is not found"
            })
        }

        // check if user's profile in completed or not
        const user = await User.findById(userId);
        if(!user || !user.phone || !user.resume) {
            return res.status(400).json({
                success: false,
                message: "Please complete your profile(add phone number or resume) in your profile before applying for job."
            })
        }

        // check if user already applied
        const existingApplication = await Application.findOne({job: jobId, user: userId});
        if(existingApplication) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for this job."
            });
        }

        const newapplication = new Application({
            job: jobId,
            user: userId
        });
        await newapplication.save();
        return res.status(201).json({
            success: true,
            message: "Application submitted succesfull"
        });


    } 
    
    catch (error) {
        console.error("Error applying for job: ", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

// get all application for a job(admin panel)

export const getApplication = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId);
        if(!job){
            return res.status(404).json({
                success: false,
                message: "Job not found."
            });
        }

        const application = await Application.find({job: jobId}).populate({
            path: "user",
            select: "name email phone role resume"
        }).sort({ createdAt: -1});

        return res.status(200).json({
            success:true,
            jobName: job.roleName,
            applicants: application
            .filter(app => app.user)
            .map(app => ({
                applicationId: app._id,
                ...app.user._doc,
                appliedDate: app.createdAt,
                resume: app.user.resume || ""
            }))
        })
    }
    
    catch (error) {
        console.error("Error featching applicants: ", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

// get all jobs applied by user
export const getUserApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const application = await Application.find({ user: userId }).populate("job").sort({createdAt: -1});
        const validApplications = application.filter(app => app.job !== null);

        return res.status(200).json({
            success: true,
            application: validApplications
        });
        
    } 
    
    catch (error) {
        console.error("Error fetching user application: ", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}