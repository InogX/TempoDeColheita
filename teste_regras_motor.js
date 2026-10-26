// Interpretador SIMPLIFICADO das regras do Firebase Realtime Database, só para os testes em Node (não existe emulador offline aqui).
// As regras (.read / .write / .validate) são expressões quase iguais ao JavaScript, então são avaliadas como JS com os objetos que as regras usam: auth, data, newData, root e as variáveis $x.
// O que ele faz: .read e .write CASCATEIAM (se um nó acima libera, o de baixo também); a escrita só vale se .write liberar E todos os .validate (do caminho e do que foi escrito) passarem; apagar não valida; chave sem regra não libera nada.
// O que ele NÃO garante: ser idêntico ao Firebase em casos de borda (ex.: ordem de avaliação em update com vários caminhos). Por isso o plano manda conferir as mesmas situações no Rules Playground.
'use strict';
const clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
const seg = p => String(p).split('/').filter(Boolean);
const SENT = Object.freeze({ __sentinela: true }); // val() de um nó com filhos devolve um valor "opaco", como no Firebase
String.prototype.__m = function (re) { return re.test(String(this)); }; // matches() das regras

function desce(v, segs) { for (const k of segs) { if (v == null || typeof v !== 'object') return undefined; v = v[k]; } return v; }
function snap(valor) {
  const obj = valor !== null && typeof valor === 'object';
  return {
    val: () => (valor === undefined ? null : obj ? SENT : valor), exists: () => valor !== undefined && valor !== null,
    child: p => snap(desce(valor, seg(p))),
    hasChildren: ks => obj && (ks ? ks.every(k => valor[k] !== undefined && valor[k] !== null) : Object.keys(valor).length > 0),
    isString: () => typeof valor === 'string', isNumber: () => typeof valor === 'number', isBoolean: () => typeof valor === 'boolean',
  };
}
const cache = new Map();
function avalia(src, ctx) {
  if (typeof src === 'boolean') return src;
  let f = cache.get(src);
  if (!f) { f = new Function('auth', 'data', 'newData', 'root', '__v', 'with (__v) { return (' + String(src).replace(/\.matches\(/g, '.__m(') + '); }'); cache.set(src, f); }
  try { return !!f(ctx.auth, snap(ctx.antes), snap(ctx.depois), snap(ctx.raiz), ctx.vars); } catch (e) { return false; } // erro na regra = nega (como o Firebase)
}
function cadeia(regras, segs) { // nós das regras ao longo do caminho: [{ no, vars, n }]
  let no = regras.rules, vars = {}; const out = [{ no, vars, n: 0 }];
  for (let i = 0; i < segs.length; i++) {
    const k = segs[i]; let prox = null, nv = vars;
    if (Object.prototype.hasOwnProperty.call(no, k) && k[0] !== '.' && k[0] !== '$' && typeof no[k] === 'object') prox = no[k];
    else { const w = Object.keys(no).find(x => x[0] === '$' && typeof no[x] === 'object'); if (w) { prox = no[w]; nv = { ...vars, [w]: k }; } }
    if (!prox) break; no = prox; vars = nv; out.push({ no, vars, n: i + 1 });
  }
  return out;
}
function aplica(raiz, segs, valor) { // devolve uma cópia da árvore com a escrita aplicada (e sem pais vazios, como o Firebase)
  const nova = clone(raiz) || {}; if (!segs.length) return valor == null ? {} : clone(valor);
  const pais = []; let n = nova;
  for (let i = 0; i < segs.length - 1; i++) { if (n[segs[i]] == null || typeof n[segs[i]] !== 'object') n[segs[i]] = {}; pais.push([n, segs[i]]); n = n[segs[i]]; }
  const k = segs[segs.length - 1]; if (valor == null) delete n[k]; else n[k] = clone(valor);
  for (let i = pais.length - 1; i >= 0; i--) { const [p, c] = pais[i]; if (p[c] && typeof p[c] === 'object' && !Object.keys(p[c]).length) delete p[c]; }
  return nova;
}

function criaMotor(regras, getRaiz) {
  const ctxDe = (uid, vars, antesRaiz, depoisRaiz, segs) => ({ auth: uid == null ? null : { uid }, vars, raiz: antesRaiz, antes: desce(antesRaiz, segs), depois: desce(depoisRaiz, segs) });
  function podeLer(uid, caminho) {
    const segs = seg(caminho); if (segs[0] === '.info') return true;
    const raiz = getRaiz();
    return cadeia(regras, segs).some(c => c.no['.read'] !== undefined && avalia(c.no['.read'], ctxDe(uid, c.vars, raiz, raiz, segs.slice(0, c.n))));
  }
  function validaFilhos(no, vars, valor, segs, antesRaiz, depoisRaiz, uid) { // .validate de tudo o que foi escrito (descendentes)
    if (valor === null || typeof valor !== 'object') return true;
    return Object.keys(valor).every(k => {
      let prox = null, nv = vars;
      if (Object.prototype.hasOwnProperty.call(no, k) && k[0] !== '.' && typeof no[k] === 'object') prox = no[k];
      else { const w = Object.keys(no).find(x => x[0] === '$' && typeof no[x] === 'object'); if (w) { prox = no[w]; nv = { ...vars, [w]: k }; } }
      if (!prox) return true;
      const s2 = segs.concat([k]);
      if (prox['.validate'] !== undefined && !avalia(prox['.validate'], ctxDe(uid, nv, antesRaiz, depoisRaiz, s2))) return false;
      return validaFilhos(prox, nv, valor[k], s2, antesRaiz, depoisRaiz, uid);
    });
  }
  function podeEscrever(uid, caminho, valor) {
    const segs = seg(caminho), raiz = getRaiz(), depois = aplica(raiz, segs, valor), ch = cadeia(regras, segs);
    const liberado = ch.some(c => c['no']['.write'] !== undefined && avalia(c.no['.write'], ctxDe(uid, c.vars, raiz, depois, segs.slice(0, c.n))));
    if (!liberado) return false;
    for (const c of ch) { // .validate do caminho (só quando o nó continua existindo)
      if (c.no['.validate'] === undefined) continue;
      const nd = desce(depois, segs.slice(0, c.n)); if (nd === undefined || nd === null) continue;
      if (!avalia(c.no['.validate'], ctxDe(uid, c.vars, raiz, depois, segs.slice(0, c.n)))) return false;
    }
    if (valor != null) { const fim = ch[ch.length - 1]; if (fim.n === segs.length && !validaFilhos(fim.no, fim.vars, valor, segs, raiz, depois, uid)) return false; }
    return true;
  }
  return { podeLer, podeEscrever };
}
module.exports = { criaMotor };
