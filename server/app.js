import express from 'express';

const app = express();

app.get('/api/health',(req,res) => {
    res.json({success:true, message:'Server is healthy', timestamp: new Date()});
})


export default app;