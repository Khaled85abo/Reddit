import { useAsync } from "../hooks/useAsync";
import { getPosts } from "../services/posts";
import {Link} from 'react-router-dom'
export function PostList() {
const {loading, value: posts, error} =useAsync(getPosts)

if(error) return <h3>Error fetching posts: {error}</h3>
if(loading) return <h3>Loading...</h3>

  return (
  <>
  <h1>{posts.map(post => {
    return (
      <div key={post.id}>

<Link to={`/posts/${post.id}`}>
      <button  >{post.title}</button >
</Link>
      </div>
    )
  })}</h1>
  </>
  );
}
