export default function TopNav() { 
   return ( 
     <nav className="topnav"> 
       <div className="topnav-logo">🏠 LitreelabStudio</div> 
       <div className="topnav-search"> 
         <input placeholder="🔍 Search LitreelabStudio..." /> 
       </div> 
       <div className="topnav-actions"> 
         <button className="nav-btn">🔔</button> 
         <button className="nav-btn">💬</button> 
         <div className="avatar">L</div> 
       </div> 
     </nav> 
   ); 
 }