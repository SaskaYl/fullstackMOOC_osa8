const { ApolloServer,UserInputError, AuthenticationError, gql } = require('apollo-server')
const { argsToArgsConfig } = require('graphql/type/definition')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author= require('./models/author')
const User=require('./models/user')
const jwt = require('jsonwebtoken')
const { PubSub } = require('apollo-server')
const pubsub = new PubSub()
mongoose.set('useFindAndModify', false)

const MONGODB_URI = 'mongodb+srv://saskator:mongoli@cluster0-wvteo.mongodb.net/libraryDB?retryWrites=true&w=majority'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useCreateIndex:true,useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


const typeDefs = gql`
type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }
type Author {
    name: String!
    born: Int 
    bookCount: Int
    id: ID!
  }
type Book {
    title: String!
    published: Int
    author: Author!
    genres: [String]
    id:ID!
}

  type Query {
      bookCount: Int!
      authorCount: Int!
      allAuthors: [Author!]!
      allBooks(author: String, genre:[String]): [Book!]!
      findAuthor(name: String!): Author!
      me: User
  }
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int
      genres: [String!]
    ): Book
    editAuthor(
        name: String!
        setBornTo: Int!
      ): Author
      createUser(
        username: String!
        favoriteGenre: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
      
  }
  type Subscription {
    bookAdded: Book!
  }  
`

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'
const resolvers = {
    Query: {
        bookCount: () => Book.collection.countDocuments(),
        authorCount: () => Author.collection.countDocuments(),
        allAuthors: () => Author.find({}),
        allBooks: async(root, args) => {
            const auth=await Author.findOne({name:args.author})
            if (args.genre && args.author) {
                return Book.find({'author':auth._id, genres:{ $all: args.genre}})
            }
            if (args.genre) {
                return Book.find({genres:{ $all: args.genre}})
            }
            if (args.author) {
                return Book.find({'author':auth._id})
            }
            return Book.find({})
        },
        findAuthor: (root, args) => Author.findOne({name :args.name}),
        me: (root, args, context) => {
            return context.currentUser
          }
    },
    Book:{
        author:async(root)=>{
            console.log('book',root.author)
            const temp= await Author.findOne({_id :root.author})
            console.log(temp)
            return {name: temp.name, born: temp.born, id:temp.id, bookCount:temp.books.length}
        }
    },
    Author: {
        bookCount: async( root) => {
          console.log(root, 'author resolver')
          if(root.hasOwnProperty('bookCount')){
            return root.bookCount
          }
            return root.books.length

        }
    },
    Mutation: {
        addBook: async(root, args, context) => {
            console.log(args.author)
            const currentUser = context.currentUser
            if (!currentUser) {
                throw new AuthenticationError("not authenticated")
              }
            if (!await Author.findOne({name:args.author})) {
                const author= new Author({name:args.author})
                console.log(author)
                try{
                    await author.save()
                }
                catch(error) {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    })
                }
            }
            const auth=await Author.findOne({name:args.author})
            const book = new Book({ ...args, author:auth._id })
            try {
               await book.save()
              } catch (error) {
                throw new UserInputError(error.message, {
                  invalidArgs: args,
                })
              }
              auth.books=auth.books.concat(book._id)
              await auth.save()
              
              console.log(book)
              pubsub.publish('BOOK_ADDED', { bookAdded: book })
            return book
        },
        editAuthor: async(root, args, context) => {
            const currentUser=context.currentUser
            if (!currentUser) {
                throw new AuthenticationError("not authenticated")
              }
            const author = await Author.findOne({name:args.name})
            author.born=args.setBornTo
            try{
                author.save()
            }  catch (error) {
                throw new UserInputError(error.message, {
                  invalidArgs: args,
                })
              }
              return author
        },
        createUser: (root, args) => {
            const user = new User({ username: args.username, favoriteGenre:args.favoriteGenre })
        
            return user.save()
              .catch(error => {
                throw new UserInputError(error.message, {
                  invalidArgs: args,
                })
              })
          },
          login: async (root, args) => {
            const user = await User.findOne({ username: args.username })
        
            if ( !user || args.password !== 'secret' ) {
              throw new UserInputError("wrong credentials")
            }
        
            const userForToken = {
              username: user.username,
              id: user._id,
            }
        
            return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
},
Subscription: {
  bookAdded: {
    subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
  },
},
}
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
          const decodedToken = jwt.verify(
            auth.substring(7), JWT_SECRET
          )
          const currentUser = await User
            .findById(decodedToken.id)
          return { currentUser }
        }
      }
})

server.listen().then(({ url, subscriptionsUrl }) => {
    console.log(`Server ready at ${url}`)
    console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})