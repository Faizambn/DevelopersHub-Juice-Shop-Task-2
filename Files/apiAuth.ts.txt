// Simple API key authentication
const apiKeys = {
  'app1-key': { name: 'Application 1', permissions: ['read'] },
  'admin-key': { name: 'Admin App', permissions: ['read', 'write', 'delete'] }
  // Add more keys as needed
}

function validateApiKey(req, res, next) {
  // Get API key from header
  const apiKey = req.get('X-API-Key')
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' })
  }
  
  // Validate key
  const keyData = apiKeys[apiKey]
  if (!keyData) {
    return res.status(403).json({ error: 'Invalid API key' })
  }
  
  // Add API client info to request
  req.apiClient = keyData
  
  // Continue to the route handler
  next()
}

module.exports = { validateApiKey }
