"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./WinkRouteExperience.module.css";

const API_URL = "https://br-billowing-hat-aydxhiyj-winkapi.compute.c-5.us-east-2.aws.neon.tech";
const CART_KEY = "wink-v4-cart";
const HERO = "https://images.pexels.com/photos/30277077/pexels-photo-30277077.jpeg?auto=compress&cs=tinysrgb&w=1800";
const PINK = "https://images.pexels.com/photos/31840152/pexels-photo-31840152.jpeg?auto=compress&cs=tinysrgb&w=1500";
const NUMBER = "https://images.pexels.com/photos/31840097/pexels-photo-31840097.jpeg?auto=compress&cs=tinysrgb&w=1500";
const NIGHT = "https://images.pexels.com/photos/31840156/pexels-photo-31840156.jpeg?auto=compress&cs=tinysrgb&w=1500";

const PALETTE_SWATCHES: Record<string,string[]> = {
  MILK:["#f7f4ed","#e8dfcf"],PINK_MILK:["#f4efe8","#e9cdd2"],PINK_CHROME:["#e9cdd2","#c8cdd2"],BLACK_GOLD:["#171615","#d1b47a"],
  NUDE_GOLD:["#e8dfcf","#d1b47a"],BLACK_CHROME:["#171615","#c8cdd2"],FROST:["#d7e4eb","#c8cdd2"],CHERRY_MILK:["#8f2332","#e9cdd2"],
};
const PALETTE_RU:Record<string,string>={MILK:"Молочный",PINK_MILK:"Розовый молочный",PINK_CHROME:"Розовый с серебром",BLACK_GOLD:"Чёрный с золотом",NUDE_GOLD:"Айвори с золотом",BLACK_CHROME:"Чёрный с серебром",FROST:"Голубой с серебром",CHERRY_MILK:"Вишня с розовым"};
const PRODUCTION_PALETTES=Object.keys(PALETTE_SWATCHES);

type Config=Record<string,unknown>;
type Variant={id:string;sku:string;palette_id:string|null;price_delta_minor:number;lead_time_minutes:number;capacity_minutes:number;config:Config};
type Product={id:string;slug:string;name:string;subtitle:string;description:string;base_price_minor:number;bestseller?:boolean;config:Config;variants:Variant[]};
type Palette={id:string;slug:string;name:string;swatches:string[];sort:number};
type Modifier={code:string;name:string;price_delta_minor:number;validation_rules:Config;group_code?:string};
type Catalog={version:string;tagline:string;products:Product[];palettes:Palette[];modifiers:Modifier[]};
type RouteMode="shop"|"birthday"|"love"|"kids"|"wow"|"build"|"product";
type LineConfig={palette?:string;foilColor?:string;number?:string;inscription?:string;revealResult?:"girl"|"boy";addons:string[]};
type CartLine={lineId:string;productId:string;name:string;subtitle:string;qty:number;unitPriceMinor:number;config:LineConfig};

const FALLBACK:Product[]=[
  ["air16","AIR","Воздушный сет · 16 шаров",349000,{production_id:"AIR16",latex_count:16,bows_eligible:true}],
  ["air30","AIR","Воздушный сет · 30 шаров",559000,{production_id:"AIR30",latex_count:30,bows_eligible:true}],
  ["birthday16-1","BIRTHDAY","16 шаров + 1 цифра",439000,{production_id:"NUM16_1",latex_count:16,digit_count:1,number_required:true,bows_eligible:true}],
  ["birthday16-2","BIRTHDAY","16 шаров + 2 цифры",519000,{production_id:"NUM16_2",latex_count:16,digit_count:2,number_required:true,bows_eligible:true}],
  ["birthday30-1","BIRTHDAY","30 шаров + 1 цифра",659000,{production_id:"NUM30_1",latex_count:30,digit_count:1,number_required:true,bows_eligible:true}],
  ["birthday30-2","BIRTHDAY","30 шаров + 2 цифры",729000,{production_id:"NUM30_2",latex_count:30,digit_count:2,number_required:true,bows_eligible:true}],
  ["love16","LOVE","16 шаров + 2 сердца",429000,{production_id:"MIX16",latex_count:16,heart_count:2}],
  ["love30","LOVE","30 шаров + 4 сердца",689000,{production_id:"MIX30",latex_count:30,heart_count:4}],
  ["hearts7","HEARTS","7 шаров в форме сердца",279000,{production_id:"HEART7",heart_count:7}],
  ["hearts14","HEARTS","14 шаров в форме сердца",479000,{production_id:"HEART14",heart_count:14}],
  ["message16","MESSAGE","16 шаров + прозрачный шар с надписью",509000,{production_id:"MSG16",latex_count:16,message_required:true,bows_eligible:true}],
  ["message30","MESSAGE","30 шаров + прозрачный шар с надписью",729000,{production_id:"MSG30",latex_count:30,message_required:true,bows_eligible:true}],
  ["baby-reveal-solo","BABY REVEAL","Шар-сюрприз",339000,{production_id:"REV0",reveal_result_required:true}],
  ["baby-reveal16","BABY REVEAL","Шар-сюрприз + 16 шаров",629000,{production_id:"REV16",latex_count:16,reveal_result_required:true}],
].map(([slug,name,subtitle,price,config])=>({id:String(slug),slug:String(slug),name:String(name),subtitle:String(subtitle),description:String(subtitle),base_price_minor:Number(price),config:config as Config,variants:[]}));

