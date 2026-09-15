import { uploadToCloudinary } from "./cloudnaryUpload.js";

// upload files
export const uploadFiles = async (files, config) => {
    const result = {};

    if(!files) return result;
    for(const key in config) {
        if(files[key]) {
            const file = files[key][0];

            const uploadRes = await uploadToCloudinary(
                file.buffer,
                config[key].folder,
                config[key].type,
                file.originalname
            );

            result[key] = uploadRes.secure_url;
        }
    }
    return result;
}

// parse and format questions
export const parseQuestions = (questionData, type, id, userId) => { // FIXED: changed questionDate to questionData
    const parsed = JSON.parse(questionData);

    return parsed.map((q) => {
        let date = new Date(q.postDate);
        if(isNaN(date)) date = new Date();

        return {
            ...(type === "company" && { company: id }),
            ...(type === "role" && { roleId: id }),
            question: q.question,
            answer: q.answer,
            keyPoints: Array.isArray(q.keyPoints) ? q.keyPoints : [q.keyPoints],
            postDate: date,
            createdBy: userId,
            askedBy: q.companies?.map((c) => ({
                companyName: c.name || "",
                dateAsked: c.date || "",
            })) || [],
        };
    })
}

// replace all questions
export const replaceQuestions = async (Model, filter, questions) => { // TWEAKED: changed question to questions for clarity
    await Model.deleteMany(filter);
    await Model.insertMany(questions);
}

// handle error
export const handleError = (res, err) => { // FIXED: changed req to err so err.message exists
    return res.status(500).json({ // FIXED: changed .JSON() to lowercase .json()
        success: false,
        message: err.message
    });
}