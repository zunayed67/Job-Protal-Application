import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import companyRouter from './routes/company.routes.js';
import jobRouter from './routes/job.routes.js';
import applicationRouter from './routes/application.routes.js';
import interviewRouter from './routes/interview.routes.js';
import saveRouter from './routes/saved.routes.js';
import inqueryRouter from './routes/inquiry.routes.js';



console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);

// port

const PORT = 5000;
const app = express();


// DB
connectDB();


// MIDDLEWARE
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));

app.use('/uploads', express.static("uploads"));

// ROUTES WARE
app.use("/api/auth/", authRouter);
app.use("/api/user", userRouter);
app.use("/api/company", companyRouter);
app.use("/api/job", jobRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/application", applicationRouter);
app.use("/api/saved", saveRouter);
app.use("/api/inquiry", inqueryRouter);

app.get('/' , (req,res)=>{
    res.send("API is working");
})

app.listen(PORT,()=>{
    console.log(`server started on http://localhost:${PORT}`)
});