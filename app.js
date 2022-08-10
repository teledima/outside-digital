const express = require('express')
const swaggerUI = require('swagger-ui-express')
const swaggerDocument = require('swagger-jsdoc')
const passport = require('passport')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cors = require('cors')


const jwtStrategy =  require('./authentication/jwt_strategy')
const routes = require('./routes')
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Digital ocean (test)',
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
    apis: ['./routes/*.js'],
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

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'))
}

app.get('/swagger.json', (_req, res) => res.json(apiSpec));
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(null, { swaggerOptions: { url: '/swagger.json' } }))
app.use('/', routes)

app.listen(8080, 'localhost', () => {
    console.log('listen to http://localhost:8080')
})

module.exports = app
