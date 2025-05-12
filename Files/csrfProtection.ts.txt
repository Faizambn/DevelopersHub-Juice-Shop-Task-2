/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const csrf = require('csurf')
const security = {}

// Configure CSRF protection
security.csrfProtection = () => {
  return csrf({
    cookie: {
      key: '_csrf-juice-shop',
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    }
  })
}

// Middleware to provide CSRF token
security.csrfHandler = () => {
  return (req, res, next) => {
    if (!req.csrfToken) {
      return next()
    }
    
    // Make CSRF token available for templates
    res.locals.csrfToken = req.csrfToken()
    
    // Send token in response header for API consumers
    res.setHeader('X-CSRF-Token', req.csrfToken())
    
    next()
  }
}

module.exports = security
