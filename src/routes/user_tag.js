const express = require('express')
const passport = require('passport')
const { userTagModel } = require('../utils')

const router = express.Router()
router.use(passport.authenticate('jwt', { session: false, failureRedirect: '/refresh' }))

/**
 * @swagger
 * /user/tag/my:
 *   get:
 *     summary: Get your tags
 *     tags: [UserTag]
 *     security: 
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfull fetch tags
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NewTag'
 *       401:
 *         description: Missing authorization token
 */
router.get('/my', async(req, res) => {
    const tags = await userTagModel.getTags(req.user.uid)
    res.status(200).json({ tags })
})

/**
 * @swagger
 * /user/tag/:
 *   post:
 *     summary: Attach tag
 *     tags: [UserTag]
 *     security:
 *     - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Tags successfull added
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 tags:
 *                   type: array
 *                   items: 
 *                     $ref: '#/components/schemas/NewTag'
 *       400:
 *         description: Empty array
 *       401:
 *         description: Missing authorization token
 */
router.post('/', async(req, res) => {
    if (!req.body.tags) {
        res.sendStatus(400)
    } else {
        const tags = await userTagModel.addUserTags(req.body.tags, req.user.uid)
        res.status(200).json({ tags })
    }
})

/**
 * @swagger
 * /user/tag/{id}:
 *   delete:
 *     summary: Unpin tag
 *     tags: [UserTag]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       type: integer
 *       required: true
 *     responses:
 *       200:
 *         description: Tag successfull deleted
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NewTag'
 *       400:
 *         description: Id doesn't passed
 *       401:
 *         description: Missing authorization token
 */
router.delete('/:id', async(req, res) => {
    if (!!Number(req.params.id)) {
        const tags = await userTagModel.deleteUserTag(Number(req.params.id), req.user.uid)
        res.status(200).json({ tags })
    } else {
        res.sendStatus(400)
    }
})

module.exports = router