function family(p:Product){return p.name.toUpperCase()}
function num(c:Config,k:string){const v=c[k];return typeof v==="number"?v:Number(v||0)}
function yes(c:Config,k:string){return c[k]===true}
function money(v:number){return `${new Intl.NumberFormat("ru-RU").format(Math.round(v/100))} ₽`}
function variants(p:Product){return Array.isArray(p.variants)?p.variants:[]}
function paletteIds(p:Product){const ids=[...new Set(variants(p).map(v=>v.palette_id).filter((v):v is string=>Boolean(v)))];return ids.length?ids:PRODUCTION_PALETTES}
function image(p:Product){const f=family(p);if(f==="BIRTHDAY")return NUMBER;if(f==="LOVE"||f==="HEARTS")return PINK;if(f==="MESSAGE"||f==="BABY REVEAL")return NIGHT;return HERO}
function bowCode(p:Product,catalog:Catalog){const count=num(p.config,"latex_count");return catalog.modifiers.find(m=>m.code===`BOWS_${count}`)?.code||""}
function productPrice(p:Product,bows:boolean,catalog:Catalog){const code=bowCode(p,catalog);const delta=bows&&code?catalog.modifiers.find(m=>m.code===code)?.price_delta_minor||0:0;return p.base_price_minor+delta}
function cartRead():CartLine[]{try{return JSON.parse(window.localStorage.getItem(CART_KEY)||"[]") as CartLine[]}catch{return[]}}
function routeCopy(mode:RouteMode){
  if(mode==="birthday")return["Birthday edit","День рождения без переписки","Выберите масштаб, палитру и точные цифры. Никаких «укажите возраст в комментарии»."];
  if(mode==="love")return["Love edit","Подарки, которые говорят за вас","LOVE, HEARTS и MESSAGE — только из реально производимых вариантов."];
  if(mode==="kids")return["Kids edit","Детский день рождения, но без party-shop","AIR, BIRTHDAY и MESSAGE в мягких палитрах из актуальной производственной матрицы."];
  if(mode==="wow")return["WINK / WOW","Большой жест. Не фальшивый SKU.","WOW строится из больших реальных композиций и сценария помещения. ROOM остаётся услугой до утверждения отдельной рецептуры."];
  return["The WINK edit","Все композиции WINK","Короткий ассортимент вместо бесконечного каталога. Внутри — палитра и персонализация."];
}
function Header(){return <header className={styles.header}><nav className={styles.nav}><Link href="/shop">Shop</Link><Link href="/occasion/birthday">Birthday</Link><Link href="/occasion/love">Love</Link><Link href="/build">Собрать свой</Link></nav><Link href="/" className={styles.brand}>WINK</Link><nav className={styles.navRight}><Link href="/wow">WOW</Link><Link href="/#faq">FAQ</Link><Link href="/">Gift bag</Link></nav></header>}
function Footer(){return <footer className={styles.footer}><span>WINK — gifts that make a moment.</span><span>Доставка рассчитывается отдельно · Telegram / Instagram</span></footer>}

