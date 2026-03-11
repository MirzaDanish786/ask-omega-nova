import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole, requireModule } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, updateRoleSchema, updateModulesSchema } from '../validators/user.validator.js';
import { UserController } from '../controllers/user.controller.js';
import { OgwiController } from '../controllers/ogwi.controller.js';
import { SimulationController } from '../controllers/simulation.controller.js';
import { EarlyWarningController } from '../controllers/earlywarning.controller.js';
import { KnowledgeController } from '../controllers/knowledge.controller.js';
import { AgentController } from '../controllers/agent.controller.js';
import { NotificationController } from '../controllers/notification.controller.js';
import { AdminController } from '../controllers/admin.controller.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth is mounted directly on the app in index.ts (BetterAuth needs full URL path)

// Users
router.get('/users/me', requireAuth, UserController.getMe);
router.patch('/users/me', requireAuth, validate(updateProfileSchema), UserController.updateMe);
router.get('/users', requireAuth, requireRole('ADMIN'), UserController.getAll);
router.patch('/users/:id/role', requireAuth, requireRole('ADMIN'), validate(updateRoleSchema), UserController.updateRole);
router.patch('/users/:id/modules', requireAuth, requireRole('ADMIN'), validate(updateModulesSchema), UserController.updateModules);

// OGWI
router.get('/ogwi/current', requireAuth, requireModule('ogwi'), OgwiController.getCurrent);
router.get('/ogwi/historical', requireAuth, requireModule('ogwi'), OgwiController.getHistorical);
router.get('/ogwi/forecast', requireAuth, requireModule('ogwi'), OgwiController.getForecast);
router.post('/ogwi/update', requireAuth, requireRole('ADMIN'), OgwiController.triggerUpdate);

// Simulations
router.get('/simulations', requireAuth, requireModule('simulations'), SimulationController.getAll);
router.post('/simulations', requireAuth, requireModule('simulations'), SimulationController.create);
router.get('/simulations/:id', requireAuth, SimulationController.getById);
router.post('/simulations/:id/continue', requireAuth, SimulationController.continueThread);

// Early Warning
router.get('/early-warning/current', requireAuth, requireModule('early-warning'), EarlyWarningController.getCurrent);
router.get('/early-warning/history', requireAuth, requireModule('early-warning'), EarlyWarningController.getHistory);

// Knowledge Base
router.get('/knowledge/search', requireAuth, requireModule('knowledge-base'), KnowledgeController.search);
router.get('/knowledge/articles', requireAuth, requireModule('knowledge-base'), KnowledgeController.getAll);
router.post('/knowledge/articles', requireAuth, requireRole('ADMIN'), KnowledgeController.create);

// Agents (Admin only)
router.get('/agents', requireAuth, requireRole('ADMIN'), AgentController.getAll);
router.post('/agents/:id/toggle', requireAuth, requireRole('ADMIN'), AgentController.toggle);
router.post('/agents/:id/run', requireAuth, requireRole('ADMIN'), AgentController.manualRun);
router.get('/agents/:id/audit', requireAuth, requireRole('ADMIN'), AgentController.getAuditLogs);

// Notifications
router.get('/notifications', requireAuth, NotificationController.getAll);
router.patch('/notifications/:id/read', requireAuth, NotificationController.markAsRead);

// Admin
router.get('/admin/stats', requireAuth, requireRole('ADMIN'), AdminController.getStats);
router.get('/admin/audit-logs', requireAuth, requireRole('ADMIN'), AdminController.getAuditLogs);

export { router };
