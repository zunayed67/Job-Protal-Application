import User from "../models/user.model.js";

// toggle save job
export const toggleSaveJob = async (req, res) => {
    try {
        const {jobId} = req.params; // FIX: typo 'jonId' to 'jobId'
        const userId = req.user.id;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isSaved = user.savedJobs.includes(jobId);
        if(isSaved) {
            // FIX: changed 'is' to 'id' in the filter callback
            user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
        } else {
            user.savedJobs.push(jobId);
        } // saved

        await user.save();
        res.status(200).json({
            success: true,
            message: isSaved ? "Job unsaved" : "Job Saved",
            savedJobs: user.savedJobs
        });
    } 
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// toggle save questions
export const toggleSaveQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { type } = req.query; // either interview or role question
        const userId = req.user.id;

        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let isSaved;
        let message;

        if(type === 'role') {
            // FIX: property name matched to 'savedRoleQuestion' used below
            isSaved = user.savedRoleQuestion.includes(questionId); 
            if(isSaved) {
                user.savedRoleQuestion = user.savedRoleQuestion.filter(id => id.toString() !== questionId);
                message = "Question unsaved";
            } else {
                user.savedRoleQuestion.push(questionId);
                message = "Question saved"; // FIX: replaced ':' with '=' for variable assignment
            }
        } else {
            // default interview questions
            isSaved = user.savedInterviewQuestions.includes(questionId);
            if(isSaved) {
                user.savedInterviewQuestions = user.savedInterviewQuestions.filter(id => id.toString() !== questionId);
                message = "Question is unsaved"; // FIX: replaced ':' with '='
            } else {
                user.savedInterviewQuestions.push(questionId);
                message = "Question is saved"; // FIX: replaced ':' with '='
            }
        }
        await user.save();
        res.status(200).json({
            success: true,
            message,
            savedInterviewQuestions: user.savedInterviewQuestions,
            savedRoleQuestions: user.savedRoleQuestion
        });
    } 
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// to get all saved items
export const getSavedItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
         .populate("savedJobs")
         .populate({
          path: "savedInterviewQuestions",
          populate: { path: "company" }
         })
         .populate({
          path: "savedRoleQuestion",
          populate: { path: "roleId"}
         });

         if(!user) {
          return res.status(404).json({
            success: false,
            message: "User not found"
          });
        }
        res.status(200).json({
          success: true,
          savedJobs: user.savedJobs,
          savedInterviewQuestions: user.savedInterviewQuestions,
          savedRoleQuestions: user.savedRoleQuestion
        });
  }     catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}