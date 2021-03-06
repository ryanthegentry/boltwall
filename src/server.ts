import express, { Response, Request, NextFunction } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

const { boltwall, TIME_CAVEAT_CONFIGS } = require('./index')

const app: express.Application = express()

// Required middleware - These must be used in any boltwall project
app.use(cors())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use((req: Request, _res: Response, next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.log(`${req.method} ${req.path}`)
  next()
})

// This route is before the boltwall and will not require payment
app.get('/', (_req, res: express.Response) => {
  res.json({ message: 'success!' })
  return
})

/**
 * Boltwall accepts a config object as an argument.
 * With this configuration object, the server/api admin
 * can setup custom caveats for restricting access to protected content
 * For example, in this config, we have a time based caveat, where each
 * satoshi of payment allows access for 1 second. caveatVerifier uses
 * the available time based caveat verifier, however this can also be customized.
 * getInvoiceDescription allows the admin to generate custom descriptions in the
 * lightning invoice
 */

app.use(boltwall(TIME_CAVEAT_CONFIGS))

/******
Any middleware our route passed after this point will be protected and require
payment
******/
export const protectedRoute = '/protected'
app.get(protectedRoute, (_req, res: express.Response) =>
  res.json({
    message:
      'Protected route! This message will only be returned if an invoice has been paid',
  })
)

app.set('port', process.env.PORT || 5000)

app.listen(app.get('port'), () => {
  //eslint-disable-next-line
  console.log(`listening on port ${app.get('port')}!`)
})