export default function WinkRouteExperience({mode,slug}:{mode:RouteMode;slug?:string}){
  const [catalog,setCatalog]=useState<Catalog>({version:"fallback",tagline:"WINK",products:FALLBACK,palettes:[],modifiers:[]});
  const [familyFilter,setFamilyFilter]=useState("ALL");
  useEffect(()=>{let alive=true;fetch(`${API_URL}/api/catalog`).then(r=>{if(!r.ok)throw new Error();return r.json()}).then((data:Catalog)=>{if(alive&&Array.isArray(data.products)&&data.products.length)setCatalog(data)}).catch(()=>undefined);return()=>{alive=false}},[]);
  if(mode==="product")return <ProductView catalog={catalog} slug={slug||""}/>;
  if(mode==="build")return <BuilderView catalog={catalog}/>;
  const [eyebrow,title,description]=routeCopy(mode);
  const families=["ALL","AIR","BIRTHDAY","LOVE","HEARTS","MESSAGE","BABY REVEAL"];
  const filtered=catalog.products.filter(p=>{const f=family(p);if(mode==="birthday"&&!(["BIRTHDAY","AIR","MESSAGE"].includes(f)))return false;if(mode==="love"&&!(["LOVE","HEARTS","MESSAGE"].includes(f)))return false;if(mode==="kids"&&!(["AIR","BIRTHDAY","MESSAGE"].includes(f)))return false;if(mode==="wow"&&!(num(p.config,"latex_count")>=30||p.slug==="hearts14"))return false;if(mode==="shop"&&familyFilter!=="ALL"&&f!==familyFilter)return false;return true});
  return <main className={styles.page}><Header/><section className={styles.hero}><div className={styles.eyebrow}>{eyebrow}</div><h1>{title}</h1><p>{description}</p></section>{mode==="shop"&&<div className={styles.toolbar}>{families.map(f=><button key={f} className={familyFilter===f?styles.pillActive:styles.pill} onClick={()=>setFamilyFilter(f)}>{f==="ALL"?"Все":f}</button>)}</div>}<section className={styles.grid}>{filtered.map(p=><Link href={`/product/${p.slug}`} className={styles.card} key={p.slug}><div className={styles.media}><img src={image(p)} alt={`${p.name} ${p.subtitle}`}/><span className={styles.badge}>{family(p)}</span></div><div className={styles.cardBody}><div><div className={styles.cardTitle}>{p.name}</div><div className={styles.cardSub}>{p.subtitle}</div></div><div className={styles.price}>{money(p.base_price_minor)}</div></div></Link>)}{!filtered.length&&<div className={styles.empty}>В актуальной производственной матрице подходящих сетов нет. WINK не показывает несуществующий товар ради заполнения каталога.</div>}</section>{mode==="wow"&&<section className={styles.editorial}><div className={styles.editorialBox}><div className={styles.eyebrow}>ROOM / concierge</div><h2>Комната — это сценарий, а не выдуманный SKU.</h2><p>Собираем WOW из существующих больших сетов, цифр и доставки. Фиксированный ROOM появится после утверждения рецептуры, цены и capacity.</p><div style={{marginTop:22}}><Link href="/build" className={styles.cta}>Собрать WOW</Link></div></div></section>}<Footer/></main>;
}

