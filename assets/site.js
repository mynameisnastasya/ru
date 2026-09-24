const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');

const header=$('#header');
const onScroll=()=>header?.classList.toggle('scrolled',scrollY>28);onScroll();addEventListener('scroll',onScroll,{passive:true});

if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.11});$$('.reveal:not(.visible)').forEach(el=>io.observe(el))}else{$$('.reveal').forEach(el=>el.classList.add('visible'))}

const menuBtn=$('#menuBtn'),mobileMenu=$('#mobileMenu');let lastFocus=null;
const menuFocusables=()=>$$('a[href],button:not([disabled])',mobileMenu).filter(el=>!el.hasAttribute('inert'));
function syncMenuLabel(){if(!menuBtn)return;const open=mobileMenu?.classList.contains('open');menuBtn.setAttribute('aria-label',open?(lang==='ru'?'Закрыть меню':'Close menu'):(lang==='ru'?'Открыть меню':'Open menu'))}
function setMenu(open,{restore=true}={}){if(!menuBtn||!mobileMenu)return;if(open){lastFocus=document.activeElement;menuBtn.classList.add('open');menuBtn.setAttribute('aria-expanded','true');mobileMenu.classList.add('open');mobileMenu.setAttribute('aria-hidden','false');mobileMenu.removeAttribute('inert');document.body.style.overflow='hidden';requestAnimationFrame(()=>menuFocusables()[0]?.focus())}else{menuBtn.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');mobileMenu.classList.remove('open');mobileMenu.setAttribute('aria-hidden','true');mobileMenu.setAttribute('inert','');document.body.style.overflow='';if(restore&&lastFocus instanceof HTMLElement)lastFocus.focus()}syncMenuLabel()}
menuBtn?.addEventListener('click',()=>setMenu(!mobileMenu.classList.contains('open')));
$$('a',mobileMenu).forEach(a=>a.addEventListener('click',()=>setMenu(false,{restore:false})));
addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileMenu?.classList.contains('open'))setMenu(false);if(e.key==='Tab'&&mobileMenu?.classList.contains('open')){const f=menuFocusables();if(!f.length)return;const first=f[0],last=f.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
addEventListener('resize',()=>{if(innerWidth>980&&mobileMenu?.classList.contains('open'))setMenu(false,{restore:false})},{passive:true});

const translations={
  toneSub:{'Cool brunette':{en:'Cool brunette',ru:'Холодный брюнет'},'Soft blonde':{en:'Soft blonde',ru:'Мягкий блонд'},'Warm copper':{en:'Warm copper',ru:'Тёплая медь'},'Caramel':{en:'Caramel',ru:'Карамель'}},
  ends:{'Loose waves':{en:'Loose waves',ru:'Свободные волны'},'Soft curls':{en:'Soft curls',ru:'Мягкие кудри'},'Mostly straight':{en:'Mostly straight',ru:'Почти прямые'},'Mixed texture':{en:'Mixed texture',ru:'Микс текстур'}},
  length:{'Shoulder':{en:'Shoulder',ru:'До плеч'},'Mid-back':{en:'Mid-back',ru:'До середины спины'},'Waist':{en:'Waist',ru:'До талии'},'Extra long':{en:'Extra long',ru:'Очень длинные'}},
  contrast:{'Soft blend':{en:'Soft blend',ru:'Мягкий переход'},'Visible ombré':{en:'Visible ombré',ru:'Заметное омбре'},'High contrast':{en:'High contrast',ru:'Высокий контраст'},'Natural match':{en:'Natural match',ru:'Натуральное совпадение'}}
};
const tr=(group,value)=>translations[group]?.[value]?.[lang]??value;
let lang='en';try{const stored=localStorage.getItem('guru-lang');lang=stored||(((navigator.language||'').toLowerCase().startsWith('ru'))?'ru':'en')}catch{lang=((navigator.language||'').toLowerCase().startsWith('ru'))?'ru':'en'}
if(!['en','ru'].includes(lang))lang='en';
const langButtons=[$('#langBtn'),$('#langBtnMobile')].filter(Boolean);
function applyLang(){document.documentElement.lang=lang;document.title=lang==='ru'?'GuruDreads — кастомные дред-экстеншены':'GuruDreads — Custom dread extensions';const md=$('meta[name="description"]');if(md)md.content=lang==='ru'?'GuruDreads — кастомные дред-экстеншены со сложным цветом, мягкими свободными концами и индивидуальным подходом.':'GuruDreads — custom dread extensions with dimensional colour, soft loose ends and a made-to-order approach.';$$('[data-en][data-ru]').forEach(el=>{el.innerHTML=el.dataset[lang]});$$('[data-aria-en][data-aria-ru]').forEach(el=>el.setAttribute('aria-label',el.dataset[`aria${lang==='en'?'En':'Ru'}`]));langButtons.forEach(b=>{b.textContent=lang==='en'?'EN / RU':'RU / EN';b.setAttribute('aria-label',lang==='en'?'Switch language to Russian':'Переключить язык на английский')});syncMenuLabel();try{localStorage.setItem('guru-lang',lang)}catch{}update()}
function toggleLang(){lang=lang==='en'?'ru':'en';applyLang()}
langButtons.forEach(b=>b.addEventListener('click',toggleLang));

const state={tone:'Smoke / Linen',toneSub:'Cool brunette',img:'assets/hero.webp',ends:'Loose waves',length:'Mid-back',contrast:'Soft blend'};
const previewImg=$('#previewImg'),previewTitle=$('#previewTitle'),previewSub=$('#previewSub'),summaryTitle=$('#summaryTitle'),summaryMeta=$('#summaryMeta'),copyStatus=$('#copyStatus');
function update(){if(!previewTitle)return;previewTitle.textContent=state.tone;previewSub.textContent=`${tr('toneSub',state.toneSub)} · ${tr('ends',state.ends).toLowerCase()} · ${tr('length',state.length).toLowerCase()}`;summaryTitle.textContent=`${state.tone} · ${tr('ends',state.ends)}`;summaryMeta.textContent=`${tr('length',state.length)} · ${tr('contrast',state.contrast)}`;if(previewImg&&previewImg.getAttribute('src')!==state.img){const next=new Image();next.decoding='async';next.src=state.img;previewImg.style.opacity='.35';next.onload=()=>{previewImg.src=state.img;previewImg.width=next.naturalWidth;previewImg.height=next.naturalHeight;previewImg.style.opacity='1';if(!reduceMotion.matches){previewImg.style.transform='scale(1.018)';setTimeout(()=>previewImg.style.transform='',260)}};next.onerror=()=>{state.img='assets/hero.webp';previewImg.src='assets/hero.webp';previewImg.style.opacity='1'}}}
$$('.option-group').forEach(group=>$$('.chip',group).forEach(btn=>btn.addEventListener('click',()=>{if(btn.classList.contains('active'))return;$$('.chip',group).forEach(x=>{x.classList.remove('active');x.setAttribute('aria-pressed','false')});btn.classList.add('active');btn.setAttribute('aria-pressed','true');const key=group.dataset.key;if(key==='tone'){state.tone=btn.dataset.value;state.toneSub=btn.dataset.sub;state.img=btn.dataset.img}else state[key]=btn.dataset.value;update()})));

const presets={smoke:0,blonde:1,copper:2,warm:3};
$$('.piece').forEach(card=>{const activate=()=>{const chips=$$('[data-key="tone"] .tone-chip');chips[presets[card.dataset.preset]]?.click();$('#custom')?.scrollIntoView({behavior:reduceMotion.matches?'auto':'smooth',block:'start'})};card.addEventListener('click',activate);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate()}})});

