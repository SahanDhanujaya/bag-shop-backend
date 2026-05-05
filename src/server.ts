import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbConnectin } from './db/db.ts'; // Path fixed
import authRouter from './routes/auth.routes.ts';
import bagRoutes from './routes/bag.routes.ts';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/bags', bagRoutes);

const PORT = process.env.PORT || 5000;

dbConnectin().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server definitely running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Critical failure during startup:", err);
});