function BuilderView({catalog}:{catalog:Catalog}){
  const [familyChoice,setFamilyChoice]=useState("AIR");const [size,setSize]=useState(16);const [digits,setDigits]=useState(1);
  const allowed=["AIR","BIRTHDAY","LOVE","MESSAGE","HEARTS","BABY REVEAL"];
  const selected=useMemo(()=>catalog.products.find(p=>{const f=family(p);if(f!==familyChoice)return false;if(f==="BIRTHDAY")return num(p.config,"latex_count")===size&&num(p.config,"digit_count")===digits;if(["AIR","LOVE","MESSAGE"].includes(f))return num(p.config,"latex_count")===size;if(f==="HEARTS")return num(p.config,"heart_count")===(size===16?14:7);return size===16?p.slug==="baby-reveal16":p.slug==="baby-reveal-solo"})||null,[catalog.products,familyChoice,size,digits]);
  return <main className={styles.page}><Header/><section className={styles.hero}><div className={styles.eyebrow}>Build your gift</div><h1>Собрать можно только то, что мы можем собрать.</h1><p>Конструктор переводит желание в одну из утверждённых производственных комплектаций WINK.</p></section><section className={styles.builder}><div className={styles.builderCard}><h2>Ваш WINK</h2><div className={styles.field}><label>Семейство</label><div className={styles.choices}>{allowed.map(f=><button className={familyChoice===f?styles.pillActive:styles.pill} key={f} onClick={()=>setFamilyChoice(f)}>{f}</button>)}</div></div>{!["HEARTS","BABY REVEAL"].includes(familyChoice)&&<div className={styles.field}><label>Масштаб</label><div className={styles.choices}>{[16,30].map(n=><button className={size===n?styles.pillActive:styles.pill} key={n} onClick={()=>setSize(n)}>{n} шаров</button>)}</div></div>}{familyChoice==="BIRTHDAY"&&<div className={styles.field}><label>Цифры</label><div className={styles.choices}>{[1,2].map(n=><button className={digits===n?styles.pillActive:styles.pill} key={n} onClick={()=>setDigits(n)}>{n}</button>)}</div></div>}{familyChoice==="HEARTS"&&<div className={styles.field}><label>Сердца</label><div className={styles.choices}><button className={size!==16?styles.pillActive:styles.pill} onClick={()=>setSize(7)}>7</button><button className={size===16?styles.pillActive:styles.pill} onClick={()=>setSize(16)}>14</button></div></div>}{familyChoice==="BABY REVEAL"&&<div className={styles.field}><label>Формат</label><div className={styles.choices}><button className={size!==16?styles.pillActive:styles.pill} onClick={()=>setSize(0)}>Только reveal</button><button className={size===16?styles.pillActive:styles.pill} onClick={()=>setSize(16)}>Reveal + 16</button></div></div>}<div className={styles.field}><label>Результат</label>{selected?<><strong>{selected.name} · {selected.subtitle}</strong><span className={styles.hint}>от {money(selected.base_price_minor)} · доставка отдельно</span><div style={{marginTop:10}}><Link href={`/product/${selected.slug}`} className={styles.cta}>Настроить этот сет →</Link></div></>:<div className={styles.error}>Такой комбинации нет в производственной матрице.</div>}</div></div></section><Footer/></main>;
}

