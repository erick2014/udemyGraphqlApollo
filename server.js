const express = require('express')
const expressGraphQL = require('express-graphql')
const schema = require('./schema/schema')

const app = express();

app.use('/graphql', expressGraphQL({
    graphiql: true,
    schema: schema
}))

app.get("/", (req, res) => {
    res.send("okay man");
})

app.listen(4000, () => {
    console.log('Listening')
})
