import { usePostContext } from "../context/PostContext"
import {  useAsyncFn } from "../hooks/useAsync"
import { createComment } from "../services/comments"
import { CommentForm } from "./CommentForm"
import { CommentList } from "./CommentList"
export default function Post(){
// const {loading, error, value: post } = usePostContext()
const { post, rootComments, createLocalComment } = usePostContext()
const {loading, error, execute:createCommentFn } = useAsyncFn(createComment)

function onCommentCreate(message){
    return createCommentFn({postId: post.id, message}).then(comment => {
        createLocalComment(comment)
    })
}
    // if(error) return (<h4>{error}</h4>)
    // if(loading) return (<h3>Loading...</h3>)
    return (
        <>
        <h1>{post.title}</h1>
        <article>{post.body}</article>
        <h3 className="comments-title">Comments</h3>
        <section>
            <CommentForm loading={loading} error={error} onSubmit={onCommentCreate} />
            {rootComments !=null && rootComments.length > 0 && (
                <div>
                    <CommentList comments={rootComments} />
                </div>
            )}
        </section>
        {/* <div>
            {post.comments.map(comment => {
                return (
                    <div key={comment.id}>
                        {comment.message}
                    </div>
                )
            })}
        </div> */}
        </>
    )
}