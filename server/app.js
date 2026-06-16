import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth.routes.js';
import driveRoutes from './src/routes/drive.routes.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();



app.use((req,res,next)=> {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/drives', driveRoutes);

app.get('/api/health',(req,res) => {
    res.json({success:true, message:'Server is healthy', timestamp: new Date()});
})

app.use(errorHandler);

export default app;