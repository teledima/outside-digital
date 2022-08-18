const express = require('express')
const swaggerUI = require('swagger-ui-express')
const swaggerDocument = require('swagger-jsdoc')
const passport = require('passport')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cors = require('cors')


const jwtStrategy =  require('./src/authentication/jwt_strategy')
const routes = require('./src/routes')
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Digital outside (test)',
            version: '1.0.0',
        },
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        email: { type: 'string' },
                        password: { type: 'string' },
                        nickname: { type: 'string' }
                    }
                },
                TokenResult: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                        expire: { type: 'int' }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js'],
}
const apiSpec = swaggerDocument(swaggerOptions);

dotenv.config({
    path: `./.${process.env.NODE_ENV}.env`
})

passport.use('jwt', jwtStrategy)

const app = express()
app.use(passport.initialize())
app.use(cors({origin: '*'}))
app.use(express.json())

if (process.env.NODE_ENV === 'dev') {
    app.use(morgan('dev'))
}

app.get('/swagger.json', (_req, res) => res.json(apiSpec));
app.use('/doc', swaggerUI.serve, swaggerUI.setup(null, { swaggerOptions: { url: '/swagger.json' } }))
app.use('/', routes)

app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`listen to http://0.0.0.0:${process.env.PORT}`)
})

module.exports = app