function brief(){const ends=tr('ends',state.ends),length=tr('length',state.length),contrast=tr('contrast',state.contrast);return lang==='ru'?`Привет, GuruDreads! Хочу обсудить кастомный заказ. Направление: ${state.tone}; концы: ${ends}; длина: ${length}; контраст: ${contrast}. Могу прислать референсы.`:`Hi GuruDreads! I’d like to discuss a custom order. Direction: ${state.tone}; ends: ${ends}; length: ${state.length}; contrast: ${state.contrast}. I can send references.`}
async function copyText(text){if(navigator.clipboard&&isSecureContext){await navigator.clipboard.writeText(text);return}const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();if(!ok)throw new Error('copy failed')}
$('#copyBrief')?.addEventListener('click',async()=>{const text=brief();try{await copyText(text);copyStatus.textContent=lang==='ru'?'Бриф скопирован. Теперь можно открыть Instagram.':'Brief copied. You can open Instagram now.'}catch{copyStatus.textContent=text}clearTimeout(copyStatus._t);copyStatus._t=setTimeout(()=>copyStatus.textContent='',5000)});

$('#shareBrief')?.addEventListener('click',async()=>{const text=brief();if(navigator.share){try{await navigator.share({title:lang==='ru'?'GuruDreads — кастомный бриф':'GuruDreads — custom brief',text});copyStatus.textContent=lang==='ru'?'Бриф отправлен.':'Brief shared.';return}catch(e){if(e?.name==='AbortError')return}}try{await copyText(text);copyStatus.textContent=lang==='ru'?'Бриф скопирован — можно отправить его в Instagram.':'Brief copied — you can send it on Instagram.'}catch{copyStatus.textContent=text}clearTimeout(copyStatus._t);copyStatus._t=setTimeout(()=>copyStatus.textContent='',5000)});
const dock=$('.mobile-dock'),custom=$('#custom');if(dock&&custom&&'IntersectionObserver' in window)new IntersectionObserver(([e])=>dock.classList.toggle('hidden',e.isIntersecting),{threshold:.15}).observe(custom);

const HERO_FALLBACK='assets/hero.webp';
function installImageFallback(img){if(!img||img.dataset.fallbackBound)return;img.dataset.fallbackBound='1';const fallback=()=>{if(img.getAttribute('src')===HERO_FALLBACK)return;img.removeAttribute('srcset');img.src=HERO_FALLBACK;img.style.opacity='1'};img.addEventListener('error',fallback);if(img.complete&&img.naturalWidth===0)fallback()}
$$('img').forEach(installImageFallback);
new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.matches?.('img'))installImageFallback(n);$$('img',n).forEach(installImageFallback)}))).observe(document.documentElement,{childList:true,subtree:true});
applyLang();