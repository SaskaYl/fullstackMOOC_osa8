import React, {useState,useEffect} from 'react'

const Books = (props) => {
  const books = props.books
 const [genre, setGenre]=useState('all')
 const[booksToShow, setBooksToShow]=useState(books)
 useEffect(()=>{
  if(genre!=='all'){
    setBooksToShow(books.filter(a=>a.genres.includes(genre)))
  }
  else{
    setBooksToShow(books)
  }
},[books, genre])
 if (!props.show) {
    return null
  }
const genrelist=books.map(x =>x.genres.find(b=>b))
console.log(genrelist)
const uniq=[...new Set(genrelist),'all']

  return (
    <div>
      <h2>books</h2>
<p>in genre {genre}</p>
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
      {uniq.map(g=><button key={g} value={g} onClick={({target})=>setGenre(target.value)}>{g}</button>)}
    </div>
  )
}

export default Books