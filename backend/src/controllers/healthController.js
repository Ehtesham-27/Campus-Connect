import { getDBStatus } from '../config/db.js';
import { ENV } from '../config/env.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Health check handler returning system status, timestamp, uptime, and DB state
 */
export function getHealth(req, res) {
  const dbStatus = getDBStatus();
  const isDbConnected = dbStatus.readyState === 1;

  const healthData = {
    service: 'Campus Connect API',
    status: isDbConnected ? 'healthy' : 'unhealthy',
    environment: ENV.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus,
  };

  if (!isDbConnected) {
    return res.status(503).json({
      success: false,
      statusCode: 503,
      data: healthData,
      message: 'Campus Connect API database is disconnected or unavailable',
    });
  }

  return new ApiResponse(200, healthData, 'Campus Connect API is operating normally').send(res);
}

