const { validateApiKey } = require('../lib/apiAuth')

// Protect API routes
router.use('/api/v1/products', validateApiKey)
// Add other routes that should be protected

