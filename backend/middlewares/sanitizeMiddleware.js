/**
 * NoSQL Injection Protection Middleware
 * Strips object keys containing '$' or '.' from req.body, req.query, and req.params.
 * This prevents MongoDB operator injection while preserving string values like emails,
 * passwords, and Base64 encoded images.
 */

export const sanitizeKeys = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = sanitizeKeys(obj[i]);
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    // If the key starts with '$' (Mongo operator) or contains '.' (nested path operator)
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else {
      obj[key] = sanitizeKeys(obj[key]);
    }
  }

  return obj;
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) sanitizeKeys(req.body);
  if (req.query) sanitizeKeys(req.query);
  if (req.params) sanitizeKeys(req.params);
  next();
};

export default sanitizeInput;
