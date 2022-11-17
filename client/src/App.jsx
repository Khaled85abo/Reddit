import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { PostList } from './components/PostLists'
import {Route, Routes} from 'react-router-dom'
import Post from './components/Post'
import PostContextProvider from './context/PostContext'
function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
    <Routes>
      <Route path="/posts" element={<PostList />} />
      <Route path="/posts/:id" element={
        <PostContextProvider>
          <Post />
        </PostContextProvider>
      } />
    </Routes>
    </div>
  )
}

export default App
