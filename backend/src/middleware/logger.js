const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const TransactionLog = require('../models/TransactionLog');

exports.logTransaction = asyncHandler(async (req, res, next) => {
  // Skip logging for GET requests
  if (req.method === 'GET') {
    return next();
  }

  // Create transaction log after response is sent
  res.on('finish', async () => {
    try {
      // Only log if user is authenticated
      if (req.user && req.user.id) {
        await TransactionLog.create({
          action: determineAction(req),
          user: req.user.id,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: sanitizeBody(req.body),
            params: req.params,
            statusCode: res.statusCode
          },
          ipAddress: req.ip
        });
      }
    } catch (err) {
      console.error('Error logging transaction:', err);
    }
  });

  next();
});

// Helper function to determine action type based on request
const determineAction = (req) => {
  const url = req.originalUrl.toLowerCase();
  
  if (url.includes('auth/login')) return 'login';
  if (url.includes('auth/logout')) return 'logout';
  if (url.includes('purchase')) return 'purchase';
  if (url.includes('transfer')) return 'transfer';
  if (url.includes('assignment') && req.body.status === 'expended') return 'expenditure';
  if (url.includes('assignment')) return 'assignment';
  
  return 'update';
};

// Helper function to sanitize sensitive data from request body
const sanitizeBody = (body) => {
  if (!body) return {};
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  if (sanitized.password) sanitized.password = '[REDACTED]';
  
  return sanitized;
};
