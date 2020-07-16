import { gql } from '@apollo/client'
const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    id
    title
    published
    genres
    author {
      name 
      bookCount
    }
  }
`
 export const allAuthors = gql`
  query {
    allAuthors  {
      name,
      born,
      bookCount,
      id
    }
  }
`
export const allBooks = gql`
query {
  allBooks  {
    ...BookDetails
  }
}
${BOOK_DETAILS}
`
export const user= gql`
query {
  me{
    username,
    favoriteGenre,
    id
  }
}`
export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`
export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  
${BOOK_DETAILS}
`
