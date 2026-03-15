import { useState } from "react"; 
 export default function PostCreator({ onPost }: { onPost: (c: string) => void }) { 
   const [text, setText] = useState(""); 
   return ( 
     <div className="post-creator"> 
       <div className="post-creator-top"> 
         <div className="avatar">L</div> 
         <input className="post-input" placeholder="What's on your mind, Larry?" 
           value={text} onChange={(e) => setText(e.target.value)} 
           onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { onPost(text.trim()); setText(""); } }} /> 
       </div> 
       <div className="post-creator-actions"> 
         <button className="post-action-btn">📷 Photo</button> 
         <button className="post-action-btn">🎬 Video</button> 
         <button className="post-action-btn">🎨 AI Generate</button> 
         <button className="post-submit" onClick={() => { if (text.trim()) { onPost(text.trim()); setText(""); } }}>Post</button> 
       </div> 
     </div> 
   ); 
 }