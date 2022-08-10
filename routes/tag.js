const express = require('express')
const passport = require('passport')
const { tagSchema, tagSchemaOptional } = require('../schemas')
const { tagModel } = require('../utils')

const router = express.Router()
router.use(passport.authenticate('jwt', {session: false, failureRedirect: '/refresh'}))

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

router.get('/:id', async(req, res) => {
    const tag = await tagModel.getTag(req.params.id)

    if (tag) {
        res.status(200).json(tag)
    } else {
        res.sendStatus(404)
    }
})

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
