import React from 'react'

const Recommend = (props) => {
  const books = props.books
  const user=props.user
  console.log(user)
  if(!props.show){
      return null
  }
  const booksToShow=books.filter(a=>a.genres.includes(user.favoriteGenre))
  return(
      <div>
        <h2>recommendations</h2>
          <p>books in your favorite genre '{user.favoriteGenre}'</p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {booksToShow.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

  )
}
export default Recommend