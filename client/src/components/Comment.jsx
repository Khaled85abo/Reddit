import { IconBtn } from "./IconBtn";
import {FaHeart, FaReply, FaTrash, FaEdit, FaRegHeart} from 'react-icons/fa'
import { usePostContext } from "../context/PostContext";
import { CommentList } from "./CommentList";
import { useState } from "react";
import { CommentForm } from "./CommentForm";
import { useAsyncFn } from "../hooks/useAsync";
import { createComment, deleteComment, toggleCommentLike, updateComment } from "../services/comments";
import { useUser } from "../hooks/useUser";
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short'
})
export function Comment({ id, message, user, createdAt, likeCount, likedByMe }) {
  const currentUser = useUser()
  const {getReplies, createLocalComment, post, updateLocalComment, deleteLocalComment, toggleLocalCommentLike} = usePostContext()
  const {loading, error, execute} = useAsyncFn(createComment)
  const updateCommentFn = useAsyncFn(updateComment)
  const deleteCommentFn = useAsyncFn(deleteComment)
  const toggleCommentFn = useAsyncFn(toggleCommentLike)
  const childComments = getReplies(id)
  const [areChildrenHidden, setAreChildrenHidden] = useState(false)
  const [isReplying, setIsRepling] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  function onCommentReply(message){
    execute({postId: post.id, message, parentId: id}).then(comment =>  {
      setIsRepling(false)
      createLocalComment(comment)})
  }

function onCommentUpdate(message){
  return updateCommentFn
  .execute({postId: post.id, message, id})
  .then(comment => {
    setIsEditing(false)
    updateLocalComment({id, message: comment.message})
  })
}

function onCommentDelet(){
  return deleteCommentFn
  .execute({postId: post.id, id})
  .then(data => {
    console.log('deleted comment id: ', data)
     deleteLocalComment(data.id)
  })
}

function onLikeToggle(){
return toggleCommentFn.execute({postId: post.id, id})
.then(res => {
  toggleLocalCommentLike(id ,res.addedLike)
})
}
  return <>
  <div className="comment">
    <div className="header">
      <span className="name">{user.name}</span>
      <span className="date">{dateFormatter.format(Date.parse(createdAt))}</span>
    </div>
    {isEditing ? (
      <CommentForm  autoFocus initialValue={message} onSubmit={onCommentUpdate} loading={updateCommentFn.loading} error={updateCommentFn.error} />
    ): <div className="message">
      {message}
    </div>}
    
    <div className="footer">
      <IconBtn disable={toggleCommentFn.loading.toString()} Icon={likedByMe ?  FaHeart : FaRegHeart} aria-label={likedByMe ? "Unlike" : "like"} onClick={onLikeToggle}>
        {likeCount}
      </IconBtn>
      {user.id == currentUser.id && (
        <>
          <IconBtn Icon={FaReply} aria-label={isReplying ? "Cancel Reply": "Reply"} onClick={() => setIsRepling(pre => !pre)} isActive={isReplying} />
          <IconBtn Icon={FaEdit} aria-label={isEditing ? "Cancel Edit": "Edit"} onClick={() => setIsEditing(pre => !pre)} isActive={isEditing}/>
          <IconBtn Icon={FaTrash} aria-label="Delete" color="danger" disable={deleteCommentFn.loading.toString()}  onClick={onCommentDelet} />
        </>
      )}
    </div>
    {deleteCommentFn.error && (
      <div className="error-msg mt-1">{deleteCommentFn.error}</div>
    )}
  </div>
  {isReplying && (
    <div className="mt-1 ml-3">
      <CommentForm autoFocus onSubmit={onCommentReply} loading={loading} error={error} />
    </div>
  )}
  {childComments?.length > 0 && (
    <>
    <div className={`nested-comments-stack ${areChildrenHidden ? 'hide': ''}`}>
      <button className="collapse-line" aria-label="Hide Replies" onClick={() => setAreChildrenHidden(true)} />
      <div className="neted-comments">
        <CommentList comments={childComments} />
      </div>
    </div>
    <button className={`btn mt-1 ${!areChildrenHidden  ? 'hide': ''}`} onClick={() =>  setAreChildrenHidden(false)}></button>
    </>
  )}
  </>;
}
