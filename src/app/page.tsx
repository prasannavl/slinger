'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntentCard } from '@/components/IntentCard';
import { demoRegistry, demoAddressBook, defaultConfig } from '@/lib/demo';
import { useDebounce } from 'react-use';

type Msg = { id: string; role: 'user'|'assistant'; text?: string; intent?: any; result?: any; pending?: boolean };

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('Give me SOL predictions');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ const el=listRef.current; if(el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); }, [messages.length]);

  async function handleSend(){
    const trimmed = text.trim();
    if(!trimmed || busy) return;
    const id = Math.random().toString(36).slice(2);
    setMessages(m=>[...m, { id, role:'user', text: trimmed }, { id: id+'-typing', role:'assistant', pending: true }]);
    setText(''); setBusy(true);
    try{
      const intentRes = await fetch('/api/intent', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ text: trimmed, defaults: { registry: demoRegistry } }) });
      const { intent } = await intentRes.json();
      const planRes = await fetch('/api/plan', {
        method:'POST', headers:{ 'content-type':'application/json' },
        body: JSON.stringify({ intent, registry: demoRegistry, addressBook: demoAddressBook, config: defaultConfig })
      });
      const result = await planRes.json();
      setMessages(m=>m.filter(x=>x.id!==id+'-typing').concat({ id: id+'-a', role:'assistant', intent, result }));
    }catch(e:any){
      setMessages(m=>m.filter(x=>x.id!==id+'-typing').concat({ id: id+'-err', role:'assistant', text: `Error: ${e?.message ?? e}` }));
    }finally{ setBusy(false); }
  }

  const [debouncedBusy, setDebouncedBusy] = useState(busy);
  useDebounce(()=>setDebouncedBusy(busy), 150, [busy]);

  return (
    <div className="container">
      <div className="chat" ref={listRef}>
        <div className="chips">
          <span className="chip">BTC</span><span className="chip">SOL</span><span className="chip">cUSD</span><span className="chip">CELO</span>
        </div>
        <div className="msglist">
          <AnimatePresence initial={false}>
            {messages.map(m=>(
              <motion.div key={m.id} className="msg"
                initial={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, height:0, margin:0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}>
                <div className="avatar">{m.role==='user'?'U':'A'}</div>
                <div className={`bubble ${m.role==='user'?'user':''}`}>
                  {m.pending && <div className="typing"><span className="dot"/><span className="dot"/><span className="dot"/></div>}
                  {!m.pending && m.text && <div>{m.text}</div>}
                  {!m.pending && m.intent &&
                    <motion.div initial={{ opacity:0, scale:.98 }} animate={{ opacity:1, scale:1 }} transition={{ duration: .2 }} style={{ marginTop: 6 }}>
                      <IntentCard message={{ intent: m.intent, result: m.result }} />
                    </motion.div>
                  }
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="composer-wrap">
        <div className="composer">
          <textarea className="input" rows={1} placeholder='Ask an intent… e.g. "Swap 2 CELO to cUSD"'
            value={text} onChange={e=>setText(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSend(); } }} />
          <button className="button" onClick={handleSend} disabled={busy}>{debouncedBusy?'Thinking…':'Send'}</button>
        </div>
      </div>
    </div>
  );
}
