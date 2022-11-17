import { usePostContext } from "../context/PostContext"
export default function Post(){
const {loading, error, value: post } = usePostContext()
// const { post } = usePostContext()


    if(error) return (<h4>{error}</h4>)
    if(loading) return (<h3>Loading...</h3>)
    return (
        <>
        <h1>Singel Post</h1>
        <h3>{post.title}</h3>
        <p>{post.body}</p>
        <div>
            {post.comments.map(comment => {
                return (
                    <div key={comment.id}>
                        {comment.message}
                    </div>
                )
            })}
        </div>
        </>
    )
}