function ProductView({catalog,slug}:{catalog:Catalog;slug:string}){
  const product=catalog.products.find(p=>p.slug===slug)||FALLBACK.find(p=>p.slug===slug)||null;
  const [palette,setPalette]=useState("");const [foil,setFoil]=useState("S");const [number,setNumber]=useState("");const [inscription,setInscription]=useState("");const [reveal,setReveal]=useState<"girl"|"boy"|"">("");const [bows,setBows]=useState(false);const [added,setAdded]=useState(false);
  if(!product)return <main className={styles.page}><Header/><section className={styles.hero}><div className={styles.eyebrow}>Product</div><h1>Такого WINK сейчас нет.</h1><p>Мы не подставляем случайный товар вместо отсутствующего SKU.</p><div style={{marginTop:24}}><Link href="/shop" className={styles.cta}>В каталог</Link></div></section><Footer/></main>;
  const f=family(product);const ids=paletteIds(product);const currentPalette=palette||ids[0]||"";const digitCount=num(product.config,"digit_count");
  const validNumber=!yes(product.config,"number_required")||(/^\d+$/.test(number)&&number.length===digitCount);
  const validMessage=!yes(product.config,"message_required")||(inscription.trim().length>0&&inscription.length<=40&&inscription.split(/\r?\n/).length<=3);
  const validReveal=!yes(product.config,"reveal_result_required")||Boolean(reveal);const validPalette=f==="HEARTS"||f==="BABY REVEAL"||Boolean(currentPalette);const valid=validNumber&&validMessage&&validReveal&&validPalette;
  const code=bowCode(product,catalog);const canBow=yes(product.config,"bows_eligible")&&Boolean(code);const price=productPrice(product,bows,catalog);const assembly=variants(product)[0]?.capacity_minutes||num(product.config,"assembly_minutes")||"—";
  function add(){if(!valid)return;const config:LineConfig={addons:[]};if(f==="HEARTS")config.foilColor=foil;else if(f==="BABY REVEAL")config.palette="MILK";else config.palette=currentPalette;if(yes(product.config,"number_required"))config.number=number;if(yes(product.config,"message_required"))config.inscription=inscription.trim();if(yes(product.config,"reveal_result_required"))config.revealResult=reveal as "girl"|"boy";if(bows&&code)config.addons=[code];const next=[...cartRead(),{lineId:`${product.slug}-${window.crypto.randomUUID()}`,productId:product.slug,name:product.name,subtitle:product.subtitle,qty:1,unitPriceMinor:price,config}];window.localStorage.setItem(CART_KEY,JSON.stringify(next));setAdded(true)}
  return <main className={styles.page}><Header/><section className={styles.product}><div className={styles.gallery}><img src={image(product)} alt={`${product.name} ${product.subtitle}`}/></div><div className={styles.productInfo}><div className={styles.eyebrow}>{f} / {String(product.config.production_id||product.slug)}</div><h1>{product.name}</h1><h2>{product.subtitle}</h2><p className={styles.description}>{product.description}</p><div className={styles.bigPrice}>{money(price)}</div>{f==="HEARTS"?<div className={styles.field}><label>Цвет сердца</label><div className={styles.choices}>{[["S","Silver"],["G","Gold"],["R","Red"]].map(([c,l])=><button key={c} className={foil===c?styles.pillActive:styles.pill} onClick={()=>setFoil(c)}>{l}</button>)}</div></div>:f!=="BABY REVEAL"?<div className={styles.field}><label>Палитра</label><div className={styles.choices}>{ids.map(id=>{const colors=PALETTE_SWATCHES[id]||["#ddd","#eee"];return <button key={id} title={PALETTE_RU[id]||id} aria-label={PALETTE_RU[id]||id} className={`${styles.swatch} ${currentPalette===id?styles.swatchActive:""}`} style={{background:`linear-gradient(135deg,${colors[0]} 0 50%,${colors[1]||colors[0]} 50%)`}} onClick={()=>setPalette(id)}/>})}</div><span className={styles.hint}>{PALETTE_RU[currentPalette]||currentPalette}</span></div>:<div className={styles.field}><label>Палитра</label><strong>Milk · нейтральная база</strong></div>}{yes(product.config,"number_required")&&<div className={styles.field}><label>{digitCount===1?"Цифра":"Две цифры"}</label><input className={styles.input} inputMode="numeric" maxLength={digitCount} value={number} onChange={e=>setNumber(e.target.value.replace(/\D/g,"").slice(0,digitCount))} placeholder={digitCount===1?"7":"19"}/><span className={styles.hint}>Нужно выбрать ровно {digitCount}.</span></div>}{yes(product.config,"message_required")&&<div className={styles.field}><label>Надпись на bubble</label><textarea className={styles.textarea} value={inscription} onChange={e=>setInscription(e.target.value)} maxLength={40} placeholder="Например: love you always"/><span className={styles.hint}>{inscription.length}/40 · максимум 3 строки</span></div>}{yes(product.config,"reveal_result_required")&&<div className={styles.field}><label>Секретный результат</label><div className={styles.choices}><button className={reveal==="girl"?styles.pillActive:styles.pill} onClick={()=>setReveal("girl")}>Girl / розовое конфетти</button><button className={reveal==="boy"?styles.pillActive:styles.pill} onClick={()=>setReveal("boy")}>Boy / голубое конфетти</button></div></div>}{canBow&&<div className={styles.field}><label>Персонализация</label><button className={bows?styles.pillActive:styles.pill} onClick={()=>setBows(v=>!v)}>{catalog.modifiers.find(m=>m.code===code)?.name||"Банты"}</button></div>}<div className={styles.facts}><div className={styles.fact}><span>Сборка</span><strong>{assembly} мин</strong></div><div className={styles.fact}><span>Доставка</span><strong>Рассчитывается отдельно</strong></div></div><div className={styles.stickyCta}><button className={styles.cta} disabled={!valid} onClick={add}>Add to gift — {money(price)}</button></div>{!valid&&<div className={styles.error}>Заполните обязательную персонализацию — неполный заказ не уйдёт в производство.</div>}{added&&<div className={styles.success}>Добавлено в gift bag. <Link href="/">Перейти к оформлению →</Link></div>}</div></section><Footer/></main>;
}
