import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import planRoutes from './plans.routes';
import subscriptionRoutes from './subscriptions.routes';
import usageRoutes from './usage.routes';
import couponRoutes from './coupons.routes';
import adminRoutes from './admin.routes';
import simulatorRoutes from './simulator.routes';

const v1Router = Router();

v1Router.use('/auth', authRoutes);
v1Router.use('/students', studentRoutes);
v1Router.use('/plans', planRoutes);
v1Router.use('/subscriptions', subscriptionRoutes);
v1Router.use('/usage', usageRoutes);
v1Router.use('/coupons', couponRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/simulator', simulatorRoutes);

export default v1Router;
