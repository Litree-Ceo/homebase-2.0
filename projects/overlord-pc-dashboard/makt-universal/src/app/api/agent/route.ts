import { routeAgent } from '@/lib/agentRouter'; 
 import { NextRequest, NextResponse } from 'next/server'; 
 
 export async function POST(req: NextRequest) { 
   const { prompt, userId } = await req.json(); 
   const result = await routeAgent(prompt, userId); 
   return NextResponse.json(result); 
 }