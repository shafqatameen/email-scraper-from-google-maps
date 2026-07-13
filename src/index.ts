import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jobsRoutes from './modules/jobs/jobs.routes';
import leadsRoutes from './modules/leads/leads.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/leads', leadsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Scraper Modular Monolith API is running' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
