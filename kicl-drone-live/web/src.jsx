import React,{useEffect,useRef,useState} from 'react';
import{createRoot}from'react-dom/client';
import Hls from'hls.js';
import './style.css';
function App(){
 const[user,setUser]=useState(''),[pass,setPass]=useState(''),[auth,setAuth]=useState(''),[streams,setStreams]=useState([]),[selected,setSelected]=useState(''),[error,setError]=useState(''),[phase,setPhase]=useState('Offline');
 const video=useRef(null);
 async function refresh(token=auth){if(!token)return;try{const r=await fetch('/api/streams',{headers:{Authorization:token},cache:'no-store'});if(!r.ok)throw Error('Session expired');const data=await r.json();setStreams(data.streams);setSelected(s=>s||data.streams[0]?.name||'')}catch(e){setError(e.message)}}
 async function login(e){e.preventDefault();const token='Basic '+btoa(user+':'+pass);try{const r=await fetch('/api/streams',{headers:{Authorization:token}});if(!r.ok)throw Error('Login failed');const data=await r.json();setAuth(token);setStreams(data.streams);setSelected(data.streams[0]?.name||'');setError('')}catch(e){setError(e.message)}}
 useEffect(()=>{if(!auth)return;const id=setInterval(()=>refresh(auth),10000);return()=>clearInterval(id)},[auth]);
 useEffect(()=>{if(!auth||!selected||!video.current)return;let hls;const el=video.current;setPhase('Connecting');setError('');
 const url='/api/hls/'+encodeURIComponent(selected)+'/index.m3u8';
 if(Hls.isSupported()){hls=new Hls({xhrSetup:x=>x.setRequestHeader('Authorization',auth),liveSyncDurationCount:3});hls.loadSource(url);hls.attachMedia(el);hls.on(Hls.Events.MANIFEST_PARSED,()=>{setPhase('Live');el.play().catch(()=>{})});hls.on(Hls.Events.ERROR,(_,d)=>{if(d.fatal){setPhase('Offline');setError('Stream unavailable; verify drone publisher and retry by changing feeds.')}})}
 else {setPhase('Unsupported');setError('This browser needs a compatible authenticated HLS player. Use Chrome or Firefox for this release.')}
 return()=>{hls?.destroy();el.removeAttribute('src');el.load()}},[auth,selected]);
 const current=streams.find(s=>s.name===selected);
 return <main><header><div className="logo">KICL</div><div><strong>DRONE LIVE SURVEILLANCE</strong><small>Kothari Industrial Corporation Limited</small></div></header>
 {!auth?<section className="panel"><h2>Viewer Login</h2><p>Authorized personnel only</p><form onSubmit={login}><input required value={user} onChange={e=>setUser(e.target.value)} placeholder="Username" autoComplete="username"/><input required value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" autoComplete="current-password"/><button>Sign in</button></form></section>:
 <><section className="stats"><div><small>Configured feeds</small><b>{streams.length}</b></div><div><small>Feeds online</small><b>{streams.filter(s=>s.online).length}</b></div><div><small>Selected feed</small><b>{current?.online?'LIVE':'OFFLINE'}</b></div></section>
 <div className="toolbar"><label>Drone feed <select value={selected} onChange={e=>setSelected(e.target.value)}>{streams.map(s=><option key={s.name} value={s.name}>{s.name} — {s.online?'Online':'Offline'}</option>)}</select></label><div><button onClick={()=>refresh()}>Refresh</button> <button className="secondary" onClick={()=>{setAuth('');setPass('');setError('');setSelected('')}}>Sign out</button></div></div>
 <section className="player"><video ref={video} controls autoPlay muted playsInline/></section><div className="footrow"><span>{phase} · {selected}</span><span>Encrypted viewer connection when HTTPS deployed</span></div><p>HLS playback introduces several seconds of delay. Recording is retained on the server for up to 7 days; a recording browser is not included yet.</p></>}
 {error&&<p role="alert" className="error">{error}</p>}<footer>© Kothari Industrial Corporation Limited · Drone operations platform</footer></main>}
createRoot(document.getElementById('root')).render(<App/>);
