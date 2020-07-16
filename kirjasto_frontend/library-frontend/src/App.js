
import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/loginForm'
import Recommend from './components/recommend'
import { useQuery, useApolloClient, useSubscription } from '@apollo/client'
import {allAuthors, allBooks, user, BOOK_ADDED} from './queries'

const App = () => {
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [page, setPage] = useState('authors')
  const result=useQuery(allAuthors)
  const resultb=useQuery(allBooks)
  const userData=useQuery(user)
  const client = useApolloClient()
  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log(subscriptionData)
      const addedBook=subscriptionData.data.bookAdded
      window.alert(`A new book '${addedBook.title}' by ${addedBook.author.name} was added`)
      updateCacheWith(addedBook)
    }
  })
  useEffect(()=>{
    const logged= localStorage.getItem('library-user-token')
    if(logged){
      setToken(logged)
    }
  },[])
  if (result.loading|resultb.loading)  {
    return <div>loading...</div>
  }
  console.log(userData)
  const updateCacheWith = (addedBook) => {
    
    const includedIn = (set, object) => 
    set.map(p => p.id).includes(object.id)  
    const dataInStore = client.readQuery({ query: allBooks })
    const dataInStoreAuthors = client.readQuery({ query: allAuthors })
    
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: allBooks,
        data: { allBooks : dataInStore.allBooks.concat(addedBook) }
      })
    }   
     if(!includedIn(dataInStoreAuthors.allAuthors, addedBook.author))
      client.writeQuery({
        query: allAuthors,
        data: {
          ...dataInStoreAuthors,
          allAuthors:[...dataInStoreAuthors.allAuthors, addedBook.author]
      }
      })
     
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }
                    if (!token) {
                      return (
                        <div>
                          <Notify errorMessage={errorMessage} />
                          <h2>Login</h2>
                          <LoginForm
                            setToken={setToken}
                            setError={notify}
                          />
                        </div>
                      )
                    }
  return (
    <div>
      <div>
        <button onClick={() => logout()}>log out</button>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommend')}>recommend</button>

      </div>
      <Notify errorMessage={errorMessage} />
      <Authors
        show={page === 'authors'} authors={result.data.allAuthors}setError={notify}
      />

      <Books
        show={page === 'books'} books={resultb.data.allBooks}
      />

      <NewBook
        show={page === 'add'} setPage={setPage} setError={notify} update={updateCacheWith}
      />
      <Recommend
        show={page === 'recommend'} books={resultb.data.allBooks} user={userData.data.me}
      />

    </div>
  )
}
const Notify = ({errorMessage}) => {
  if ( !errorMessage ) {
    return null
  }
  return (
    <div style={{color: 'red'}}>
      {errorMessage}
    </div>
  )
}

export default App