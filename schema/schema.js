// schmea file communicates all different types of data
// in our application over graphql, how are they all related
const graphql = require('graphql')
const axios = require('axios')

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql

const baseServerUrl = `http://localhost:3000`

// company entity
const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(response => response.data)
                    .catch(err => null)
            }
        }
    })
})

// User entity
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return axios.get(`${baseServerUrl}/companies/${parentValue.companyId}`)
                    .then(response => response.data)
                    .catch(err => null)
            }
        }
    })
})


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                // third party server
                return axios.get(`${baseServerUrl}/users/${args.id}`)
                    .then(response => response.data)
                    .catch(err => null)
            }
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                // third party server
                return axios.get(`${baseServerUrl}/companies/${args.id}`)
                    .then(response => response.data)
                    .catch(err => null)
            }
        }
    }
})

const rootMutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                // not null means, the field is mandatory
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, { firstName, age, companyId }) { // destruct firstName, age from args parameter
                return axios.post(`${baseServerUrl}/users`, { firstName, age, companyId })
                    .then(res => res.data)
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                // not null means, the field is mandatory
                userId: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parentValue, { userId }) {
                return axios.delete(`${baseServerUrl}/users/${userId}`)
                    .then(res => { return { id: userId } })
                    .catch(r0es => null)
            }
        },
        editUser: {
            type: UserType,
            args: {
                // not null means, the field is mandatory
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, { id, firstName, age, companyId }) {
                return axios.patch(`${baseServerUrl}/users/${id}`, { firstName, age, companyId })
                    .then(res => res.data)
                    .catch(res => null)

            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: rootMutation
})
