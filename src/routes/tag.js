const express = require('express')
const passport = require('passport')
const { tagSchema, tagSchemaOptional } = require('../schemas')
const { tagModel } = require('../utils')

const router = express.Router()
router.use(passport.authenticate('jwt', {session: false, failureRedirect: '/refresh'}))

/**
 * @swagger
 * /tag/:
 *   post:
 *     summary: Create new tag
 *     tags: [Tag]
 *     security:
 *     - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tag successfull created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NewTag'
 *       400:
 *         description: Error while body validation
 *       401:
 *         description: Missing authorization token
 *       500:
 *         description: Other errors
 */
router.post('/', async(req, res) => {
    const result = tagSchema.validate(req.body)

    if (result.error) {
        res.status(400).send(result.error.message)
    } else {
        const tag = await tagModel.addTag(result.value, req.user.uid)
        if (tag.tag) {
            res.status(200).json(tag)
        } else {
            res.status(500).send(tag.error)
        }
    }
})

/**
 * @swagger
 * /tag/{id}:
 *   get:
 *     summary: Get data about specific tag
 *     tags: [Tag]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       description: Tag id
 *       required: true
 *     responses:
 *       200:
 *         description: Tag successfull fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       401:
 *         description: Missing authorization token
 *       404:
 *         description: Tag don't exist
 */
router.get('/:id', async(req, res) => {
    const tag = await tagModel.getTag(req.params.id)

    if (tag) {
        res.status(200).json(tag)
    } else {
        res.sendStatus(404)
    }
})

/**
 * @swagger
 * /tag/:
 *   get:
 *     summary: Get all tags
 *     tags: [Tag]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: sortByOrder
 *       in: query
 *       description: Use order in sort
 *     - name: sortByName
 *       in: query
 *       description: User name in sort
 *     - name: offset
 *       in: query
 *       schema:
 *         type: integer
 *         default: 0
 *     - name: length
 *       in: query
 *       description: Length of result
 *       schema:
 *         type: integer
 *         default: 10
 *     responses:
 *       200:
 *         description: Rows successfull fetched
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     offset:
 *                       type: integer
 *                     length:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *       401:
 *         description: Missing authorization token
 */
router.get('/', async(req, res) => {
    const queryParams = req.query

    const tags = await tagModel.getAllTags({
        sortByOrder: 'sortByOrder' in queryParams,
        sortByName: 'sortByName' in queryParams,
        offset: queryParams.offset,
        length: queryParams.length
    })
    res.status(200).json(tags)
})


/**
 * @swagger
 * /tag/{id}:
 *   put:
 *     summary: Update tag
 *     tags: [Tag]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tag successfull updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Error while body validation
 *       401:
 *         description: Missing authorization token
 *       404:
 *         description: Tag don't exist or you don't have permission for update
 *             
 */
router.put('/:id', async(req, res) => {
    const result = tagSchemaOptional.validate(req.body)
    if (result.error) {
        res.status(400).send(result.error.message)
    } else {
        const tag = await tagModel.updateTag(req.params.id, req.body.name, req.body.sortOrder, req.user.uid)

        if (tag) {
            if (!tag.error) {
                res.status(200).json(tag)
            } else if (!!tag.error) {
                res.status(400).send(tag)
            }
        } else {
            res.sendStatus(404)
        }
    }
})

/**
 * @swagger
 * /tag/{id}:
 *   delete:
 *     summary: Delete tag
 *     tags: [Tag]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       type: integer
 *     responses:
 *       204:
 *         description: Tag successfull deleted
 *       401:
 *         description: Missing authorization token
 *       404:
 *         description: Tag doesn't exist or you don't have permission for delete
 *       500:
 *         description: Other errors
 */
router.delete('/:id', async(req, res) => {
    const deleteRes = await tagModel.deleteTag(req.params.id, req.user.uid)

    if (deleteRes.count > 0) {
        res.sendStatus(204)
    } else if (deleteRes.count === 0) {
        res.sendStatus(404)
    } else {
        res.status(500).send(deleteRes.error)
    }
})

module.exports = router
