// A minimal DOM test double for adapter behaviour. It does not simulate layout,
// native focus trapping or browser rendering; see README's real-browser checks.
export class Element {
  constructor(tag) { this.tag=tag; this.children=[]; this.textContent=''; this.checked=false; this.events={}; this.attrs={}; this.style={}; this.offsetWidth=300; this.offsetHeight=100; this.classes=new Set(); this.classList={toggle:(key,on)=>on?this.classes.add(key):this.classes.delete(key)}; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(fragment) { this.children=[...fragment.children]; }
  addEventListener(type,fn) { (this.events[type]??=[]).push(fn); }
  fire(type,event={}) { for(const fn of this.events[type]??[]) fn({target:this,...event}); }
  setAttribute(key,value) { this.attrs[key]=value; }
  removeAttribute(key) { delete this.attrs[key]; }
  contains(node) { return this===node||this.children.some(child=>child.contains(node)); }
  getBoundingClientRect() { return this.rect??{left:20,top:40,right:320,bottom:140,height:100}; }
  showModal() { this.open=true; }
  close() { this.open=false;this.fire('close'); }
  focus() { this.focused=true; }
  get text() { return this.textContent+this.children.map(child=>child.text).join(''); }
}
export function fixture(html, href = 'https://khod.example/index.html') {
  const elements={};
  for(const match of html.matchAll(/<(\w+)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
    const node=new Element(match[1]);const tag=match[0];node.value=tag.match(/\bvalue="([^"]+)"/)?.[1];node.name=tag.match(/\bname="([^"]+)"/)?.[1];node.type=tag.match(/\btype="([^"]+)"/)?.[1];node.checked=/\bchecked\b/.test(tag);node.hidden=/\bhidden\b/.test(tag);elements[match[2]]=node;
  }
  const document={activeElement:null,events:{},getElementById:id=>elements[id],createElement:tag=>new Element(tag),createDocumentFragment:()=>new Element('fragment'),createTextNode:text=>{if(typeof text!=='string')throw Error('Missing text');const node=new Element('text');node.textContent=text;return node;},addEventListener(type,fn){(this.events[type]??=[]).push(fn);},fire(type,event){for(const fn of this.events[type]??[])fn(event);}};
  const window={innerWidth:1000,innerHeight:800,events:{},addEventListener(type,fn){(this.events[type]??=[]).push(fn);},fire(type){for(const fn of this.events[type]??[])fn();}};
  let sequence = 0;
  window.crypto = { randomUUID: () => 'entry-' + (++sequence) };
  window.location = new URL(href);
  const entries = [{ url: href, state: null }];
  let index = 0;
  window.history = {
    get state() { return entries[index].state; },
    get length() { return entries.length; },
    replaceState(state, unused, url) { entries[index] = { state, url }; window.location = new URL(url); },
    pushState(state, unused, url) { entries.splice(++index); entries.push({ state, url }); window.location = new URL(url); },
    back() { if (index) { index--; window.location = new URL(entries[index].url); window.fire('popstate'); } },
    forward() { if (index + 1 < entries.length) { index++; window.location = new URL(entries[index].url); window.fire('popstate'); } }
  };
  function choose(id){const node=elements[id];if(node.type==='radio')for(const other of Object.values(elements))if(other.name===node.name)other.checked=false;node.checked=true;node.fire('change');}
  return {elements,document,window,choose};
}
export function descendants(node,tag){return(node.tag===tag?[node]:[]).concat(node.children.flatMap(child=>descendants(child,tag)));}
