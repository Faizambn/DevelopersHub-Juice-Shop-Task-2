/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import { type Request, type Response, type NextFunction } from 'express'
import { type User } from '../data/types'
import { BasketModel } from '../models/basket'
import { UserModel } from '../models/user'
import challengeUtils = require('../lib/challengeUtils')
import config from 'config'
import { challenges } from '../data/datacache'
import bcrypt from 'bcryptjs'
import validator from 'validator'

import * as utils from '../lib/utils'
const security = require('../lib/insecurity')
const users = require('../data/datacache').users
const loginMonitor = require('../lib/security/loginMonitor')

// vuln-code-snippet start loginAdminChallenge loginBenderChallenge loginJimChallenge
module.exports = function login () {
  function afterLogin (user: { data: User, bid: number }, res: Response, next: NextFunction) {
    verifyPostLoginChallenges(user) // vuln-code-snippet hide-line
    BasketModel.findOrCreate({ where: { UserId: user.data.id } })
      .then(([basket]: [BasketModel, boolean]) => {
        const token = security.authorize(user)
        user.bid = basket.id // keep track of original basket
        security.authenticatedUsers.put(token, user)
        res.json({ authentication: { token, bid: basket.id, umail: user.data.email } })
      }).catch((error: Error) => {
        next(error)
      })
  }

  return (req: Request, res: Response, next: NextFunction) => {
    verifyPreLoginChallenges(req) // vuln-code-snippet hide-line

    const { email, password } = req.body

    if (!validator.isEmail(email)) {
      return res.status(400).send('Invalid email format')
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).send('Invalid password')
    }

    UserModel.findOne({
      where: {
        email: validator.normalizeEmail(email),
        deletedAt: null
      }
    }).then((authenticatedUser) => {
      const user = utils.queryResultToJson(authenticatedUser)
      if (user.data?.id && user.data.totpSecret !== '') {
        res.status(401).json({
          status: 'totp_token_required',
          data: {
            tmpToken: security.authorize({
              userId: user.data.id,
              type: 'password_valid_needs_second_factor_token'
            })
          }
        })
      } else if (user.data?.id) {
        // @ts-expect-error FIXME some properties missing in user - vuln-code-snippet hide-line
        afterLogin(user, res, next)
      } else {
        // Log failed login attempt
        loginMonitor.logFailedLogin(email, req.ip)
        res.status(401).send(res.__('Invalid email or password.'))
      }
    }).catch((error: Error) => {
      next(error)
    })
  }

  function verifyPreLoginChallenges (req: Request) {
    // [existing code]
  }

  function verifyPostLoginChallenges (user: { data: User }) {
    // [existing code]
  }
}
// vuln-code-snippet end loginAdminChallenge loginBenderChallenge loginJimChallenge
