const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const { createHash } = require('crypto') 
const { fullUserSchema, emailPassUserSchema } = require('../schemas')
const { getJwtToken, userModel } = require('../utils')

const router = express.Router()

/**
 * @swagger
 * /signup:
 *   post: 
 *     summary: Sign up new user
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              nickname:
 *                type: string
 *     responses:
 *       200:
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResult'
 *       400:
 *         description: Incorrect body
 *       500:
 *         description: Other errors
 */
 router.post('/signup', async(req, res) => {
    const result = fullUserSchema.validate(req.body)
    if (result.error) {
        res.status(400).send(result.error.message)
    } else {
        const user = await userModel.addUser(req.body)
        if (user.user) {
            const tokenResult = getJwtToken(user.user.uid)
            res.status(200).json(tokenResult)
        } else {
            res.status(500).send(user.error)
        }
    }
})

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Account]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email: 
 *                 type: string
 *               password: 
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfull login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResult'
 *       400:
 *         description: Incorrect body
 *       403:
 *         description: No such user or incorrect passwrord
 */
router.post('/login', async(req, res) => {
    const result = emailPassUserSchema.validate(req.body)
    if (result.error) {
        res.status(400).send(result.error.message)
    } else {
        const user = await userModel.getUser({email: req.body.email})
        if (user) {
            if (user.password === createHash('SHA256').update(req.body.password).digest('hex')) {
                const tokenResult = getJwtToken(user.uid)
                res.status(200).json(tokenResult)
            } else {
                res.sendStatus(403)
            }
        } else {
            res.sendStatus(403)
        }
    }
})

/**
 * @swagger
 * /refresh:
 *   get:
 *     summary: Refresh JWT token
 *     tags: [Account]
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfull update token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResult'
 *       401:
 *         description: Missing authorization token
 *       403:
 *         description: No such user
 */
router.get('/refresh', async(req, res) => {
    if (req.headers['authorization']) {
        const payload = jwt.verify(req.headers['authorization'].split(' ')[1], 'secret', { algorithms: ['HS256'], ignoreExpiration: true })

        const user = await userModel.getUser({uid: payload.uid})

        if (user) {
            res.status(200).json(getJwtToken(payload.uid))
        } else {
            res.sendStatus(403)
        }
    } else {
        res.sendStatus(401)
    }
})

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout user
 *     tags: [Account]
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       204:
 *         description: Successfull logout
 *       401:
 *         description: Missing authorization token
 */
router.post('/logout', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.sendStatus(204)
})

module.exports = router
