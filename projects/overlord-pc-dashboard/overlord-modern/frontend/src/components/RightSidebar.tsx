import AgentZeroChat from './AgentZeroChat';
import VibeCoder from './VibeCoder';

export default function RightSidebar() { 
   return ( 
     <aside className="right-sidebar"> 
       <VibeCoder />
       <AgentZeroChat />
       <div className="sidebar-section"> 
         <div className="sidebar-section-label">TRENDING</div> 
         <p>#btc</p> 
         <p>#ai-art</p> 
         <p>#retro-gaming</p> 
       </div> 
     </aside> 
   ); 
 }