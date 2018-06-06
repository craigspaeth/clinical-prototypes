const Koa = require('koa')
const app = new Koa()
const request = require('superagent')
const router = require('koa-route')
const jsforce = require('jsforce')

const {
  CLINIKO_API_KEY,
  SALESFORCE_LOGIN_URL,
  SALESFORCE_PASSWORD
} = process.env
const salesforce = new jsforce.Connection()

const clinikoAddnote = router.get('/cliniko/clinikoAddnote', async ctx => {
  const res = await request
    .post('https://api.cliniko.com/v1/treatment_notes')
    .auth(CLINIKO_API_KEY, '')
    .set('Accept', 'application/json')
    .set('User-Agent', 'PROTOTYPE (craigspaeth@gmail.com)')
    .send({
      draft: true,
      title: 'Simple',
      patient_id: 49628460,
      treatment_note_template_id: 143903,
      content: {
        sections: [
          {
            name: 'Note',
            questions: [
              {
                name: 'Note',
                type: 'text',
                answer: 'Hello World'
              }
            ]
          }
        ]
      }
    })
  ctx.body = res.body
})

const clinikoPatients = router.get('/cliniko/patients', async ctx => {
  const res = await request
    .get('https://api.cliniko.com/v1/patients')
    .auth(CLINIKO_API_KEY, '')
    .set('Accept', 'application/json')
    .set('User-Agent', 'PROTOTYPE (craigspaeth@gmail.com)')
  const patients = res.body.patients
  ctx.body = patients
    .map(patient => {
      return `<h2>${patient.first_name}</h2>`
    })
    .join('')
})

const salesforcePatients = router.get('/salesforce/patients', async ctx => {
  const { records: patients } = await salesforce.query(
    'SELECT Id, Name FROM Contact LIMIT 100'
  )
  ctx.body = patients
    .map(patient => {
      return `<h2>${patient.Name}</h2>`
    })
    .join('')
})

const init = async () => {
  await salesforce.login(SALESFORCE_LOGIN_URL, SALESFORCE_PASSWORD)
  app.listen(3000)
  console.log('Listening on 3000')
}

app.use(clinikoAddnote)
app.use(clinikoPatients)
app.use(salesforcePatients)
init().catch(console.error.bind(console))
