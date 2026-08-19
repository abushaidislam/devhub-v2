import {ImageResponse} from "next/og";
export const runtime="edge";
export const alt="DevHub — Developer tools, engineered for speed";
export const size={width:1200,height:630};
export const contentType="image/png";
export default function Image(){return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",background:"#000",color:"#fff",padding:"72px",fontFamily:"Arial"}}><div style={{display:"flex",alignItems:"center",fontSize:28,fontWeight:600}}><div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(180deg,#f6f6f6,#c6c6c6)",display:"flex",alignItems:"center",justifyContent:"center",marginRight:10,fontSize:18,color:"#000",fontWeight:700}}>D.</div>DevHub</div><div><div style={{fontSize:80,fontWeight:700,letterSpacing:"-4px",lineHeight:1}}>Developer tools,<br/><span style={{color:"#777"}}>engineered for speed.</span></div><div style={{marginTop:32,fontSize:24,color:"#aaa"}}>Private. Keyboard-first. Built for focused work.</div></div></div>,size)}
