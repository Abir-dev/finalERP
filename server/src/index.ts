import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import userRoutes from './routes/user';
import invitationRoutes from './routes/invitation';
import projectRoutes from './routes/project';
import billingRoutes from './routes/billing';
import inventoryRoutes from './routes/inventory';
import tenderRoutes from './routes/tender';
import hrRoutes from './routes/hr';
import accountsRoutes from './routes/accounts';
import notificationRoutes from './routes/notification';
import reportRoutes from './routes/report';
import purchaseOrderRoutes from './routes/purchaseOrder';
import siteOpsRoutes from './routes/siteOps';
import vendorRoutes from './routes/vendor';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "https://testboard-1.onrender.com",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(express.json());

// Debug middleware to log request body
app.use((req, res, next) => {
  if (req.body) {
    console.log('Request Body:', JSON.stringify(req.body));
    console.log('Content-Type:', req.headers['content-type']);
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/site-ops', siteOpsRoutes);
app.use('/api/vendors', vendorRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({   
    error: 'Something went wrong!',
    message: err.message,  })
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});