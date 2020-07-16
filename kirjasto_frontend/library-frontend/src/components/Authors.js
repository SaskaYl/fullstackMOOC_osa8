  
import React, {useState} from 'react'
import { gql, useMutation } from '@apollo/client'
import {allAuthors} from '../queries'
const EDIT_AUTHOR=gql`
mutation editAuthor($name: String!, $setBornTo: Int!){
  editAuthor(
    name: $name,
    setBornTo: $setBornTo
    ){
      name,
      born,
      id,
      bookCount
    }
  }
`
const Authors = (props) => {
 const [name, setName]=useState('')
 const [born, setBorn]=useState('')
 const [editAuthor]=useMutation(EDIT_AUTHOR, {refetchQueries: [ { query: allAuthors } ], onError: (error) => {
  props.setError(error.graphQLErrors[0].message)
}})
  if (!props.show) {
    return null
  }
  const authors = props.authors

const submit=async(event)=>{
  //event.PreventDefault()

var setBornTo=parseInt(born)
console.log(setBornTo)
await editAuthor({variables: { name, setBornTo }})

setName('')
setBorn('')
}
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
<h3>set birthyear</h3>
<div>
<form onSubmit={submit}>
        <div>
          name
          <select
          name='choose'
            value={name}
            onChange={({ target }) => setName(target.value)}>
              <option label='select...'></option>
              {authors.map(a=><option key={a.id}>{a.name}</option>)}
         </select>
        </div>
        <div>
          born
          <input type='number'
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type='submit'>update author</button>
        </form>
        </div>
    </div>
  )
}

export default Authors
