import React, { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $publishedInt: Int, $genres: [String!]) {
    addBook(
      title: $title,
      author: $author,
      published: $publishedInt,
      genres: $genres
    ) {
      title
      id
      published
      genres
      author{name, id, bookCount, born}
    }
  }
`
const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuhtor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const [ createBook ] = useMutation(CREATE_BOOK, {
    onError: (error) => {
      props.setError(error.graphQLErrors[0].message)
    },
    update:(store, response) =>{
      props.update(response.data.addBook)

    }
})

  if (!props.show) {
    return null
  }
  const submit = async (event) => {
    event.preventDefault()
    var publishedInt=parseInt(published)
    createBook({  variables: { title, author, publishedInt, genres } })
    console.log('add book...')

    setTitle('')
    setPublished('')
    setAuhtor('')
    setGenres([])
    setGenre('')
    props.setPage('books')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuhtor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">add genre</button>
        </div>
        <div>
          genres: {genres.join(' ')}
        </div>
        <button type='submit'>create book</button>
      </form>
    </div>
  )
}

export default NewBook