const Ki = "15.1.22", Ai = (s, t, e) => ({ endTime: t, insertTime: e, type: "exponentialRampToValue", value: s }), Ni = (s, t, e) => ({ endTime: t, insertTime: e, type: "linearRampToValue", value: s }), ws = (s, t) => ({ startTime: t, type: "setValue", value: s }), tr = (s, t, e) => ({ duration: e, startTime: t, type: "setValueCurve", values: s }), er = (s, t, { startTime: e, target: n, timeConstant: i }) => n + (t - n) * Math.exp((e - s) / i), De = (s) => s.type === "exponentialRampToValue", Mn = (s) => s.type === "linearRampToValue", ce = (s) => De(s) || Mn(s), Rs = (s) => s.type === "setValue", Jt = (s) => s.type === "setValueCurve", Rn = (s, t, e, n) => {
  const i = s[t];
  return i === void 0 ? n : ce(i) || Rs(i) ? i.value : Jt(i) ? i.values[i.values.length - 1] : er(e, Rn(s, t - 1, i.startTime, n), i);
}, Oi = (s, t, e, n, i) => e === void 0 ? [n.insertTime, i] : ce(e) ? [e.endTime, e.value] : Rs(e) ? [e.startTime, e.value] : Jt(e) ? [
  e.startTime + e.duration,
  e.values[e.values.length - 1]
] : [
  e.startTime,
  Rn(s, t - 1, e.startTime, i)
], Ts = (s) => s.type === "cancelAndHold", bs = (s) => s.type === "cancelScheduledValues", ae = (s) => Ts(s) || bs(s) ? s.cancelTime : De(s) || Mn(s) ? s.endTime : s.startTime, Di = (s, t, e, { endTime: n, value: i }) => e === i ? i : 0 < e && 0 < i || e < 0 && i < 0 ? e * (i / e) ** ((s - t) / (n - t)) : 0, Ei = (s, t, e, { endTime: n, value: i }) => e + (s - t) / (n - t) * (i - e), yo = (s, t) => {
  const e = Math.floor(t), n = Math.ceil(t);
  return e === n ? s[e] : (1 - (t - e)) * s[e] + (1 - (n - t)) * s[n];
}, vo = (s, { duration: t, startTime: e, values: n }) => {
  const i = (s - e) / t * (n.length - 1);
  return yo(n, i);
}, kn = (s) => s.type === "setTarget";
class wo {
  constructor(t) {
    this._automationEvents = [], this._currenTime = 0, this._defaultValue = t;
  }
  [Symbol.iterator]() {
    return this._automationEvents[Symbol.iterator]();
  }
  add(t) {
    const e = ae(t);
    if (Ts(t) || bs(t)) {
      const n = this._automationEvents.findIndex((r) => bs(t) && Jt(r) ? r.startTime + r.duration >= e : ae(r) >= e), i = this._automationEvents[n];
      if (n !== -1 && (this._automationEvents = this._automationEvents.slice(0, n)), Ts(t)) {
        const r = this._automationEvents[this._automationEvents.length - 1];
        if (i !== void 0 && ce(i)) {
          if (r !== void 0 && kn(r))
            throw new Error("The internal list is malformed.");
          const o = r === void 0 ? i.insertTime : Jt(r) ? r.startTime + r.duration : ae(r), a = r === void 0 ? this._defaultValue : Jt(r) ? r.values[r.values.length - 1] : r.value, c = De(i) ? Di(e, o, a, i) : Ei(e, o, a, i), u = De(i) ? Ai(c, e, this._currenTime) : Ni(c, e, this._currenTime);
          this._automationEvents.push(u);
        }
        if (r !== void 0 && kn(r) && this._automationEvents.push(ws(this.getValue(e), e)), r !== void 0 && Jt(r) && r.startTime + r.duration > e) {
          const o = e - r.startTime, a = (r.values.length - 1) / r.duration, c = Math.max(2, 1 + Math.ceil(o * a)), u = o / (c - 1) * a, l = r.values.slice(0, c);
          if (u < 1)
            for (let h = 1; h < c; h += 1) {
              const p = u * h % 1;
              l[h] = r.values[h - 1] * (1 - p) + r.values[h] * p;
            }
          this._automationEvents[this._automationEvents.length - 1] = tr(l, r.startTime, o);
        }
      }
    } else {
      const n = this._automationEvents.findIndex((o) => ae(o) > e), i = n === -1 ? this._automationEvents[this._automationEvents.length - 1] : this._automationEvents[n - 1];
      if (i !== void 0 && Jt(i) && ae(i) + i.duration > e)
        return !1;
      const r = De(t) ? Ai(t.value, t.endTime, this._currenTime) : Mn(t) ? Ni(t.value, e, this._currenTime) : t;
      if (n === -1)
        this._automationEvents.push(r);
      else {
        if (Jt(t) && e + t.duration > ae(this._automationEvents[n]))
          return !1;
        this._automationEvents.splice(n, 0, r);
      }
    }
    return !0;
  }
  flush(t) {
    const e = this._automationEvents.findIndex((n) => ae(n) > t);
    if (e > 1) {
      const n = this._automationEvents.slice(e - 1), i = n[0];
      kn(i) && n.unshift(ws(Rn(this._automationEvents, e - 2, i.startTime, this._defaultValue), i.startTime)), this._automationEvents = n;
    }
  }
  getValue(t) {
    if (this._automationEvents.length === 0)
      return this._defaultValue;
    const e = this._automationEvents.findIndex((o) => ae(o) > t), n = this._automationEvents[e], i = (e === -1 ? this._automationEvents.length : e) - 1, r = this._automationEvents[i];
    if (r !== void 0 && kn(r) && (n === void 0 || !ce(n) || n.insertTime > t))
      return er(t, Rn(this._automationEvents, i - 1, r.startTime, this._defaultValue), r);
    if (r !== void 0 && Rs(r) && (n === void 0 || !ce(n)))
      return r.value;
    if (r !== void 0 && Jt(r) && (n === void 0 || !ce(n) || r.startTime + r.duration > t))
      return t < r.startTime + r.duration ? vo(t, r) : r.values[r.values.length - 1];
    if (r !== void 0 && ce(r) && (n === void 0 || !ce(n)))
      return r.value;
    if (n !== void 0 && De(n)) {
      const [o, a] = Oi(this._automationEvents, i, r, n, this._defaultValue);
      return Di(t, o, a, n);
    }
    if (n !== void 0 && Mn(n)) {
      const [o, a] = Oi(this._automationEvents, i, r, n, this._defaultValue);
      return Ei(t, o, a, n);
    }
    return this._defaultValue;
  }
}
const To = (s) => ({ cancelTime: s, type: "cancelAndHold" }), bo = (s) => ({ cancelTime: s, type: "cancelScheduledValues" }), xo = (s, t) => ({ endTime: t, type: "exponentialRampToValue", value: s }), Co = (s, t) => ({ endTime: t, type: "linearRampToValue", value: s }), So = (s, t, e) => ({ startTime: t, target: s, timeConstant: e, type: "setTarget" }), ko = () => new DOMException("", "AbortError"), Ao = (s) => (t, e, [n, i, r], o) => {
  s(t[i], [e, n, r], (a) => a[0] === e && a[1] === n, o);
}, No = (s) => (t, e, n) => {
  const i = [];
  for (let r = 0; r < n.numberOfInputs; r += 1)
    i.push(/* @__PURE__ */ new Set());
  s.set(t, {
    activeInputs: i,
    outputs: /* @__PURE__ */ new Set(),
    passiveInputs: /* @__PURE__ */ new WeakMap(),
    renderer: e
  });
}, Oo = (s) => (t, e) => {
  s.set(t, { activeInputs: /* @__PURE__ */ new Set(), passiveInputs: /* @__PURE__ */ new WeakMap(), renderer: e });
}, Fe = /* @__PURE__ */ new WeakSet(), nr = /* @__PURE__ */ new WeakMap(), Ps = /* @__PURE__ */ new WeakMap(), sr = /* @__PURE__ */ new WeakMap(), Fs = /* @__PURE__ */ new WeakMap(), Zn = /* @__PURE__ */ new WeakMap(), ir = /* @__PURE__ */ new WeakMap(), xs = /* @__PURE__ */ new WeakMap(), Cs = /* @__PURE__ */ new WeakMap(), Ss = /* @__PURE__ */ new WeakMap(), rr = {
  construct() {
    return rr;
  }
}, Do = (s) => {
  try {
    const t = new Proxy(s, rr);
    new t();
  } catch {
    return !1;
  }
  return !0;
}, Ii = /^import(?:(?:[\s]+[\w]+|(?:[\s]+[\w]+[\s]*,)?[\s]*\{[\s]*[\w]+(?:[\s]+as[\s]+[\w]+)?(?:[\s]*,[\s]*[\w]+(?:[\s]+as[\s]+[\w]+)?)*[\s]*}|(?:[\s]+[\w]+[\s]*,)?[\s]*\*[\s]+as[\s]+[\w]+)[\s]+from)?(?:[\s]*)("([^"\\]|\\.)+"|'([^'\\]|\\.)+')(?:[\s]*);?/, Mi = (s, t) => {
  const e = [];
  let n = s.replace(/^[\s]+/, ""), i = n.match(Ii);
  for (; i !== null; ) {
    const r = i[1].slice(1, -1), o = i[0].replace(/([\s]+)?;?$/, "").replace(r, new URL(r, t).toString());
    e.push(o), n = n.slice(i[0].length).replace(/^[\s]+/, ""), i = n.match(Ii);
  }
  return [e.join(";"), n];
}, Ri = (s) => {
  if (s !== void 0 && !Array.isArray(s))
    throw new TypeError("The parameterDescriptors property of given value for processorCtor is not an array.");
}, Pi = (s) => {
  if (!Do(s))
    throw new TypeError("The given value for processorCtor should be a constructor.");
  if (s.prototype === null || typeof s.prototype != "object")
    throw new TypeError("The given value for processorCtor should have a prototype.");
}, Eo = (s, t, e, n, i, r, o, a, c, u, l, h, p) => {
  let f = 0;
  return (d, m, _ = { credentials: "omit" }) => {
    const y = l.get(d);
    if (y !== void 0 && y.has(m))
      return Promise.resolve();
    const b = u.get(d);
    if (b !== void 0) {
      const g = b.get(m);
      if (g !== void 0)
        return g;
    }
    const x = r(d), S = x.audioWorklet === void 0 ? i(m).then(([g, w]) => {
      const [T, v] = Mi(g, w), N = `${T};((a,b)=>{(a[b]=a[b]||[]).push((AudioWorkletProcessor,global,registerProcessor,sampleRate,self,window)=>{${v}
})})(window,'_AWGS')`;
      return e(N);
    }).then(() => {
      const g = p._AWGS.pop();
      if (g === void 0)
        throw new SyntaxError();
      n(x.currentTime, x.sampleRate, () => g(class {
      }, void 0, (w, T) => {
        if (w.trim() === "")
          throw t();
        const v = Cs.get(x);
        if (v !== void 0) {
          if (v.has(w))
            throw t();
          Pi(T), Ri(T.parameterDescriptors), v.set(w, T);
        } else
          Pi(T), Ri(T.parameterDescriptors), Cs.set(x, /* @__PURE__ */ new Map([[w, T]]));
      }, x.sampleRate, void 0, void 0));
    }) : Promise.all([
      i(m),
      Promise.resolve(s(h, h))
    ]).then(([[g, w], T]) => {
      const v = f + 1;
      f = v;
      const [N, A] = Mi(g, w), D = `${N};((AudioWorkletProcessor,registerProcessor)=>{${A}
})(${T ? "AudioWorkletProcessor" : "class extends AudioWorkletProcessor {__b=new WeakSet();constructor(){super();(p=>p.postMessage=(q=>(m,t)=>q.call(p,m,t?t.filter(u=>!this.__b.has(u)):t))(p.postMessage))(this.port)}}"},(n,p)=>registerProcessor(n,class extends p{${T ? "" : "__c = (a) => a.forEach(e=>this.__b.add(e.buffer));"}process(i,o,p){${T ? "" : "i.forEach(this.__c);o.forEach(this.__c);this.__c(Object.values(p));"}return super.process(i.map(j=>j.some(k=>k.length===0)?[]:j),o,p)}}));registerProcessor('__sac${v}',class extends AudioWorkletProcessor{process(){return !1}})`, V = new Blob([D], { type: "application/javascript; charset=utf-8" }), M = URL.createObjectURL(V);
      return x.audioWorklet.addModule(M, _).then(() => {
        if (a(x))
          return x;
        const P = o(x);
        return P.audioWorklet.addModule(M, _).then(() => P);
      }).then((P) => {
        if (c === null)
          throw new SyntaxError();
        try {
          new c(P, `__sac${v}`);
        } catch {
          throw new SyntaxError();
        }
      }).finally(() => URL.revokeObjectURL(M));
    });
    return b === void 0 ? u.set(d, /* @__PURE__ */ new Map([[m, S]])) : b.set(m, S), S.then(() => {
      const g = l.get(d);
      g === void 0 ? l.set(d, /* @__PURE__ */ new Set([m])) : g.add(m);
    }).finally(() => {
      const g = u.get(d);
      g !== void 0 && g.delete(m);
    }), S;
  };
}, Wt = (s, t) => {
  const e = s.get(t);
  if (e === void 0)
    throw new Error("A value with the given key could not be found.");
  return e;
}, Xn = (s, t) => {
  const e = Array.from(s).filter(t);
  if (e.length > 1)
    throw Error("More than one element was found.");
  if (e.length === 0)
    throw Error("No element was found.");
  const [n] = e;
  return s.delete(n), n;
}, or = (s, t, e, n) => {
  const i = Wt(s, t), r = Xn(i, (o) => o[0] === e && o[1] === n);
  return i.size === 0 && s.delete(t), r;
}, ln = (s) => Wt(ir, s), Ve = (s) => {
  if (Fe.has(s))
    throw new Error("The AudioNode is already stored.");
  Fe.add(s), ln(s).forEach((t) => t(!0));
}, ar = (s) => "port" in s, hn = (s) => {
  if (!Fe.has(s))
    throw new Error("The AudioNode is not stored.");
  Fe.delete(s), ln(s).forEach((t) => t(!1));
}, ks = (s, t) => {
  !ar(s) && t.every((e) => e.size === 0) && hn(s);
}, Io = (s, t, e, n, i, r, o, a, c, u, l, h, p) => {
  const f = /* @__PURE__ */ new WeakMap();
  return (d, m, _, y, b) => {
    const { activeInputs: x, passiveInputs: S } = r(m), { outputs: g } = r(d), w = a(d), T = (v) => {
      const N = c(m), A = c(d);
      if (v) {
        const k = or(S, d, _, y);
        s(x, d, k, !1), !b && !h(d) && e(A, N, _, y), p(m) && Ve(m);
      } else {
        const k = n(x, d, _, y);
        t(S, y, k, !1), !b && !h(d) && i(A, N, _, y);
        const C = o(m);
        if (C === 0)
          l(m) && ks(m, x);
        else {
          const E = f.get(m);
          E !== void 0 && clearTimeout(E), f.set(m, setTimeout(() => {
            l(m) && ks(m, x);
          }, C * 1e3));
        }
      }
    };
    return u(g, [m, _, y], (v) => v[0] === m && v[1] === _ && v[2] === y, !0) ? (w.add(T), l(d) ? s(x, d, [_, y, T], !0) : t(S, y, [d, _, T], !0), !0) : !1;
  };
}, Mo = (s) => (t, e, [n, i, r], o) => {
  const a = t.get(n);
  a === void 0 ? t.set(n, /* @__PURE__ */ new Set([[i, e, r]])) : s(a, [i, e, r], (c) => c[0] === i && c[1] === e, o);
}, Ro = (s) => (t, e) => {
  const n = s(t, {
    channelCount: 1,
    channelCountMode: "explicit",
    channelInterpretation: "discrete",
    gain: 0
  });
  e.connect(n).connect(t.destination);
  const i = () => {
    e.removeEventListener("ended", i), e.disconnect(n), n.disconnect();
  };
  e.addEventListener("ended", i);
}, Po = (s) => (t, e) => {
  s(t).add(e);
}, Fo = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  fftSize: 2048,
  maxDecibels: -30,
  minDecibels: -100,
  smoothingTimeConstant: 0.8
}, Vo = (s, t, e, n, i, r) => class extends s {
  constructor(a, c) {
    const u = i(a), l = { ...Fo, ...c }, h = n(u, l), p = r(u) ? t() : null;
    super(a, !1, h, p), this._nativeAnalyserNode = h;
  }
  get fftSize() {
    return this._nativeAnalyserNode.fftSize;
  }
  set fftSize(a) {
    this._nativeAnalyserNode.fftSize = a;
  }
  get frequencyBinCount() {
    return this._nativeAnalyserNode.frequencyBinCount;
  }
  get maxDecibels() {
    return this._nativeAnalyserNode.maxDecibels;
  }
  set maxDecibels(a) {
    const c = this._nativeAnalyserNode.maxDecibels;
    if (this._nativeAnalyserNode.maxDecibels = a, !(a > this._nativeAnalyserNode.minDecibels))
      throw this._nativeAnalyserNode.maxDecibels = c, e();
  }
  get minDecibels() {
    return this._nativeAnalyserNode.minDecibels;
  }
  set minDecibels(a) {
    const c = this._nativeAnalyserNode.minDecibels;
    if (this._nativeAnalyserNode.minDecibels = a, !(this._nativeAnalyserNode.maxDecibels > a))
      throw this._nativeAnalyserNode.minDecibels = c, e();
  }
  get smoothingTimeConstant() {
    return this._nativeAnalyserNode.smoothingTimeConstant;
  }
  set smoothingTimeConstant(a) {
    this._nativeAnalyserNode.smoothingTimeConstant = a;
  }
  getByteFrequencyData(a) {
    this._nativeAnalyserNode.getByteFrequencyData(a);
  }
  getByteTimeDomainData(a) {
    this._nativeAnalyserNode.getByteTimeDomainData(a);
  }
  getFloatFrequencyData(a) {
    this._nativeAnalyserNode.getFloatFrequencyData(a);
  }
  getFloatTimeDomainData(a) {
    this._nativeAnalyserNode.getFloatTimeDomainData(a);
  }
}, yt = (s, t) => s.context === t, qo = (s, t, e) => () => {
  const n = /* @__PURE__ */ new WeakMap(), i = async (r, o) => {
    let a = t(r);
    if (!yt(a, o)) {
      const u = {
        channelCount: a.channelCount,
        channelCountMode: a.channelCountMode,
        channelInterpretation: a.channelInterpretation,
        fftSize: a.fftSize,
        maxDecibels: a.maxDecibels,
        minDecibels: a.minDecibels,
        smoothingTimeConstant: a.smoothingTimeConstant
      };
      a = s(o, u);
    }
    return n.set(o, a), await e(r, o, a), a;
  };
  return {
    render(r, o) {
      const a = n.get(o);
      return a !== void 0 ? Promise.resolve(a) : i(r, o);
    }
  };
}, Pn = (s) => {
  try {
    s.copyToChannel(new Float32Array(1), 0, -1);
  } catch {
    return !1;
  }
  return !0;
}, Zt = () => new DOMException("", "IndexSizeError"), Vs = (s) => {
  s.getChannelData = /* @__PURE__ */ ((t) => (e) => {
    try {
      return t.call(s, e);
    } catch (n) {
      throw n.code === 12 ? Zt() : n;
    }
  })(s.getChannelData);
}, Lo = {
  numberOfChannels: 1
}, Wo = (s, t, e, n, i, r, o, a) => {
  let c = null;
  return class cr {
    constructor(l) {
      if (i === null)
        throw new Error("Missing the native OfflineAudioContext constructor.");
      const { length: h, numberOfChannels: p, sampleRate: f } = { ...Lo, ...l };
      c === null && (c = new i(1, 1, 44100));
      const d = n !== null && t(r, r) ? new n({ length: h, numberOfChannels: p, sampleRate: f }) : c.createBuffer(p, h, f);
      if (d.numberOfChannels === 0)
        throw e();
      return typeof d.copyFromChannel != "function" ? (o(d), Vs(d)) : t(Pn, () => Pn(d)) || a(d), s.add(d), d;
    }
    static [Symbol.hasInstance](l) {
      return l !== null && typeof l == "object" && Object.getPrototypeOf(l) === cr.prototype || s.has(l);
    }
  };
}, St = -34028234663852886e22, wt = -St, Kt = (s) => Fe.has(s), jo = {
  buffer: null,
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  // Bug #149: Safari does not yet support the detune AudioParam.
  loop: !1,
  loopEnd: 0,
  loopStart: 0,
  playbackRate: 1
}, Bo = (s, t, e, n, i, r, o, a) => class extends s {
  constructor(u, l) {
    const h = r(u), p = { ...jo, ...l }, f = i(h, p), d = o(h), m = d ? t() : null;
    super(u, !1, f, m), this._audioBufferSourceNodeRenderer = m, this._isBufferNullified = !1, this._isBufferSet = p.buffer !== null, this._nativeAudioBufferSourceNode = f, this._onended = null, this._playbackRate = e(this, d, f.playbackRate, wt, St);
  }
  get buffer() {
    return this._isBufferNullified ? null : this._nativeAudioBufferSourceNode.buffer;
  }
  set buffer(u) {
    if (this._nativeAudioBufferSourceNode.buffer = u, u !== null) {
      if (this._isBufferSet)
        throw n();
      this._isBufferSet = !0;
    }
  }
  get loop() {
    return this._nativeAudioBufferSourceNode.loop;
  }
  set loop(u) {
    this._nativeAudioBufferSourceNode.loop = u;
  }
  get loopEnd() {
    return this._nativeAudioBufferSourceNode.loopEnd;
  }
  set loopEnd(u) {
    this._nativeAudioBufferSourceNode.loopEnd = u;
  }
  get loopStart() {
    return this._nativeAudioBufferSourceNode.loopStart;
  }
  set loopStart(u) {
    this._nativeAudioBufferSourceNode.loopStart = u;
  }
  get onended() {
    return this._onended;
  }
  set onended(u) {
    const l = typeof u == "function" ? a(this, u) : null;
    this._nativeAudioBufferSourceNode.onended = l;
    const h = this._nativeAudioBufferSourceNode.onended;
    this._onended = h !== null && h === l ? u : h;
  }
  get playbackRate() {
    return this._playbackRate;
  }
  start(u = 0, l = 0, h) {
    if (this._nativeAudioBufferSourceNode.start(u, l, h), this._audioBufferSourceNodeRenderer !== null && (this._audioBufferSourceNodeRenderer.start = h === void 0 ? [u, l] : [u, l, h]), this.context.state !== "closed") {
      Ve(this);
      const p = () => {
        this._nativeAudioBufferSourceNode.removeEventListener("ended", p), Kt(this) && hn(this);
      };
      this._nativeAudioBufferSourceNode.addEventListener("ended", p);
    }
  }
  stop(u = 0) {
    this._nativeAudioBufferSourceNode.stop(u), this._audioBufferSourceNodeRenderer !== null && (this._audioBufferSourceNodeRenderer.stop = u);
  }
}, Uo = (s, t, e, n, i) => () => {
  const r = /* @__PURE__ */ new WeakMap();
  let o = null, a = null;
  const c = async (u, l) => {
    let h = e(u);
    const p = yt(h, l);
    if (!p) {
      const f = {
        buffer: h.buffer,
        channelCount: h.channelCount,
        channelCountMode: h.channelCountMode,
        channelInterpretation: h.channelInterpretation,
        // Bug #149: Safari does not yet support the detune AudioParam.
        loop: h.loop,
        loopEnd: h.loopEnd,
        loopStart: h.loopStart,
        playbackRate: h.playbackRate.value
      };
      h = t(l, f), o !== null && h.start(...o), a !== null && h.stop(a);
    }
    return r.set(l, h), p ? await s(l, u.playbackRate, h.playbackRate) : await n(l, u.playbackRate, h.playbackRate), await i(u, l, h), h;
  };
  return {
    set start(u) {
      o = u;
    },
    set stop(u) {
      a = u;
    },
    render(u, l) {
      const h = r.get(l);
      return h !== void 0 ? Promise.resolve(h) : c(u, l);
    }
  };
}, Go = (s) => "playbackRate" in s, zo = (s) => "frequency" in s && "gain" in s, $o = (s) => "offset" in s, Zo = (s) => !("frequency" in s) && "gain" in s, Xo = (s) => "detune" in s && "frequency" in s && !("gain" in s), Yo = (s) => "pan" in s, Tt = (s) => Wt(nr, s), dn = (s) => Wt(sr, s), As = (s, t) => {
  const { activeInputs: e } = Tt(s);
  e.forEach((i) => i.forEach(([r]) => {
    t.includes(s) || As(r, [...t, s]);
  }));
  const n = Go(s) ? [
    // Bug #149: Safari does not yet support the detune AudioParam.
    s.playbackRate
  ] : ar(s) ? Array.from(s.parameters.values()) : zo(s) ? [s.Q, s.detune, s.frequency, s.gain] : $o(s) ? [s.offset] : Zo(s) ? [s.gain] : Xo(s) ? [s.detune, s.frequency] : Yo(s) ? [s.pan] : [];
  for (const i of n) {
    const r = dn(i);
    r !== void 0 && r.activeInputs.forEach(([o]) => As(o, t));
  }
  Kt(s) && hn(s);
}, ur = (s) => {
  As(s.destination, []);
}, Ho = (s) => s === void 0 || typeof s == "number" || typeof s == "string" && (s === "balanced" || s === "interactive" || s === "playback"), Qo = (s, t, e, n, i, r, o, a, c) => class extends s {
  constructor(l = {}) {
    if (c === null)
      throw new Error("Missing the native AudioContext constructor.");
    let h;
    try {
      h = new c(l);
    } catch (d) {
      throw d.code === 12 && d.message === "sampleRate is not in range" ? e() : d;
    }
    if (h === null)
      throw n();
    if (!Ho(l.latencyHint))
      throw new TypeError(`The provided value '${l.latencyHint}' is not a valid enum value of type AudioContextLatencyCategory.`);
    if (l.sampleRate !== void 0 && h.sampleRate !== l.sampleRate)
      throw e();
    super(h, 2);
    const { latencyHint: p } = l, { sampleRate: f } = h;
    if (this._baseLatency = typeof h.baseLatency == "number" ? h.baseLatency : p === "balanced" ? 512 / f : p === "interactive" || p === void 0 ? 256 / f : p === "playback" ? 1024 / f : (
      /*
       * @todo The min (256) and max (16384) values are taken from the allowed bufferSize values of a
       * ScriptProcessorNode.
       */
      Math.max(2, Math.min(128, Math.round(p * f / 128))) * 128 / f
    ), this._nativeAudioContext = h, c.name === "webkitAudioContext" ? (this._nativeGainNode = h.createGain(), this._nativeOscillatorNode = h.createOscillator(), this._nativeGainNode.gain.value = 1e-37, this._nativeOscillatorNode.connect(this._nativeGainNode).connect(h.destination), this._nativeOscillatorNode.start()) : (this._nativeGainNode = null, this._nativeOscillatorNode = null), this._state = null, h.state === "running") {
      this._state = "suspended";
      const d = () => {
        this._state === "suspended" && (this._state = null), h.removeEventListener("statechange", d);
      };
      h.addEventListener("statechange", d);
    }
  }
  get baseLatency() {
    return this._baseLatency;
  }
  get state() {
    return this._state !== null ? this._state : this._nativeAudioContext.state;
  }
  close() {
    return this.state === "closed" ? this._nativeAudioContext.close().then(() => {
      throw t();
    }) : (this._state === "suspended" && (this._state = null), this._nativeAudioContext.close().then(() => {
      this._nativeGainNode !== null && this._nativeOscillatorNode !== null && (this._nativeOscillatorNode.stop(), this._nativeGainNode.disconnect(), this._nativeOscillatorNode.disconnect()), ur(this);
    }));
  }
  createMediaElementSource(l) {
    return new i(this, { mediaElement: l });
  }
  createMediaStreamDestination() {
    return new r(this);
  }
  createMediaStreamSource(l) {
    return new o(this, { mediaStream: l });
  }
  createMediaStreamTrackSource(l) {
    return new a(this, { mediaStreamTrack: l });
  }
  resume() {
    return this._state === "suspended" ? new Promise((l, h) => {
      const p = () => {
        this._nativeAudioContext.removeEventListener("statechange", p), this._nativeAudioContext.state === "running" ? l() : this.resume().then(l, h);
      };
      this._nativeAudioContext.addEventListener("statechange", p);
    }) : this._nativeAudioContext.resume().catch((l) => {
      throw l === void 0 || l.code === 15 ? t() : l;
    });
  }
  suspend() {
    return this._nativeAudioContext.suspend().catch((l) => {
      throw l === void 0 ? t() : l;
    });
  }
}, Jo = (s, t, e, n, i, r, o, a) => class extends s {
  constructor(u, l) {
    const h = r(u), p = o(h), f = i(h, l, p), d = p ? t(a) : null;
    super(u, !1, f, d), this._isNodeOfNativeOfflineAudioContext = p, this._nativeAudioDestinationNode = f;
  }
  get channelCount() {
    return this._nativeAudioDestinationNode.channelCount;
  }
  set channelCount(u) {
    if (this._isNodeOfNativeOfflineAudioContext)
      throw n();
    if (u > this._nativeAudioDestinationNode.maxChannelCount)
      throw e();
    this._nativeAudioDestinationNode.channelCount = u;
  }
  get channelCountMode() {
    return this._nativeAudioDestinationNode.channelCountMode;
  }
  set channelCountMode(u) {
    if (this._isNodeOfNativeOfflineAudioContext)
      throw n();
    this._nativeAudioDestinationNode.channelCountMode = u;
  }
  get maxChannelCount() {
    return this._nativeAudioDestinationNode.maxChannelCount;
  }
}, Ko = (s) => {
  const t = /* @__PURE__ */ new WeakMap(), e = async (n, i) => {
    const r = i.destination;
    return t.set(i, r), await s(n, i, r), r;
  };
  return {
    render(n, i) {
      const r = t.get(i);
      return r !== void 0 ? Promise.resolve(r) : e(n, i);
    }
  };
}, ta = (s, t, e, n, i, r, o, a) => (c, u) => {
  const l = u.listener, h = () => {
    const g = new Float32Array(1), w = t(u, {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "speakers",
      numberOfInputs: 9
    }), T = o(u);
    let v = !1, N = [0, 0, -1, 0, 1, 0], A = [0, 0, 0];
    const k = () => {
      if (v)
        return;
      v = !0;
      const V = n(u, 256, 9, 0);
      V.onaudioprocess = ({ inputBuffer: M }) => {
        const P = [
          r(M, g, 0),
          r(M, g, 1),
          r(M, g, 2),
          r(M, g, 3),
          r(M, g, 4),
          r(M, g, 5)
        ];
        P.some((q, B) => q !== N[B]) && (l.setOrientation(...P), N = P);
        const G = [
          r(M, g, 6),
          r(M, g, 7),
          r(M, g, 8)
        ];
        G.some((q, B) => q !== A[B]) && (l.setPosition(...G), A = G);
      }, w.connect(V);
    }, C = (V) => (M) => {
      M !== N[V] && (N[V] = M, l.setOrientation(...N));
    }, E = (V) => (M) => {
      M !== A[V] && (A[V] = M, l.setPosition(...A));
    }, D = (V, M, P) => {
      const G = e(u, {
        channelCount: 1,
        channelCountMode: "explicit",
        channelInterpretation: "discrete",
        offset: M
      });
      G.connect(w, 0, V), G.start(), Object.defineProperty(G.offset, "defaultValue", {
        get() {
          return M;
        }
      });
      const q = s({ context: c }, T, G.offset, wt, St);
      return a(q, "value", (B) => () => B.call(q), (B) => (W) => {
        try {
          B.call(q, W);
        } catch (K) {
          if (K.code !== 9)
            throw K;
        }
        k(), T && P(W);
      }), q.cancelAndHoldAtTime = /* @__PURE__ */ ((B) => T ? () => {
        throw i();
      } : (...W) => {
        const K = B.apply(q, W);
        return k(), K;
      })(q.cancelAndHoldAtTime), q.cancelScheduledValues = /* @__PURE__ */ ((B) => T ? () => {
        throw i();
      } : (...W) => {
        const K = B.apply(q, W);
        return k(), K;
      })(q.cancelScheduledValues), q.exponentialRampToValueAtTime = /* @__PURE__ */ ((B) => T ? () => {
        throw i();
      } : (...W) => {
        const K = B.apply(q, W);
        return k(), K;
      })(q.exponentialRampToValueAtTime), q.linearRampToValueAtTime = /* @__PURE__ */ ((B) => T ? () => {
        throw i();
      } : (...W) => {
        const K = B.apply(q, W);
        return k(), K;
      })(q.linearRampToValueAtTime), q.setTargetAtTime = /* @__PURE__ */ ((B) => T ? () => {
        throw i();
      } : (...W) => {
        const K = B.apply(q, W);
        return k(), K;
      })(q.setTargetAtTime), q.setValueAtTime = /* @__PURE__ */ ((B) => T ? () => {
        throw i();
      } : (...W) => {
        const K = B.apply(q, W);
        return k(), K;
      })(q.setValueAtTime), q.setValueCurveAtTime = /* @__PURE__ */ ((B) => T ? () => {
        throw i();
      } : (...W) => {
        const K = B.apply(q, W);
        return k(), K;
      })(q.setValueCurveAtTime), q;
    };
    return {
      forwardX: D(0, 0, C(0)),
      forwardY: D(1, 0, C(1)),
      forwardZ: D(2, -1, C(2)),
      positionX: D(6, 0, E(0)),
      positionY: D(7, 0, E(1)),
      positionZ: D(8, 0, E(2)),
      upX: D(3, 0, C(3)),
      upY: D(4, 1, C(4)),
      upZ: D(5, 0, C(5))
    };
  }, { forwardX: p, forwardY: f, forwardZ: d, positionX: m, positionY: _, positionZ: y, upX: b, upY: x, upZ: S } = l.forwardX === void 0 ? h() : l;
  return {
    get forwardX() {
      return p;
    },
    get forwardY() {
      return f;
    },
    get forwardZ() {
      return d;
    },
    get positionX() {
      return m;
    },
    get positionY() {
      return _;
    },
    get positionZ() {
      return y;
    },
    get upX() {
      return b;
    },
    get upY() {
      return x;
    },
    get upZ() {
      return S;
    }
  };
}, Fn = (s) => "context" in s, pn = (s) => Fn(s[0]), be = (s, t, e, n) => {
  for (const i of s)
    if (e(i)) {
      if (n)
        return !1;
      throw Error("The set contains at least one similar element.");
    }
  return s.add(t), !0;
}, Fi = (s, t, [e, n], i) => {
  be(s, [t, e, n], (r) => r[0] === t && r[1] === e, i);
}, Vi = (s, [t, e, n], i) => {
  const r = s.get(t);
  r === void 0 ? s.set(t, /* @__PURE__ */ new Set([[e, n]])) : be(r, [e, n], (o) => o[0] === e, i);
}, ze = (s) => "inputs" in s, Vn = (s, t, e, n) => {
  if (ze(t)) {
    const i = t.inputs[n];
    return s.connect(i, e, 0), [i, e, 0];
  }
  return s.connect(t, e, n), [t, e, n];
}, lr = (s, t, e) => {
  for (const n of s)
    if (n[0] === t && n[1] === e)
      return s.delete(n), n;
  return null;
}, ea = (s, t, e) => Xn(s, (n) => n[0] === t && n[1] === e), hr = (s, t) => {
  if (!ln(s).delete(t))
    throw new Error("Missing the expected event listener.");
}, dr = (s, t, e) => {
  const n = Wt(s, t), i = Xn(n, (r) => r[0] === e);
  return n.size === 0 && s.delete(t), i;
}, qn = (s, t, e, n) => {
  ze(t) ? s.disconnect(t.inputs[n], e, 0) : s.disconnect(t, e, n);
}, st = (s) => Wt(Ps, s), on = (s) => Wt(Fs, s), we = (s) => xs.has(s), En = (s) => !Fe.has(s), qi = (s, t) => new Promise((e) => {
  if (t !== null)
    e(!0);
  else {
    const n = s.createScriptProcessor(256, 1, 1), i = s.createGain(), r = s.createBuffer(1, 2, 44100), o = r.getChannelData(0);
    o[0] = 1, o[1] = 1;
    const a = s.createBufferSource();
    a.buffer = r, a.loop = !0, a.connect(n).connect(s.destination), a.connect(i), a.disconnect(i), n.onaudioprocess = (c) => {
      const u = c.inputBuffer.getChannelData(0);
      Array.prototype.some.call(u, (l) => l === 1) ? e(!0) : e(!1), a.stop(), n.onaudioprocess = null, a.disconnect(n), n.disconnect(s.destination);
    }, a.start();
  }
}), _s = (s, t) => {
  const e = /* @__PURE__ */ new Map();
  for (const n of s)
    for (const i of n) {
      const r = e.get(i);
      e.set(i, r === void 0 ? 1 : r + 1);
    }
  e.forEach((n, i) => t(i, n));
}, Ln = (s) => "context" in s, na = (s) => {
  const t = /* @__PURE__ */ new Map();
  s.connect = /* @__PURE__ */ ((e) => (n, i = 0, r = 0) => {
    const o = Ln(n) ? e(n, i, r) : e(n, i), a = t.get(n);
    return a === void 0 ? t.set(n, [{ input: r, output: i }]) : a.every((c) => c.input !== r || c.output !== i) && a.push({ input: r, output: i }), o;
  })(s.connect.bind(s)), s.disconnect = /* @__PURE__ */ ((e) => (n, i, r) => {
    if (e.apply(s), n === void 0)
      t.clear();
    else if (typeof n == "number")
      for (const [o, a] of t) {
        const c = a.filter((u) => u.output !== n);
        c.length === 0 ? t.delete(o) : t.set(o, c);
      }
    else if (t.has(n))
      if (i === void 0)
        t.delete(n);
      else {
        const o = t.get(n);
        if (o !== void 0) {
          const a = o.filter((c) => c.output !== i && (c.input !== r || r === void 0));
          a.length === 0 ? t.delete(n) : t.set(n, a);
        }
      }
    for (const [o, a] of t)
      a.forEach((c) => {
        Ln(o) ? s.connect(o, c.output, c.input) : s.connect(o, c.output);
      });
  })(s.disconnect);
}, sa = (s, t, e, n) => {
  const { activeInputs: i, passiveInputs: r } = dn(t), { outputs: o } = Tt(s), a = ln(s), c = (u) => {
    const l = st(s), h = on(t);
    if (u) {
      const p = dr(r, s, e);
      Fi(i, s, p, !1), !n && !we(s) && l.connect(h, e);
    } else {
      const p = ea(i, s, e);
      Vi(r, p, !1), !n && !we(s) && l.disconnect(h, e);
    }
  };
  return be(o, [t, e], (u) => u[0] === t && u[1] === e, !0) ? (a.add(c), Kt(s) ? Fi(i, s, [e, c], !0) : Vi(r, [s, e, c], !0), !0) : !1;
}, ia = (s, t, e, n) => {
  const { activeInputs: i, passiveInputs: r } = Tt(t), o = lr(i[n], s, e);
  return o === null ? [or(r, s, e, n)[2], !1] : [o[2], !0];
}, ra = (s, t, e) => {
  const { activeInputs: n, passiveInputs: i } = dn(t), r = lr(n, s, e);
  return r === null ? [dr(i, s, e)[1], !1] : [r[2], !0];
}, qs = (s, t, e, n, i) => {
  const [r, o] = ia(s, e, n, i);
  if (r !== null && (hr(s, r), o && !t && !we(s) && qn(st(s), st(e), n, i)), Kt(e)) {
    const { activeInputs: a } = Tt(e);
    ks(e, a);
  }
}, Ls = (s, t, e, n) => {
  const [i, r] = ra(s, e, n);
  i !== null && (hr(s, i), r && !t && !we(s) && st(s).disconnect(on(e), n));
}, oa = (s, t) => {
  const e = Tt(s), n = [];
  for (const i of e.outputs)
    pn(i) ? qs(s, t, ...i) : Ls(s, t, ...i), n.push(i[0]);
  return e.outputs.clear(), n;
}, aa = (s, t, e) => {
  const n = Tt(s), i = [];
  for (const r of n.outputs)
    r[1] === e && (pn(r) ? qs(s, t, ...r) : Ls(s, t, ...r), i.push(r[0]), n.outputs.delete(r));
  return i;
}, ca = (s, t, e, n, i) => {
  const r = Tt(s);
  return Array.from(r.outputs).filter((o) => o[0] === e && (n === void 0 || o[1] === n) && (i === void 0 || o[2] === i)).map((o) => (pn(o) ? qs(s, t, ...o) : Ls(s, t, ...o), r.outputs.delete(o), o[0]));
}, ua = (s, t, e, n, i, r, o, a, c, u, l, h, p, f, d, m) => class extends u {
  constructor(y, b, x, S) {
    super(x), this._context = y, this._nativeAudioNode = x;
    const g = l(y);
    h(g) && e(qi, () => qi(g, m)) !== !0 && na(x), Ps.set(this, x), ir.set(this, /* @__PURE__ */ new Set()), y.state !== "closed" && b && Ve(this), s(this, S, x);
  }
  get channelCount() {
    return this._nativeAudioNode.channelCount;
  }
  set channelCount(y) {
    this._nativeAudioNode.channelCount = y;
  }
  get channelCountMode() {
    return this._nativeAudioNode.channelCountMode;
  }
  set channelCountMode(y) {
    this._nativeAudioNode.channelCountMode = y;
  }
  get channelInterpretation() {
    return this._nativeAudioNode.channelInterpretation;
  }
  set channelInterpretation(y) {
    this._nativeAudioNode.channelInterpretation = y;
  }
  get context() {
    return this._context;
  }
  get numberOfInputs() {
    return this._nativeAudioNode.numberOfInputs;
  }
  get numberOfOutputs() {
    return this._nativeAudioNode.numberOfOutputs;
  }
  // tslint:disable-next-line:invalid-void
  connect(y, b = 0, x = 0) {
    if (b < 0 || b >= this._nativeAudioNode.numberOfOutputs)
      throw i();
    const S = l(this._context), g = d(S);
    if (p(y) || f(y))
      throw r();
    if (Fn(y)) {
      const v = st(y);
      try {
        const A = Vn(this._nativeAudioNode, v, b, x), k = En(this);
        (g || k) && this._nativeAudioNode.disconnect(...A), this.context.state !== "closed" && !k && En(y) && Ve(y);
      } catch (A) {
        throw A.code === 12 ? r() : A;
      }
      if (t(this, y, b, x, g)) {
        const A = c([this], y);
        _s(A, n(g));
      }
      return y;
    }
    const w = on(y);
    if (w.name === "playbackRate" && w.maxValue === 1024)
      throw o();
    try {
      this._nativeAudioNode.connect(w, b), (g || En(this)) && this._nativeAudioNode.disconnect(w, b);
    } catch (v) {
      throw v.code === 12 ? r() : v;
    }
    if (sa(this, y, b, g)) {
      const v = c([this], y);
      _s(v, n(g));
    }
  }
  disconnect(y, b, x) {
    let S;
    const g = l(this._context), w = d(g);
    if (y === void 0)
      S = oa(this, w);
    else if (typeof y == "number") {
      if (y < 0 || y >= this.numberOfOutputs)
        throw i();
      S = aa(this, w, y);
    } else {
      if (b !== void 0 && (b < 0 || b >= this.numberOfOutputs) || Fn(y) && x !== void 0 && (x < 0 || x >= y.numberOfInputs))
        throw i();
      if (S = ca(this, w, y, b, x), S.length === 0)
        throw r();
    }
    for (const T of S) {
      const v = c([this], T);
      _s(v, a);
    }
  }
}, la = (s, t, e, n, i, r, o, a, c, u, l, h, p) => (f, d, m, _ = null, y = null) => {
  const b = m.value, x = new wo(b), S = d ? n(x) : null, g = {
    get defaultValue() {
      return b;
    },
    get maxValue() {
      return _ === null ? m.maxValue : _;
    },
    get minValue() {
      return y === null ? m.minValue : y;
    },
    get value() {
      return m.value;
    },
    set value(w) {
      m.value = w, g.setValueAtTime(w, f.context.currentTime);
    },
    cancelAndHoldAtTime(w) {
      if (typeof m.cancelAndHoldAtTime == "function")
        S === null && x.flush(f.context.currentTime), x.add(i(w)), m.cancelAndHoldAtTime(w);
      else {
        const T = Array.from(x).pop();
        S === null && x.flush(f.context.currentTime), x.add(i(w));
        const v = Array.from(x).pop();
        m.cancelScheduledValues(w), T !== v && v !== void 0 && (v.type === "exponentialRampToValue" ? m.exponentialRampToValueAtTime(v.value, v.endTime) : v.type === "linearRampToValue" ? m.linearRampToValueAtTime(v.value, v.endTime) : v.type === "setValue" ? m.setValueAtTime(v.value, v.startTime) : v.type === "setValueCurve" && m.setValueCurveAtTime(v.values, v.startTime, v.duration));
      }
      return g;
    },
    cancelScheduledValues(w) {
      return S === null && x.flush(f.context.currentTime), x.add(r(w)), m.cancelScheduledValues(w), g;
    },
    exponentialRampToValueAtTime(w, T) {
      if (w === 0)
        throw new RangeError();
      if (!Number.isFinite(T) || T < 0)
        throw new RangeError();
      const v = f.context.currentTime;
      return S === null && x.flush(v), Array.from(x).length === 0 && (x.add(u(b, v)), m.setValueAtTime(b, v)), x.add(o(w, T)), m.exponentialRampToValueAtTime(w, T), g;
    },
    linearRampToValueAtTime(w, T) {
      const v = f.context.currentTime;
      return S === null && x.flush(v), Array.from(x).length === 0 && (x.add(u(b, v)), m.setValueAtTime(b, v)), x.add(a(w, T)), m.linearRampToValueAtTime(w, T), g;
    },
    setTargetAtTime(w, T, v) {
      return S === null && x.flush(f.context.currentTime), x.add(c(w, T, v)), m.setTargetAtTime(w, T, v), g;
    },
    setValueAtTime(w, T) {
      return S === null && x.flush(f.context.currentTime), x.add(u(w, T)), m.setValueAtTime(w, T), g;
    },
    setValueCurveAtTime(w, T, v) {
      const N = w instanceof Float32Array ? w : new Float32Array(w);
      if (h !== null && h.name === "webkitAudioContext") {
        const A = T + v, k = f.context.sampleRate, C = Math.ceil(T * k), E = Math.floor(A * k), D = E - C, V = new Float32Array(D);
        for (let P = 0; P < D; P += 1) {
          const G = (N.length - 1) / v * ((C + P) / k - T), q = Math.floor(G), B = Math.ceil(G);
          V[P] = q === B ? N[q] : (1 - (G - q)) * N[q] + (1 - (B - G)) * N[B];
        }
        S === null && x.flush(f.context.currentTime), x.add(l(V, T, v)), m.setValueCurveAtTime(V, T, v);
        const M = E / k;
        M < A && p(g, V[V.length - 1], M), p(g, N[N.length - 1], A);
      } else
        S === null && x.flush(f.context.currentTime), x.add(l(N, T, v)), m.setValueCurveAtTime(N, T, v);
      return g;
    }
  };
  return e.set(g, m), t.set(g, f), s(g, S), g;
}, ha = (s) => ({
  replay(t) {
    for (const e of s)
      if (e.type === "exponentialRampToValue") {
        const { endTime: n, value: i } = e;
        t.exponentialRampToValueAtTime(i, n);
      } else if (e.type === "linearRampToValue") {
        const { endTime: n, value: i } = e;
        t.linearRampToValueAtTime(i, n);
      } else if (e.type === "setTarget") {
        const { startTime: n, target: i, timeConstant: r } = e;
        t.setTargetAtTime(i, n, r);
      } else if (e.type === "setValue") {
        const { startTime: n, value: i } = e;
        t.setValueAtTime(i, n);
      } else if (e.type === "setValueCurve") {
        const { duration: n, startTime: i, values: r } = e;
        t.setValueCurveAtTime(r, i, n);
      } else
        throw new Error("Can't apply an unknown automation.");
  }
});
class pr {
  constructor(t) {
    this._map = new Map(t);
  }
  get size() {
    return this._map.size;
  }
  entries() {
    return this._map.entries();
  }
  forEach(t, e = null) {
    return this._map.forEach((n, i) => t.call(e, n, i, this));
  }
  get(t) {
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
  keys() {
    return this._map.keys();
  }
  values() {
    return this._map.values();
  }
}
const da = {
  channelCount: 2,
  // Bug #61: The channelCountMode should be 'max' according to the spec but is set to 'explicit' to achieve consistent behavior.
  channelCountMode: "explicit",
  channelInterpretation: "speakers",
  numberOfInputs: 1,
  numberOfOutputs: 1,
  parameterData: {},
  processorOptions: {}
}, pa = (s, t, e, n, i, r, o, a, c, u, l, h, p, f) => class extends t {
  constructor(m, _, y) {
    var b;
    const x = a(m), S = c(x), g = l({ ...da, ...y });
    p(g);
    const w = Cs.get(x), T = w?.get(_), v = S || x.state !== "closed" ? x : (b = o(x)) !== null && b !== void 0 ? b : x, N = i(v, S ? null : m.baseLatency, u, _, T, g), A = S ? n(_, g, T) : null;
    super(m, !0, N, A);
    const k = [];
    N.parameters.forEach((E, D) => {
      const V = e(this, S, E);
      k.push([D, V]);
    }), this._nativeAudioWorkletNode = N, this._onprocessorerror = null, this._parameters = new pr(k), S && s(x, this);
    const { activeInputs: C } = r(this);
    h(N, C);
  }
  get onprocessorerror() {
    return this._onprocessorerror;
  }
  set onprocessorerror(m) {
    const _ = typeof m == "function" ? f(this, m) : null;
    this._nativeAudioWorkletNode.onprocessorerror = _;
    const y = this._nativeAudioWorkletNode.onprocessorerror;
    this._onprocessorerror = y !== null && y === _ ? m : y;
  }
  get parameters() {
    return this._parameters === null ? this._nativeAudioWorkletNode.parameters : this._parameters;
  }
  get port() {
    return this._nativeAudioWorkletNode.port;
  }
};
function Wn(s, t, e, n, i) {
  if (typeof s.copyFromChannel == "function")
    t[e].byteLength === 0 && (t[e] = new Float32Array(128)), s.copyFromChannel(t[e], n, i);
  else {
    const r = s.getChannelData(n);
    if (t[e].byteLength === 0)
      t[e] = r.slice(i, i + 128);
    else {
      const o = new Float32Array(r.buffer, i * Float32Array.BYTES_PER_ELEMENT, 128);
      t[e].set(o);
    }
  }
}
const fr = (s, t, e, n, i) => {
  typeof s.copyToChannel == "function" ? t[e].byteLength !== 0 && s.copyToChannel(t[e], n, i) : t[e].byteLength !== 0 && s.getChannelData(n).set(t[e], i);
}, jn = (s, t) => {
  const e = [];
  for (let n = 0; n < s; n += 1) {
    const i = [], r = typeof t == "number" ? t : t[n];
    for (let o = 0; o < r; o += 1)
      i.push(new Float32Array(128));
    e.push(i);
  }
  return e;
}, fa = (s, t) => {
  const e = Wt(Ss, s), n = st(t);
  return Wt(e, n);
}, ma = async (s, t, e, n, i, r, o) => {
  const a = t === null ? Math.ceil(s.context.length / 128) * 128 : t.length, c = n.channelCount * n.numberOfInputs, u = i.reduce((_, y) => _ + y, 0), l = u === 0 ? null : e.createBuffer(u, a, e.sampleRate);
  if (r === void 0)
    throw new Error("Missing the processor constructor.");
  const h = Tt(s), p = await fa(e, s), f = jn(n.numberOfInputs, n.channelCount), d = jn(n.numberOfOutputs, i), m = Array.from(s.parameters.keys()).reduce((_, y) => ({ ..._, [y]: new Float32Array(128) }), {});
  for (let _ = 0; _ < a; _ += 128) {
    if (n.numberOfInputs > 0 && t !== null)
      for (let y = 0; y < n.numberOfInputs; y += 1)
        for (let b = 0; b < n.channelCount; b += 1)
          Wn(t, f[y], b, b, _);
    r.parameterDescriptors !== void 0 && t !== null && r.parameterDescriptors.forEach(({ name: y }, b) => {
      Wn(t, m, y, c + b, _);
    });
    for (let y = 0; y < n.numberOfInputs; y += 1)
      for (let b = 0; b < i[y]; b += 1)
        d[y][b].byteLength === 0 && (d[y][b] = new Float32Array(128));
    try {
      const y = f.map((x, S) => h.activeInputs[S].size === 0 ? [] : x), b = o(_ / e.sampleRate, e.sampleRate, () => p.process(y, d, m));
      if (l !== null)
        for (let x = 0, S = 0; x < n.numberOfOutputs; x += 1) {
          for (let g = 0; g < i[x]; g += 1)
            fr(l, d[x], g, S + g, _);
          S += i[x];
        }
      if (!b)
        break;
    } catch (y) {
      s.dispatchEvent(new ErrorEvent("processorerror", {
        colno: y.colno,
        filename: y.filename,
        lineno: y.lineno,
        message: y.message
      }));
      break;
    }
  }
  return l;
}, _a = (s, t, e, n, i, r, o, a, c, u, l, h, p, f, d, m) => (_, y, b) => {
  const x = /* @__PURE__ */ new WeakMap();
  let S = null;
  const g = async (w, T) => {
    let v = l(w), N = null;
    const A = yt(v, T), k = Array.isArray(y.outputChannelCount) ? y.outputChannelCount : Array.from(y.outputChannelCount);
    if (h === null) {
      const C = k.reduce((M, P) => M + P, 0), E = i(T, {
        channelCount: Math.max(1, C),
        channelCountMode: "explicit",
        channelInterpretation: "discrete",
        numberOfOutputs: Math.max(1, C)
      }), D = [];
      for (let M = 0; M < w.numberOfOutputs; M += 1)
        D.push(n(T, {
          channelCount: 1,
          channelCountMode: "explicit",
          channelInterpretation: "speakers",
          numberOfInputs: k[M]
        }));
      const V = o(T, {
        channelCount: y.channelCount,
        channelCountMode: y.channelCountMode,
        channelInterpretation: y.channelInterpretation,
        gain: 1
      });
      V.connect = t.bind(null, D), V.disconnect = c.bind(null, D), N = [E, D, V];
    } else A || (v = new h(T, _));
    if (x.set(T, N === null ? v : N[2]), N !== null) {
      if (S === null) {
        if (b === void 0)
          throw new Error("Missing the processor constructor.");
        if (p === null)
          throw new Error("Missing the native OfflineAudioContext constructor.");
        const P = w.channelCount * w.numberOfInputs, G = b.parameterDescriptors === void 0 ? 0 : b.parameterDescriptors.length, q = P + G;
        S = ma(w, q === 0 ? null : await (async () => {
          const W = new p(
            q,
            // Ceil the length to the next full render quantum.
            // Bug #17: Safari does not yet expose the length.
            Math.ceil(w.context.length / 128) * 128,
            T.sampleRate
          ), K = [], Nt = [];
          for (let it = 0; it < y.numberOfInputs; it += 1)
            K.push(o(W, {
              channelCount: y.channelCount,
              channelCountMode: y.channelCountMode,
              channelInterpretation: y.channelInterpretation,
              gain: 1
            })), Nt.push(i(W, {
              channelCount: y.channelCount,
              channelCountMode: "explicit",
              channelInterpretation: "discrete",
              numberOfOutputs: y.channelCount
            }));
          const Ot = await Promise.all(Array.from(w.parameters.values()).map(async (it) => {
            const vt = r(W, {
              channelCount: 1,
              channelCountMode: "explicit",
              channelInterpretation: "discrete",
              offset: it.value
            });
            return await f(W, it, vt.offset), vt;
          })), $ = n(W, {
            channelCount: 1,
            channelCountMode: "explicit",
            channelInterpretation: "speakers",
            numberOfInputs: Math.max(1, P + G)
          });
          for (let it = 0; it < y.numberOfInputs; it += 1) {
            K[it].connect(Nt[it]);
            for (let vt = 0; vt < y.channelCount; vt += 1)
              Nt[it].connect($, vt, it * y.channelCount + vt);
          }
          for (const [it, vt] of Ot.entries())
            vt.connect($, 0, P + it), vt.start(0);
          return $.connect(W.destination), await Promise.all(K.map((it) => d(w, W, it))), m(W);
        })(), T, y, k, b, u);
      }
      const C = await S, E = e(T, {
        buffer: null,
        channelCount: 2,
        channelCountMode: "max",
        channelInterpretation: "speakers",
        loop: !1,
        loopEnd: 0,
        loopStart: 0,
        playbackRate: 1
      }), [D, V, M] = N;
      C !== null && (E.buffer = C, E.start(0)), E.connect(D);
      for (let P = 0, G = 0; P < w.numberOfOutputs; P += 1) {
        const q = V[P];
        for (let B = 0; B < k[P]; B += 1)
          D.connect(q, G + B, B);
        G += k[P];
      }
      return M;
    }
    if (A)
      for (const [C, E] of w.parameters.entries())
        await s(
          T,
          E,
          // @todo The definition that TypeScript uses of the AudioParamMap is lacking many methods.
          v.parameters.get(C)
        );
    else
      for (const [C, E] of w.parameters.entries())
        await f(
          T,
          E,
          // @todo The definition that TypeScript uses of the AudioParamMap is lacking many methods.
          v.parameters.get(C)
        );
    return await d(w, T, v), v;
  };
  return {
    render(w, T) {
      a(T, w);
      const v = x.get(T);
      return v !== void 0 ? Promise.resolve(v) : g(w, T);
    }
  };
}, ga = (s, t, e, n, i, r, o, a, c, u, l, h, p, f, d, m, _, y, b, x) => class extends d {
  constructor(g, w) {
    super(g, w), this._nativeContext = g, this._audioWorklet = s === void 0 ? void 0 : {
      addModule: (T, v) => s(this, T, v)
    };
  }
  get audioWorklet() {
    return this._audioWorklet;
  }
  createAnalyser() {
    return new t(this);
  }
  createBiquadFilter() {
    return new i(this);
  }
  createBuffer(g, w, T) {
    return new e({ length: w, numberOfChannels: g, sampleRate: T });
  }
  createBufferSource() {
    return new n(this);
  }
  createChannelMerger(g = 6) {
    return new r(this, { numberOfInputs: g });
  }
  createChannelSplitter(g = 6) {
    return new o(this, { numberOfOutputs: g });
  }
  createConstantSource() {
    return new a(this);
  }
  createConvolver() {
    return new c(this);
  }
  createDelay(g = 1) {
    return new l(this, { maxDelayTime: g });
  }
  createDynamicsCompressor() {
    return new h(this);
  }
  createGain() {
    return new p(this);
  }
  createIIRFilter(g, w) {
    return new f(this, { feedback: w, feedforward: g });
  }
  createOscillator() {
    return new m(this);
  }
  createPanner() {
    return new _(this);
  }
  createPeriodicWave(g, w, T = { disableNormalization: !1 }) {
    return new y(this, { ...T, imag: w, real: g });
  }
  createStereoPanner() {
    return new b(this);
  }
  createWaveShaper() {
    return new x(this);
  }
  decodeAudioData(g, w, T) {
    return u(this._nativeContext, g).then((v) => (typeof w == "function" && w(v), v), (v) => {
      throw typeof T == "function" && T(v), v;
    });
  }
}, ya = {
  Q: 1,
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  detune: 0,
  frequency: 350,
  gain: 0,
  type: "lowpass"
}, va = (s, t, e, n, i, r, o, a) => class extends s {
  constructor(u, l) {
    const h = r(u), p = { ...ya, ...l }, f = i(h, p), d = o(h), m = d ? e() : null;
    super(u, !1, f, m), this._Q = t(this, d, f.Q, wt, St), this._detune = t(this, d, f.detune, 1200 * Math.log2(wt), -1200 * Math.log2(wt)), this._frequency = t(this, d, f.frequency, u.sampleRate / 2, 0), this._gain = t(this, d, f.gain, 40 * Math.log10(wt), St), this._nativeBiquadFilterNode = f, a(this, 1);
  }
  get detune() {
    return this._detune;
  }
  get frequency() {
    return this._frequency;
  }
  get gain() {
    return this._gain;
  }
  get Q() {
    return this._Q;
  }
  get type() {
    return this._nativeBiquadFilterNode.type;
  }
  set type(u) {
    this._nativeBiquadFilterNode.type = u;
  }
  getFrequencyResponse(u, l, h) {
    try {
      this._nativeBiquadFilterNode.getFrequencyResponse(u, l, h);
    } catch (p) {
      throw p.code === 11 ? n() : p;
    }
    if (u.length !== l.length || l.length !== h.length)
      throw n();
  }
}, wa = (s, t, e, n, i) => () => {
  const r = /* @__PURE__ */ new WeakMap(), o = async (a, c) => {
    let u = e(a);
    const l = yt(u, c);
    if (!l) {
      const h = {
        Q: u.Q.value,
        channelCount: u.channelCount,
        channelCountMode: u.channelCountMode,
        channelInterpretation: u.channelInterpretation,
        detune: u.detune.value,
        frequency: u.frequency.value,
        gain: u.gain.value,
        type: u.type
      };
      u = t(c, h);
    }
    return r.set(c, u), l ? (await s(c, a.Q, u.Q), await s(c, a.detune, u.detune), await s(c, a.frequency, u.frequency), await s(c, a.gain, u.gain)) : (await n(c, a.Q, u.Q), await n(c, a.detune, u.detune), await n(c, a.frequency, u.frequency), await n(c, a.gain, u.gain)), await i(a, c, u), u;
  };
  return {
    render(a, c) {
      const u = r.get(c);
      return u !== void 0 ? Promise.resolve(u) : o(a, c);
    }
  };
}, Ta = (s, t) => (e, n) => {
  const i = t.get(e);
  if (i !== void 0)
    return i;
  const r = s.get(e);
  if (r !== void 0)
    return r;
  try {
    const o = n();
    return o instanceof Promise ? (s.set(e, o), o.catch(() => !1).then((a) => (s.delete(e), t.set(e, a), a))) : (t.set(e, o), o);
  } catch {
    return t.set(e, !1), !1;
  }
}, ba = {
  channelCount: 1,
  channelCountMode: "explicit",
  channelInterpretation: "speakers",
  numberOfInputs: 6
}, xa = (s, t, e, n, i) => class extends s {
  constructor(o, a) {
    const c = n(o), u = { ...ba, ...a }, l = e(c, u), h = i(c) ? t() : null;
    super(o, !1, l, h);
  }
}, Ca = (s, t, e) => () => {
  const n = /* @__PURE__ */ new WeakMap(), i = async (r, o) => {
    let a = t(r);
    if (!yt(a, o)) {
      const u = {
        channelCount: a.channelCount,
        channelCountMode: a.channelCountMode,
        channelInterpretation: a.channelInterpretation,
        numberOfInputs: a.numberOfInputs
      };
      a = s(o, u);
    }
    return n.set(o, a), await e(r, o, a), a;
  };
  return {
    render(r, o) {
      const a = n.get(o);
      return a !== void 0 ? Promise.resolve(a) : i(r, o);
    }
  };
}, Sa = {
  channelCount: 6,
  channelCountMode: "explicit",
  channelInterpretation: "discrete",
  numberOfOutputs: 6
}, ka = (s, t, e, n, i, r) => class extends s {
  constructor(a, c) {
    const u = n(a), l = r({ ...Sa, ...c }), h = e(u, l), p = i(u) ? t() : null;
    super(a, !1, h, p);
  }
}, Aa = (s, t, e) => () => {
  const n = /* @__PURE__ */ new WeakMap(), i = async (r, o) => {
    let a = t(r);
    if (!yt(a, o)) {
      const u = {
        channelCount: a.channelCount,
        channelCountMode: a.channelCountMode,
        channelInterpretation: a.channelInterpretation,
        numberOfOutputs: a.numberOfOutputs
      };
      a = s(o, u);
    }
    return n.set(o, a), await e(r, o, a), a;
  };
  return {
    render(r, o) {
      const a = n.get(o);
      return a !== void 0 ? Promise.resolve(a) : i(r, o);
    }
  };
}, Na = (s) => (t, e, n) => s(e, t, n), Oa = (s) => (t, e, n = 0, i = 0) => {
  const r = t[n];
  if (r === void 0)
    throw s();
  return Ln(e) ? r.connect(e, 0, i) : r.connect(e, 0);
}, Da = (s) => (t, e) => {
  const n = s(t, {
    buffer: null,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    loop: !1,
    loopEnd: 0,
    loopStart: 0,
    playbackRate: 1
  }), i = t.createBuffer(1, 2, 44100);
  return n.buffer = i, n.loop = !0, n.connect(e), n.start(), () => {
    n.stop(), n.disconnect(e);
  };
}, Ea = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  offset: 1
}, Ia = (s, t, e, n, i, r, o) => class extends s {
  constructor(c, u) {
    const l = i(c), h = { ...Ea, ...u }, p = n(l, h), f = r(l), d = f ? e() : null;
    super(c, !1, p, d), this._constantSourceNodeRenderer = d, this._nativeConstantSourceNode = p, this._offset = t(this, f, p.offset, wt, St), this._onended = null;
  }
  get offset() {
    return this._offset;
  }
  get onended() {
    return this._onended;
  }
  set onended(c) {
    const u = typeof c == "function" ? o(this, c) : null;
    this._nativeConstantSourceNode.onended = u;
    const l = this._nativeConstantSourceNode.onended;
    this._onended = l !== null && l === u ? c : l;
  }
  start(c = 0) {
    if (this._nativeConstantSourceNode.start(c), this._constantSourceNodeRenderer !== null && (this._constantSourceNodeRenderer.start = c), this.context.state !== "closed") {
      Ve(this);
      const u = () => {
        this._nativeConstantSourceNode.removeEventListener("ended", u), Kt(this) && hn(this);
      };
      this._nativeConstantSourceNode.addEventListener("ended", u);
    }
  }
  stop(c = 0) {
    this._nativeConstantSourceNode.stop(c), this._constantSourceNodeRenderer !== null && (this._constantSourceNodeRenderer.stop = c);
  }
}, Ma = (s, t, e, n, i) => () => {
  const r = /* @__PURE__ */ new WeakMap();
  let o = null, a = null;
  const c = async (u, l) => {
    let h = e(u);
    const p = yt(h, l);
    if (!p) {
      const f = {
        channelCount: h.channelCount,
        channelCountMode: h.channelCountMode,
        channelInterpretation: h.channelInterpretation,
        offset: h.offset.value
      };
      h = t(l, f), o !== null && h.start(o), a !== null && h.stop(a);
    }
    return r.set(l, h), p ? await s(l, u.offset, h.offset) : await n(l, u.offset, h.offset), await i(u, l, h), h;
  };
  return {
    set start(u) {
      o = u;
    },
    set stop(u) {
      a = u;
    },
    render(u, l) {
      const h = r.get(l);
      return h !== void 0 ? Promise.resolve(h) : c(u, l);
    }
  };
}, Ra = (s) => (t) => (s[0] = t, s[0]), Pa = {
  buffer: null,
  channelCount: 2,
  channelCountMode: "clamped-max",
  channelInterpretation: "speakers",
  disableNormalization: !1
}, Fa = (s, t, e, n, i, r) => class extends s {
  constructor(a, c) {
    const u = n(a), l = { ...Pa, ...c }, h = e(u, l), f = i(u) ? t() : null;
    super(a, !1, h, f), this._isBufferNullified = !1, this._nativeConvolverNode = h, l.buffer !== null && r(this, l.buffer.duration);
  }
  get buffer() {
    return this._isBufferNullified ? null : this._nativeConvolverNode.buffer;
  }
  set buffer(a) {
    if (this._nativeConvolverNode.buffer = a, a === null && this._nativeConvolverNode.buffer !== null) {
      const c = this._nativeConvolverNode.context;
      this._nativeConvolverNode.buffer = c.createBuffer(1, 1, c.sampleRate), this._isBufferNullified = !0, r(this, 0);
    } else
      this._isBufferNullified = !1, r(this, this._nativeConvolverNode.buffer === null ? 0 : this._nativeConvolverNode.buffer.duration);
  }
  get normalize() {
    return this._nativeConvolverNode.normalize;
  }
  set normalize(a) {
    this._nativeConvolverNode.normalize = a;
  }
}, Va = (s, t, e) => () => {
  const n = /* @__PURE__ */ new WeakMap(), i = async (r, o) => {
    let a = t(r);
    if (!yt(a, o)) {
      const u = {
        buffer: a.buffer,
        channelCount: a.channelCount,
        channelCountMode: a.channelCountMode,
        channelInterpretation: a.channelInterpretation,
        disableNormalization: !a.normalize
      };
      a = s(o, u);
    }
    return n.set(o, a), ze(a) ? await e(r, o, a.inputs[0]) : await e(r, o, a), a;
  };
  return {
    render(r, o) {
      const a = n.get(o);
      return a !== void 0 ? Promise.resolve(a) : i(r, o);
    }
  };
}, qa = (s, t) => (e, n, i) => {
  if (t === null)
    throw new Error("Missing the native OfflineAudioContext constructor.");
  try {
    return new t(e, n, i);
  } catch (r) {
    throw r.name === "SyntaxError" ? s() : r;
  }
}, La = () => new DOMException("", "DataCloneError"), Li = (s) => {
  const { port1: t, port2: e } = new MessageChannel();
  return new Promise((n) => {
    const i = () => {
      e.onmessage = null, t.close(), e.close(), n();
    };
    e.onmessage = () => i();
    try {
      t.postMessage(s, [s]);
    } catch {
    } finally {
      i();
    }
  });
}, Wa = (s, t, e, n, i, r, o, a, c, u, l) => (h, p) => {
  const f = o(h) ? h : r(h);
  if (i.has(p)) {
    const d = e();
    return Promise.reject(d);
  }
  try {
    i.add(p);
  } catch {
  }
  return t(c, () => c(f)) ? f.decodeAudioData(p).then((d) => (Li(p).catch(() => {
  }), t(a, () => a(d)) || l(d), s.add(d), d)) : new Promise((d, m) => {
    const _ = async () => {
      try {
        await Li(p);
      } catch {
      }
    }, y = (b) => {
      m(b), _();
    };
    try {
      f.decodeAudioData(p, (b) => {
        typeof b.copyFromChannel != "function" && (u(b), Vs(b)), s.add(b), _().then(() => d(b));
      }, (b) => {
        y(b === null ? n() : b);
      });
    } catch (b) {
      y(b);
    }
  });
}, ja = (s, t, e, n, i, r, o, a) => (c, u) => {
  const l = t.get(c);
  if (l === void 0)
    throw new Error("Missing the expected cycle count.");
  const h = r(c.context), p = a(h);
  if (l === u) {
    if (t.delete(c), !p && o(c)) {
      const f = n(c), { outputs: d } = e(c);
      for (const m of d)
        if (pn(m)) {
          const _ = n(m[0]);
          s(f, _, m[1], m[2]);
        } else {
          const _ = i(m[0]);
          f.connect(_, m[1]);
        }
    }
  } else
    t.set(c, l - u);
}, Ba = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  delayTime: 0,
  maxDelayTime: 1
}, Ua = (s, t, e, n, i, r, o) => class extends s {
  constructor(c, u) {
    const l = i(c), h = { ...Ba, ...u }, p = n(l, h), f = r(l), d = f ? e(h.maxDelayTime) : null;
    super(c, !1, p, d), this._delayTime = t(this, f, p.delayTime), o(this, h.maxDelayTime);
  }
  get delayTime() {
    return this._delayTime;
  }
}, Ga = (s, t, e, n, i) => (r) => {
  const o = /* @__PURE__ */ new WeakMap(), a = async (c, u) => {
    let l = e(c);
    const h = yt(l, u);
    if (!h) {
      const p = {
        channelCount: l.channelCount,
        channelCountMode: l.channelCountMode,
        channelInterpretation: l.channelInterpretation,
        delayTime: l.delayTime.value,
        maxDelayTime: r
      };
      l = t(u, p);
    }
    return o.set(u, l), h ? await s(u, c.delayTime, l.delayTime) : await n(u, c.delayTime, l.delayTime), await i(c, u, l), l;
  };
  return {
    render(c, u) {
      const l = o.get(u);
      return l !== void 0 ? Promise.resolve(l) : a(c, u);
    }
  };
}, za = (s) => (t, e, n, i) => s(t[i], (r) => r[0] === e && r[1] === n), $a = (s) => (t, e) => {
  s(t).delete(e);
}, Za = (s) => "delayTime" in s, Xa = (s, t, e) => function n(i, r) {
  const o = Fn(r) ? r : e(s, r);
  if (Za(o))
    return [];
  if (i[0] === o)
    return [i];
  if (i.includes(o))
    return [];
  const { outputs: a } = t(o);
  return Array.from(a).map((c) => n([...i, o], c[0])).reduce((c, u) => c.concat(u), []);
}, An = (s, t, e) => {
  const n = t[e];
  if (n === void 0)
    throw s();
  return n;
}, Ya = (s) => (t, e = void 0, n = void 0, i = 0) => e === void 0 ? t.forEach((r) => r.disconnect()) : typeof e == "number" ? An(s, t, e).disconnect() : Ln(e) ? n === void 0 ? t.forEach((r) => r.disconnect(e)) : i === void 0 ? An(s, t, n).disconnect(e, 0) : An(s, t, n).disconnect(e, 0, i) : n === void 0 ? t.forEach((r) => r.disconnect(e)) : An(s, t, n).disconnect(e, 0), Ha = {
  attack: 3e-3,
  channelCount: 2,
  channelCountMode: "clamped-max",
  channelInterpretation: "speakers",
  knee: 30,
  ratio: 12,
  release: 0.25,
  threshold: -24
}, Qa = (s, t, e, n, i, r, o, a) => class extends s {
  constructor(u, l) {
    const h = r(u), p = { ...Ha, ...l }, f = n(h, p), d = o(h), m = d ? e() : null;
    super(u, !1, f, m), this._attack = t(this, d, f.attack), this._knee = t(this, d, f.knee), this._nativeDynamicsCompressorNode = f, this._ratio = t(this, d, f.ratio), this._release = t(this, d, f.release), this._threshold = t(this, d, f.threshold), a(this, 6e-3);
  }
  get attack() {
    return this._attack;
  }
  // Bug #108: Safari allows a channelCount of three and above which is why the getter and setter needs to be overwritten here.
  get channelCount() {
    return this._nativeDynamicsCompressorNode.channelCount;
  }
  set channelCount(u) {
    const l = this._nativeDynamicsCompressorNode.channelCount;
    if (this._nativeDynamicsCompressorNode.channelCount = u, u > 2)
      throw this._nativeDynamicsCompressorNode.channelCount = l, i();
  }
  /*
   * Bug #109: Only Chrome and Firefox disallow a channelCountMode of 'max' yet which is why the getter and setter needs to be
   * overwritten here.
   */
  get channelCountMode() {
    return this._nativeDynamicsCompressorNode.channelCountMode;
  }
  set channelCountMode(u) {
    const l = this._nativeDynamicsCompressorNode.channelCountMode;
    if (this._nativeDynamicsCompressorNode.channelCountMode = u, u === "max")
      throw this._nativeDynamicsCompressorNode.channelCountMode = l, i();
  }
  get knee() {
    return this._knee;
  }
  get ratio() {
    return this._ratio;
  }
  get reduction() {
    return typeof this._nativeDynamicsCompressorNode.reduction.value == "number" ? this._nativeDynamicsCompressorNode.reduction.value : this._nativeDynamicsCompressorNode.reduction;
  }
  get release() {
    return this._release;
  }
  get threshold() {
    return this._threshold;
  }
}, Ja = (s, t, e, n, i) => () => {
  const r = /* @__PURE__ */ new WeakMap(), o = async (a, c) => {
    let u = e(a);
    const l = yt(u, c);
    if (!l) {
      const h = {
        attack: u.attack.value,
        channelCount: u.channelCount,
        channelCountMode: u.channelCountMode,
        channelInterpretation: u.channelInterpretation,
        knee: u.knee.value,
        ratio: u.ratio.value,
        release: u.release.value,
        threshold: u.threshold.value
      };
      u = t(c, h);
    }
    return r.set(c, u), l ? (await s(c, a.attack, u.attack), await s(c, a.knee, u.knee), await s(c, a.ratio, u.ratio), await s(c, a.release, u.release), await s(c, a.threshold, u.threshold)) : (await n(c, a.attack, u.attack), await n(c, a.knee, u.knee), await n(c, a.ratio, u.ratio), await n(c, a.release, u.release), await n(c, a.threshold, u.threshold)), await i(a, c, u), u;
  };
  return {
    render(a, c) {
      const u = r.get(c);
      return u !== void 0 ? Promise.resolve(u) : o(a, c);
    }
  };
}, Ka = () => new DOMException("", "EncodingError"), tc = (s) => (t) => new Promise((e, n) => {
  if (s === null) {
    n(new SyntaxError());
    return;
  }
  const i = s.document.head;
  if (i === null)
    n(new SyntaxError());
  else {
    const r = s.document.createElement("script"), o = new Blob([t], { type: "application/javascript" }), a = URL.createObjectURL(o), c = s.onerror, u = () => {
      s.onerror = c, URL.revokeObjectURL(a);
    };
    s.onerror = (l, h, p, f, d) => {
      if (h === a || h === s.location.href && p === 1 && f === 1)
        return u(), n(d), !1;
      if (c !== null)
        return c(l, h, p, f, d);
    }, r.onerror = () => {
      u(), n(new SyntaxError());
    }, r.onload = () => {
      u(), e();
    }, r.src = a, r.type = "module", i.appendChild(r);
  }
}), ec = (s) => class {
  constructor(e) {
    this._nativeEventTarget = e, this._listeners = /* @__PURE__ */ new WeakMap();
  }
  addEventListener(e, n, i) {
    if (n !== null) {
      let r = this._listeners.get(n);
      r === void 0 && (r = s(this, n), typeof n == "function" && this._listeners.set(n, r)), this._nativeEventTarget.addEventListener(e, r, i);
    }
  }
  dispatchEvent(e) {
    return this._nativeEventTarget.dispatchEvent(e);
  }
  removeEventListener(e, n, i) {
    const r = n === null ? void 0 : this._listeners.get(n);
    this._nativeEventTarget.removeEventListener(e, r === void 0 ? null : r, i);
  }
}, nc = (s) => (t, e, n) => {
  Object.defineProperties(s, {
    currentFrame: {
      configurable: !0,
      get() {
        return Math.round(t * e);
      }
    },
    currentTime: {
      configurable: !0,
      get() {
        return t;
      }
    }
  });
  try {
    return n();
  } finally {
    s !== null && (delete s.currentFrame, delete s.currentTime);
  }
}, sc = (s) => async (t) => {
  try {
    const e = await fetch(t);
    if (e.ok)
      return [await e.text(), e.url];
  } catch {
  }
  throw s();
}, ic = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  gain: 1
}, rc = (s, t, e, n, i, r) => class extends s {
  constructor(a, c) {
    const u = i(a), l = { ...ic, ...c }, h = n(u, l), p = r(u), f = p ? e() : null;
    super(a, !1, h, f), this._gain = t(this, p, h.gain, wt, St);
  }
  get gain() {
    return this._gain;
  }
}, oc = (s, t, e, n, i) => () => {
  const r = /* @__PURE__ */ new WeakMap(), o = async (a, c) => {
    let u = e(a);
    const l = yt(u, c);
    if (!l) {
      const h = {
        channelCount: u.channelCount,
        channelCountMode: u.channelCountMode,
        channelInterpretation: u.channelInterpretation,
        gain: u.gain.value
      };
      u = t(c, h);
    }
    return r.set(c, u), l ? await s(c, a.gain, u.gain) : await n(c, a.gain, u.gain), await i(a, c, u), u;
  };
  return {
    render(a, c) {
      const u = r.get(c);
      return u !== void 0 ? Promise.resolve(u) : o(a, c);
    }
  };
}, ac = (s, t) => (e) => t(s, e), cc = (s) => (t) => {
  const e = s(t);
  if (e.renderer === null)
    throw new Error("Missing the renderer of the given AudioNode in the audio graph.");
  return e.renderer;
}, uc = (s) => (t) => {
  var e;
  return (e = s.get(t)) !== null && e !== void 0 ? e : 0;
}, lc = (s) => (t) => {
  const e = s(t);
  if (e.renderer === null)
    throw new Error("Missing the renderer of the given AudioParam in the audio graph.");
  return e.renderer;
}, hc = (s) => (t) => s.get(t), _t = () => new DOMException("", "InvalidStateError"), dc = (s) => (t) => {
  const e = s.get(t);
  if (e === void 0)
    throw _t();
  return e;
}, pc = (s, t) => (e) => {
  let n = s.get(e);
  if (n !== void 0)
    return n;
  if (t === null)
    throw new Error("Missing the native OfflineAudioContext constructor.");
  return n = new t(1, 1, 44100), s.set(e, n), n;
}, fc = (s) => (t) => {
  const e = s.get(t);
  if (e === void 0)
    throw new Error("The context has no set of AudioWorkletNodes.");
  return e;
}, Yn = () => new DOMException("", "InvalidAccessError"), mc = (s) => {
  s.getFrequencyResponse = /* @__PURE__ */ ((t) => (e, n, i) => {
    if (e.length !== n.length || n.length !== i.length)
      throw Yn();
    return t.call(s, e, n, i);
  })(s.getFrequencyResponse);
}, _c = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers"
}, gc = (s, t, e, n, i, r) => class extends s {
  constructor(a, c) {
    const u = n(a), l = i(u), h = { ..._c, ...c }, p = t(u, l ? null : a.baseLatency, h), f = l ? e(h.feedback, h.feedforward) : null;
    super(a, !1, p, f), mc(p), this._nativeIIRFilterNode = p, r(this, 1);
  }
  getFrequencyResponse(a, c, u) {
    return this._nativeIIRFilterNode.getFrequencyResponse(a, c, u);
  }
}, mr = (s, t, e, n, i, r, o, a, c, u, l) => {
  const h = u.length;
  let p = a;
  for (let f = 0; f < h; f += 1) {
    let d = e[0] * u[f];
    for (let m = 1; m < i; m += 1) {
      const _ = p - m & c - 1;
      d += e[m] * r[_], d -= s[m] * o[_];
    }
    for (let m = i; m < n; m += 1)
      d += e[m] * r[p - m & c - 1];
    for (let m = i; m < t; m += 1)
      d -= s[m] * o[p - m & c - 1];
    r[p] = u[f], o[p] = d, p = p + 1 & c - 1, l[f] = d;
  }
  return p;
}, yc = (s, t, e, n) => {
  const i = e instanceof Float64Array ? e : new Float64Array(e), r = n instanceof Float64Array ? n : new Float64Array(n), o = i.length, a = r.length, c = Math.min(o, a);
  if (i[0] !== 1) {
    for (let d = 0; d < o; d += 1)
      r[d] /= i[0];
    for (let d = 1; d < a; d += 1)
      i[d] /= i[0];
  }
  const u = 32, l = new Float32Array(u), h = new Float32Array(u), p = t.createBuffer(s.numberOfChannels, s.length, s.sampleRate), f = s.numberOfChannels;
  for (let d = 0; d < f; d += 1) {
    const m = s.getChannelData(d), _ = p.getChannelData(d);
    l.fill(0), h.fill(0), mr(i, o, r, a, c, l, h, 0, u, m, _);
  }
  return p;
}, vc = (s, t, e, n, i) => (r, o) => {
  const a = /* @__PURE__ */ new WeakMap();
  let c = null;
  const u = async (l, h) => {
    let p = null, f = t(l);
    const d = yt(f, h);
    if (h.createIIRFilter === void 0 ? p = s(h, {
      buffer: null,
      channelCount: 2,
      channelCountMode: "max",
      channelInterpretation: "speakers",
      loop: !1,
      loopEnd: 0,
      loopStart: 0,
      playbackRate: 1
    }) : d || (f = h.createIIRFilter(o, r)), a.set(h, p === null ? f : p), p !== null) {
      if (c === null) {
        if (e === null)
          throw new Error("Missing the native OfflineAudioContext constructor.");
        const _ = new e(
          // Bug #47: The AudioDestinationNode in Safari gets not initialized correctly.
          l.context.destination.channelCount,
          // Bug #17: Safari does not yet expose the length.
          l.context.length,
          h.sampleRate
        );
        c = (async () => {
          await n(l, _, _.destination);
          const y = await i(_);
          return yc(y, h, r, o);
        })();
      }
      const m = await c;
      return p.buffer = m, p.start(0), p;
    }
    return await n(l, h, f), f;
  };
  return {
    render(l, h) {
      const p = a.get(h);
      return p !== void 0 ? Promise.resolve(p) : u(l, h);
    }
  };
}, wc = (s, t, e, n, i, r) => (o) => (a, c) => {
  const u = s.get(a);
  if (u === void 0) {
    if (!o && r(a)) {
      const l = n(a), { outputs: h } = e(a);
      for (const p of h)
        if (pn(p)) {
          const f = n(p[0]);
          t(l, f, p[1], p[2]);
        } else {
          const f = i(p[0]);
          l.disconnect(f, p[1]);
        }
    }
    s.set(a, c);
  } else
    s.set(a, u + c);
}, Tc = (s, t) => (e) => {
  const n = s.get(e);
  return t(n) || t(e);
}, bc = (s, t) => (e) => s.has(e) || t(e), xc = (s, t) => (e) => s.has(e) || t(e), Cc = (s, t) => (e) => {
  const n = s.get(e);
  return t(n) || t(e);
}, Sc = (s) => (t) => s !== null && t instanceof s, kc = (s) => (t) => s !== null && typeof s.AudioNode == "function" && t instanceof s.AudioNode, Ac = (s) => (t) => s !== null && typeof s.AudioParam == "function" && t instanceof s.AudioParam, Nc = (s, t) => (e) => s(e) || t(e), Oc = (s) => (t) => s !== null && t instanceof s, Dc = (s) => s !== null && s.isSecureContext, Ec = (s, t, e, n) => class extends s {
  constructor(r, o) {
    const a = e(r), c = t(a, o);
    if (n(a))
      throw TypeError();
    super(r, !0, c, null), this._nativeMediaElementAudioSourceNode = c;
  }
  get mediaElement() {
    return this._nativeMediaElementAudioSourceNode.mediaElement;
  }
}, Ic = {
  channelCount: 2,
  channelCountMode: "explicit",
  channelInterpretation: "speakers"
}, Mc = (s, t, e, n) => class extends s {
  constructor(r, o) {
    const a = e(r);
    if (n(a))
      throw new TypeError();
    const c = { ...Ic, ...o }, u = t(a, c);
    super(r, !1, u, null), this._nativeMediaStreamAudioDestinationNode = u;
  }
  get stream() {
    return this._nativeMediaStreamAudioDestinationNode.stream;
  }
}, Rc = (s, t, e, n) => class extends s {
  constructor(r, o) {
    const a = e(r), c = t(a, o);
    if (n(a))
      throw new TypeError();
    super(r, !0, c, null), this._nativeMediaStreamAudioSourceNode = c;
  }
  get mediaStream() {
    return this._nativeMediaStreamAudioSourceNode.mediaStream;
  }
}, Pc = (s, t, e) => class extends s {
  constructor(i, r) {
    const o = e(i), a = t(o, r);
    super(i, !0, a, null);
  }
}, Fc = (s, t, e, n, i, r) => class extends e {
  constructor(a, c) {
    super(a), this._nativeContext = a, Zn.set(this, a), n(a) && i.set(a, /* @__PURE__ */ new Set()), this._destination = new s(this, c), this._listener = t(this, a), this._onstatechange = null;
  }
  get currentTime() {
    return this._nativeContext.currentTime;
  }
  get destination() {
    return this._destination;
  }
  get listener() {
    return this._listener;
  }
  get onstatechange() {
    return this._onstatechange;
  }
  set onstatechange(a) {
    const c = typeof a == "function" ? r(this, a) : null;
    this._nativeContext.onstatechange = c;
    const u = this._nativeContext.onstatechange;
    this._onstatechange = u !== null && u === c ? a : u;
  }
  get sampleRate() {
    return this._nativeContext.sampleRate;
  }
  get state() {
    return this._nativeContext.state;
  }
}, an = (s) => {
  const t = new Uint32Array([1179011410, 40, 1163280727, 544501094, 16, 131073, 44100, 176400, 1048580, 1635017060, 4, 0]);
  try {
    const e = s.decodeAudioData(t.buffer, () => {
    });
    return e === void 0 ? !1 : (e.catch(() => {
    }), !0);
  } catch {
  }
  return !1;
}, Vc = (s, t) => (e, n, i) => {
  const r = /* @__PURE__ */ new Set();
  return e.connect = /* @__PURE__ */ ((o) => (a, c = 0, u = 0) => {
    const l = r.size === 0;
    if (t(a))
      return o.call(e, a, c, u), s(r, [a, c, u], (h) => h[0] === a && h[1] === c && h[2] === u, !0), l && n(), a;
    o.call(e, a, c), s(r, [a, c], (h) => h[0] === a && h[1] === c, !0), l && n();
  })(e.connect), e.disconnect = /* @__PURE__ */ ((o) => (a, c, u) => {
    const l = r.size > 0;
    if (a === void 0)
      o.apply(e), r.clear();
    else if (typeof a == "number") {
      o.call(e, a);
      for (const p of r)
        p[1] === a && r.delete(p);
    } else {
      t(a) ? o.call(e, a, c, u) : o.call(e, a, c);
      for (const p of r)
        p[0] === a && (c === void 0 || p[1] === c) && (u === void 0 || p[2] === u) && r.delete(p);
    }
    const h = r.size === 0;
    l && h && i();
  })(e.disconnect), e;
}, rt = (s, t, e) => {
  const n = t[e];
  n !== void 0 && n !== s[e] && (s[e] = n);
}, mt = (s, t) => {
  rt(s, t, "channelCount"), rt(s, t, "channelCountMode"), rt(s, t, "channelInterpretation");
}, Wi = (s) => typeof s.getFloatTimeDomainData == "function", qc = (s) => {
  s.getFloatTimeDomainData = (t) => {
    const e = new Uint8Array(t.length);
    s.getByteTimeDomainData(e);
    const n = Math.max(e.length, s.fftSize);
    for (let i = 0; i < n; i += 1)
      t[i] = (e[i] - 128) * 78125e-7;
    return t;
  };
}, Lc = (s, t) => (e, n) => {
  const i = e.createAnalyser();
  if (mt(i, n), !(n.maxDecibels > n.minDecibels))
    throw t();
  return rt(i, n, "fftSize"), rt(i, n, "maxDecibels"), rt(i, n, "minDecibels"), rt(i, n, "smoothingTimeConstant"), s(Wi, () => Wi(i)) || qc(i), i;
}, Wc = (s) => s === null ? null : s.hasOwnProperty("AudioBuffer") ? s.AudioBuffer : null, lt = (s, t, e) => {
  const n = t[e];
  n !== void 0 && n !== s[e].value && (s[e].value = n);
}, jc = (s) => {
  s.start = /* @__PURE__ */ ((t) => {
    let e = !1;
    return (n = 0, i = 0, r) => {
      if (e)
        throw _t();
      t.call(s, n, i, r), e = !0;
    };
  })(s.start);
}, Ws = (s) => {
  s.start = /* @__PURE__ */ ((t) => (e = 0, n = 0, i) => {
    if (typeof i == "number" && i < 0 || n < 0 || e < 0)
      throw new RangeError("The parameters can't be negative.");
    t.call(s, e, n, i);
  })(s.start);
}, js = (s) => {
  s.stop = /* @__PURE__ */ ((t) => (e = 0) => {
    if (e < 0)
      throw new RangeError("The parameter can't be negative.");
    t.call(s, e);
  })(s.stop);
}, Bc = (s, t, e, n, i, r, o, a, c, u, l) => (h, p) => {
  const f = h.createBufferSource();
  return mt(f, p), lt(f, p, "playbackRate"), rt(f, p, "buffer"), rt(f, p, "loop"), rt(f, p, "loopEnd"), rt(f, p, "loopStart"), t(e, () => e(h)) || jc(f), t(n, () => n(h)) || c(f), t(i, () => i(h)) || u(f, h), t(r, () => r(h)) || Ws(f), t(o, () => o(h)) || l(f, h), t(a, () => a(h)) || js(f), s(h, f), f;
}, Uc = (s) => s === null ? null : s.hasOwnProperty("AudioContext") ? s.AudioContext : s.hasOwnProperty("webkitAudioContext") ? s.webkitAudioContext : null, Gc = (s, t) => (e, n, i) => {
  const r = e.destination;
  if (r.channelCount !== n)
    try {
      r.channelCount = n;
    } catch {
    }
  i && r.channelCountMode !== "explicit" && (r.channelCountMode = "explicit"), r.maxChannelCount === 0 && Object.defineProperty(r, "maxChannelCount", {
    value: n
  });
  const o = s(e, {
    channelCount: n,
    channelCountMode: r.channelCountMode,
    channelInterpretation: r.channelInterpretation,
    gain: 1
  });
  return t(o, "channelCount", (a) => () => a.call(o), (a) => (c) => {
    a.call(o, c);
    try {
      r.channelCount = c;
    } catch (u) {
      if (c > r.maxChannelCount)
        throw u;
    }
  }), t(o, "channelCountMode", (a) => () => a.call(o), (a) => (c) => {
    a.call(o, c), r.channelCountMode = c;
  }), t(o, "channelInterpretation", (a) => () => a.call(o), (a) => (c) => {
    a.call(o, c), r.channelInterpretation = c;
  }), Object.defineProperty(o, "maxChannelCount", {
    get: () => r.maxChannelCount
  }), o.connect(r), o;
}, zc = (s) => s === null ? null : s.hasOwnProperty("AudioWorkletNode") ? s.AudioWorkletNode : null, $c = (s) => {
  const { port1: t } = new MessageChannel();
  try {
    t.postMessage(s);
  } finally {
    t.close();
  }
}, Zc = (s, t, e, n, i) => (r, o, a, c, u, l) => {
  if (a !== null)
    try {
      const h = new a(r, c, l), p = /* @__PURE__ */ new Map();
      let f = null;
      if (Object.defineProperties(h, {
        /*
         * Bug #61: Overwriting the property accessors for channelCount and channelCountMode is necessary as long as some
         * browsers have no native implementation to achieve a consistent behavior.
         */
        channelCount: {
          get: () => l.channelCount,
          set: () => {
            throw s();
          }
        },
        channelCountMode: {
          get: () => "explicit",
          set: () => {
            throw s();
          }
        },
        // Bug #156: Chrome and Edge do not yet fire an ErrorEvent.
        onprocessorerror: {
          get: () => f,
          set: (d) => {
            typeof f == "function" && h.removeEventListener("processorerror", f), f = typeof d == "function" ? d : null, typeof f == "function" && h.addEventListener("processorerror", f);
          }
        }
      }), h.addEventListener = /* @__PURE__ */ ((d) => (...m) => {
        if (m[0] === "processorerror") {
          const _ = typeof m[1] == "function" ? m[1] : typeof m[1] == "object" && m[1] !== null && typeof m[1].handleEvent == "function" ? m[1].handleEvent : null;
          if (_ !== null) {
            const y = p.get(m[1]);
            y !== void 0 ? m[1] = y : (m[1] = (b) => {
              b.type === "error" ? (Object.defineProperties(b, {
                type: { value: "processorerror" }
              }), _(b)) : _(new ErrorEvent(m[0], { ...b }));
            }, p.set(_, m[1]));
          }
        }
        return d.call(h, "error", m[1], m[2]), d.call(h, ...m);
      })(h.addEventListener), h.removeEventListener = /* @__PURE__ */ ((d) => (...m) => {
        if (m[0] === "processorerror") {
          const _ = p.get(m[1]);
          _ !== void 0 && (p.delete(m[1]), m[1] = _);
        }
        return d.call(h, "error", m[1], m[2]), d.call(h, m[0], m[1], m[2]);
      })(h.removeEventListener), l.numberOfOutputs !== 0) {
        const d = e(r, {
          channelCount: 1,
          channelCountMode: "explicit",
          channelInterpretation: "discrete",
          gain: 0
        });
        return h.connect(d).connect(r.destination), i(h, () => d.disconnect(), () => d.connect(r.destination));
      }
      return h;
    } catch (h) {
      throw h.code === 11 ? n() : h;
    }
  if (u === void 0)
    throw n();
  return $c(l), t(r, o, u, l);
}, _r = (s, t) => s === null ? 512 : Math.max(512, Math.min(16384, Math.pow(2, Math.round(Math.log2(s * t))))), Xc = (s) => new Promise((t, e) => {
  const { port1: n, port2: i } = new MessageChannel();
  n.onmessage = ({ data: r }) => {
    n.close(), i.close(), t(r);
  }, n.onmessageerror = ({ data: r }) => {
    n.close(), i.close(), e(r);
  }, i.postMessage(s);
}), Yc = async (s, t) => {
  const e = await Xc(t);
  return new s(e);
}, Hc = (s, t, e, n) => {
  let i = Ss.get(s);
  i === void 0 && (i = /* @__PURE__ */ new WeakMap(), Ss.set(s, i));
  const r = Yc(e, n);
  return i.set(t, r), r;
}, Qc = (s, t, e, n, i, r, o, a, c, u, l, h, p) => (f, d, m, _) => {
  if (_.numberOfInputs === 0 && _.numberOfOutputs === 0)
    throw c();
  const y = Array.isArray(_.outputChannelCount) ? _.outputChannelCount : Array.from(_.outputChannelCount);
  if (y.some((O) => O < 1))
    throw c();
  if (y.length !== _.numberOfOutputs)
    throw t();
  if (_.channelCountMode !== "explicit")
    throw c();
  const b = _.channelCount * _.numberOfInputs, x = y.reduce((O, L) => O + L, 0), S = m.parameterDescriptors === void 0 ? 0 : m.parameterDescriptors.length;
  if (b + S > 6 || x > 6)
    throw c();
  const g = new MessageChannel(), w = [], T = [];
  for (let O = 0; O < _.numberOfInputs; O += 1)
    w.push(o(f, {
      channelCount: _.channelCount,
      channelCountMode: _.channelCountMode,
      channelInterpretation: _.channelInterpretation,
      gain: 1
    })), T.push(i(f, {
      channelCount: _.channelCount,
      channelCountMode: "explicit",
      channelInterpretation: "discrete",
      numberOfOutputs: _.channelCount
    }));
  const v = [];
  if (m.parameterDescriptors !== void 0)
    for (const { defaultValue: O, maxValue: L, minValue: ft, name: ot } of m.parameterDescriptors) {
      const H = r(f, {
        channelCount: 1,
        channelCountMode: "explicit",
        channelInterpretation: "discrete",
        offset: _.parameterData[ot] !== void 0 ? _.parameterData[ot] : O === void 0 ? 0 : O
      });
      Object.defineProperties(H.offset, {
        defaultValue: {
          get: () => O === void 0 ? 0 : O
        },
        maxValue: {
          get: () => L === void 0 ? wt : L
        },
        minValue: {
          get: () => ft === void 0 ? St : ft
        }
      }), v.push(H);
    }
  const N = n(f, {
    channelCount: 1,
    channelCountMode: "explicit",
    channelInterpretation: "speakers",
    numberOfInputs: Math.max(1, b + S)
  }), A = _r(d, f.sampleRate), k = a(
    f,
    A,
    b + S,
    // Bug #87: Only Firefox will fire an AudioProcessingEvent if there is no connected output.
    Math.max(1, x)
  ), C = i(f, {
    channelCount: Math.max(1, x),
    channelCountMode: "explicit",
    channelInterpretation: "discrete",
    numberOfOutputs: Math.max(1, x)
  }), E = [];
  for (let O = 0; O < _.numberOfOutputs; O += 1)
    E.push(n(f, {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "speakers",
      numberOfInputs: y[O]
    }));
  for (let O = 0; O < _.numberOfInputs; O += 1) {
    w[O].connect(T[O]);
    for (let L = 0; L < _.channelCount; L += 1)
      T[O].connect(N, L, O * _.channelCount + L);
  }
  const D = new pr(m.parameterDescriptors === void 0 ? [] : m.parameterDescriptors.map(({ name: O }, L) => {
    const ft = v[L];
    return ft.connect(N, 0, b + L), ft.start(0), [O, ft.offset];
  }));
  N.connect(k);
  let V = _.channelInterpretation, M = null;
  const P = _.numberOfOutputs === 0 ? [k] : E, G = {
    get bufferSize() {
      return A;
    },
    get channelCount() {
      return _.channelCount;
    },
    set channelCount(O) {
      throw e();
    },
    get channelCountMode() {
      return _.channelCountMode;
    },
    set channelCountMode(O) {
      throw e();
    },
    get channelInterpretation() {
      return V;
    },
    set channelInterpretation(O) {
      for (const L of w)
        L.channelInterpretation = O;
      V = O;
    },
    get context() {
      return k.context;
    },
    get inputs() {
      return w;
    },
    get numberOfInputs() {
      return _.numberOfInputs;
    },
    get numberOfOutputs() {
      return _.numberOfOutputs;
    },
    get onprocessorerror() {
      return M;
    },
    set onprocessorerror(O) {
      typeof M == "function" && G.removeEventListener("processorerror", M), M = typeof O == "function" ? O : null, typeof M == "function" && G.addEventListener("processorerror", M);
    },
    get parameters() {
      return D;
    },
    get port() {
      return g.port2;
    },
    addEventListener(...O) {
      return k.addEventListener(O[0], O[1], O[2]);
    },
    connect: s.bind(null, P),
    disconnect: u.bind(null, P),
    dispatchEvent(...O) {
      return k.dispatchEvent(O[0]);
    },
    removeEventListener(...O) {
      return k.removeEventListener(O[0], O[1], O[2]);
    }
  }, q = /* @__PURE__ */ new Map();
  g.port1.addEventListener = /* @__PURE__ */ ((O) => (...L) => {
    if (L[0] === "message") {
      const ft = typeof L[1] == "function" ? L[1] : typeof L[1] == "object" && L[1] !== null && typeof L[1].handleEvent == "function" ? L[1].handleEvent : null;
      if (ft !== null) {
        const ot = q.get(L[1]);
        ot !== void 0 ? L[1] = ot : (L[1] = (H) => {
          l(f.currentTime, f.sampleRate, () => ft(H));
        }, q.set(ft, L[1]));
      }
    }
    return O.call(g.port1, L[0], L[1], L[2]);
  })(g.port1.addEventListener), g.port1.removeEventListener = /* @__PURE__ */ ((O) => (...L) => {
    if (L[0] === "message") {
      const ft = q.get(L[1]);
      ft !== void 0 && (q.delete(L[1]), L[1] = ft);
    }
    return O.call(g.port1, L[0], L[1], L[2]);
  })(g.port1.removeEventListener);
  let B = null;
  Object.defineProperty(g.port1, "onmessage", {
    get: () => B,
    set: (O) => {
      typeof B == "function" && g.port1.removeEventListener("message", B), B = typeof O == "function" ? O : null, typeof B == "function" && (g.port1.addEventListener("message", B), g.port1.start());
    }
  }), m.prototype.port = g.port1;
  let W = null;
  Hc(f, G, m, _).then((O) => W = O);
  const Nt = jn(_.numberOfInputs, _.channelCount), Ot = jn(_.numberOfOutputs, y), $ = m.parameterDescriptors === void 0 ? [] : m.parameterDescriptors.reduce((O, { name: L }) => ({ ...O, [L]: new Float32Array(128) }), {});
  let it = !0;
  const vt = () => {
    _.numberOfOutputs > 0 && k.disconnect(C);
    for (let O = 0, L = 0; O < _.numberOfOutputs; O += 1) {
      const ft = E[O];
      for (let ot = 0; ot < y[O]; ot += 1)
        C.disconnect(ft, L + ot, ot);
      L += y[O];
    }
  }, F = /* @__PURE__ */ new Map();
  k.onaudioprocess = ({ inputBuffer: O, outputBuffer: L }) => {
    if (W !== null) {
      const ft = h(G);
      for (let ot = 0; ot < A; ot += 128) {
        for (let H = 0; H < _.numberOfInputs; H += 1)
          for (let ct = 0; ct < _.channelCount; ct += 1)
            Wn(O, Nt[H], ct, ct, ot);
        m.parameterDescriptors !== void 0 && m.parameterDescriptors.forEach(({ name: H }, ct) => {
          Wn(O, $, H, b + ct, ot);
        });
        for (let H = 0; H < _.numberOfInputs; H += 1)
          for (let ct = 0; ct < y[H]; ct += 1)
            Ot[H][ct].byteLength === 0 && (Ot[H][ct] = new Float32Array(128));
        try {
          const H = Nt.map((It, oe) => {
            if (ft[oe].size > 0)
              return F.set(oe, A / 128), It;
            const ms = F.get(oe);
            return ms === void 0 ? [] : (It.every((_o) => _o.every((go) => go === 0)) && (ms === 1 ? F.delete(oe) : F.set(oe, ms - 1)), It);
          });
          it = l(f.currentTime + ot / f.sampleRate, f.sampleRate, () => W.process(H, Ot, $));
          for (let It = 0, oe = 0; It < _.numberOfOutputs; It += 1) {
            for (let Ke = 0; Ke < y[It]; Ke += 1)
              fr(L, Ot[It], Ke, oe + Ke, ot);
            oe += y[It];
          }
        } catch (H) {
          it = !1, G.dispatchEvent(new ErrorEvent("processorerror", {
            colno: H.colno,
            filename: H.filename,
            lineno: H.lineno,
            message: H.message
          }));
        }
        if (!it) {
          for (let H = 0; H < _.numberOfInputs; H += 1) {
            w[H].disconnect(T[H]);
            for (let ct = 0; ct < _.channelCount; ct += 1)
              T[ot].disconnect(N, ct, H * _.channelCount + ct);
          }
          if (m.parameterDescriptors !== void 0) {
            const H = m.parameterDescriptors.length;
            for (let ct = 0; ct < H; ct += 1) {
              const It = v[ct];
              It.disconnect(N, 0, b + ct), It.stop();
            }
          }
          N.disconnect(k), k.onaudioprocess = null, me ? vt() : Ae();
          break;
        }
      }
    }
  };
  let me = !1;
  const _e = o(f, {
    channelCount: 1,
    channelCountMode: "explicit",
    channelInterpretation: "discrete",
    gain: 0
  }), ke = () => k.connect(_e).connect(f.destination), Ae = () => {
    k.disconnect(_e), _e.disconnect();
  }, fo = () => {
    if (it) {
      Ae(), _.numberOfOutputs > 0 && k.connect(C);
      for (let O = 0, L = 0; O < _.numberOfOutputs; O += 1) {
        const ft = E[O];
        for (let ot = 0; ot < y[O]; ot += 1)
          C.connect(ft, L + ot, ot);
        L += y[O];
      }
    }
    me = !0;
  }, mo = () => {
    it && (ke(), vt()), me = !1;
  };
  return ke(), p(G, fo, mo);
}, gr = (s, t) => {
  const e = s.createBiquadFilter();
  return mt(e, t), lt(e, t, "Q"), lt(e, t, "detune"), lt(e, t, "frequency"), lt(e, t, "gain"), rt(e, t, "type"), e;
}, Jc = (s, t) => (e, n) => {
  const i = e.createChannelMerger(n.numberOfInputs);
  return s !== null && s.name === "webkitAudioContext" && t(e, i), mt(i, n), i;
}, Kc = (s) => {
  const t = s.numberOfOutputs;
  Object.defineProperty(s, "channelCount", {
    get: () => t,
    set: (e) => {
      if (e !== t)
        throw _t();
    }
  }), Object.defineProperty(s, "channelCountMode", {
    get: () => "explicit",
    set: (e) => {
      if (e !== "explicit")
        throw _t();
    }
  }), Object.defineProperty(s, "channelInterpretation", {
    get: () => "discrete",
    set: (e) => {
      if (e !== "discrete")
        throw _t();
    }
  });
}, fn = (s, t) => {
  const e = s.createChannelSplitter(t.numberOfOutputs);
  return mt(e, t), Kc(e), e;
}, tu = (s, t, e, n, i) => (r, o) => {
  if (r.createConstantSource === void 0)
    return e(r, o);
  const a = r.createConstantSource();
  return mt(a, o), lt(a, o, "offset"), t(n, () => n(r)) || Ws(a), t(i, () => i(r)) || js(a), s(r, a), a;
}, $e = (s, t) => (s.connect = t.connect.bind(t), s.disconnect = t.disconnect.bind(t), s), eu = (s, t, e, n) => (i, { offset: r, ...o }) => {
  const a = i.createBuffer(1, 2, 44100), c = t(i, {
    buffer: null,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    loop: !1,
    loopEnd: 0,
    loopStart: 0,
    playbackRate: 1
  }), u = e(i, { ...o, gain: r }), l = a.getChannelData(0);
  l[0] = 1, l[1] = 1, c.buffer = a, c.loop = !0;
  const h = {
    get bufferSize() {
    },
    get channelCount() {
      return u.channelCount;
    },
    set channelCount(d) {
      u.channelCount = d;
    },
    get channelCountMode() {
      return u.channelCountMode;
    },
    set channelCountMode(d) {
      u.channelCountMode = d;
    },
    get channelInterpretation() {
      return u.channelInterpretation;
    },
    set channelInterpretation(d) {
      u.channelInterpretation = d;
    },
    get context() {
      return u.context;
    },
    get inputs() {
      return [];
    },
    get numberOfInputs() {
      return c.numberOfInputs;
    },
    get numberOfOutputs() {
      return u.numberOfOutputs;
    },
    get offset() {
      return u.gain;
    },
    get onended() {
      return c.onended;
    },
    set onended(d) {
      c.onended = d;
    },
    addEventListener(...d) {
      return c.addEventListener(d[0], d[1], d[2]);
    },
    dispatchEvent(...d) {
      return c.dispatchEvent(d[0]);
    },
    removeEventListener(...d) {
      return c.removeEventListener(d[0], d[1], d[2]);
    },
    start(d = 0) {
      c.start.call(c, d);
    },
    stop(d = 0) {
      c.stop.call(c, d);
    }
  }, p = () => c.connect(u), f = () => c.disconnect(u);
  return s(i, c), n($e(h, u), p, f);
}, nu = (s, t) => (e, n) => {
  const i = e.createConvolver();
  if (mt(i, n), n.disableNormalization === i.normalize && (i.normalize = !n.disableNormalization), rt(i, n, "buffer"), n.channelCount > 2 || (t(i, "channelCount", (r) => () => r.call(i), (r) => (o) => {
    if (o > 2)
      throw s();
    return r.call(i, o);
  }), n.channelCountMode === "max"))
    throw s();
  return t(i, "channelCountMode", (r) => () => r.call(i), (r) => (o) => {
    if (o === "max")
      throw s();
    return r.call(i, o);
  }), i;
}, yr = (s, t) => {
  const e = s.createDelay(t.maxDelayTime);
  return mt(e, t), lt(e, t, "delayTime"), e;
}, su = (s) => (t, e) => {
  const n = t.createDynamicsCompressor();
  if (mt(n, e), e.channelCount > 2 || e.channelCountMode === "max")
    throw s();
  return lt(n, e, "attack"), lt(n, e, "knee"), lt(n, e, "ratio"), lt(n, e, "release"), lt(n, e, "threshold"), n;
}, At = (s, t) => {
  const e = s.createGain();
  return mt(e, t), lt(e, t, "gain"), e;
}, iu = (s) => (t, e, n) => {
  if (t.createIIRFilter === void 0)
    return s(t, e, n);
  const i = t.createIIRFilter(n.feedforward, n.feedback);
  return mt(i, n), i;
};
function ru(s, t) {
  const e = t[0] * t[0] + t[1] * t[1];
  return [(s[0] * t[0] + s[1] * t[1]) / e, (s[1] * t[0] - s[0] * t[1]) / e];
}
function ou(s, t) {
  return [s[0] * t[0] - s[1] * t[1], s[0] * t[1] + s[1] * t[0]];
}
function ji(s, t) {
  let e = [0, 0];
  for (let n = s.length - 1; n >= 0; n -= 1)
    e = ou(e, t), e[0] += s[n];
  return e;
}
const au = (s, t, e, n) => (i, r, { channelCount: o, channelCountMode: a, channelInterpretation: c, feedback: u, feedforward: l }) => {
  const h = _r(r, i.sampleRate), p = u instanceof Float64Array ? u : new Float64Array(u), f = l instanceof Float64Array ? l : new Float64Array(l), d = p.length, m = f.length, _ = Math.min(d, m);
  if (d === 0 || d > 20)
    throw n();
  if (p[0] === 0)
    throw t();
  if (m === 0 || m > 20)
    throw n();
  if (f[0] === 0)
    throw t();
  if (p[0] !== 1) {
    for (let v = 0; v < m; v += 1)
      f[v] /= p[0];
    for (let v = 1; v < d; v += 1)
      p[v] /= p[0];
  }
  const y = e(i, h, o, o);
  y.channelCount = o, y.channelCountMode = a, y.channelInterpretation = c;
  const b = 32, x = [], S = [], g = [];
  for (let v = 0; v < o; v += 1) {
    x.push(0);
    const N = new Float32Array(b), A = new Float32Array(b);
    N.fill(0), A.fill(0), S.push(N), g.push(A);
  }
  y.onaudioprocess = (v) => {
    const N = v.inputBuffer, A = v.outputBuffer, k = N.numberOfChannels;
    for (let C = 0; C < k; C += 1) {
      const E = N.getChannelData(C), D = A.getChannelData(C);
      x[C] = mr(p, d, f, m, _, S[C], g[C], x[C], b, E, D);
    }
  };
  const w = i.sampleRate / 2;
  return $e({
    get bufferSize() {
      return h;
    },
    get channelCount() {
      return y.channelCount;
    },
    set channelCount(v) {
      y.channelCount = v;
    },
    get channelCountMode() {
      return y.channelCountMode;
    },
    set channelCountMode(v) {
      y.channelCountMode = v;
    },
    get channelInterpretation() {
      return y.channelInterpretation;
    },
    set channelInterpretation(v) {
      y.channelInterpretation = v;
    },
    get context() {
      return y.context;
    },
    get inputs() {
      return [y];
    },
    get numberOfInputs() {
      return y.numberOfInputs;
    },
    get numberOfOutputs() {
      return y.numberOfOutputs;
    },
    addEventListener(...v) {
      return y.addEventListener(v[0], v[1], v[2]);
    },
    dispatchEvent(...v) {
      return y.dispatchEvent(v[0]);
    },
    getFrequencyResponse(v, N, A) {
      if (v.length !== N.length || N.length !== A.length)
        throw s();
      const k = v.length;
      for (let C = 0; C < k; C += 1) {
        const E = -Math.PI * (v[C] / w), D = [Math.cos(E), Math.sin(E)], V = ji(f, D), M = ji(p, D), P = ru(V, M);
        N[C] = Math.sqrt(P[0] * P[0] + P[1] * P[1]), A[C] = Math.atan2(P[1], P[0]);
      }
    },
    removeEventListener(...v) {
      return y.removeEventListener(v[0], v[1], v[2]);
    }
  }, y);
}, cu = (s, t) => s.createMediaElementSource(t.mediaElement), uu = (s, t) => {
  const e = s.createMediaStreamDestination();
  return mt(e, t), e.numberOfOutputs === 1 && Object.defineProperty(e, "numberOfOutputs", { get: () => 0 }), e;
}, lu = (s, { mediaStream: t }) => {
  const e = t.getAudioTracks();
  e.sort((r, o) => r.id < o.id ? -1 : r.id > o.id ? 1 : 0);
  const n = e.slice(0, 1), i = s.createMediaStreamSource(new MediaStream(n));
  return Object.defineProperty(i, "mediaStream", { value: t }), i;
}, hu = (s, t) => (e, { mediaStreamTrack: n }) => {
  if (typeof e.createMediaStreamTrackSource == "function")
    return e.createMediaStreamTrackSource(n);
  const i = new MediaStream([n]), r = e.createMediaStreamSource(i);
  if (n.kind !== "audio")
    throw s();
  if (t(e))
    throw new TypeError();
  return r;
}, du = (s) => s === null ? null : s.hasOwnProperty("OfflineAudioContext") ? s.OfflineAudioContext : s.hasOwnProperty("webkitOfflineAudioContext") ? s.webkitOfflineAudioContext : null, pu = (s, t, e, n, i, r) => (o, a) => {
  const c = o.createOscillator();
  return mt(c, a), lt(c, a, "detune"), lt(c, a, "frequency"), a.periodicWave !== void 0 ? c.setPeriodicWave(a.periodicWave) : rt(c, a, "type"), t(e, () => e(o)) || Ws(c), t(n, () => n(o)) || r(c, o), t(i, () => i(o)) || js(c), s(o, c), c;
}, fu = (s) => (t, e) => {
  const n = t.createPanner();
  return n.orientationX === void 0 ? s(t, e) : (mt(n, e), lt(n, e, "orientationX"), lt(n, e, "orientationY"), lt(n, e, "orientationZ"), lt(n, e, "positionX"), lt(n, e, "positionY"), lt(n, e, "positionZ"), rt(n, e, "coneInnerAngle"), rt(n, e, "coneOuterAngle"), rt(n, e, "coneOuterGain"), rt(n, e, "distanceModel"), rt(n, e, "maxDistance"), rt(n, e, "panningModel"), rt(n, e, "refDistance"), rt(n, e, "rolloffFactor"), n);
}, mu = (s, t, e, n, i, r, o, a, c, u) => (l, { coneInnerAngle: h, coneOuterAngle: p, coneOuterGain: f, distanceModel: d, maxDistance: m, orientationX: _, orientationY: y, orientationZ: b, panningModel: x, positionX: S, positionY: g, positionZ: w, refDistance: T, rolloffFactor: v, ...N }) => {
  const A = l.createPanner();
  if (N.channelCount > 2 || N.channelCountMode === "max")
    throw o();
  mt(A, N);
  const k = {
    channelCount: 1,
    channelCountMode: "explicit",
    channelInterpretation: "discrete"
  }, C = e(l, {
    ...k,
    channelInterpretation: "speakers",
    numberOfInputs: 6
  }), E = n(l, { ...N, gain: 1 }), D = n(l, { ...k, gain: 1 }), V = n(l, { ...k, gain: 0 }), M = n(l, { ...k, gain: 0 }), P = n(l, { ...k, gain: 0 }), G = n(l, { ...k, gain: 0 }), q = n(l, { ...k, gain: 0 }), B = i(l, 256, 6, 1), W = r(l, {
    ...k,
    curve: new Float32Array([1, 1]),
    oversample: "none"
  });
  let K = [_, y, b], Nt = [S, g, w];
  const Ot = new Float32Array(1);
  B.onaudioprocess = ({ inputBuffer: F }) => {
    const me = [
      c(F, Ot, 0),
      c(F, Ot, 1),
      c(F, Ot, 2)
    ];
    me.some((ke, Ae) => ke !== K[Ae]) && (A.setOrientation(...me), K = me);
    const _e = [
      c(F, Ot, 3),
      c(F, Ot, 4),
      c(F, Ot, 5)
    ];
    _e.some((ke, Ae) => ke !== Nt[Ae]) && (A.setPosition(..._e), Nt = _e);
  }, Object.defineProperty(V.gain, "defaultValue", { get: () => 0 }), Object.defineProperty(M.gain, "defaultValue", { get: () => 0 }), Object.defineProperty(P.gain, "defaultValue", { get: () => 0 }), Object.defineProperty(G.gain, "defaultValue", { get: () => 0 }), Object.defineProperty(q.gain, "defaultValue", { get: () => 0 });
  const $ = {
    get bufferSize() {
    },
    get channelCount() {
      return A.channelCount;
    },
    set channelCount(F) {
      if (F > 2)
        throw o();
      E.channelCount = F, A.channelCount = F;
    },
    get channelCountMode() {
      return A.channelCountMode;
    },
    set channelCountMode(F) {
      if (F === "max")
        throw o();
      E.channelCountMode = F, A.channelCountMode = F;
    },
    get channelInterpretation() {
      return A.channelInterpretation;
    },
    set channelInterpretation(F) {
      E.channelInterpretation = F, A.channelInterpretation = F;
    },
    get coneInnerAngle() {
      return A.coneInnerAngle;
    },
    set coneInnerAngle(F) {
      A.coneInnerAngle = F;
    },
    get coneOuterAngle() {
      return A.coneOuterAngle;
    },
    set coneOuterAngle(F) {
      A.coneOuterAngle = F;
    },
    get coneOuterGain() {
      return A.coneOuterGain;
    },
    set coneOuterGain(F) {
      if (F < 0 || F > 1)
        throw t();
      A.coneOuterGain = F;
    },
    get context() {
      return A.context;
    },
    get distanceModel() {
      return A.distanceModel;
    },
    set distanceModel(F) {
      A.distanceModel = F;
    },
    get inputs() {
      return [E];
    },
    get maxDistance() {
      return A.maxDistance;
    },
    set maxDistance(F) {
      if (F < 0)
        throw new RangeError();
      A.maxDistance = F;
    },
    get numberOfInputs() {
      return A.numberOfInputs;
    },
    get numberOfOutputs() {
      return A.numberOfOutputs;
    },
    get orientationX() {
      return D.gain;
    },
    get orientationY() {
      return V.gain;
    },
    get orientationZ() {
      return M.gain;
    },
    get panningModel() {
      return A.panningModel;
    },
    set panningModel(F) {
      A.panningModel = F;
    },
    get positionX() {
      return P.gain;
    },
    get positionY() {
      return G.gain;
    },
    get positionZ() {
      return q.gain;
    },
    get refDistance() {
      return A.refDistance;
    },
    set refDistance(F) {
      if (F < 0)
        throw new RangeError();
      A.refDistance = F;
    },
    get rolloffFactor() {
      return A.rolloffFactor;
    },
    set rolloffFactor(F) {
      if (F < 0)
        throw new RangeError();
      A.rolloffFactor = F;
    },
    addEventListener(...F) {
      return E.addEventListener(F[0], F[1], F[2]);
    },
    dispatchEvent(...F) {
      return E.dispatchEvent(F[0]);
    },
    removeEventListener(...F) {
      return E.removeEventListener(F[0], F[1], F[2]);
    }
  };
  h !== $.coneInnerAngle && ($.coneInnerAngle = h), p !== $.coneOuterAngle && ($.coneOuterAngle = p), f !== $.coneOuterGain && ($.coneOuterGain = f), d !== $.distanceModel && ($.distanceModel = d), m !== $.maxDistance && ($.maxDistance = m), _ !== $.orientationX.value && ($.orientationX.value = _), y !== $.orientationY.value && ($.orientationY.value = y), b !== $.orientationZ.value && ($.orientationZ.value = b), x !== $.panningModel && ($.panningModel = x), S !== $.positionX.value && ($.positionX.value = S), g !== $.positionY.value && ($.positionY.value = g), w !== $.positionZ.value && ($.positionZ.value = w), T !== $.refDistance && ($.refDistance = T), v !== $.rolloffFactor && ($.rolloffFactor = v), (K[0] !== 1 || K[1] !== 0 || K[2] !== 0) && A.setOrientation(...K), (Nt[0] !== 0 || Nt[1] !== 0 || Nt[2] !== 0) && A.setPosition(...Nt);
  const it = () => {
    E.connect(A), s(E, W, 0, 0), W.connect(D).connect(C, 0, 0), W.connect(V).connect(C, 0, 1), W.connect(M).connect(C, 0, 2), W.connect(P).connect(C, 0, 3), W.connect(G).connect(C, 0, 4), W.connect(q).connect(C, 0, 5), C.connect(B).connect(l.destination);
  }, vt = () => {
    E.disconnect(A), a(E, W, 0, 0), W.disconnect(D), D.disconnect(C), W.disconnect(V), V.disconnect(C), W.disconnect(M), M.disconnect(C), W.disconnect(P), P.disconnect(C), W.disconnect(G), G.disconnect(C), W.disconnect(q), q.disconnect(C), C.disconnect(B), B.disconnect(l.destination);
  };
  return u($e($, A), it, vt);
}, _u = (s) => (t, { disableNormalization: e, imag: n, real: i }) => {
  const r = n instanceof Float32Array ? n : new Float32Array(n), o = i instanceof Float32Array ? i : new Float32Array(i), a = t.createPeriodicWave(o, r, { disableNormalization: e });
  if (Array.from(n).length < 2)
    throw s();
  return a;
}, mn = (s, t, e, n) => s.createScriptProcessor(t, e, n), gu = (s, t) => (e, n) => {
  const i = n.channelCountMode;
  if (i === "clamped-max")
    throw t();
  if (e.createStereoPanner === void 0)
    return s(e, n);
  const r = e.createStereoPanner();
  return mt(r, n), lt(r, n, "pan"), Object.defineProperty(r, "channelCountMode", {
    get: () => i,
    set: (o) => {
      if (o !== i)
        throw t();
    }
  }), r;
}, yu = (s, t, e, n, i, r) => {
  const a = new Float32Array([1, 1]), c = Math.PI / 2, u = { channelCount: 1, channelCountMode: "explicit", channelInterpretation: "discrete" }, l = { ...u, oversample: "none" }, h = (d, m, _, y) => {
    const b = new Float32Array(16385), x = new Float32Array(16385);
    for (let N = 0; N < 16385; N += 1) {
      const A = N / 16384 * c;
      b[N] = Math.cos(A), x[N] = Math.sin(A);
    }
    const S = e(d, { ...u, gain: 0 }), g = n(d, { ...l, curve: b }), w = n(d, { ...l, curve: a }), T = e(d, { ...u, gain: 0 }), v = n(d, { ...l, curve: x });
    return {
      connectGraph() {
        m.connect(S), m.connect(w.inputs === void 0 ? w : w.inputs[0]), m.connect(T), w.connect(_), _.connect(g.inputs === void 0 ? g : g.inputs[0]), _.connect(v.inputs === void 0 ? v : v.inputs[0]), g.connect(S.gain), v.connect(T.gain), S.connect(y, 0, 0), T.connect(y, 0, 1);
      },
      disconnectGraph() {
        m.disconnect(S), m.disconnect(w.inputs === void 0 ? w : w.inputs[0]), m.disconnect(T), w.disconnect(_), _.disconnect(g.inputs === void 0 ? g : g.inputs[0]), _.disconnect(v.inputs === void 0 ? v : v.inputs[0]), g.disconnect(S.gain), v.disconnect(T.gain), S.disconnect(y, 0, 0), T.disconnect(y, 0, 1);
      }
    };
  }, p = (d, m, _, y) => {
    const b = new Float32Array(16385), x = new Float32Array(16385), S = new Float32Array(16385), g = new Float32Array(16385), w = Math.floor(16385 / 2);
    for (let P = 0; P < 16385; P += 1)
      if (P > w) {
        const G = (P - w) / (16384 - w) * c;
        b[P] = Math.cos(G), x[P] = Math.sin(G), S[P] = 0, g[P] = 1;
      } else {
        const G = P / (16384 - w) * c;
        b[P] = 1, x[P] = 0, S[P] = Math.cos(G), g[P] = Math.sin(G);
      }
    const T = t(d, {
      channelCount: 2,
      channelCountMode: "explicit",
      channelInterpretation: "discrete",
      numberOfOutputs: 2
    }), v = e(d, { ...u, gain: 0 }), N = n(d, {
      ...l,
      curve: b
    }), A = e(d, { ...u, gain: 0 }), k = n(d, {
      ...l,
      curve: x
    }), C = n(d, { ...l, curve: a }), E = e(d, { ...u, gain: 0 }), D = n(d, {
      ...l,
      curve: S
    }), V = e(d, { ...u, gain: 0 }), M = n(d, {
      ...l,
      curve: g
    });
    return {
      connectGraph() {
        m.connect(T), m.connect(C.inputs === void 0 ? C : C.inputs[0]), T.connect(v, 0), T.connect(A, 0), T.connect(E, 1), T.connect(V, 1), C.connect(_), _.connect(N.inputs === void 0 ? N : N.inputs[0]), _.connect(k.inputs === void 0 ? k : k.inputs[0]), _.connect(D.inputs === void 0 ? D : D.inputs[0]), _.connect(M.inputs === void 0 ? M : M.inputs[0]), N.connect(v.gain), k.connect(A.gain), D.connect(E.gain), M.connect(V.gain), v.connect(y, 0, 0), E.connect(y, 0, 0), A.connect(y, 0, 1), V.connect(y, 0, 1);
      },
      disconnectGraph() {
        m.disconnect(T), m.disconnect(C.inputs === void 0 ? C : C.inputs[0]), T.disconnect(v, 0), T.disconnect(A, 0), T.disconnect(E, 1), T.disconnect(V, 1), C.disconnect(_), _.disconnect(N.inputs === void 0 ? N : N.inputs[0]), _.disconnect(k.inputs === void 0 ? k : k.inputs[0]), _.disconnect(D.inputs === void 0 ? D : D.inputs[0]), _.disconnect(M.inputs === void 0 ? M : M.inputs[0]), N.disconnect(v.gain), k.disconnect(A.gain), D.disconnect(E.gain), M.disconnect(V.gain), v.disconnect(y, 0, 0), E.disconnect(y, 0, 0), A.disconnect(y, 0, 1), V.disconnect(y, 0, 1);
      }
    };
  }, f = (d, m, _, y, b) => {
    if (m === 1)
      return h(d, _, y, b);
    if (m === 2)
      return p(d, _, y, b);
    throw i();
  };
  return (d, { channelCount: m, channelCountMode: _, pan: y, ...b }) => {
    if (_ === "max")
      throw i();
    const x = s(d, {
      ...b,
      channelCount: 1,
      channelCountMode: _,
      numberOfInputs: 2
    }), S = e(d, { ...b, channelCount: m, channelCountMode: _, gain: 1 }), g = e(d, {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "discrete",
      gain: y
    });
    let { connectGraph: w, disconnectGraph: T } = f(d, m, S, g, x);
    Object.defineProperty(g.gain, "defaultValue", { get: () => 0 }), Object.defineProperty(g.gain, "maxValue", { get: () => 1 }), Object.defineProperty(g.gain, "minValue", { get: () => -1 });
    const v = {
      get bufferSize() {
      },
      get channelCount() {
        return S.channelCount;
      },
      set channelCount(C) {
        S.channelCount !== C && (N && T(), { connectGraph: w, disconnectGraph: T } = f(d, C, S, g, x), N && w()), S.channelCount = C;
      },
      get channelCountMode() {
        return S.channelCountMode;
      },
      set channelCountMode(C) {
        if (C === "clamped-max" || C === "max")
          throw i();
        S.channelCountMode = C;
      },
      get channelInterpretation() {
        return S.channelInterpretation;
      },
      set channelInterpretation(C) {
        S.channelInterpretation = C;
      },
      get context() {
        return S.context;
      },
      get inputs() {
        return [S];
      },
      get numberOfInputs() {
        return S.numberOfInputs;
      },
      get numberOfOutputs() {
        return S.numberOfOutputs;
      },
      get pan() {
        return g.gain;
      },
      addEventListener(...C) {
        return S.addEventListener(C[0], C[1], C[2]);
      },
      dispatchEvent(...C) {
        return S.dispatchEvent(C[0]);
      },
      removeEventListener(...C) {
        return S.removeEventListener(C[0], C[1], C[2]);
      }
    };
    let N = !1;
    const A = () => {
      w(), N = !0;
    }, k = () => {
      T(), N = !1;
    };
    return r($e(v, x), A, k);
  };
}, vu = (s, t, e, n, i, r, o) => (a, c) => {
  const u = a.createWaveShaper();
  if (r !== null && r.name === "webkitAudioContext" && a.createGain().gain.automationRate === void 0)
    return e(a, c);
  mt(u, c);
  const l = c.curve === null || c.curve instanceof Float32Array ? c.curve : new Float32Array(c.curve);
  if (l !== null && l.length < 2)
    throw t();
  rt(u, { curve: l }, "curve"), rt(u, c, "oversample");
  let h = null, p = !1;
  return o(u, "curve", (m) => () => m.call(u), (m) => (_) => (m.call(u, _), p && (n(_) && h === null ? h = s(a, u) : !n(_) && h !== null && (h(), h = null)), _)), i(u, () => {
    p = !0, n(u.curve) && (h = s(a, u));
  }, () => {
    p = !1, h !== null && (h(), h = null);
  });
}, wu = (s, t, e, n, i) => (r, { curve: o, oversample: a, ...c }) => {
  const u = r.createWaveShaper(), l = r.createWaveShaper();
  mt(u, c), mt(l, c);
  const h = e(r, { ...c, gain: 1 }), p = e(r, { ...c, gain: -1 }), f = e(r, { ...c, gain: 1 }), d = e(r, { ...c, gain: -1 });
  let m = null, _ = !1, y = null;
  const b = {
    get bufferSize() {
    },
    get channelCount() {
      return u.channelCount;
    },
    set channelCount(g) {
      h.channelCount = g, p.channelCount = g, u.channelCount = g, f.channelCount = g, l.channelCount = g, d.channelCount = g;
    },
    get channelCountMode() {
      return u.channelCountMode;
    },
    set channelCountMode(g) {
      h.channelCountMode = g, p.channelCountMode = g, u.channelCountMode = g, f.channelCountMode = g, l.channelCountMode = g, d.channelCountMode = g;
    },
    get channelInterpretation() {
      return u.channelInterpretation;
    },
    set channelInterpretation(g) {
      h.channelInterpretation = g, p.channelInterpretation = g, u.channelInterpretation = g, f.channelInterpretation = g, l.channelInterpretation = g, d.channelInterpretation = g;
    },
    get context() {
      return u.context;
    },
    get curve() {
      return y;
    },
    set curve(g) {
      if (g !== null && g.length < 2)
        throw t();
      if (g === null)
        u.curve = g, l.curve = g;
      else {
        const w = g.length, T = new Float32Array(w + 2 - w % 2), v = new Float32Array(w + 2 - w % 2);
        T[0] = g[0], v[0] = -g[w - 1];
        const N = Math.ceil((w + 1) / 2), A = (w + 1) / 2 - 1;
        for (let k = 1; k < N; k += 1) {
          const C = k / N * A, E = Math.floor(C), D = Math.ceil(C);
          T[k] = E === D ? g[E] : (1 - (C - E)) * g[E] + (1 - (D - C)) * g[D], v[k] = E === D ? -g[w - 1 - E] : -((1 - (C - E)) * g[w - 1 - E]) - (1 - (D - C)) * g[w - 1 - D];
        }
        T[N] = w % 2 === 1 ? g[N - 1] : (g[N - 2] + g[N - 1]) / 2, u.curve = T, l.curve = v;
      }
      y = g, _ && (n(y) && m === null ? m = s(r, h) : m !== null && (m(), m = null));
    },
    get inputs() {
      return [h];
    },
    get numberOfInputs() {
      return u.numberOfInputs;
    },
    get numberOfOutputs() {
      return u.numberOfOutputs;
    },
    get oversample() {
      return u.oversample;
    },
    set oversample(g) {
      u.oversample = g, l.oversample = g;
    },
    addEventListener(...g) {
      return h.addEventListener(g[0], g[1], g[2]);
    },
    dispatchEvent(...g) {
      return h.dispatchEvent(g[0]);
    },
    removeEventListener(...g) {
      return h.removeEventListener(g[0], g[1], g[2]);
    }
  };
  o !== null && (b.curve = o instanceof Float32Array ? o : new Float32Array(o)), a !== b.oversample && (b.oversample = a);
  const x = () => {
    h.connect(u).connect(f), h.connect(p).connect(l).connect(d).connect(f), _ = !0, n(y) && (m = s(r, h));
  }, S = () => {
    h.disconnect(u), u.disconnect(f), h.disconnect(p), p.disconnect(l), l.disconnect(d), d.disconnect(f), _ = !1, m !== null && (m(), m = null);
  };
  return i($e(b, f), x, S);
}, Ct = () => new DOMException("", "NotSupportedError"), Tu = {
  numberOfChannels: 1
}, bu = (s, t, e, n, i) => class extends s {
  constructor(o, a, c) {
    let u;
    if (typeof o == "number" && a !== void 0 && c !== void 0)
      u = { length: a, numberOfChannels: o, sampleRate: c };
    else if (typeof o == "object")
      u = o;
    else
      throw new Error("The given parameters are not valid.");
    const { length: l, numberOfChannels: h, sampleRate: p } = { ...Tu, ...u }, f = n(h, l, p);
    t(an, () => an(f)) || f.addEventListener("statechange", /* @__PURE__ */ (() => {
      let d = 0;
      const m = (_) => {
        this._state === "running" && (d > 0 ? (f.removeEventListener("statechange", m), _.stopImmediatePropagation(), this._waitForThePromiseToSettle(_)) : d += 1);
      };
      return m;
    })()), super(f, h), this._length = l, this._nativeOfflineAudioContext = f, this._state = null;
  }
  get length() {
    return this._nativeOfflineAudioContext.length === void 0 ? this._length : this._nativeOfflineAudioContext.length;
  }
  get state() {
    return this._state === null ? this._nativeOfflineAudioContext.state : this._state;
  }
  startRendering() {
    return this._state === "running" ? Promise.reject(e()) : (this._state = "running", i(this.destination, this._nativeOfflineAudioContext).finally(() => {
      this._state = null, ur(this);
    }));
  }
  _waitForThePromiseToSettle(o) {
    this._state === null ? this._nativeOfflineAudioContext.dispatchEvent(o) : setTimeout(() => this._waitForThePromiseToSettle(o));
  }
}, xu = {
  channelCount: 2,
  channelCountMode: "max",
  // This attribute has no effect for nodes with no inputs.
  channelInterpretation: "speakers",
  // This attribute has no effect for nodes with no inputs.
  detune: 0,
  frequency: 440,
  periodicWave: void 0,
  type: "sine"
}, Cu = (s, t, e, n, i, r, o) => class extends s {
  constructor(c, u) {
    const l = i(c), h = { ...xu, ...u }, p = e(l, h), f = r(l), d = f ? n() : null, m = c.sampleRate / 2;
    super(c, !1, p, d), this._detune = t(this, f, p.detune, 153600, -153600), this._frequency = t(this, f, p.frequency, m, -m), this._nativeOscillatorNode = p, this._onended = null, this._oscillatorNodeRenderer = d, this._oscillatorNodeRenderer !== null && h.periodicWave !== void 0 && (this._oscillatorNodeRenderer.periodicWave = h.periodicWave);
  }
  get detune() {
    return this._detune;
  }
  get frequency() {
    return this._frequency;
  }
  get onended() {
    return this._onended;
  }
  set onended(c) {
    const u = typeof c == "function" ? o(this, c) : null;
    this._nativeOscillatorNode.onended = u;
    const l = this._nativeOscillatorNode.onended;
    this._onended = l !== null && l === u ? c : l;
  }
  get type() {
    return this._nativeOscillatorNode.type;
  }
  set type(c) {
    this._nativeOscillatorNode.type = c, this._oscillatorNodeRenderer !== null && (this._oscillatorNodeRenderer.periodicWave = null);
  }
  setPeriodicWave(c) {
    this._nativeOscillatorNode.setPeriodicWave(c), this._oscillatorNodeRenderer !== null && (this._oscillatorNodeRenderer.periodicWave = c);
  }
  start(c = 0) {
    if (this._nativeOscillatorNode.start(c), this._oscillatorNodeRenderer !== null && (this._oscillatorNodeRenderer.start = c), this.context.state !== "closed") {
      Ve(this);
      const u = () => {
        this._nativeOscillatorNode.removeEventListener("ended", u), Kt(this) && hn(this);
      };
      this._nativeOscillatorNode.addEventListener("ended", u);
    }
  }
  stop(c = 0) {
    this._nativeOscillatorNode.stop(c), this._oscillatorNodeRenderer !== null && (this._oscillatorNodeRenderer.stop = c);
  }
}, Su = (s, t, e, n, i) => () => {
  const r = /* @__PURE__ */ new WeakMap();
  let o = null, a = null, c = null;
  const u = async (l, h) => {
    let p = e(l);
    const f = yt(p, h);
    if (!f) {
      const d = {
        channelCount: p.channelCount,
        channelCountMode: p.channelCountMode,
        channelInterpretation: p.channelInterpretation,
        detune: p.detune.value,
        frequency: p.frequency.value,
        periodicWave: o === null ? void 0 : o,
        type: p.type
      };
      p = t(h, d), a !== null && p.start(a), c !== null && p.stop(c);
    }
    return r.set(h, p), f ? (await s(h, l.detune, p.detune), await s(h, l.frequency, p.frequency)) : (await n(h, l.detune, p.detune), await n(h, l.frequency, p.frequency)), await i(l, h, p), p;
  };
  return {
    set periodicWave(l) {
      o = l;
    },
    set start(l) {
      a = l;
    },
    set stop(l) {
      c = l;
    },
    render(l, h) {
      const p = r.get(h);
      return p !== void 0 ? Promise.resolve(p) : u(l, h);
    }
  };
}, ku = {
  channelCount: 2,
  channelCountMode: "clamped-max",
  channelInterpretation: "speakers",
  coneInnerAngle: 360,
  coneOuterAngle: 360,
  coneOuterGain: 0,
  distanceModel: "inverse",
  maxDistance: 1e4,
  orientationX: 1,
  orientationY: 0,
  orientationZ: 0,
  panningModel: "equalpower",
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  refDistance: 1,
  rolloffFactor: 1
}, Au = (s, t, e, n, i, r, o) => class extends s {
  constructor(c, u) {
    const l = i(c), h = { ...ku, ...u }, p = e(l, h), f = r(l), d = f ? n() : null;
    super(c, !1, p, d), this._nativePannerNode = p, this._orientationX = t(this, f, p.orientationX, wt, St), this._orientationY = t(this, f, p.orientationY, wt, St), this._orientationZ = t(this, f, p.orientationZ, wt, St), this._positionX = t(this, f, p.positionX, wt, St), this._positionY = t(this, f, p.positionY, wt, St), this._positionZ = t(this, f, p.positionZ, wt, St), o(this, 1);
  }
  get coneInnerAngle() {
    return this._nativePannerNode.coneInnerAngle;
  }
  set coneInnerAngle(c) {
    this._nativePannerNode.coneInnerAngle = c;
  }
  get coneOuterAngle() {
    return this._nativePannerNode.coneOuterAngle;
  }
  set coneOuterAngle(c) {
    this._nativePannerNode.coneOuterAngle = c;
  }
  get coneOuterGain() {
    return this._nativePannerNode.coneOuterGain;
  }
  set coneOuterGain(c) {
    this._nativePannerNode.coneOuterGain = c;
  }
  get distanceModel() {
    return this._nativePannerNode.distanceModel;
  }
  set distanceModel(c) {
    this._nativePannerNode.distanceModel = c;
  }
  get maxDistance() {
    return this._nativePannerNode.maxDistance;
  }
  set maxDistance(c) {
    this._nativePannerNode.maxDistance = c;
  }
  get orientationX() {
    return this._orientationX;
  }
  get orientationY() {
    return this._orientationY;
  }
  get orientationZ() {
    return this._orientationZ;
  }
  get panningModel() {
    return this._nativePannerNode.panningModel;
  }
  set panningModel(c) {
    this._nativePannerNode.panningModel = c;
  }
  get positionX() {
    return this._positionX;
  }
  get positionY() {
    return this._positionY;
  }
  get positionZ() {
    return this._positionZ;
  }
  get refDistance() {
    return this._nativePannerNode.refDistance;
  }
  set refDistance(c) {
    this._nativePannerNode.refDistance = c;
  }
  get rolloffFactor() {
    return this._nativePannerNode.rolloffFactor;
  }
  set rolloffFactor(c) {
    this._nativePannerNode.rolloffFactor = c;
  }
}, Nu = (s, t, e, n, i, r, o, a, c, u) => () => {
  const l = /* @__PURE__ */ new WeakMap();
  let h = null;
  const p = async (f, d) => {
    let m = null, _ = r(f);
    const y = {
      channelCount: _.channelCount,
      channelCountMode: _.channelCountMode,
      channelInterpretation: _.channelInterpretation
    }, b = {
      ...y,
      coneInnerAngle: _.coneInnerAngle,
      coneOuterAngle: _.coneOuterAngle,
      coneOuterGain: _.coneOuterGain,
      distanceModel: _.distanceModel,
      maxDistance: _.maxDistance,
      panningModel: _.panningModel,
      refDistance: _.refDistance,
      rolloffFactor: _.rolloffFactor
    }, x = yt(_, d);
    if ("bufferSize" in _)
      m = n(d, { ...y, gain: 1 });
    else if (!x) {
      const S = {
        ...b,
        orientationX: _.orientationX.value,
        orientationY: _.orientationY.value,
        orientationZ: _.orientationZ.value,
        positionX: _.positionX.value,
        positionY: _.positionY.value,
        positionZ: _.positionZ.value
      };
      _ = i(d, S);
    }
    if (l.set(d, m === null ? _ : m), m !== null) {
      if (h === null) {
        if (o === null)
          throw new Error("Missing the native OfflineAudioContext constructor.");
        const k = new o(
          6,
          // Bug #17: Safari does not yet expose the length.
          f.context.length,
          d.sampleRate
        ), C = t(k, {
          channelCount: 1,
          channelCountMode: "explicit",
          channelInterpretation: "speakers",
          numberOfInputs: 6
        });
        C.connect(k.destination), h = (async () => {
          const E = await Promise.all([
            f.orientationX,
            f.orientationY,
            f.orientationZ,
            f.positionX,
            f.positionY,
            f.positionZ
          ].map(async (D, V) => {
            const M = e(k, {
              channelCount: 1,
              channelCountMode: "explicit",
              channelInterpretation: "discrete",
              offset: V === 0 ? 1 : 0
            });
            return await a(k, D, M.offset), M;
          }));
          for (let D = 0; D < 6; D += 1)
            E[D].connect(C, 0, D), E[D].start(0);
          return u(k);
        })();
      }
      const S = await h, g = n(d, { ...y, gain: 1 });
      await c(f, d, g);
      const w = [];
      for (let k = 0; k < S.numberOfChannels; k += 1)
        w.push(S.getChannelData(k));
      let T = [w[0][0], w[1][0], w[2][0]], v = [w[3][0], w[4][0], w[5][0]], N = n(d, { ...y, gain: 1 }), A = i(d, {
        ...b,
        orientationX: T[0],
        orientationY: T[1],
        orientationZ: T[2],
        positionX: v[0],
        positionY: v[1],
        positionZ: v[2]
      });
      g.connect(N).connect(A.inputs[0]), A.connect(m);
      for (let k = 128; k < S.length; k += 128) {
        const C = [w[0][k], w[1][k], w[2][k]], E = [w[3][k], w[4][k], w[5][k]];
        if (C.some((D, V) => D !== T[V]) || E.some((D, V) => D !== v[V])) {
          T = C, v = E;
          const D = k / d.sampleRate;
          N.gain.setValueAtTime(0, D), N = n(d, { ...y, gain: 0 }), A = i(d, {
            ...b,
            orientationX: T[0],
            orientationY: T[1],
            orientationZ: T[2],
            positionX: v[0],
            positionY: v[1],
            positionZ: v[2]
          }), N.gain.setValueAtTime(1, D), g.connect(N).connect(A.inputs[0]), A.connect(m);
        }
      }
      return m;
    }
    return x ? (await s(d, f.orientationX, _.orientationX), await s(d, f.orientationY, _.orientationY), await s(d, f.orientationZ, _.orientationZ), await s(d, f.positionX, _.positionX), await s(d, f.positionY, _.positionY), await s(d, f.positionZ, _.positionZ)) : (await a(d, f.orientationX, _.orientationX), await a(d, f.orientationY, _.orientationY), await a(d, f.orientationZ, _.orientationZ), await a(d, f.positionX, _.positionX), await a(d, f.positionY, _.positionY), await a(d, f.positionZ, _.positionZ)), ze(_) ? await c(f, d, _.inputs[0]) : await c(f, d, _), _;
  };
  return {
    render(f, d) {
      const m = l.get(d);
      return m !== void 0 ? Promise.resolve(m) : p(f, d);
    }
  };
}, Ou = {
  disableNormalization: !1
}, Du = (s, t, e, n) => class vr {
  constructor(r, o) {
    const a = t(r), c = n({ ...Ou, ...o }), u = s(a, c);
    return e.add(u), u;
  }
  static [Symbol.hasInstance](r) {
    return r !== null && typeof r == "object" && Object.getPrototypeOf(r) === vr.prototype || e.has(r);
  }
}, Eu = (s, t) => (e, n, i) => (s(n).replay(i), t(n, e, i)), Iu = (s, t, e) => async (n, i, r) => {
  const o = s(n);
  await Promise.all(o.activeInputs.map((a, c) => Array.from(a).map(async ([u, l]) => {
    const p = await t(u).render(u, i), f = n.context.destination;
    !e(u) && (n !== f || !e(n)) && p.connect(r, l, c);
  })).reduce((a, c) => [...a, ...c], []));
}, Mu = (s, t, e) => async (n, i, r) => {
  const o = t(n);
  await Promise.all(Array.from(o.activeInputs).map(async ([a, c]) => {
    const l = await s(a).render(a, i);
    e(a) || l.connect(r, c);
  }));
}, Ru = (s, t, e, n) => (i) => s(an, () => an(i)) ? Promise.resolve(s(n, n)).then((r) => {
  if (!r) {
    const o = e(i, 512, 0, 1);
    i.oncomplete = () => {
      o.onaudioprocess = null, o.disconnect();
    }, o.onaudioprocess = () => i.currentTime, o.connect(i.destination);
  }
  return i.startRendering();
}) : new Promise((r) => {
  const o = t(i, {
    channelCount: 1,
    channelCountMode: "explicit",
    channelInterpretation: "discrete",
    gain: 0
  });
  i.oncomplete = (a) => {
    o.disconnect(), r(a.renderedBuffer);
  }, o.connect(i.destination), i.startRendering();
}), Pu = (s) => (t, e) => {
  s.set(t, e);
}, Fu = (s) => (t, e) => s.set(t, e), Vu = (s, t, e, n, i, r, o, a) => (c, u) => e(c).render(c, u).then(() => Promise.all(Array.from(n(u)).map((l) => e(l).render(l, u)))).then(() => i(u)).then((l) => (typeof l.copyFromChannel != "function" ? (o(l), Vs(l)) : t(r, () => r(l)) || a(l), s.add(l), l)), qu = {
  channelCount: 2,
  /*
   * Bug #105: The channelCountMode should be 'clamped-max' according to the spec but is set to 'explicit' to achieve consistent
   * behavior.
   */
  channelCountMode: "explicit",
  channelInterpretation: "speakers",
  pan: 0
}, Lu = (s, t, e, n, i, r) => class extends s {
  constructor(a, c) {
    const u = i(a), l = { ...qu, ...c }, h = e(u, l), p = r(u), f = p ? n() : null;
    super(a, !1, h, f), this._pan = t(this, p, h.pan);
  }
  get pan() {
    return this._pan;
  }
}, Wu = (s, t, e, n, i) => () => {
  const r = /* @__PURE__ */ new WeakMap(), o = async (a, c) => {
    let u = e(a);
    const l = yt(u, c);
    if (!l) {
      const h = {
        channelCount: u.channelCount,
        channelCountMode: u.channelCountMode,
        channelInterpretation: u.channelInterpretation,
        pan: u.pan.value
      };
      u = t(c, h);
    }
    return r.set(c, u), l ? await s(c, a.pan, u.pan) : await n(c, a.pan, u.pan), ze(u) ? await i(a, c, u.inputs[0]) : await i(a, c, u), u;
  };
  return {
    render(a, c) {
      const u = r.get(c);
      return u !== void 0 ? Promise.resolve(u) : o(a, c);
    }
  };
}, ju = (s) => () => {
  if (s === null)
    return !1;
  try {
    new s({ length: 1, sampleRate: 44100 });
  } catch {
    return !1;
  }
  return !0;
}, Bu = (s, t) => async () => {
  if (s === null)
    return !0;
  if (t === null)
    return !1;
  const e = new Blob(['class A extends AudioWorkletProcessor{process(i){this.port.postMessage(i,[i[0][0].buffer])}}registerProcessor("a",A)'], {
    type: "application/javascript; charset=utf-8"
  }), n = new t(1, 128, 44100), i = URL.createObjectURL(e);
  let r = !1, o = !1;
  try {
    await n.audioWorklet.addModule(i);
    const a = new s(n, "a", { numberOfOutputs: 0 }), c = n.createOscillator();
    a.port.onmessage = () => r = !0, a.onprocessorerror = () => o = !0, c.connect(a), c.start(0), await n.startRendering(), await new Promise((u) => setTimeout(u));
  } catch {
  } finally {
    URL.revokeObjectURL(i);
  }
  return r && !o;
}, Uu = (s, t) => () => {
  if (t === null)
    return Promise.resolve(!1);
  const e = new t(1, 1, 44100), n = s(e, {
    channelCount: 1,
    channelCountMode: "explicit",
    channelInterpretation: "discrete",
    gain: 0
  });
  return new Promise((i) => {
    e.oncomplete = () => {
      n.disconnect(), i(e.currentTime !== 0);
    }, e.startRendering();
  });
}, Gu = () => new DOMException("", "UnknownError"), zu = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  curve: null,
  oversample: "none"
}, $u = (s, t, e, n, i, r, o) => class extends s {
  constructor(c, u) {
    const l = i(c), h = { ...zu, ...u }, p = e(l, h), d = r(l) ? n() : null;
    super(c, !0, p, d), this._isCurveNullified = !1, this._nativeWaveShaperNode = p, o(this, 1);
  }
  get curve() {
    return this._isCurveNullified ? null : this._nativeWaveShaperNode.curve;
  }
  set curve(c) {
    if (c === null)
      this._isCurveNullified = !0, this._nativeWaveShaperNode.curve = new Float32Array([0, 0]);
    else {
      if (c.length < 2)
        throw t();
      this._isCurveNullified = !1, this._nativeWaveShaperNode.curve = c;
    }
  }
  get oversample() {
    return this._nativeWaveShaperNode.oversample;
  }
  set oversample(c) {
    this._nativeWaveShaperNode.oversample = c;
  }
}, Zu = (s, t, e) => () => {
  const n = /* @__PURE__ */ new WeakMap(), i = async (r, o) => {
    let a = t(r);
    if (!yt(a, o)) {
      const u = {
        channelCount: a.channelCount,
        channelCountMode: a.channelCountMode,
        channelInterpretation: a.channelInterpretation,
        curve: a.curve,
        oversample: a.oversample
      };
      a = s(o, u);
    }
    return n.set(o, a), ze(a) ? await e(r, o, a.inputs[0]) : await e(r, o, a), a;
  };
  return {
    render(r, o) {
      const a = n.get(o);
      return a !== void 0 ? Promise.resolve(a) : i(r, o);
    }
  };
}, Xu = () => typeof window > "u" ? null : window, Yu = (s, t) => (e) => {
  e.copyFromChannel = (n, i, r = 0) => {
    const o = s(r), a = s(i);
    if (a >= e.numberOfChannels)
      throw t();
    const c = e.length, u = e.getChannelData(a), l = n.length;
    for (let h = o < 0 ? -o : 0; h + o < c && h < l; h += 1)
      n[h] = u[h + o];
  }, e.copyToChannel = (n, i, r = 0) => {
    const o = s(r), a = s(i);
    if (a >= e.numberOfChannels)
      throw t();
    const c = e.length, u = e.getChannelData(a), l = n.length;
    for (let h = o < 0 ? -o : 0; h + o < c && h < l; h += 1)
      u[h + o] = n[h];
  };
}, Hu = (s) => (t) => {
  t.copyFromChannel = /* @__PURE__ */ ((e) => (n, i, r = 0) => {
    const o = s(r), a = s(i);
    if (o < t.length)
      return e.call(t, n, a, o);
  })(t.copyFromChannel), t.copyToChannel = /* @__PURE__ */ ((e) => (n, i, r = 0) => {
    const o = s(r), a = s(i);
    if (o < t.length)
      return e.call(t, n, a, o);
  })(t.copyToChannel);
}, Qu = (s) => (t, e) => {
  const n = e.createBuffer(1, 1, 44100);
  t.buffer === null && (t.buffer = n), s(t, "buffer", (i) => () => {
    const r = i.call(t);
    return r === n ? null : r;
  }, (i) => (r) => i.call(t, r === null ? n : r));
}, Ju = (s, t) => (e, n) => {
  n.channelCount = 1, n.channelCountMode = "explicit", Object.defineProperty(n, "channelCount", {
    get: () => 1,
    set: () => {
      throw s();
    }
  }), Object.defineProperty(n, "channelCountMode", {
    get: () => "explicit",
    set: () => {
      throw s();
    }
  });
  const i = e.createBufferSource();
  t(n, () => {
    const a = n.numberOfInputs;
    for (let c = 0; c < a; c += 1)
      i.connect(n, 0, c);
  }, () => i.disconnect(n));
}, wr = (s, t, e) => s.copyFromChannel === void 0 ? s.getChannelData(e)[0] : (s.copyFromChannel(t, e), t[0]), Tr = (s) => {
  if (s === null)
    return !1;
  const t = s.length;
  return t % 2 !== 0 ? s[Math.floor(t / 2)] !== 0 : s[t / 2 - 1] + s[t / 2] !== 0;
}, _n = (s, t, e, n) => {
  let i = s;
  for (; !i.hasOwnProperty(t); )
    i = Object.getPrototypeOf(i);
  const { get: r, set: o } = Object.getOwnPropertyDescriptor(i, t);
  Object.defineProperty(s, t, { get: e(r), set: n(o) });
}, Ku = (s) => ({
  ...s,
  outputChannelCount: s.outputChannelCount !== void 0 ? s.outputChannelCount : s.numberOfInputs === 1 && s.numberOfOutputs === 1 ? (
    /*
     * Bug #61: This should be the computedNumberOfChannels, but unfortunately that is almost impossible to fake. That's why
     * the channelCountMode is required to be 'explicit' as long as there is not a native implementation in every browser. That
     * makes sure the computedNumberOfChannels is equivilant to the channelCount which makes it much easier to compute.
     */
    [s.channelCount]
  ) : Array.from({ length: s.numberOfOutputs }, () => 1)
}), tl = (s) => ({ ...s, channelCount: s.numberOfOutputs }), el = (s) => {
  const { imag: t, real: e } = s;
  return t === void 0 ? e === void 0 ? { ...s, imag: [0, 0], real: [0, 0] } : { ...s, imag: Array.from(e, () => 0), real: e } : e === void 0 ? { ...s, imag: t, real: Array.from(t, () => 0) } : { ...s, imag: t, real: e };
}, br = (s, t, e) => {
  try {
    s.setValueAtTime(t, e);
  } catch (n) {
    if (n.code !== 9)
      throw n;
    br(s, t, e + 1e-7);
  }
}, nl = (s) => {
  const t = s.createBufferSource();
  t.start();
  try {
    t.start();
  } catch {
    return !0;
  }
  return !1;
}, sl = (s) => {
  const t = s.createBufferSource(), e = s.createBuffer(1, 1, 44100);
  t.buffer = e;
  try {
    t.start(0, 1);
  } catch {
    return !1;
  }
  return !0;
}, il = (s) => {
  const t = s.createBufferSource();
  t.start();
  try {
    t.stop();
  } catch {
    return !1;
  }
  return !0;
}, Bs = (s) => {
  const t = s.createOscillator();
  try {
    t.start(-1);
  } catch (e) {
    return e instanceof RangeError;
  }
  return !1;
}, xr = (s) => {
  const t = s.createBuffer(1, 1, 44100), e = s.createBufferSource();
  e.buffer = t, e.start(), e.stop();
  try {
    return e.stop(), !0;
  } catch {
    return !1;
  }
}, Us = (s) => {
  const t = s.createOscillator();
  try {
    t.stop(-1);
  } catch (e) {
    return e instanceof RangeError;
  }
  return !1;
}, rl = (s) => {
  const { port1: t, port2: e } = new MessageChannel();
  try {
    t.postMessage(s);
  } finally {
    t.close(), e.close();
  }
}, ol = (s) => {
  s.start = /* @__PURE__ */ ((t) => (e = 0, n = 0, i) => {
    const r = s.buffer, o = r === null ? n : Math.min(r.duration, n);
    r !== null && o > r.duration - 0.5 / s.context.sampleRate ? t.call(s, e, 0, 0) : t.call(s, e, o, i);
  })(s.start);
}, Cr = (s, t) => {
  const e = t.createGain();
  s.connect(e);
  const n = /* @__PURE__ */ ((i) => () => {
    i.call(s, e), s.removeEventListener("ended", n);
  })(s.disconnect);
  s.addEventListener("ended", n), $e(s, e), s.stop = /* @__PURE__ */ ((i) => {
    let r = !1;
    return (o = 0) => {
      if (r)
        try {
          i.call(s, o);
        } catch {
          e.gain.setValueAtTime(0, o);
        }
      else
        i.call(s, o), r = !0;
    };
  })(s.stop);
}, Ze = (s, t) => (e) => {
  const n = { value: s };
  return Object.defineProperties(e, {
    currentTarget: n,
    target: n
  }), typeof t == "function" ? t.call(s, e) : t.handleEvent.call(s, e);
}, al = Ao(be), cl = Mo(be), ul = za(Xn), Sr = /* @__PURE__ */ new WeakMap(), ll = uc(Sr), Bt = Ta(/* @__PURE__ */ new Map(), /* @__PURE__ */ new WeakMap()), zt = Xu(), kr = Lc(Bt, Zt), Gs = cc(Tt), gt = Iu(Tt, Gs, we), hl = qo(kr, st, gt), nt = dc(Zn), ne = du(zt), tt = Oc(ne), Ar = /* @__PURE__ */ new WeakMap(), Nr = ec(Ze), gn = Uc(zt), zs = Sc(gn), $s = kc(zt), Or = Ac(zt), cn = zc(zt), dt = ua(No(nr), Io(al, cl, Vn, ul, qn, Tt, ll, ln, st, be, Kt, we, En), Bt, wc(xs, qn, Tt, st, on, Kt), Zt, Yn, Ct, ja(Vn, xs, Tt, st, on, nt, Kt, tt), Xa(Ar, Tt, Wt), Nr, nt, zs, $s, Or, tt, cn), dl = Vo(dt, hl, Zt, kr, nt, tt), Zs = /* @__PURE__ */ new WeakSet(), Bi = Wc(zt), Dr = Ra(new Uint32Array(1)), Xs = Yu(Dr, Zt), Ys = Hu(Dr), Er = Wo(Zs, Bt, Ct, Bi, ne, ju(Bi), Xs, Ys), Hn = Ro(At), Ir = Mu(Gs, dn, we), Xt = Na(Ir), Xe = Bc(Hn, Bt, nl, sl, il, Bs, xr, Us, ol, Qu(_n), Cr), Yt = Eu(lc(dn), Ir), pl = Uo(Xt, Xe, st, Yt, gt), Ut = la(Oo(sr), Ar, Fs, ha, To, bo, xo, Co, So, ws, tr, gn, br), fl = Bo(dt, pl, Ut, _t, Xe, nt, tt, Ze), ml = Jo(dt, Ko, Zt, _t, Gc(At, _n), nt, tt, gt), _l = wa(Xt, gr, st, Yt, gt), xe = Fu(Sr), gl = va(dt, Ut, _l, Yn, gr, nt, tt, xe), pe = Vc(be, $s), yl = Ju(_t, pe), fe = Jc(gn, yl), vl = Ca(fe, st, gt), wl = xa(dt, vl, fe, nt, tt), Tl = Aa(fn, st, gt), bl = ka(dt, Tl, fn, nt, tt, tl), xl = eu(Hn, Xe, At, pe), Ye = tu(Hn, Bt, xl, Bs, Us), Cl = Ma(Xt, Ye, st, Yt, gt), Sl = Ia(dt, Ut, Cl, Ye, nt, tt, Ze), Mr = nu(Ct, _n), kl = Va(Mr, st, gt), Al = Fa(dt, kl, Mr, nt, tt, xe), Nl = Ga(Xt, yr, st, Yt, gt), Ol = Ua(dt, Ut, Nl, yr, nt, tt, xe), Rr = su(Ct), Dl = Ja(Xt, Rr, st, Yt, gt), El = Qa(dt, Ut, Dl, Rr, Ct, nt, tt, xe), Il = oc(Xt, At, st, Yt, gt), Ml = rc(dt, Ut, Il, At, nt, tt), Rl = au(Yn, _t, mn, Ct), Qn = Ru(Bt, At, mn, Uu(At, ne)), Pl = vc(Xe, st, ne, gt, Qn), Fl = iu(Rl), Vl = gc(dt, Fl, Pl, nt, tt, xe), ql = ta(Ut, fe, Ye, mn, Ct, wr, tt, _n), Pr = /* @__PURE__ */ new WeakMap(), Ll = Fc(ml, ql, Nr, tt, Pr, Ze), Fr = pu(Hn, Bt, Bs, xr, Us, Cr), Wl = Su(Xt, Fr, st, Yt, gt), jl = Cu(dt, Ut, Fr, Wl, nt, tt, Ze), Vr = Da(Xe), Bl = wu(Vr, _t, At, Tr, pe), Jn = vu(Vr, _t, Bl, Tr, pe, gn, _n), Ul = mu(Vn, _t, fe, At, mn, Jn, Ct, qn, wr, pe), qr = fu(Ul), Gl = Nu(Xt, fe, Ye, At, qr, st, ne, Yt, gt, Qn), zl = Au(dt, Ut, qr, Gl, nt, tt, xe), $l = _u(Zt), Zl = Du($l, nt, /* @__PURE__ */ new WeakSet(), el), Xl = yu(fe, fn, At, Jn, Ct, pe), Lr = gu(Xl, Ct), Yl = Wu(Xt, Lr, st, Yt, gt), Hl = Lu(dt, Ut, Lr, Yl, nt, tt), Ql = Zu(Jn, st, gt), Jl = $u(dt, _t, Jn, Ql, nt, tt, xe), Wr = Dc(zt), Hs = nc(zt), jr = /* @__PURE__ */ new WeakMap(), Kl = pc(jr, ne), th = Wr ? Eo(
  Bt,
  Ct,
  tc(zt),
  Hs,
  sc(ko),
  nt,
  Kl,
  tt,
  cn,
  /* @__PURE__ */ new WeakMap(),
  /* @__PURE__ */ new WeakMap(),
  Bu(cn, ne),
  // @todo window is guaranteed to be defined because isSecureContext checks that as well.
  zt
) : void 0, eh = Nc(zs, tt), nh = Wa(Zs, Bt, La, Ka, /* @__PURE__ */ new WeakSet(), nt, eh, Pn, an, Xs, Ys), Br = ga(th, dl, Er, fl, gl, wl, bl, Sl, Al, nh, Ol, El, Ml, Vl, Ll, jl, zl, Zl, Hl, Jl), sh = Ec(dt, cu, nt, tt), ih = Mc(dt, uu, nt, tt), rh = Rc(dt, lu, nt, tt), oh = hu(_t, tt), ah = Pc(dt, oh, nt), ch = Qo(Br, _t, Ct, Gu, sh, ih, rh, ah, gn), Qs = fc(Pr), uh = Po(Qs), Ur = Oa(Zt), lh = $a(Qs), Gr = Ya(Zt), zr = /* @__PURE__ */ new WeakMap(), hh = ac(zr, Wt), dh = Qc(Ur, Zt, _t, fe, fn, Ye, At, mn, Ct, Gr, Hs, hh, pe), ph = Zc(_t, dh, At, Ct, pe), fh = _a(Xt, Ur, Xe, fe, fn, Ye, At, lh, Gr, Hs, st, cn, ne, Yt, gt, Qn), mh = hc(jr), _h = Pu(zr), Ui = Wr ? pa(uh, dt, Ut, fh, ph, Tt, mh, nt, tt, cn, Ku, _h, rl, Ze) : void 0, gh = qa(Ct, ne), yh = Vu(Zs, Bt, Gs, Qs, Qn, Pn, Xs, Ys), vh = bu(Br, Bt, _t, gh, yh), wh = Tc(Zn, zs), Th = bc(Ps, $s), bh = xc(Fs, Or), xh = Cc(Zn, tt);
function Pt(s) {
  return s === void 0;
}
function Z(s) {
  return s !== void 0;
}
function Ch(s) {
  return typeof s == "function";
}
function le(s) {
  return typeof s == "number";
}
function ge(s) {
  return Object.prototype.toString.call(s) === "[object Object]" && s.constructor === Object;
}
function Sh(s) {
  return typeof s == "boolean";
}
function Lt(s) {
  return Array.isArray(s);
}
function te(s) {
  return typeof s == "string";
}
function Nn(s) {
  return te(s) && /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i.test(s);
}
function j(s, t) {
  if (!s)
    throw new Error(t);
}
function Mt(s, t, e = 1 / 0) {
  if (!(t <= s && s <= e))
    throw new RangeError(`Value must be within [${t}, ${e}], got: ${s}`);
}
function $r(s) {
  !s.isOffline && s.state !== "running" && Js('The AudioContext is "suspended". Invoke Tone.start() from a user action to start the audio.');
}
let Zr = !1, Gi = !1;
function zi(s) {
  Zr = s;
}
function kh(s) {
  Pt(s) && Zr && !Gi && (Gi = !0, Js("Events scheduled inside of scheduled callbacks should use the passed in scheduling time. See https://github.com/Tonejs/Tone.js/wiki/Accurate-Timing"));
}
let Xr = console;
function Ah(...s) {
  Xr.log(...s);
}
function Js(...s) {
  Xr.warn(...s);
}
function Nh(s) {
  return new ch(s);
}
function Oh(s, t, e) {
  return new vh(s, t, e);
}
const Dt = typeof self == "object" ? self : null, Dh = Dt && (Dt.hasOwnProperty("AudioContext") || Dt.hasOwnProperty("webkitAudioContext"));
function Eh(s, t, e) {
  return j(Z(Ui), "AudioWorkletNode only works in a secure context (https or localhost)"), new (s instanceof Dt?.BaseAudioContext ? Dt?.AudioWorkletNode : Ui)(s, t, e);
}
function Gt(s, t, e, n) {
  var i = arguments.length, r = i < 3 ? t : n === null ? n = Object.getOwnPropertyDescriptor(t, e) : n, o;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function") r = Reflect.decorate(s, t, e, n);
  else for (var a = s.length - 1; a >= 0; a--) (o = s[a]) && (r = (i < 3 ? o(r) : i > 3 ? o(t, e, r) : o(t, e)) || r);
  return i > 3 && r && Object.defineProperty(t, e, r), r;
}
function ht(s, t, e, n) {
  function i(r) {
    return r instanceof e ? r : new e(function(o) {
      o(r);
    });
  }
  return new (e || (e = Promise))(function(r, o) {
    function a(l) {
      try {
        u(n.next(l));
      } catch (h) {
        o(h);
      }
    }
    function c(l) {
      try {
        u(n.throw(l));
      } catch (h) {
        o(h);
      }
    }
    function u(l) {
      l.done ? r(l.value) : i(l.value).then(a, c);
    }
    u((n = n.apply(s, t || [])).next());
  });
}
class Ih {
  constructor(t, e, n, i) {
    this._callback = t, this._type = e, this._minimumUpdateInterval = Math.max(128 / (i || 44100), 1e-3), this.updateInterval = n, this._createClock();
  }
  /**
   * Generate a web worker
   */
  _createWorker() {
    const t = new Blob([
      /* javascript */
      `
			// the initial timeout time
			let timeoutTime =  ${(this._updateInterval * 1e3).toFixed(1)};
			// onmessage callback
			self.onmessage = function(msg){
				timeoutTime = parseInt(msg.data);
			};
			// the tick function which posts a message
			// and schedules a new tick
			function tick(){
				setTimeout(tick, timeoutTime);
				self.postMessage('tick');
			}
			// call tick initially
			tick();
			`
    ], { type: "text/javascript" }), e = URL.createObjectURL(t), n = new Worker(e);
    n.onmessage = this._callback.bind(this), this._worker = n;
  }
  /**
   * Create a timeout loop
   */
  _createTimeout() {
    this._timeout = setTimeout(() => {
      this._createTimeout(), this._callback();
    }, this._updateInterval * 1e3);
  }
  /**
   * Create the clock source.
   */
  _createClock() {
    if (this._type === "worker")
      try {
        this._createWorker();
      } catch {
        this._type = "timeout", this._createClock();
      }
    else this._type === "timeout" && this._createTimeout();
  }
  /**
   * Clean up the current clock source
   */
  _disposeClock() {
    this._timeout && clearTimeout(this._timeout), this._worker && (this._worker.terminate(), this._worker.onmessage = null);
  }
  /**
   * The rate in seconds the ticker will update
   */
  get updateInterval() {
    return this._updateInterval;
  }
  set updateInterval(t) {
    var e;
    this._updateInterval = Math.max(t, this._minimumUpdateInterval), this._type === "worker" && ((e = this._worker) === null || e === void 0 || e.postMessage(this._updateInterval * 1e3));
  }
  /**
   * The type of the ticker, either a worker or a timeout
   */
  get type() {
    return this._type;
  }
  set type(t) {
    this._disposeClock(), this._type = t, this._createClock();
  }
  /**
   * Clean up
   */
  dispose() {
    this._disposeClock();
  }
}
function Te(s) {
  return bh(s);
}
function ue(s) {
  return Th(s);
}
function In(s) {
  return xh(s);
}
function Oe(s) {
  return wh(s);
}
function Mh(s) {
  return s instanceof Er;
}
function Rh(s, t) {
  return s === "value" || Te(t) || ue(t) || Mh(t);
}
function Re(s, ...t) {
  if (!t.length)
    return s;
  const e = t.shift();
  if (ge(s) && ge(e))
    for (const n in e)
      Rh(n, e[n]) ? s[n] = e[n] : ge(e[n]) ? (s[n] || Object.assign(s, { [n]: {} }), Re(s[n], e[n])) : Object.assign(s, { [n]: e[n] });
  return Re(s, ...t);
}
function Ph(s, t) {
  return s.length === t.length && s.every((e, n) => t[n] === e);
}
function I(s, t, e = [], n) {
  const i = {}, r = Array.from(t);
  if (ge(r[0]) && n && !Reflect.has(r[0], n) && (Object.keys(r[0]).some((a) => Reflect.has(s, a)) || (Re(i, { [n]: r[0] }), e.splice(e.indexOf(n), 1), r.shift())), r.length === 1 && ge(r[0]))
    Re(i, r[0]);
  else
    for (let o = 0; o < e.length; o++)
      Z(r[o]) && (i[e[o]] = r[o]);
  return Re(s, i);
}
function Fh(s) {
  return s.constructor.getDefaults();
}
function Pe(s, t) {
  return Pt(s) ? t : s;
}
function $i(s, t) {
  return t.forEach((e) => {
    Reflect.has(s, e) && delete s[e];
  }), s;
}
/**
 * Tone.js
 * @author Yotam Mann
 * @license http://opensource.org/licenses/MIT MIT License
 * @copyright 2014-2024 Yotam Mann
 */
class se {
  constructor() {
    this.debug = !1, this._wasDisposed = !1;
  }
  /**
   * Returns all of the default options belonging to the class.
   */
  static getDefaults() {
    return {};
  }
  /**
   * Prints the outputs to the console log for debugging purposes.
   * Prints the contents only if either the object has a property
   * called `debug` set to true, or a variable called TONE_DEBUG_CLASS
   * is set to the name of the class.
   * @example
   * const osc = new Tone.Oscillator();
   * // prints all logs originating from this oscillator
   * osc.debug = true;
   * // calls to start/stop will print in the console
   * osc.start();
   */
  log(...t) {
    (this.debug || Dt && this.toString() === Dt.TONE_DEBUG_CLASS) && Ah(this, ...t);
  }
  /**
   * disconnect and dispose.
   */
  dispose() {
    return this._wasDisposed = !0, this;
  }
  /**
   * Indicates if the instance was disposed. 'Disposing' an
   * instance means that all of the Web Audio nodes that were
   * created for the instance are disconnected and freed for garbage collection.
   */
  get disposed() {
    return this._wasDisposed;
  }
  /**
   * Convert the class to a string
   * @example
   * const osc = new Tone.Oscillator();
   * console.log(osc.toString());
   */
  toString() {
    return this.name;
  }
}
se.version = Ki;
const Ks = 1e-6;
function qe(s, t) {
  return s > t + Ks;
}
function Ns(s, t) {
  return qe(s, t) || Vt(s, t);
}
function Bn(s, t) {
  return s + Ks < t;
}
function Vt(s, t) {
  return Math.abs(s - t) < Ks;
}
function Vh(s, t, e) {
  return Math.max(Math.min(s, e), t);
}
class Ft extends se {
  constructor() {
    super(), this.name = "Timeline", this._timeline = [];
    const t = I(Ft.getDefaults(), arguments, ["memory"]);
    this.memory = t.memory, this.increasing = t.increasing;
  }
  static getDefaults() {
    return {
      memory: 1 / 0,
      increasing: !1
    };
  }
  /**
   * The number of items in the timeline.
   */
  get length() {
    return this._timeline.length;
  }
  /**
   * Insert an event object onto the timeline. Events must have a "time" attribute.
   * @param event  The event object to insert into the timeline.
   */
  add(t) {
    if (j(Reflect.has(t, "time"), "Timeline: events must have a time attribute"), t.time = t.time.valueOf(), this.increasing && this.length) {
      const e = this._timeline[this.length - 1];
      j(Ns(t.time, e.time), "The time must be greater than or equal to the last scheduled time"), this._timeline.push(t);
    } else {
      const e = this._search(t.time);
      this._timeline.splice(e + 1, 0, t);
    }
    if (this.length > this.memory) {
      const e = this.length - this.memory;
      this._timeline.splice(0, e);
    }
    return this;
  }
  /**
   * Remove an event from the timeline.
   * @param  {Object}  event  The event object to remove from the list.
   * @returns {Timeline} this
   */
  remove(t) {
    const e = this._timeline.indexOf(t);
    return e !== -1 && this._timeline.splice(e, 1), this;
  }
  /**
   * Get the nearest event whose time is less than or equal to the given time.
   * @param  time  The time to query.
   */
  get(t, e = "time") {
    const n = this._search(t, e);
    return n !== -1 ? this._timeline[n] : null;
  }
  /**
   * Return the first event in the timeline without removing it
   * @returns {Object} The first event object
   * @deprecated
   */
  peek() {
    return this._timeline[0];
  }
  /**
   * Return the first event in the timeline and remove it
   * @deprecated
   */
  shift() {
    return this._timeline.shift();
  }
  /**
   * Get the event which is scheduled after the given time.
   * @param  time  The time to query.
   */
  getAfter(t, e = "time") {
    const n = this._search(t, e);
    return n + 1 < this._timeline.length ? this._timeline[n + 1] : null;
  }
  /**
   * Get the event before the event at the given time.
   * @param  time  The time to query.
   */
  getBefore(t) {
    const e = this._timeline.length;
    if (e > 0 && this._timeline[e - 1].time < t)
      return this._timeline[e - 1];
    const n = this._search(t);
    return n - 1 >= 0 ? this._timeline[n - 1] : null;
  }
  /**
   * Cancel events at and after the given time
   * @param  after  The time to query.
   */
  cancel(t) {
    if (this._timeline.length > 1) {
      let e = this._search(t);
      if (e >= 0)
        if (Vt(this._timeline[e].time, t)) {
          for (let n = e; n >= 0 && Vt(this._timeline[n].time, t); n--)
            e = n;
          this._timeline = this._timeline.slice(0, e);
        } else
          this._timeline = this._timeline.slice(0, e + 1);
      else
        this._timeline = [];
    } else this._timeline.length === 1 && Ns(this._timeline[0].time, t) && (this._timeline = []);
    return this;
  }
  /**
   * Cancel events before or equal to the given time.
   * @param  time  The time to cancel before.
   */
  cancelBefore(t) {
    const e = this._search(t);
    return e >= 0 && (this._timeline = this._timeline.slice(e + 1)), this;
  }
  /**
   * Returns the previous event if there is one. null otherwise
   * @param  event The event to find the previous one of
   * @return The event right before the given event
   */
  previousEvent(t) {
    const e = this._timeline.indexOf(t);
    return e > 0 ? this._timeline[e - 1] : null;
  }
  /**
   * Does a binary search on the timeline array and returns the
   * nearest event index whose time is after or equal to the given time.
   * If a time is searched before the first index in the timeline, -1 is returned.
   * If the time is after the end, the index of the last item is returned.
   */
  _search(t, e = "time") {
    if (this._timeline.length === 0)
      return -1;
    let n = 0;
    const i = this._timeline.length;
    let r = i;
    if (i > 0 && this._timeline[i - 1][e] <= t)
      return i - 1;
    for (; n < r; ) {
      let o = Math.floor(n + (r - n) / 2);
      const a = this._timeline[o], c = this._timeline[o + 1];
      if (Vt(a[e], t)) {
        for (let u = o; u < this._timeline.length; u++) {
          const l = this._timeline[u];
          if (Vt(l[e], t))
            o = u;
          else
            break;
        }
        return o;
      } else {
        if (Bn(a[e], t) && qe(c[e], t))
          return o;
        qe(a[e], t) ? r = o : n = o + 1;
      }
    }
    return -1;
  }
  /**
   * Internal iterator. Applies extra safety checks for
   * removing items from the array.
   */
  _iterate(t, e = 0, n = this._timeline.length - 1) {
    this._timeline.slice(e, n + 1).forEach(t);
  }
  /**
   * Iterate over everything in the array
   * @param  callback The callback to invoke with every item
   */
  forEach(t) {
    return this._iterate(t), this;
  }
  /**
   * Iterate over everything in the array at or before the given time.
   * @param  time The time to check if items are before
   * @param  callback The callback to invoke with every item
   */
  forEachBefore(t, e) {
    const n = this._search(t);
    return n !== -1 && this._iterate(e, 0, n), this;
  }
  /**
   * Iterate over everything in the array after the given time.
   * @param  time The time to check if items are before
   * @param  callback The callback to invoke with every item
   */
  forEachAfter(t, e) {
    const n = this._search(t);
    return this._iterate(e, n + 1), this;
  }
  /**
   * Iterate over everything in the array between the startTime and endTime.
   * The timerange is inclusive of the startTime, but exclusive of the endTime.
   * range = [startTime, endTime).
   * @param  startTime The time to check if items are before
   * @param  endTime The end of the test interval.
   * @param  callback The callback to invoke with every item
   */
  forEachBetween(t, e, n) {
    let i = this._search(t), r = this._search(e);
    return i !== -1 && r !== -1 ? (this._timeline[i].time !== t && (i += 1), this._timeline[r].time === e && (r -= 1), this._iterate(n, i, r)) : i === -1 && this._iterate(n, 0, r), this;
  }
  /**
   * Iterate over everything in the array at or after the given time. Similar to
   * forEachAfter, but includes the item(s) at the given time.
   * @param  time The time to check if items are before
   * @param  callback The callback to invoke with every item
   */
  forEachFrom(t, e) {
    let n = this._search(t);
    for (; n >= 0 && this._timeline[n].time >= t; )
      n--;
    return this._iterate(e, n + 1), this;
  }
  /**
   * Iterate over everything in the array at the given time
   * @param  time The time to check if items are before
   * @param  callback The callback to invoke with every item
   */
  forEachAtTime(t, e) {
    const n = this._search(t);
    if (n !== -1 && Vt(this._timeline[n].time, t)) {
      let i = n;
      for (let r = n; r >= 0 && Vt(this._timeline[r].time, t); r--)
        i = r;
      this._iterate((r) => {
        e(r);
      }, i, n);
    }
    return this;
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._timeline = [], this;
  }
}
const Yr = [];
function Kn(s) {
  Yr.push(s);
}
function qh(s) {
  Yr.forEach((t) => t(s));
}
const Hr = [];
function ts(s) {
  Hr.push(s);
}
function Lh(s) {
  Hr.forEach((t) => t(s));
}
class yn extends se {
  constructor() {
    super(...arguments), this.name = "Emitter";
  }
  /**
   * Bind a callback to a specific event.
   * @param  event     The name of the event to listen for.
   * @param  callback  The callback to invoke when the event is emitted
   */
  on(t, e) {
    return t.split(/\W+/).forEach((i) => {
      Pt(this._events) && (this._events = {}), this._events.hasOwnProperty(i) || (this._events[i] = []), this._events[i].push(e);
    }), this;
  }
  /**
   * Bind a callback which is only invoked once
   * @param  event     The name of the event to listen for.
   * @param  callback  The callback to invoke when the event is emitted
   */
  once(t, e) {
    const n = (...i) => {
      e(...i), this.off(t, n);
    };
    return this.on(t, n), this;
  }
  /**
   * Remove the event listener.
   * @param  event     The event to stop listening to.
   * @param  callback  The callback which was bound to the event with Emitter.on.
   *                   If no callback is given, all callbacks events are removed.
   */
  off(t, e) {
    return t.split(/\W+/).forEach((i) => {
      if (Pt(this._events) && (this._events = {}), this._events.hasOwnProperty(i))
        if (Pt(e))
          this._events[i] = [];
        else {
          const r = this._events[i];
          for (let o = r.length - 1; o >= 0; o--)
            r[o] === e && r.splice(o, 1);
        }
    }), this;
  }
  /**
   * Invoke all of the callbacks bound to the event
   * with any arguments passed in.
   * @param  event  The name of the event.
   * @param args The arguments to pass to the functions listening.
   */
  emit(t, ...e) {
    if (this._events && this._events.hasOwnProperty(t)) {
      const n = this._events[t].slice(0);
      for (let i = 0, r = n.length; i < r; i++)
        n[i].apply(this, e);
    }
    return this;
  }
  /**
   * Add Emitter functions (on/off/emit) to the object
   */
  static mixin(t) {
    ["on", "once", "off", "emit"].forEach((e) => {
      const n = Object.getOwnPropertyDescriptor(yn.prototype, e);
      Object.defineProperty(t.prototype, e, n);
    });
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this._events = void 0, this;
  }
}
class Qr extends yn {
  constructor() {
    super(...arguments), this.isOffline = !1;
  }
  /*
   * This is a placeholder so that JSON.stringify does not throw an error
   * This matches what JSON.stringify(audioContext) returns on a native
   * audioContext instance.
   */
  toJSON() {
    return {};
  }
}
class vn extends Qr {
  constructor() {
    var t, e;
    super(), this.name = "Context", this._constants = /* @__PURE__ */ new Map(), this._timeouts = new Ft(), this._timeoutIds = 0, this._initialized = !1, this._closeStarted = !1, this.isOffline = !1, this._workletPromise = null;
    const n = I(vn.getDefaults(), arguments, [
      "context"
    ]);
    n.context ? (this._context = n.context, this._latencyHint = ((t = arguments[0]) === null || t === void 0 ? void 0 : t.latencyHint) || "") : (this._context = Nh({
      latencyHint: n.latencyHint
    }), this._latencyHint = n.latencyHint), this._ticker = new Ih(this.emit.bind(this, "tick"), n.clockSource, n.updateInterval, this._context.sampleRate), this.on("tick", this._timeoutLoop.bind(this)), this._context.onstatechange = () => {
      this.emit("statechange", this.state);
    }, this[!((e = arguments[0]) === null || e === void 0) && e.hasOwnProperty("updateInterval") ? "_lookAhead" : "lookAhead"] = n.lookAhead;
  }
  static getDefaults() {
    return {
      clockSource: "worker",
      latencyHint: "interactive",
      lookAhead: 0.1,
      updateInterval: 0.05
    };
  }
  /**
   * Finish setting up the context. **You usually do not need to do this manually.**
   */
  initialize() {
    return this._initialized || (qh(this), this._initialized = !0), this;
  }
  //---------------------------
  // BASE AUDIO CONTEXT METHODS
  //---------------------------
  createAnalyser() {
    return this._context.createAnalyser();
  }
  createOscillator() {
    return this._context.createOscillator();
  }
  createBufferSource() {
    return this._context.createBufferSource();
  }
  createBiquadFilter() {
    return this._context.createBiquadFilter();
  }
  createBuffer(t, e, n) {
    return this._context.createBuffer(t, e, n);
  }
  createChannelMerger(t) {
    return this._context.createChannelMerger(t);
  }
  createChannelSplitter(t) {
    return this._context.createChannelSplitter(t);
  }
  createConstantSource() {
    return this._context.createConstantSource();
  }
  createConvolver() {
    return this._context.createConvolver();
  }
  createDelay(t) {
    return this._context.createDelay(t);
  }
  createDynamicsCompressor() {
    return this._context.createDynamicsCompressor();
  }
  createGain() {
    return this._context.createGain();
  }
  createIIRFilter(t, e) {
    return this._context.createIIRFilter(t, e);
  }
  createPanner() {
    return this._context.createPanner();
  }
  createPeriodicWave(t, e, n) {
    return this._context.createPeriodicWave(t, e, n);
  }
  createStereoPanner() {
    return this._context.createStereoPanner();
  }
  createWaveShaper() {
    return this._context.createWaveShaper();
  }
  createMediaStreamSource(t) {
    return j(Oe(this._context), "Not available if OfflineAudioContext"), this._context.createMediaStreamSource(t);
  }
  createMediaElementSource(t) {
    return j(Oe(this._context), "Not available if OfflineAudioContext"), this._context.createMediaElementSource(t);
  }
  createMediaStreamDestination() {
    return j(Oe(this._context), "Not available if OfflineAudioContext"), this._context.createMediaStreamDestination();
  }
  decodeAudioData(t) {
    return this._context.decodeAudioData(t);
  }
  /**
   * The current time in seconds of the AudioContext.
   */
  get currentTime() {
    return this._context.currentTime;
  }
  /**
   * The current time in seconds of the AudioContext.
   */
  get state() {
    return this._context.state;
  }
  /**
   * The current time in seconds of the AudioContext.
   */
  get sampleRate() {
    return this._context.sampleRate;
  }
  /**
   * The listener
   */
  get listener() {
    return this.initialize(), this._listener;
  }
  set listener(t) {
    j(!this._initialized, "The listener cannot be set after initialization."), this._listener = t;
  }
  /**
   * There is only one Transport per Context. It is created on initialization.
   */
  get transport() {
    return this.initialize(), this._transport;
  }
  set transport(t) {
    j(!this._initialized, "The transport cannot be set after initialization."), this._transport = t;
  }
  /**
   * This is the Draw object for the context which is useful for synchronizing the draw frame with the Tone.js clock.
   */
  get draw() {
    return this.initialize(), this._draw;
  }
  set draw(t) {
    j(!this._initialized, "Draw cannot be set after initialization."), this._draw = t;
  }
  /**
   * A reference to the Context's destination node.
   */
  get destination() {
    return this.initialize(), this._destination;
  }
  set destination(t) {
    j(!this._initialized, "The destination cannot be set after initialization."), this._destination = t;
  }
  /**
   * Create an audio worklet node from a name and options. The module
   * must first be loaded using {@link addAudioWorkletModule}.
   */
  createAudioWorkletNode(t, e) {
    return Eh(this.rawContext, t, e);
  }
  /**
   * Add an AudioWorkletProcessor module
   * @param url The url of the module
   */
  addAudioWorkletModule(t) {
    return ht(this, void 0, void 0, function* () {
      j(Z(this.rawContext.audioWorklet), "AudioWorkletNode is only available in a secure context (https or localhost)"), this._workletPromise || (this._workletPromise = this.rawContext.audioWorklet.addModule(t)), yield this._workletPromise;
    });
  }
  /**
   * Returns a promise which resolves when all of the worklets have been loaded on this context
   */
  workletsAreReady() {
    return ht(this, void 0, void 0, function* () {
      (yield this._workletPromise) ? this._workletPromise : Promise.resolve();
    });
  }
  //---------------------------
  // TICKER
  //---------------------------
  /**
   * How often the interval callback is invoked.
   * This number corresponds to how responsive the scheduling
   * can be. Setting to 0 will result in the lowest practial interval
   * based on context properties. context.updateInterval + context.lookAhead
   * gives you the total latency between scheduling an event and hearing it.
   */
  get updateInterval() {
    return this._ticker.updateInterval;
  }
  set updateInterval(t) {
    this._ticker.updateInterval = t;
  }
  /**
   * What the source of the clock is, either "worker" (default),
   * "timeout", or "offline" (none).
   */
  get clockSource() {
    return this._ticker.type;
  }
  set clockSource(t) {
    this._ticker.type = t;
  }
  /**
   * The amount of time into the future events are scheduled. Giving Web Audio
   * a short amount of time into the future to schedule events can reduce clicks and
   * improve performance. This value can be set to 0 to get the lowest latency.
   * Adjusting this value also affects the {@link updateInterval}.
   */
  get lookAhead() {
    return this._lookAhead;
  }
  set lookAhead(t) {
    this._lookAhead = t, this.updateInterval = t ? t / 2 : 0.01;
  }
  /**
   * The type of playback, which affects tradeoffs between audio
   * output latency and responsiveness.
   * In addition to setting the value in seconds, the latencyHint also
   * accepts the strings "interactive" (prioritizes low latency),
   * "playback" (prioritizes sustained playback), "balanced" (balances
   * latency and performance).
   * @example
   * // prioritize sustained playback
   * const context = new Tone.Context({ latencyHint: "playback" });
   * // set this context as the global Context
   * Tone.setContext(context);
   * // the global context is gettable with Tone.getContext()
   * console.log(Tone.getContext().latencyHint);
   */
  get latencyHint() {
    return this._latencyHint;
  }
  /**
   * The unwrapped AudioContext or OfflineAudioContext
   */
  get rawContext() {
    return this._context;
  }
  /**
   * The current audio context time plus a short {@link lookAhead}.
   * @example
   * setInterval(() => {
   * 	console.log("now", Tone.now());
   * }, 100);
   */
  now() {
    return this._context.currentTime + this._lookAhead;
  }
  /**
   * The current audio context time without the {@link lookAhead}.
   * In most cases it is better to use {@link now} instead of {@link immediate} since
   * with {@link now} the {@link lookAhead} is applied equally to _all_ components including internal components,
   * to making sure that everything is scheduled in sync. Mixing {@link now} and {@link immediate}
   * can cause some timing issues. If no lookAhead is desired, you can set the {@link lookAhead} to `0`.
   */
  immediate() {
    return this._context.currentTime;
  }
  /**
   * Starts the audio context from a suspended state. This is required
   * to initially start the AudioContext.
   * @see {@link start}
   */
  resume() {
    return Oe(this._context) ? this._context.resume() : Promise.resolve();
  }
  /**
   * Close the context. Once closed, the context can no longer be used and
   * any AudioNodes created from the context will be silent.
   */
  close() {
    return ht(this, void 0, void 0, function* () {
      Oe(this._context) && this.state !== "closed" && !this._closeStarted && (this._closeStarted = !0, yield this._context.close()), this._initialized && Lh(this);
    });
  }
  /**
   * **Internal** Generate a looped buffer at some constant value.
   */
  getConstant(t) {
    if (this._constants.has(t))
      return this._constants.get(t);
    {
      const e = this._context.createBuffer(1, 128, this._context.sampleRate), n = e.getChannelData(0);
      for (let r = 0; r < n.length; r++)
        n[r] = t;
      const i = this._context.createBufferSource();
      return i.channelCount = 1, i.channelCountMode = "explicit", i.buffer = e, i.loop = !0, i.start(0), this._constants.set(t, i), i;
    }
  }
  /**
   * Clean up. Also closes the audio context.
   */
  dispose() {
    return super.dispose(), this._ticker.dispose(), this._timeouts.dispose(), Object.keys(this._constants).map((t) => this._constants[t].disconnect()), this.close(), this;
  }
  //---------------------------
  // TIMEOUTS
  //---------------------------
  /**
   * The private loop which keeps track of the context scheduled timeouts
   * Is invoked from the clock source
   */
  _timeoutLoop() {
    const t = this.now();
    this._timeouts.forEachBefore(t, (e) => {
      e.callback(), this._timeouts.remove(e);
    });
  }
  /**
   * A setTimeout which is guaranteed by the clock source.
   * Also runs in the offline context.
   * @param  fn       The callback to invoke
   * @param  timeout  The timeout in seconds
   * @returns ID to use when invoking Context.clearTimeout
   */
  setTimeout(t, e) {
    this._timeoutIds++;
    const n = this.now();
    return this._timeouts.add({
      callback: t,
      id: this._timeoutIds,
      time: n + e
    }), this._timeoutIds;
  }
  /**
   * Clears a previously scheduled timeout with Tone.context.setTimeout
   * @param  id  The ID returned from setTimeout
   */
  clearTimeout(t) {
    return this._timeouts.forEach((e) => {
      e.id === t && this._timeouts.remove(e);
    }), this;
  }
  /**
   * Clear the function scheduled by {@link setInterval}
   */
  clearInterval(t) {
    return this.clearTimeout(t);
  }
  /**
   * Adds a repeating event to the context's callback clock
   */
  setInterval(t, e) {
    const n = ++this._timeoutIds, i = () => {
      const r = this.now();
      this._timeouts.add({
        callback: () => {
          t(), i();
        },
        id: n,
        time: r + e
      });
    };
    return i(), n;
  }
}
class Wh extends Qr {
  constructor() {
    super(...arguments), this.lookAhead = 0, this.latencyHint = 0, this.isOffline = !1;
  }
  //---------------------------
  // BASE AUDIO CONTEXT METHODS
  //---------------------------
  createAnalyser() {
    return {};
  }
  createOscillator() {
    return {};
  }
  createBufferSource() {
    return {};
  }
  createBiquadFilter() {
    return {};
  }
  createBuffer(t, e, n) {
    return {};
  }
  createChannelMerger(t) {
    return {};
  }
  createChannelSplitter(t) {
    return {};
  }
  createConstantSource() {
    return {};
  }
  createConvolver() {
    return {};
  }
  createDelay(t) {
    return {};
  }
  createDynamicsCompressor() {
    return {};
  }
  createGain() {
    return {};
  }
  createIIRFilter(t, e) {
    return {};
  }
  createPanner() {
    return {};
  }
  createPeriodicWave(t, e, n) {
    return {};
  }
  createStereoPanner() {
    return {};
  }
  createWaveShaper() {
    return {};
  }
  createMediaStreamSource(t) {
    return {};
  }
  createMediaElementSource(t) {
    return {};
  }
  createMediaStreamDestination() {
    return {};
  }
  decodeAudioData(t) {
    return Promise.resolve({});
  }
  //---------------------------
  // TONE AUDIO CONTEXT METHODS
  //---------------------------
  createAudioWorkletNode(t, e) {
    return {};
  }
  get rawContext() {
    return {};
  }
  addAudioWorkletModule(t) {
    return ht(this, void 0, void 0, function* () {
      return Promise.resolve();
    });
  }
  resume() {
    return Promise.resolve();
  }
  setTimeout(t, e) {
    return 0;
  }
  clearTimeout(t) {
    return this;
  }
  setInterval(t, e) {
    return 0;
  }
  clearInterval(t) {
    return this;
  }
  getConstant(t) {
    return {};
  }
  get currentTime() {
    return 0;
  }
  get state() {
    return {};
  }
  get sampleRate() {
    return 0;
  }
  get listener() {
    return {};
  }
  get transport() {
    return {};
  }
  get draw() {
    return {};
  }
  set draw(t) {
  }
  get destination() {
    return {};
  }
  set destination(t) {
  }
  now() {
    return 0;
  }
  immediate() {
    return 0;
  }
}
function Y(s, t) {
  Lt(t) ? t.forEach((e) => Y(s, e)) : Object.defineProperty(s, t, {
    enumerable: !0,
    writable: !1
  });
}
function ti(s, t) {
  Lt(t) ? t.forEach((e) => ti(s, e)) : Object.defineProperty(s, t, {
    writable: !0
  });
}
const Q = () => {
};
class et extends se {
  constructor() {
    super(), this.name = "ToneAudioBuffer", this.onload = Q;
    const t = I(et.getDefaults(), arguments, ["url", "onload", "onerror"]);
    this.reverse = t.reverse, this.onload = t.onload, te(t.url) ? this.load(t.url).catch(t.onerror) : t.url && this.set(t.url);
  }
  static getDefaults() {
    return {
      onerror: Q,
      onload: Q,
      reverse: !1
    };
  }
  /**
   * The sample rate of the AudioBuffer
   */
  get sampleRate() {
    return this._buffer ? this._buffer.sampleRate : bt().sampleRate;
  }
  /**
   * Pass in an AudioBuffer or ToneAudioBuffer to set the value of this buffer.
   */
  set(t) {
    return t instanceof et ? t.loaded ? this._buffer = t.get() : t.onload = () => {
      this.set(t), this.onload(this);
    } : this._buffer = t, this._reversed && this._reverse(), this;
  }
  /**
   * The audio buffer stored in the object.
   */
  get() {
    return this._buffer;
  }
  /**
   * Makes an fetch request for the selected url then decodes the file as an audio buffer.
   * Invokes the callback once the audio buffer loads.
   * @param url The url of the buffer to load. filetype support depends on the browser.
   * @returns A Promise which resolves with this ToneAudioBuffer
   */
  load(t) {
    return ht(this, void 0, void 0, function* () {
      const e = et.load(t).then((n) => {
        this.set(n), this.onload(this);
      });
      et.downloads.push(e);
      try {
        yield e;
      } finally {
        const n = et.downloads.indexOf(e);
        et.downloads.splice(n, 1);
      }
      return this;
    });
  }
  /**
   * clean up
   */
  dispose() {
    return super.dispose(), this._buffer = void 0, this;
  }
  /**
   * Set the audio buffer from the array.
   * To create a multichannel AudioBuffer, pass in a multidimensional array.
   * @param array The array to fill the audio buffer
   */
  fromArray(t) {
    const e = Lt(t) && t[0].length > 0, n = e ? t.length : 1, i = e ? t[0].length : t.length, r = bt(), o = r.createBuffer(n, i, r.sampleRate), a = !e && n === 1 ? [t] : t;
    for (let c = 0; c < n; c++)
      o.copyToChannel(a[c], c);
    return this._buffer = o, this;
  }
  /**
   * Sums multiple channels into 1 channel
   * @param chanNum Optionally only copy a single channel from the array.
   */
  toMono(t) {
    if (le(t))
      this.fromArray(this.toArray(t));
    else {
      let e = new Float32Array(this.length);
      const n = this.numberOfChannels;
      for (let i = 0; i < n; i++) {
        const r = this.toArray(i);
        for (let o = 0; o < r.length; o++)
          e[o] += r[o];
      }
      e = e.map((i) => i / n), this.fromArray(e);
    }
    return this;
  }
  /**
   * Get the buffer as an array. Single channel buffers will return a 1-dimensional
   * Float32Array, and multichannel buffers will return multidimensional arrays.
   * @param channel Optionally only copy a single channel from the array.
   */
  toArray(t) {
    if (le(t))
      return this.getChannelData(t);
    if (this.numberOfChannels === 1)
      return this.toArray(0);
    {
      const e = [];
      for (let n = 0; n < this.numberOfChannels; n++)
        e[n] = this.getChannelData(n);
      return e;
    }
  }
  /**
   * Returns the Float32Array representing the PCM audio data for the specific channel.
   * @param  channel  The channel number to return
   * @return The audio as a TypedArray
   */
  getChannelData(t) {
    return this._buffer ? this._buffer.getChannelData(t) : new Float32Array(0);
  }
  /**
   * Cut a subsection of the array and return a buffer of the
   * subsection. Does not modify the original buffer
   * @param start The time to start the slice
   * @param end The end time to slice. If none is given will default to the end of the buffer
   */
  slice(t, e = this.duration) {
    j(this.loaded, "Buffer is not loaded");
    const n = Math.floor(t * this.sampleRate), i = Math.floor(e * this.sampleRate);
    j(n < i, "The start time must be less than the end time");
    const r = i - n, o = bt().createBuffer(this.numberOfChannels, r, this.sampleRate);
    for (let a = 0; a < this.numberOfChannels; a++)
      o.copyToChannel(this.getChannelData(a).subarray(n, i), a);
    return new et(o);
  }
  /**
   * Reverse the buffer.
   */
  _reverse() {
    if (this.loaded)
      for (let t = 0; t < this.numberOfChannels; t++)
        this.getChannelData(t).reverse();
    return this;
  }
  /**
   * If the buffer is loaded or not
   */
  get loaded() {
    return this.length > 0;
  }
  /**
   * The duration of the buffer in seconds.
   */
  get duration() {
    return this._buffer ? this._buffer.duration : 0;
  }
  /**
   * The length of the buffer in samples
   */
  get length() {
    return this._buffer ? this._buffer.length : 0;
  }
  /**
   * The number of discrete audio channels. Returns 0 if no buffer is loaded.
   */
  get numberOfChannels() {
    return this._buffer ? this._buffer.numberOfChannels : 0;
  }
  /**
   * Reverse the buffer.
   */
  get reverse() {
    return this._reversed;
  }
  set reverse(t) {
    this._reversed !== t && (this._reversed = t, this._reverse());
  }
  /**
   * Create a ToneAudioBuffer from the array. To create a multichannel AudioBuffer,
   * pass in a multidimensional array.
   * @param array The array to fill the audio buffer
   * @return A ToneAudioBuffer created from the array
   */
  static fromArray(t) {
    return new et().fromArray(t);
  }
  /**
   * Creates a ToneAudioBuffer from a URL, returns a promise which resolves to a ToneAudioBuffer
   * @param  url The url to load.
   * @return A promise which resolves to a ToneAudioBuffer
   */
  static fromUrl(t) {
    return ht(this, void 0, void 0, function* () {
      return yield new et().load(t);
    });
  }
  /**
   * Loads a url using fetch and returns the AudioBuffer.
   */
  static load(t) {
    return ht(this, void 0, void 0, function* () {
      const e = et.baseUrl === "" || et.baseUrl.endsWith("/") ? et.baseUrl : et.baseUrl + "/", n = yield fetch(e + t);
      if (!n.ok)
        throw new Error(`could not load url: ${t}`);
      const i = yield n.arrayBuffer();
      return yield bt().decodeAudioData(i);
    });
  }
  /**
   * Checks a url's extension to see if the current browser can play that file type.
   * @param url The url/extension to test
   * @return If the file extension can be played
   * @static
   * @example
   * Tone.ToneAudioBuffer.supportsType("wav"); // returns true
   * Tone.ToneAudioBuffer.supportsType("path/to/file.wav"); // returns true
   */
  static supportsType(t) {
    const e = t.split("."), n = e[e.length - 1];
    return document.createElement("audio").canPlayType("audio/" + n) !== "";
  }
  /**
   * Returns a Promise which resolves when all of the buffers have loaded
   */
  static loaded() {
    return ht(this, void 0, void 0, function* () {
      for (yield Promise.resolve(); et.downloads.length; )
        yield et.downloads[0];
    });
  }
}
et.baseUrl = "";
et.downloads = [];
class es extends vn {
  constructor() {
    super({
      clockSource: "offline",
      context: In(arguments[0]) ? arguments[0] : Oh(arguments[0], arguments[1] * arguments[2], arguments[2]),
      lookAhead: 0,
      updateInterval: In(arguments[0]) ? 128 / arguments[0].sampleRate : 128 / arguments[2]
    }), this.name = "OfflineContext", this._currentTime = 0, this.isOffline = !0, this._duration = In(arguments[0]) ? arguments[0].length / arguments[0].sampleRate : arguments[1];
  }
  /**
   * Override the now method to point to the internal clock time
   */
  now() {
    return this._currentTime;
  }
  /**
   * Same as this.now()
   */
  get currentTime() {
    return this._currentTime;
  }
  /**
   * Render just the clock portion of the audio context.
   */
  _renderClock(t) {
    return ht(this, void 0, void 0, function* () {
      let e = 0;
      for (; this._duration - this._currentTime >= 0; ) {
        this.emit("tick"), this._currentTime += 128 / this.sampleRate, e++;
        const n = Math.floor(this.sampleRate / 128);
        t && e % n === 0 && (yield new Promise((i) => setTimeout(i, 1)));
      }
    });
  }
  /**
   * Render the output of the OfflineContext
   * @param asynchronous If the clock should be rendered asynchronously, which will not block the main thread, but be slightly slower.
   */
  render() {
    return ht(this, arguments, void 0, function* (t = !0) {
      yield this.workletsAreReady(), yield this._renderClock(t);
      const e = yield this._context.startRendering();
      return new et(e);
    });
  }
  /**
   * Close the context
   */
  close() {
    return Promise.resolve();
  }
}
const Jr = new Wh();
let Ee = Jr;
function bt() {
  return Ee === Jr && Dh && jh(new vn()), Ee;
}
function jh(s, t = !1) {
  t && Ee.dispose(), Oe(s) ? Ee = new vn(s) : In(s) ? Ee = new es(s) : Ee = s;
}
if (Dt && !Dt.TONE_SILENCE_LOGGING) {
  const t = ` * Tone.js v${Ki} * `;
  console.log(`%c${t}`, "background: #000; color: #fff");
}
function Bh(s) {
  return Math.pow(10, s / 20);
}
function Uh(s) {
  return 20 * (Math.log(s) / Math.LN10);
}
function Kr(s) {
  return Math.pow(2, s / 12);
}
let ns = 440;
function Gh() {
  return ns;
}
function zh(s) {
  ns = s;
}
function Os(s) {
  return Math.round(to(s));
}
function to(s) {
  return 69 + 12 * Math.log2(s / ns);
}
function $h(s) {
  return ns * Math.pow(2, (s - 69) / 12);
}
class ei extends se {
  /**
   * @param context The context associated with the time value. Used to compute
   * Transport and context-relative timing.
   * @param  value  The time value as a number, string or object
   * @param  units  Unit values
   */
  constructor(t, e, n) {
    super(), this.defaultUnits = "s", this._val = e, this._units = n, this.context = t, this._expressions = this._getExpressions();
  }
  /**
   * All of the time encoding expressions
   */
  _getExpressions() {
    return {
      hz: {
        method: (t) => this._frequencyToUnits(parseFloat(t)),
        regexp: /^(\d+(?:\.\d+)?)hz$/i
      },
      i: {
        method: (t) => this._ticksToUnits(parseInt(t, 10)),
        regexp: /^(\d+)i$/i
      },
      m: {
        method: (t) => this._beatsToUnits(parseInt(t, 10) * this._getTimeSignature()),
        regexp: /^(\d+)m$/i
      },
      n: {
        method: (t, e) => {
          const n = parseInt(t, 10), i = e === "." ? 1.5 : 1;
          return n === 1 ? this._beatsToUnits(this._getTimeSignature()) * i : this._beatsToUnits(4 / n) * i;
        },
        regexp: /^(\d+)n(\.?)$/i
      },
      number: {
        method: (t) => this._expressions[this.defaultUnits].method.call(this, t),
        regexp: /^(\d+(?:\.\d+)?)$/
      },
      s: {
        method: (t) => this._secondsToUnits(parseFloat(t)),
        regexp: /^(\d+(?:\.\d+)?)s$/
      },
      samples: {
        method: (t) => parseInt(t, 10) / this.context.sampleRate,
        regexp: /^(\d+)samples$/
      },
      t: {
        method: (t) => {
          const e = parseInt(t, 10);
          return this._beatsToUnits(8 / (Math.floor(e) * 3));
        },
        regexp: /^(\d+)t$/i
      },
      tr: {
        method: (t, e, n) => {
          let i = 0;
          return t && t !== "0" && (i += this._beatsToUnits(this._getTimeSignature() * parseFloat(t))), e && e !== "0" && (i += this._beatsToUnits(parseFloat(e))), n && n !== "0" && (i += this._beatsToUnits(parseFloat(n) / 4)), i;
        },
        regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?$/
      }
    };
  }
  //-------------------------------------
  // 	VALUE OF
  //-------------------------------------
  /**
   * Evaluate the time value. Returns the time in seconds.
   */
  valueOf() {
    if (this._val instanceof ei && this.fromType(this._val), Pt(this._val))
      return this._noArg();
    if (te(this._val) && Pt(this._units)) {
      for (const t in this._expressions)
        if (this._expressions[t].regexp.test(this._val.trim())) {
          this._units = t;
          break;
        }
    } else if (ge(this._val)) {
      let t = 0;
      for (const e in this._val)
        if (Z(this._val[e])) {
          const n = this._val[e], i = (
            // @ts-ignore
            new this.constructor(this.context, e).valueOf() * n
          );
          t += i;
        }
      return t;
    }
    if (Z(this._units)) {
      const t = this._expressions[this._units], e = this._val.toString().trim().match(t.regexp);
      return e ? t.method.apply(this, e.slice(1)) : t.method.call(this, this._val);
    } else return te(this._val) ? parseFloat(this._val) : this._val;
  }
  //-------------------------------------
  // 	UNIT CONVERSIONS
  //-------------------------------------
  /**
   * Returns the value of a frequency in the current units
   */
  _frequencyToUnits(t) {
    return 1 / t;
  }
  /**
   * Return the value of the beats in the current units
   */
  _beatsToUnits(t) {
    return 60 / this._getBpm() * t;
  }
  /**
   * Returns the value of a second in the current units
   */
  _secondsToUnits(t) {
    return t;
  }
  /**
   * Returns the value of a tick in the current time units
   */
  _ticksToUnits(t) {
    return t * this._beatsToUnits(1) / this._getPPQ();
  }
  /**
   * With no arguments, return 'now'
   */
  _noArg() {
    return this._now();
  }
  //-------------------------------------
  // 	TEMPO CONVERSIONS
  //-------------------------------------
  /**
   * Return the bpm
   */
  _getBpm() {
    return this.context.transport.bpm.value;
  }
  /**
   * Return the timeSignature
   */
  _getTimeSignature() {
    return this.context.transport.timeSignature;
  }
  /**
   * Return the PPQ or 192 if Transport is not available
   */
  _getPPQ() {
    return this.context.transport.PPQ;
  }
  //-------------------------------------
  // 	CONVERSION INTERFACE
  //-------------------------------------
  /**
   * Coerce a time type into this units type.
   * @param type Any time type units
   */
  fromType(t) {
    switch (this._units = void 0, this.defaultUnits) {
      case "s":
        this._val = t.toSeconds();
        break;
      case "i":
        this._val = t.toTicks();
        break;
      case "hz":
        this._val = t.toFrequency();
        break;
      case "midi":
        this._val = t.toMidi();
        break;
    }
    return this;
  }
  /**
   * Return the value in hertz
   */
  toFrequency() {
    return 1 / this.toSeconds();
  }
  /**
   * Return the time in samples
   */
  toSamples() {
    return this.toSeconds() * this.context.sampleRate;
  }
  /**
   * Return the time in milliseconds.
   */
  toMilliseconds() {
    return this.toSeconds() * 1e3;
  }
}
class qt extends ei {
  constructor() {
    super(...arguments), this.name = "TimeClass";
  }
  _getExpressions() {
    return Object.assign(super._getExpressions(), {
      now: {
        method: (t) => this._now() + new this.constructor(this.context, t).valueOf(),
        regexp: /^\+(.+)/
      },
      quantize: {
        method: (t) => {
          const e = new qt(this.context, t).valueOf();
          return this._secondsToUnits(this.context.transport.nextSubdivision(e));
        },
        regexp: /^@(.+)/
      }
    });
  }
  /**
   * Quantize the time by the given subdivision. Optionally add a
   * percentage which will move the time value towards the ideal
   * quantized value by that percentage.
   * @param  subdiv    The subdivision to quantize to
   * @param  percent  Move the time value towards the quantized value by a percentage.
   * @example
   * Tone.Time(21).quantize(2); // returns 22
   * Tone.Time(0.6).quantize("4n", 0.5); // returns 0.55
   */
  quantize(t, e = 1) {
    const n = new this.constructor(this.context, t).valueOf(), i = this.valueOf(), a = Math.round(i / n) * n - i;
    return i + a * e;
  }
  //-------------------------------------
  // CONVERSIONS
  //-------------------------------------
  /**
   * Convert a Time to Notation. The notation values are will be the
   * closest representation between 1m to 128th note.
   * @return {Notation}
   * @example
   * // if the Transport is at 120bpm:
   * Tone.Time(2).toNotation(); // returns "1m"
   */
  toNotation() {
    const t = this.toSeconds(), e = ["1m"];
    for (let r = 1; r < 9; r++) {
      const o = Math.pow(2, r);
      e.push(o + "n."), e.push(o + "n"), e.push(o + "t");
    }
    e.push("0");
    let n = e[0], i = new qt(this.context, e[0]).toSeconds();
    return e.forEach((r) => {
      const o = new qt(this.context, r).toSeconds();
      Math.abs(o - t) < Math.abs(i - t) && (n = r, i = o);
    }), n;
  }
  /**
   * Return the time encoded as Bars:Beats:Sixteenths.
   */
  toBarsBeatsSixteenths() {
    const t = this._beatsToUnits(1);
    let e = this.valueOf() / t;
    e = parseFloat(e.toFixed(4));
    const n = Math.floor(e / this._getTimeSignature());
    let i = e % 1 * 4;
    e = Math.floor(e) % this._getTimeSignature();
    const r = i.toString();
    return r.length > 3 && (i = parseFloat(parseFloat(r).toFixed(3))), [n, e, i].join(":");
  }
  /**
   * Return the time in ticks.
   */
  toTicks() {
    const t = this._beatsToUnits(1);
    return this.valueOf() / t * this._getPPQ();
  }
  /**
   * Return the time in seconds.
   */
  toSeconds() {
    return this.valueOf();
  }
  /**
   * Return the value as a midi note.
   */
  toMidi() {
    return Os(this.toFrequency());
  }
  _now() {
    return this.context.now();
  }
}
class Rt extends qt {
  constructor() {
    super(...arguments), this.name = "Frequency", this.defaultUnits = "hz";
  }
  /**
   * The [concert tuning pitch](https://en.wikipedia.org/wiki/Concert_pitch) which is used
   * to generate all the other pitch values from notes. A4's values in Hertz.
   */
  static get A4() {
    return Gh();
  }
  static set A4(t) {
    zh(t);
  }
  //-------------------------------------
  // 	AUGMENT BASE EXPRESSIONS
  //-------------------------------------
  _getExpressions() {
    return Object.assign({}, super._getExpressions(), {
      midi: {
        regexp: /^(\d+(?:\.\d+)?midi)/,
        method(t) {
          return this.defaultUnits === "midi" ? t : Rt.mtof(t);
        }
      },
      note: {
        regexp: /^([a-g]{1}(?:b|#|##|x|bb|###|#x|x#|bbb)?)(-?[0-9]+)/i,
        method(t, e) {
          const i = Zh[t.toLowerCase()] + (parseInt(e, 10) + 1) * 12;
          return this.defaultUnits === "midi" ? i : Rt.mtof(i);
        }
      },
      tr: {
        regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?/,
        method(t, e, n) {
          let i = 1;
          return t && t !== "0" && (i *= this._beatsToUnits(this._getTimeSignature() * parseFloat(t))), e && e !== "0" && (i *= this._beatsToUnits(parseFloat(e))), n && n !== "0" && (i *= this._beatsToUnits(parseFloat(n) / 4)), i;
        }
      }
    });
  }
  //-------------------------------------
  // 	EXPRESSIONS
  //-------------------------------------
  /**
   * Transposes the frequency by the given number of semitones.
   * @return  A new transposed frequency
   * @example
   * Tone.Frequency("A4").transpose(3); // "C5"
   */
  transpose(t) {
    return new Rt(this.context, this.valueOf() * Kr(t));
  }
  /**
   * Takes an array of semitone intervals and returns
   * an array of frequencies transposed by those intervals.
   * @return  Returns an array of Frequencies
   * @example
   * Tone.Frequency("A4").harmonize([0, 3, 7]); // ["A4", "C5", "E5"]
   */
  harmonize(t) {
    return t.map((e) => this.transpose(e));
  }
  //-------------------------------------
  // 	UNIT CONVERSIONS
  //-------------------------------------
  /**
   * Return the value of the frequency as a MIDI note
   * @example
   * Tone.Frequency("C4").toMidi(); // 60
   */
  toMidi() {
    return Os(this.valueOf());
  }
  /**
   * Return the value of the frequency in Scientific Pitch Notation
   * @example
   * Tone.Frequency(69, "midi").toNote(); // "A4"
   */
  toNote() {
    const t = this.toFrequency(), e = Math.log2(t / Rt.A4);
    let n = Math.round(12 * e) + 57;
    const i = Math.floor(n / 12);
    return i < 0 && (n += -12 * i), Xh[n % 12] + i.toString();
  }
  /**
   * Return the duration of one cycle in seconds.
   */
  toSeconds() {
    return 1 / super.toSeconds();
  }
  /**
   * Return the duration of one cycle in ticks
   */
  toTicks() {
    const t = this._beatsToUnits(1), e = this.valueOf() / t;
    return Math.floor(e * this._getPPQ());
  }
  //-------------------------------------
  // 	UNIT CONVERSIONS HELPERS
  //-------------------------------------
  /**
   * With no arguments, return 0
   */
  _noArg() {
    return 0;
  }
  /**
   * Returns the value of a frequency in the current units
   */
  _frequencyToUnits(t) {
    return t;
  }
  /**
   * Returns the value of a tick in the current time units
   */
  _ticksToUnits(t) {
    return 1 / (t * 60 / (this._getBpm() * this._getPPQ()));
  }
  /**
   * Return the value of the beats in the current units
   */
  _beatsToUnits(t) {
    return 1 / super._beatsToUnits(t);
  }
  /**
   * Returns the value of a second in the current units
   */
  _secondsToUnits(t) {
    return 1 / t;
  }
  /**
   * Convert a MIDI note to frequency value.
   * @param  midi The midi number to convert.
   * @return The corresponding frequency value
   */
  static mtof(t) {
    return $h(t);
  }
  /**
   * Convert a frequency value to a MIDI note.
   * @param frequency The value to frequency value to convert.
   */
  static ftom(t) {
    return Os(t);
  }
}
const Zh = {
  cbbb: -3,
  cbb: -2,
  cb: -1,
  c: 0,
  "c#": 1,
  cx: 2,
  "c##": 2,
  "c###": 3,
  "cx#": 3,
  "c#x": 3,
  dbbb: -1,
  dbb: 0,
  db: 1,
  d: 2,
  "d#": 3,
  dx: 4,
  "d##": 4,
  "d###": 5,
  "dx#": 5,
  "d#x": 5,
  ebbb: 1,
  ebb: 2,
  eb: 3,
  e: 4,
  "e#": 5,
  ex: 6,
  "e##": 6,
  "e###": 7,
  "ex#": 7,
  "e#x": 7,
  fbbb: 2,
  fbb: 3,
  fb: 4,
  f: 5,
  "f#": 6,
  fx: 7,
  "f##": 7,
  "f###": 8,
  "fx#": 8,
  "f#x": 8,
  gbbb: 4,
  gbb: 5,
  gb: 6,
  g: 7,
  "g#": 8,
  gx: 9,
  "g##": 9,
  "g###": 10,
  "gx#": 10,
  "g#x": 10,
  abbb: 6,
  abb: 7,
  ab: 8,
  a: 9,
  "a#": 10,
  ax: 11,
  "a##": 11,
  "a###": 12,
  "ax#": 12,
  "a#x": 12,
  bbbb: 8,
  bbb: 9,
  bb: 10,
  b: 11,
  "b#": 12,
  bx: 13,
  "b##": 13,
  "b###": 14,
  "bx#": 14,
  "b#x": 14
}, Xh = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
];
class rn extends qt {
  constructor() {
    super(...arguments), this.name = "TransportTime";
  }
  /**
   * Return the current time in whichever context is relevant
   */
  _now() {
    return this.context.transport.seconds;
  }
}
class kt extends se {
  constructor() {
    super();
    const t = I(kt.getDefaults(), arguments, ["context"]);
    this.defaultContext ? this.context = this.defaultContext : this.context = t.context;
  }
  static getDefaults() {
    return {
      context: bt()
    };
  }
  /**
   * Return the current time of the Context clock plus the lookAhead.
   * @example
   * setInterval(() => {
   * 	console.log(Tone.now());
   * }, 100);
   */
  now() {
    return this.context.currentTime + this.context.lookAhead;
  }
  /**
   * Return the current time of the Context clock without any lookAhead.
   * @example
   * setInterval(() => {
   * 	console.log(Tone.immediate());
   * }, 100);
   */
  immediate() {
    return this.context.currentTime;
  }
  /**
   * The duration in seconds of one sample.
   */
  get sampleTime() {
    return 1 / this.context.sampleRate;
  }
  /**
   * The number of seconds of 1 processing block (128 samples)
   * @example
   * console.log(Tone.Destination.blockTime);
   */
  get blockTime() {
    return 128 / this.context.sampleRate;
  }
  /**
   * Convert the incoming time to seconds.
   * This is calculated against the current {@link TransportClass} bpm
   * @example
   * const gain = new Tone.Gain();
   * setInterval(() => console.log(gain.toSeconds("4n")), 100);
   * // ramp the tempo to 60 bpm over 30 seconds
   * Tone.getTransport().bpm.rampTo(60, 30);
   */
  toSeconds(t) {
    return kh(t), new qt(this.context, t).toSeconds();
  }
  /**
   * Convert the input to a frequency number
   * @example
   * const gain = new Tone.Gain();
   * console.log(gain.toFrequency("4n"));
   */
  toFrequency(t) {
    return new Rt(this.context, t).toFrequency();
  }
  /**
   * Convert the input time into ticks
   * @example
   * const gain = new Tone.Gain();
   * console.log(gain.toTicks("4n"));
   */
  toTicks(t) {
    return new rn(this.context, t).toTicks();
  }
  //-------------------------------------
  // 	GET/SET
  //-------------------------------------
  /**
   * Get a subset of the properties which are in the partial props
   */
  _getPartialProperties(t) {
    const e = this.get();
    return Object.keys(e).forEach((n) => {
      Pt(t[n]) && delete e[n];
    }), e;
  }
  /**
   * Get the object's attributes.
   * @example
   * const osc = new Tone.Oscillator();
   * console.log(osc.get());
   */
  get() {
    const t = Fh(this);
    return Object.keys(t).forEach((e) => {
      if (Reflect.has(this, e)) {
        const n = this[e];
        Z(n) && Z(n.value) && Z(n.setValueAtTime) ? t[e] = n.value : n instanceof kt ? t[e] = n._getPartialProperties(t[e]) : Lt(n) || le(n) || te(n) || Sh(n) ? t[e] = n : delete t[e];
      }
    }), t;
  }
  /**
   * Set multiple properties at once with an object.
   * @example
   * const filter = new Tone.Filter().toDestination();
   * // set values using an object
   * filter.set({
   * 	frequency: "C6",
   * 	type: "highpass"
   * });
   * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/Analogsynth_octaves_highmid.mp3").connect(filter);
   * player.autostart = true;
   */
  set(t) {
    return Object.keys(t).forEach((e) => {
      Reflect.has(this, e) && Z(this[e]) && (this[e] && Z(this[e].value) && Z(this[e].setValueAtTime) ? this[e].value !== t[e] && (this[e].value = t[e]) : this[e] instanceof kt ? this[e].set(t[e]) : this[e] = t[e]);
    }), this;
  }
}
class ni extends Ft {
  constructor(t = "stopped") {
    super(), this.name = "StateTimeline", this._initial = t, this.setStateAtTime(this._initial, 0);
  }
  /**
   * Returns the scheduled state scheduled before or at
   * the given time.
   * @param  time  The time to query.
   * @return  The name of the state input in setStateAtTime.
   */
  getValueAtTime(t) {
    const e = this.get(t);
    return e !== null ? e.state : this._initial;
  }
  /**
   * Add a state to the timeline.
   * @param  state The name of the state to set.
   * @param  time  The time to query.
   * @param options Any additional options that are needed in the timeline.
   */
  setStateAtTime(t, e, n) {
    return Mt(e, 0), this.add(Object.assign({}, n, {
      state: t,
      time: e
    })), this;
  }
  /**
   * Return the event before the time with the given state
   * @param  state The state to look for
   * @param  time  When to check before
   * @return  The event with the given state before the time
   */
  getLastState(t, e) {
    const n = this._search(e);
    for (let i = n; i >= 0; i--) {
      const r = this._timeline[i];
      if (r.state === t)
        return r;
    }
  }
  /**
   * Return the event after the time with the given state
   * @param  state The state to look for
   * @param  time  When to check from
   * @return  The event with the given state after the time
   */
  getNextState(t, e) {
    const n = this._search(e);
    if (n !== -1)
      for (let i = n; i < this._timeline.length; i++) {
        const r = this._timeline[i];
        if (r.state === t)
          return r;
      }
  }
}
class X extends kt {
  constructor() {
    const t = I(X.getDefaults(), arguments, [
      "param",
      "units",
      "convert"
    ]);
    for (super(t), this.name = "Param", this.overridden = !1, this._minOutput = 1e-7, j(Z(t.param) && (Te(t.param) || t.param instanceof X), "param must be an AudioParam"); !Te(t.param); )
      t.param = t.param._param;
    this._swappable = Z(t.swappable) ? t.swappable : !1, this._swappable ? (this.input = this.context.createGain(), this._param = t.param, this.input.connect(this._param)) : this._param = this.input = t.param, this._events = new Ft(1e3), this._initialValue = this._param.defaultValue, this.units = t.units, this.convert = t.convert, this._minValue = t.minValue, this._maxValue = t.maxValue, Z(t.value) && t.value !== this._toType(this._initialValue) && this.setValueAtTime(t.value, 0);
  }
  static getDefaults() {
    return Object.assign(kt.getDefaults(), {
      convert: !0,
      units: "number"
    });
  }
  get value() {
    const t = this.now();
    return this.getValueAtTime(t);
  }
  set value(t) {
    this.cancelScheduledValues(this.now()), this.setValueAtTime(t, this.now());
  }
  get minValue() {
    return Z(this._minValue) ? this._minValue : this.units === "time" || this.units === "frequency" || this.units === "normalRange" || this.units === "positive" || this.units === "transportTime" || this.units === "ticks" || this.units === "bpm" || this.units === "hertz" || this.units === "samples" ? 0 : this.units === "audioRange" ? -1 : this.units === "decibels" ? -1 / 0 : this._param.minValue;
  }
  get maxValue() {
    return Z(this._maxValue) ? this._maxValue : this.units === "normalRange" || this.units === "audioRange" ? 1 : this._param.maxValue;
  }
  /**
   * Type guard based on the unit name
   */
  _is(t, e) {
    return this.units === e;
  }
  /**
   * Make sure the value is always in the defined range
   */
  _assertRange(t) {
    return Z(this.maxValue) && Z(this.minValue) && Mt(t, this._fromType(this.minValue), this._fromType(this.maxValue)), t;
  }
  /**
   * Convert the given value from the type specified by Param.units
   * into the destination value (such as Gain or Frequency).
   */
  _fromType(t) {
    return this.convert && !this.overridden ? this._is(t, "time") ? this.toSeconds(t) : this._is(t, "decibels") ? Bh(t) : this._is(t, "frequency") ? this.toFrequency(t) : t : this.overridden ? 0 : t;
  }
  /**
   * Convert the parameters value into the units specified by Param.units.
   */
  _toType(t) {
    return this.convert && this.units === "decibels" ? Uh(t) : t;
  }
  //-------------------------------------
  // ABSTRACT PARAM INTERFACE
  // all docs are generated from ParamInterface.ts
  //-------------------------------------
  setValueAtTime(t, e) {
    const n = this.toSeconds(e), i = this._fromType(t);
    return j(isFinite(i) && isFinite(n), `Invalid argument(s) to setValueAtTime: ${JSON.stringify(t)}, ${JSON.stringify(e)}`), this._assertRange(i), this.log(this.units, "setValueAtTime", t, n), this._events.add({
      time: n,
      type: "setValueAtTime",
      value: i
    }), this._param.setValueAtTime(i, n), this;
  }
  getValueAtTime(t) {
    const e = Math.max(this.toSeconds(t), 0), n = this._events.getAfter(e), i = this._events.get(e);
    let r = this._initialValue;
    if (i === null)
      r = this._initialValue;
    else if (i.type === "setTargetAtTime" && (n === null || n.type === "setValueAtTime")) {
      const o = this._events.getBefore(i.time);
      let a;
      o === null ? a = this._initialValue : a = o.value, i.type === "setTargetAtTime" && (r = this._exponentialApproach(i.time, a, i.value, i.constant, e));
    } else if (n === null)
      r = i.value;
    else if (n.type === "linearRampToValueAtTime" || n.type === "exponentialRampToValueAtTime") {
      let o = i.value;
      if (i.type === "setTargetAtTime") {
        const a = this._events.getBefore(i.time);
        a === null ? o = this._initialValue : o = a.value;
      }
      n.type === "linearRampToValueAtTime" ? r = this._linearInterpolate(i.time, o, n.time, n.value, e) : r = this._exponentialInterpolate(i.time, o, n.time, n.value, e);
    } else
      r = i.value;
    return this._toType(r);
  }
  setRampPoint(t) {
    t = this.toSeconds(t);
    let e = this.getValueAtTime(t);
    return this.cancelAndHoldAtTime(t), this._fromType(e) === 0 && (e = this._toType(this._minOutput)), this.setValueAtTime(e, t), this;
  }
  linearRampToValueAtTime(t, e) {
    const n = this._fromType(t), i = this.toSeconds(e);
    return j(isFinite(n) && isFinite(i), `Invalid argument(s) to linearRampToValueAtTime: ${JSON.stringify(t)}, ${JSON.stringify(e)}`), this._assertRange(n), this._events.add({
      time: i,
      type: "linearRampToValueAtTime",
      value: n
    }), this.log(this.units, "linearRampToValueAtTime", t, i), this._param.linearRampToValueAtTime(n, i), this;
  }
  exponentialRampToValueAtTime(t, e) {
    let n = this._fromType(t);
    n = Vt(n, 0) ? this._minOutput : n, this._assertRange(n);
    const i = this.toSeconds(e);
    return j(isFinite(n) && isFinite(i), `Invalid argument(s) to exponentialRampToValueAtTime: ${JSON.stringify(t)}, ${JSON.stringify(e)}`), this._events.add({
      time: i,
      type: "exponentialRampToValueAtTime",
      value: n
    }), this.log(this.units, "exponentialRampToValueAtTime", t, i), this._param.exponentialRampToValueAtTime(n, i), this;
  }
  exponentialRampTo(t, e, n) {
    return n = this.toSeconds(n), this.setRampPoint(n), this.exponentialRampToValueAtTime(t, n + this.toSeconds(e)), this;
  }
  linearRampTo(t, e, n) {
    return n = this.toSeconds(n), this.setRampPoint(n), this.linearRampToValueAtTime(t, n + this.toSeconds(e)), this;
  }
  targetRampTo(t, e, n) {
    return n = this.toSeconds(n), this.setRampPoint(n), this.exponentialApproachValueAtTime(t, n, e), this;
  }
  exponentialApproachValueAtTime(t, e, n) {
    e = this.toSeconds(e), n = this.toSeconds(n);
    const i = Math.log(n + 1) / Math.log(200);
    return this.setTargetAtTime(t, e, i), this.cancelAndHoldAtTime(e + n * 0.9), this.linearRampToValueAtTime(t, e + n), this;
  }
  setTargetAtTime(t, e, n) {
    const i = this._fromType(t);
    j(isFinite(n) && n > 0, "timeConstant must be a number greater than 0");
    const r = this.toSeconds(e);
    return this._assertRange(i), j(isFinite(i) && isFinite(r), `Invalid argument(s) to setTargetAtTime: ${JSON.stringify(t)}, ${JSON.stringify(e)}`), this._events.add({
      constant: n,
      time: r,
      type: "setTargetAtTime",
      value: i
    }), this.log(this.units, "setTargetAtTime", t, r, n), this._param.setTargetAtTime(i, r, n), this;
  }
  setValueCurveAtTime(t, e, n, i = 1) {
    n = this.toSeconds(n), e = this.toSeconds(e);
    const r = this._fromType(t[0]) * i;
    this.setValueAtTime(this._toType(r), e);
    const o = n / (t.length - 1);
    for (let a = 1; a < t.length; a++) {
      const c = this._fromType(t[a]) * i;
      this.linearRampToValueAtTime(this._toType(c), e + a * o);
    }
    return this;
  }
  cancelScheduledValues(t) {
    const e = this.toSeconds(t);
    return j(isFinite(e), `Invalid argument to cancelScheduledValues: ${JSON.stringify(t)}`), this._events.cancel(e), this._param.cancelScheduledValues(e), this.log(this.units, "cancelScheduledValues", e), this;
  }
  cancelAndHoldAtTime(t) {
    const e = this.toSeconds(t), n = this._fromType(this.getValueAtTime(e));
    j(isFinite(e), `Invalid argument to cancelAndHoldAtTime: ${JSON.stringify(t)}`), this.log(this.units, "cancelAndHoldAtTime", e, "value=" + n);
    const i = this._events.get(e), r = this._events.getAfter(e);
    return i && Vt(i.time, e) ? r ? (this._param.cancelScheduledValues(r.time), this._events.cancel(r.time)) : (this._param.cancelAndHoldAtTime(e), this._events.cancel(e + this.sampleTime)) : r && (this._param.cancelScheduledValues(r.time), this._events.cancel(r.time), r.type === "linearRampToValueAtTime" ? this.linearRampToValueAtTime(this._toType(n), e) : r.type === "exponentialRampToValueAtTime" && this.exponentialRampToValueAtTime(this._toType(n), e)), this._events.add({
      time: e,
      type: "setValueAtTime",
      value: n
    }), this._param.setValueAtTime(n, e), this;
  }
  rampTo(t, e = 0.1, n) {
    return this.units === "frequency" || this.units === "bpm" || this.units === "decibels" ? this.exponentialRampTo(t, e, n) : this.linearRampTo(t, e, n), this;
  }
  /**
   * Apply all of the previously scheduled events to the passed in Param or AudioParam.
   * The applied values will start at the context's current time and schedule
   * all of the events which are scheduled on this Param onto the passed in param.
   */
  apply(t) {
    const e = this.context.currentTime;
    t.setValueAtTime(this.getValueAtTime(e), e);
    const n = this._events.get(e);
    if (n && n.type === "setTargetAtTime") {
      const i = this._events.getAfter(n.time), r = i ? i.time : e + 2, o = (r - e) / 10;
      for (let a = e; a < r; a += o)
        t.linearRampToValueAtTime(this.getValueAtTime(a), a);
    }
    return this._events.forEachAfter(this.context.currentTime, (i) => {
      i.type === "cancelScheduledValues" ? t.cancelScheduledValues(i.time) : i.type === "setTargetAtTime" ? t.setTargetAtTime(i.value, i.time, i.constant) : t[i.type](i.value, i.time);
    }), this;
  }
  /**
   * Replace the Param's internal AudioParam. Will apply scheduled curves
   * onto the parameter and replace the connections.
   */
  setParam(t) {
    j(this._swappable, "The Param must be assigned as 'swappable' in the constructor");
    const e = this.input;
    return e.disconnect(this._param), this.apply(t), this._param = t, e.connect(this._param), this;
  }
  dispose() {
    return super.dispose(), this._events.dispose(), this;
  }
  get defaultValue() {
    return this._toType(this._param.defaultValue);
  }
  //-------------------------------------
  // 	AUTOMATION CURVE CALCULATIONS
  // 	MIT License, copyright (c) 2014 Jordan Santell
  //-------------------------------------
  // Calculates the the value along the curve produced by setTargetAtTime
  _exponentialApproach(t, e, n, i, r) {
    return n + (e - n) * Math.exp(-(r - t) / i);
  }
  // Calculates the the value along the curve produced by linearRampToValueAtTime
  _linearInterpolate(t, e, n, i, r) {
    return e + (i - e) * ((r - t) / (n - t));
  }
  // Calculates the the value along the curve produced by exponentialRampToValueAtTime
  _exponentialInterpolate(t, e, n, i, r) {
    return e * Math.pow(i / e, (r - t) / (n - t));
  }
}
class R extends kt {
  constructor() {
    super(...arguments), this._internalChannels = [];
  }
  /**
   * The number of inputs feeding into the AudioNode.
   * For source nodes, this will be 0.
   * @example
   * const node = new Tone.Gain();
   * console.log(node.numberOfInputs);
   */
  get numberOfInputs() {
    return Z(this.input) ? Te(this.input) || this.input instanceof X ? 1 : this.input.numberOfInputs : 0;
  }
  /**
   * The number of outputs of the AudioNode.
   * @example
   * const node = new Tone.Gain();
   * console.log(node.numberOfOutputs);
   */
  get numberOfOutputs() {
    return Z(this.output) ? this.output.numberOfOutputs : 0;
  }
  //-------------------------------------
  // AUDIO PROPERTIES
  //-------------------------------------
  /**
   * Used to decide which nodes to get/set properties on
   */
  _isAudioNode(t) {
    return Z(t) && (t instanceof R || ue(t));
  }
  /**
   * Get all of the audio nodes (either internal or input/output) which together
   * make up how the class node responds to channel input/output
   */
  _getInternalNodes() {
    const t = this._internalChannels.slice(0);
    return this._isAudioNode(this.input) && t.push(this.input), this._isAudioNode(this.output) && this.input !== this.output && t.push(this.output), t;
  }
  /**
   * Set the audio options for this node such as channelInterpretation
   * channelCount, etc.
   * @param options
   */
  _setChannelProperties(t) {
    this._getInternalNodes().forEach((n) => {
      n.channelCount = t.channelCount, n.channelCountMode = t.channelCountMode, n.channelInterpretation = t.channelInterpretation;
    });
  }
  /**
   * Get the current audio options for this node such as channelInterpretation
   * channelCount, etc.
   */
  _getChannelProperties() {
    const t = this._getInternalNodes();
    j(t.length > 0, "ToneAudioNode does not have any internal nodes");
    const e = t[0];
    return {
      channelCount: e.channelCount,
      channelCountMode: e.channelCountMode,
      channelInterpretation: e.channelInterpretation
    };
  }
  /**
   * channelCount is the number of channels used when up-mixing and down-mixing
   * connections to any inputs to the node. The default value is 2 except for
   * specific nodes where its value is specially determined.
   */
  get channelCount() {
    return this._getChannelProperties().channelCount;
  }
  set channelCount(t) {
    const e = this._getChannelProperties();
    this._setChannelProperties(Object.assign(e, { channelCount: t }));
  }
  /**
   * channelCountMode determines how channels will be counted when up-mixing and
   * down-mixing connections to any inputs to the node.
   * The default value is "max". This attribute has no effect for nodes with no inputs.
   * * "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
   * * "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
   * * "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.
   */
  get channelCountMode() {
    return this._getChannelProperties().channelCountMode;
  }
  set channelCountMode(t) {
    const e = this._getChannelProperties();
    this._setChannelProperties(Object.assign(e, { channelCountMode: t }));
  }
  /**
   * channelInterpretation determines how individual channels will be treated
   * when up-mixing and down-mixing connections to any inputs to the node.
   * The default value is "speakers".
   */
  get channelInterpretation() {
    return this._getChannelProperties().channelInterpretation;
  }
  set channelInterpretation(t) {
    const e = this._getChannelProperties();
    this._setChannelProperties(Object.assign(e, { channelInterpretation: t }));
  }
  //-------------------------------------
  // CONNECTIONS
  //-------------------------------------
  /**
   * connect the output of a ToneAudioNode to an AudioParam, AudioNode, or ToneAudioNode
   * @param destination The output to connect to
   * @param outputNum The output to connect from
   * @param inputNum The input to connect to
   */
  connect(t, e = 0, n = 0) {
    return jt(this, t, e, n), this;
  }
  /**
   * Connect the output to the context's destination node.
   * @example
   * const osc = new Tone.Oscillator("C2").start();
   * osc.toDestination();
   */
  toDestination() {
    return this.connect(this.context.destination), this;
  }
  /**
   * Connect the output to the context's destination node.
   * @see {@link toDestination}
   * @deprecated
   */
  toMaster() {
    return Js("toMaster() has been renamed toDestination()"), this.toDestination();
  }
  /**
   * disconnect the output
   */
  disconnect(t, e = 0, n = 0) {
    return eo(this, t, e, n), this;
  }
  /**
   * Connect the output of this node to the rest of the nodes in series.
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/handdrum-loop.mp3");
   * player.autostart = true;
   * const filter = new Tone.AutoFilter(4).start();
   * const distortion = new Tone.Distortion(0.5);
   * // connect the player to the filter, distortion and then to the master output
   * player.chain(filter, distortion, Tone.Destination);
   */
  chain(...t) {
    return ee(this, ...t), this;
  }
  /**
   * connect the output of this node to the rest of the nodes in parallel.
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/conga-rhythm.mp3");
   * player.autostart = true;
   * const pitchShift = new Tone.PitchShift(4).toDestination();
   * const filter = new Tone.Filter("G5").toDestination();
   * // connect a node to the pitch shift and filter in parallel
   * player.fan(pitchShift, filter);
   */
  fan(...t) {
    return t.forEach((e) => this.connect(e)), this;
  }
  /**
   * Dispose and disconnect
   */
  dispose() {
    return super.dispose(), Z(this.input) && (this.input instanceof R ? this.input.dispose() : ue(this.input) && this.input.disconnect()), Z(this.output) && (this.output instanceof R ? this.output.dispose() : ue(this.output) && this.output.disconnect()), this._internalChannels = [], this;
  }
}
function ee(...s) {
  const t = s.shift();
  s.reduce((e, n) => (e instanceof R ? e.connect(n) : ue(e) && jt(e, n), n), t);
}
function jt(s, t, e = 0, n = 0) {
  for (j(Z(s), "Cannot connect from undefined node"), j(Z(t), "Cannot connect to undefined node"), (t instanceof R || ue(t)) && j(t.numberOfInputs > 0, "Cannot connect to node with no inputs"), j(s.numberOfOutputs > 0, "Cannot connect from node with no outputs"); t instanceof R || t instanceof X; )
    Z(t.input) && (t = t.input);
  for (; s instanceof R; )
    Z(s.output) && (s = s.output);
  Te(t) ? s.connect(t, e) : s.connect(t, e, n);
}
function eo(s, t, e = 0, n = 0) {
  if (Z(t))
    for (; t instanceof R; )
      t = t.input;
  for (; !ue(s); )
    Z(s.output) && (s = s.output);
  Te(t) ? s.disconnect(t, e) : ue(t) ? s.disconnect(t, e, n) : s.disconnect();
}
class U extends R {
  constructor() {
    const t = I(U.getDefaults(), arguments, [
      "gain",
      "units"
    ]);
    super(t), this.name = "Gain", this._gainNode = this.context.createGain(), this.input = this._gainNode, this.output = this._gainNode, this.gain = new X({
      context: this.context,
      convert: t.convert,
      param: this._gainNode.gain,
      units: t.units,
      value: t.gain,
      minValue: t.minValue,
      maxValue: t.maxValue
    }), Y(this, "gain");
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      convert: !0,
      gain: 1,
      units: "gain"
    });
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._gainNode.disconnect(), this.gain.dispose(), this;
  }
}
class Le extends R {
  constructor(t) {
    super(t), this.onended = Q, this._startTime = -1, this._stopTime = -1, this._timeout = -1, this.output = new U({
      context: this.context,
      gain: 0
    }), this._gainNode = this.output, this.getStateAtTime = function(e) {
      const n = this.toSeconds(e);
      return this._startTime !== -1 && n >= this._startTime && (this._stopTime === -1 || n <= this._stopTime) ? "started" : "stopped";
    }, this._fadeIn = t.fadeIn, this._fadeOut = t.fadeOut, this._curve = t.curve, this.onended = t.onended;
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      curve: "linear",
      fadeIn: 0,
      fadeOut: 0,
      onended: Q
    });
  }
  /**
   * Start the source at the given time
   * @param  time When to start the source
   */
  _startGain(t, e = 1) {
    j(this._startTime === -1, "Source cannot be started more than once");
    const n = this.toSeconds(this._fadeIn);
    return this._startTime = t + n, this._startTime = Math.max(this._startTime, this.context.currentTime), n > 0 ? (this._gainNode.gain.setValueAtTime(0, t), this._curve === "linear" ? this._gainNode.gain.linearRampToValueAtTime(e, t + n) : this._gainNode.gain.exponentialApproachValueAtTime(e, t, n)) : this._gainNode.gain.setValueAtTime(e, t), this;
  }
  /**
   * Stop the source node at the given time.
   * @param time When to stop the source
   */
  stop(t) {
    return this.log("stop", t), this._stopGain(this.toSeconds(t)), this;
  }
  /**
   * Stop the source at the given time
   * @param  time When to stop the source
   */
  _stopGain(t) {
    j(this._startTime !== -1, "'start' must be called before 'stop'"), this.cancelStop();
    const e = this.toSeconds(this._fadeOut);
    return this._stopTime = this.toSeconds(t) + e, this._stopTime = Math.max(this._stopTime, this.now()), e > 0 ? this._curve === "linear" ? this._gainNode.gain.linearRampTo(0, e, t) : this._gainNode.gain.targetRampTo(0, e, t) : (this._gainNode.gain.cancelAndHoldAtTime(t), this._gainNode.gain.setValueAtTime(0, t)), this.context.clearTimeout(this._timeout), this._timeout = this.context.setTimeout(() => {
      const n = this._curve === "exponential" ? e * 2 : 0;
      this._stopSource(this.now() + n), this._onended();
    }, this._stopTime - this.context.currentTime), this;
  }
  /**
   * Invoke the onended callback
   */
  _onended() {
    if (this.onended !== Q && (this.onended(this), this.onended = Q, !this.context.isOffline)) {
      const t = () => this.dispose();
      typeof requestIdleCallback < "u" ? requestIdleCallback(t) : setTimeout(t, 10);
    }
  }
  /**
   * Get the playback state at the current time
   */
  get state() {
    return this.getStateAtTime(this.now());
  }
  /**
   * Cancel a scheduled stop event
   */
  cancelStop() {
    return this.log("cancelStop"), j(this._startTime !== -1, "Source is not started"), this._gainNode.gain.cancelScheduledValues(this._startTime + this.sampleTime), this.context.clearTimeout(this._timeout), this._stopTime = -1, this;
  }
  dispose() {
    return super.dispose(), this._gainNode.dispose(), this.onended = Q, this;
  }
}
class si extends Le {
  constructor() {
    const t = I(si.getDefaults(), arguments, ["offset"]);
    super(t), this.name = "ToneConstantSource", this._source = this.context.createConstantSource(), jt(this._source, this._gainNode), this.offset = new X({
      context: this.context,
      convert: t.convert,
      param: this._source.offset,
      units: t.units,
      value: t.offset,
      minValue: t.minValue,
      maxValue: t.maxValue
    });
  }
  static getDefaults() {
    return Object.assign(Le.getDefaults(), {
      convert: !0,
      offset: 1,
      units: "number"
    });
  }
  /**
   * Start the source node at the given time
   * @param  time When to start the source
   */
  start(t) {
    const e = this.toSeconds(t);
    return this.log("start", e), this._startGain(e), this._source.start(e), this;
  }
  _stopSource(t) {
    this._source.stop(t);
  }
  dispose() {
    return super.dispose(), this.state === "started" && this.stop(), this._source.disconnect(), this.offset.dispose(), this;
  }
}
class z extends R {
  constructor() {
    const t = I(z.getDefaults(), arguments, [
      "value",
      "units"
    ]);
    super(t), this.name = "Signal", this.override = !0, this.output = this._constantSource = new si({
      context: this.context,
      convert: t.convert,
      offset: t.value,
      units: t.units,
      minValue: t.minValue,
      maxValue: t.maxValue
    }), this._constantSource.start(0), this.input = this._param = this._constantSource.offset;
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      convert: !0,
      units: "number",
      value: 0
    });
  }
  connect(t, e = 0, n = 0) {
    return ss(this, t, e, n), this;
  }
  dispose() {
    return super.dispose(), this._param.dispose(), this._constantSource.dispose(), this;
  }
  //-------------------------------------
  // ABSTRACT PARAM INTERFACE
  // just a proxy for the ConstantSourceNode's offset AudioParam
  // all docs are generated from AbstractParam.ts
  //-------------------------------------
  setValueAtTime(t, e) {
    return this._param.setValueAtTime(t, e), this;
  }
  getValueAtTime(t) {
    return this._param.getValueAtTime(t);
  }
  setRampPoint(t) {
    return this._param.setRampPoint(t), this;
  }
  linearRampToValueAtTime(t, e) {
    return this._param.linearRampToValueAtTime(t, e), this;
  }
  exponentialRampToValueAtTime(t, e) {
    return this._param.exponentialRampToValueAtTime(t, e), this;
  }
  exponentialRampTo(t, e, n) {
    return this._param.exponentialRampTo(t, e, n), this;
  }
  linearRampTo(t, e, n) {
    return this._param.linearRampTo(t, e, n), this;
  }
  targetRampTo(t, e, n) {
    return this._param.targetRampTo(t, e, n), this;
  }
  exponentialApproachValueAtTime(t, e, n) {
    return this._param.exponentialApproachValueAtTime(t, e, n), this;
  }
  setTargetAtTime(t, e, n) {
    return this._param.setTargetAtTime(t, e, n), this;
  }
  setValueCurveAtTime(t, e, n, i) {
    return this._param.setValueCurveAtTime(t, e, n, i), this;
  }
  cancelScheduledValues(t) {
    return this._param.cancelScheduledValues(t), this;
  }
  cancelAndHoldAtTime(t) {
    return this._param.cancelAndHoldAtTime(t), this;
  }
  rampTo(t, e, n) {
    return this._param.rampTo(t, e, n), this;
  }
  get value() {
    return this._param.value;
  }
  set value(t) {
    this._param.value = t;
  }
  get convert() {
    return this._param.convert;
  }
  set convert(t) {
    this._param.convert = t;
  }
  get units() {
    return this._param.units;
  }
  get overridden() {
    return this._param.overridden;
  }
  set overridden(t) {
    this._param.overridden = t;
  }
  get maxValue() {
    return this._param.maxValue;
  }
  get minValue() {
    return this._param.minValue;
  }
  /**
   * @see {@link Param.apply}.
   */
  apply(t) {
    return this._param.apply(t), this;
  }
}
function ss(s, t, e, n) {
  (t instanceof X || Te(t) || t instanceof z && t.override) && (t.cancelScheduledValues(0), t.setValueAtTime(0, 0), t instanceof z && (t.overridden = !0)), jt(s, t, e, n);
}
class ii extends X {
  constructor() {
    const t = I(ii.getDefaults(), arguments, ["value"]);
    super(t), this.name = "TickParam", this._events = new Ft(1 / 0), this._multiplier = 1, this._multiplier = t.multiplier, this._events.cancel(0), this._events.add({
      ticks: 0,
      time: 0,
      type: "setValueAtTime",
      value: this._fromType(t.value)
    }), this.setValueAtTime(t.value, 0);
  }
  static getDefaults() {
    return Object.assign(X.getDefaults(), {
      multiplier: 1,
      units: "hertz",
      value: 1
    });
  }
  setTargetAtTime(t, e, n) {
    e = this.toSeconds(e), this.setRampPoint(e);
    const i = this._fromType(t), r = this._events.get(e), o = Math.round(Math.max(1 / n, 1));
    for (let a = 0; a <= o; a++) {
      const c = n * a + e, u = this._exponentialApproach(r.time, r.value, i, n, c);
      this.linearRampToValueAtTime(this._toType(u), c);
    }
    return this;
  }
  setValueAtTime(t, e) {
    const n = this.toSeconds(e);
    super.setValueAtTime(t, e);
    const i = this._events.get(n), r = this._events.previousEvent(i), o = this._getTicksUntilEvent(r, n);
    return i.ticks = Math.max(o, 0), this;
  }
  linearRampToValueAtTime(t, e) {
    const n = this.toSeconds(e);
    super.linearRampToValueAtTime(t, e);
    const i = this._events.get(n), r = this._events.previousEvent(i), o = this._getTicksUntilEvent(r, n);
    return i.ticks = Math.max(o, 0), this;
  }
  exponentialRampToValueAtTime(t, e) {
    e = this.toSeconds(e);
    const n = this._fromType(t), i = this._events.get(e), r = Math.round(Math.max((e - i.time) * 10, 1)), o = (e - i.time) / r;
    for (let a = 0; a <= r; a++) {
      const c = o * a + i.time, u = this._exponentialInterpolate(i.time, i.value, e, n, c);
      this.linearRampToValueAtTime(this._toType(u), c);
    }
    return this;
  }
  /**
   * Returns the tick value at the time. Takes into account
   * any automation curves scheduled on the signal.
   * @param  event The time to get the tick count at
   * @return The number of ticks which have elapsed at the time given any automations.
   */
  _getTicksUntilEvent(t, e) {
    if (t === null)
      t = {
        ticks: 0,
        time: 0,
        type: "setValueAtTime",
        value: 0
      };
    else if (Pt(t.ticks)) {
      const o = this._events.previousEvent(t);
      t.ticks = this._getTicksUntilEvent(o, t.time);
    }
    const n = this._fromType(this.getValueAtTime(t.time));
    let i = this._fromType(this.getValueAtTime(e));
    const r = this._events.get(e);
    return r && r.time === e && r.type === "setValueAtTime" && (i = this._fromType(this.getValueAtTime(e - this.sampleTime))), 0.5 * (e - t.time) * (n + i) + t.ticks;
  }
  /**
   * Returns the tick value at the time. Takes into account
   * any automation curves scheduled on the signal.
   * @param  time The time to get the tick count at
   * @return The number of ticks which have elapsed at the time given any automations.
   */
  getTicksAtTime(t) {
    const e = this.toSeconds(t), n = this._events.get(e);
    return Math.max(this._getTicksUntilEvent(n, e), 0);
  }
  /**
   * Return the elapsed time of the number of ticks from the given time
   * @param ticks The number of ticks to calculate
   * @param  time The time to get the next tick from
   * @return The duration of the number of ticks from the given time in seconds
   */
  getDurationOfTicks(t, e) {
    const n = this.toSeconds(e), i = this.getTicksAtTime(e);
    return this.getTimeOfTick(i + t) - n;
  }
  /**
   * Given a tick, returns the time that tick occurs at.
   * @return The time that the tick occurs.
   */
  getTimeOfTick(t) {
    const e = this._events.get(t, "ticks"), n = this._events.getAfter(t, "ticks");
    if (e && e.ticks === t)
      return e.time;
    if (e && n && n.type === "linearRampToValueAtTime" && e.value !== n.value) {
      const i = this._fromType(this.getValueAtTime(e.time)), o = (this._fromType(this.getValueAtTime(n.time)) - i) / (n.time - e.time), a = Math.sqrt(Math.pow(i, 2) - 2 * o * (e.ticks - t)), c = (-i + a) / o, u = (-i - a) / o;
      return (c > 0 ? c : u) + e.time;
    } else return e ? e.value === 0 ? 1 / 0 : e.time + (t - e.ticks) / e.value : t / this._initialValue;
  }
  /**
   * Convert some number of ticks their the duration in seconds accounting
   * for any automation curves starting at the given time.
   * @param  ticks The number of ticks to convert to seconds.
   * @param  when  When along the automation timeline to convert the ticks.
   * @return The duration in seconds of the ticks.
   */
  ticksToTime(t, e) {
    return this.getDurationOfTicks(t, e);
  }
  /**
   * The inverse of {@link ticksToTime}. Convert a duration in
   * seconds to the corresponding number of ticks accounting for any
   * automation curves starting at the given time.
   * @param  duration The time interval to convert to ticks.
   * @param  when When along the automation timeline to convert the ticks.
   * @return The duration in ticks.
   */
  timeToTicks(t, e) {
    const n = this.toSeconds(e), i = this.toSeconds(t), r = this.getTicksAtTime(n);
    return this.getTicksAtTime(n + i) - r;
  }
  /**
   * Convert from the type when the unit value is BPM
   */
  _fromType(t) {
    return this.units === "bpm" && this.multiplier ? 1 / (60 / t / this.multiplier) : super._fromType(t);
  }
  /**
   * Special case of type conversion where the units === "bpm"
   */
  _toType(t) {
    return this.units === "bpm" && this.multiplier ? t / this.multiplier * 60 : super._toType(t);
  }
  /**
   * A multiplier on the bpm value. Useful for setting a PPQ relative to the base frequency value.
   */
  get multiplier() {
    return this._multiplier;
  }
  set multiplier(t) {
    const e = this.value;
    this._multiplier = t, this.cancelScheduledValues(0), this.setValueAtTime(e, 0);
  }
}
class ri extends z {
  constructor() {
    const t = I(ri.getDefaults(), arguments, ["value"]);
    super(t), this.name = "TickSignal", this.input = this._param = new ii({
      context: this.context,
      convert: t.convert,
      multiplier: t.multiplier,
      param: this._constantSource.offset,
      units: t.units,
      value: t.value
    });
  }
  static getDefaults() {
    return Object.assign(z.getDefaults(), {
      multiplier: 1,
      units: "hertz",
      value: 1
    });
  }
  ticksToTime(t, e) {
    return this._param.ticksToTime(t, e);
  }
  timeToTicks(t, e) {
    return this._param.timeToTicks(t, e);
  }
  getTimeOfTick(t) {
    return this._param.getTimeOfTick(t);
  }
  getDurationOfTicks(t, e) {
    return this._param.getDurationOfTicks(t, e);
  }
  getTicksAtTime(t) {
    return this._param.getTicksAtTime(t);
  }
  /**
   * A multiplier on the bpm value. Useful for setting a PPQ relative to the base frequency value.
   */
  get multiplier() {
    return this._param.multiplier;
  }
  set multiplier(t) {
    this._param.multiplier = t;
  }
  dispose() {
    return super.dispose(), this._param.dispose(), this;
  }
}
class oi extends kt {
  constructor() {
    const t = I(oi.getDefaults(), arguments, ["frequency"]);
    super(t), this.name = "TickSource", this._state = new ni(), this._tickOffset = new Ft(), this._ticksAtTime = new Ft(), this._secondsAtTime = new Ft(), this.frequency = new ri({
      context: this.context,
      units: t.units,
      value: t.frequency
    }), Y(this, "frequency"), this._state.setStateAtTime("stopped", 0), this.setTicksAtTime(0, 0);
  }
  static getDefaults() {
    return Object.assign({
      frequency: 1,
      units: "hertz"
    }, kt.getDefaults());
  }
  /**
   * Returns the playback state of the source, either "started", "stopped" or "paused".
   */
  get state() {
    return this.getStateAtTime(this.now());
  }
  /**
   * Start the clock at the given time. Optionally pass in an offset
   * of where to start the tick counter from.
   * @param  time    The time the clock should start
   * @param offset The number of ticks to start the source at
   */
  start(t, e) {
    const n = this.toSeconds(t);
    return this._state.getValueAtTime(n) !== "started" && (this._state.setStateAtTime("started", n), Z(e) && this.setTicksAtTime(e, n), this._ticksAtTime.cancel(n), this._secondsAtTime.cancel(n)), this;
  }
  /**
   * Stop the clock. Stopping the clock resets the tick counter to 0.
   * @param time The time when the clock should stop.
   */
  stop(t) {
    const e = this.toSeconds(t);
    if (this._state.getValueAtTime(e) === "stopped") {
      const n = this._state.get(e);
      n && n.time > 0 && (this._tickOffset.cancel(n.time), this._state.cancel(n.time));
    }
    return this._state.cancel(e), this._state.setStateAtTime("stopped", e), this.setTicksAtTime(0, e), this._ticksAtTime.cancel(e), this._secondsAtTime.cancel(e), this;
  }
  /**
   * Pause the clock. Pausing does not reset the tick counter.
   * @param time The time when the clock should stop.
   */
  pause(t) {
    const e = this.toSeconds(t);
    return this._state.getValueAtTime(e) === "started" && (this._state.setStateAtTime("paused", e), this._ticksAtTime.cancel(e), this._secondsAtTime.cancel(e)), this;
  }
  /**
   * Cancel start/stop/pause and setTickAtTime events scheduled after the given time.
   * @param time When to clear the events after
   */
  cancel(t) {
    return t = this.toSeconds(t), this._state.cancel(t), this._tickOffset.cancel(t), this._ticksAtTime.cancel(t), this._secondsAtTime.cancel(t), this;
  }
  /**
   * Get the elapsed ticks at the given time
   * @param  time  When to get the tick value
   * @return The number of ticks
   */
  getTicksAtTime(t) {
    const e = this.toSeconds(t), n = this._state.getLastState("stopped", e), i = this._ticksAtTime.get(e), r = {
      state: "paused",
      time: e
    };
    this._state.add(r);
    let o = i || n, a = i ? i.ticks : 0, c = null;
    return this._state.forEachBetween(o.time, e + this.sampleTime, (u) => {
      let l = o.time;
      const h = this._tickOffset.get(u.time);
      h && h.time >= o.time && (a = h.ticks, l = h.time), o.state === "started" && u.state !== "started" && (a += this.frequency.getTicksAtTime(u.time) - this.frequency.getTicksAtTime(l), u.time !== r.time && (c = {
        state: u.state,
        time: u.time,
        ticks: a
      })), o = u;
    }), this._state.remove(r), c && this._ticksAtTime.add(c), a;
  }
  /**
   * The number of times the callback was invoked. Starts counting at 0
   * and increments after the callback was invoked. Returns -1 when stopped.
   */
  get ticks() {
    return this.getTicksAtTime(this.now());
  }
  set ticks(t) {
    this.setTicksAtTime(t, this.now());
  }
  /**
   * The time since ticks=0 that the TickSource has been running. Accounts
   * for tempo curves
   */
  get seconds() {
    return this.getSecondsAtTime(this.now());
  }
  set seconds(t) {
    const e = this.now(), n = this.frequency.timeToTicks(t, e);
    this.setTicksAtTime(n, e);
  }
  /**
   * Return the elapsed seconds at the given time.
   * @param  time  When to get the elapsed seconds
   * @return  The number of elapsed seconds
   */
  getSecondsAtTime(t) {
    t = this.toSeconds(t);
    const e = this._state.getLastState("stopped", t), n = { state: "paused", time: t };
    this._state.add(n);
    const i = this._secondsAtTime.get(t);
    let r = i || e, o = i ? i.seconds : 0, a = null;
    return this._state.forEachBetween(r.time, t + this.sampleTime, (c) => {
      let u = r.time;
      const l = this._tickOffset.get(c.time);
      l && l.time >= r.time && (o = l.seconds, u = l.time), r.state === "started" && c.state !== "started" && (o += c.time - u, c.time !== n.time && (a = {
        state: c.state,
        time: c.time,
        seconds: o
      })), r = c;
    }), this._state.remove(n), a && this._secondsAtTime.add(a), o;
  }
  /**
   * Set the clock's ticks at the given time.
   * @param  ticks The tick value to set
   * @param  time  When to set the tick value
   */
  setTicksAtTime(t, e) {
    return e = this.toSeconds(e), this._tickOffset.cancel(e), this._tickOffset.add({
      seconds: this.frequency.getDurationOfTicks(t, e),
      ticks: t,
      time: e
    }), this._ticksAtTime.cancel(e), this._secondsAtTime.cancel(e), this;
  }
  /**
   * Returns the scheduled state at the given time.
   * @param  time  The time to query.
   */
  getStateAtTime(t) {
    return t = this.toSeconds(t), this._state.getValueAtTime(t);
  }
  /**
   * Get the time of the given tick. The second argument
   * is when to test before. Since ticks can be set (with setTicksAtTime)
   * there may be multiple times for a given tick value.
   * @param  tick The tick number.
   * @param  before When to measure the tick value from.
   * @return The time of the tick
   */
  getTimeOfTick(t, e = this.now()) {
    const n = this._tickOffset.get(e), i = this._state.get(e), r = Math.max(n.time, i.time), o = this.frequency.getTicksAtTime(r) + t - n.ticks;
    return this.frequency.getTimeOfTick(o);
  }
  /**
   * Invoke the callback event at all scheduled ticks between the
   * start time and the end time
   * @param  startTime  The beginning of the search range
   * @param  endTime    The end of the search range
   * @param  callback   The callback to invoke with each tick
   */
  forEachTickBetween(t, e, n) {
    let i = this._state.get(t);
    this._state.forEachBetween(t, e, (o) => {
      i && i.state === "started" && o.state !== "started" && this.forEachTickBetween(Math.max(i.time, t), o.time - this.sampleTime, n), i = o;
    });
    let r = null;
    if (i && i.state === "started") {
      const o = Math.max(i.time, t), a = this.frequency.getTicksAtTime(o), c = this.frequency.getTicksAtTime(i.time), u = a - c;
      let l = Math.ceil(u) - u;
      l = Vt(l, 1) ? 0 : l;
      let h = this.frequency.getTimeOfTick(a + l);
      for (; h < e; ) {
        try {
          n(h, Math.round(this.getTicksAtTime(h)));
        } catch (p) {
          r = p;
          break;
        }
        h += this.frequency.getDurationOfTicks(1, h);
      }
    }
    if (r)
      throw r;
    return this;
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this._state.dispose(), this._tickOffset.dispose(), this._ticksAtTime.dispose(), this._secondsAtTime.dispose(), this.frequency.dispose(), this;
  }
}
class is extends kt {
  constructor() {
    const t = I(is.getDefaults(), arguments, [
      "callback",
      "frequency"
    ]);
    super(t), this.name = "Clock", this.callback = Q, this._lastUpdate = 0, this._state = new ni("stopped"), this._boundLoop = this._loop.bind(this), this.callback = t.callback, this._tickSource = new oi({
      context: this.context,
      frequency: t.frequency,
      units: t.units
    }), this._lastUpdate = 0, this.frequency = this._tickSource.frequency, Y(this, "frequency"), this._state.setStateAtTime("stopped", 0), this.context.on("tick", this._boundLoop);
  }
  static getDefaults() {
    return Object.assign(kt.getDefaults(), {
      callback: Q,
      frequency: 1,
      units: "hertz"
    });
  }
  /**
   * Returns the playback state of the source, either "started", "stopped" or "paused".
   */
  get state() {
    return this._state.getValueAtTime(this.now());
  }
  /**
   * Start the clock at the given time. Optionally pass in an offset
   * of where to start the tick counter from.
   * @param  time    The time the clock should start
   * @param offset  Where the tick counter starts counting from.
   */
  start(t, e) {
    $r(this.context);
    const n = this.toSeconds(t);
    return this.log("start", n), this._state.getValueAtTime(n) !== "started" && (this._state.setStateAtTime("started", n), this._tickSource.start(n, e), n < this._lastUpdate && this.emit("start", n, e)), this;
  }
  /**
   * Stop the clock. Stopping the clock resets the tick counter to 0.
   * @param time The time when the clock should stop.
   * @example
   * const clock = new Tone.Clock(time => {
   * 	console.log(time);
   * }, 1);
   * clock.start();
   * // stop the clock after 10 seconds
   * clock.stop("+10");
   */
  stop(t) {
    const e = this.toSeconds(t);
    return this.log("stop", e), this._state.cancel(e), this._state.setStateAtTime("stopped", e), this._tickSource.stop(e), e < this._lastUpdate && this.emit("stop", e), this;
  }
  /**
   * Pause the clock. Pausing does not reset the tick counter.
   * @param time The time when the clock should stop.
   */
  pause(t) {
    const e = this.toSeconds(t);
    return this._state.getValueAtTime(e) === "started" && (this._state.setStateAtTime("paused", e), this._tickSource.pause(e), e < this._lastUpdate && this.emit("pause", e)), this;
  }
  /**
   * The number of times the callback was invoked. Starts counting at 0
   * and increments after the callback was invoked.
   */
  get ticks() {
    return Math.ceil(this.getTicksAtTime(this.now()));
  }
  set ticks(t) {
    this._tickSource.ticks = t;
  }
  /**
   * The time since ticks=0 that the Clock has been running. Accounts for tempo curves
   */
  get seconds() {
    return this._tickSource.seconds;
  }
  set seconds(t) {
    this._tickSource.seconds = t;
  }
  /**
   * Return the elapsed seconds at the given time.
   * @param  time  When to get the elapsed seconds
   * @return  The number of elapsed seconds
   */
  getSecondsAtTime(t) {
    return this._tickSource.getSecondsAtTime(t);
  }
  /**
   * Set the clock's ticks at the given time.
   * @param  ticks The tick value to set
   * @param  time  When to set the tick value
   */
  setTicksAtTime(t, e) {
    return this._tickSource.setTicksAtTime(t, e), this;
  }
  /**
   * Get the time of the given tick. The second argument
   * is when to test before. Since ticks can be set (with setTicksAtTime)
   * there may be multiple times for a given tick value.
   * @param  tick The tick number.
   * @param  before When to measure the tick value from.
   * @return The time of the tick
   */
  getTimeOfTick(t, e = this.now()) {
    return this._tickSource.getTimeOfTick(t, e);
  }
  /**
   * Get the clock's ticks at the given time.
   * @param  time  When to get the tick value
   * @return The tick value at the given time.
   */
  getTicksAtTime(t) {
    return this._tickSource.getTicksAtTime(t);
  }
  /**
   * Get the time of the next tick
   * @param  offset The tick number.
   */
  nextTickTime(t, e) {
    const n = this.toSeconds(e), i = this.getTicksAtTime(n);
    return this._tickSource.getTimeOfTick(i + t, n);
  }
  /**
   * The scheduling loop.
   */
  _loop() {
    const t = this._lastUpdate, e = this.now();
    this._lastUpdate = e, this.log("loop", t, e), t !== e && (this._state.forEachBetween(t, e, (n) => {
      switch (n.state) {
        case "started":
          const i = this._tickSource.getTicksAtTime(n.time);
          this.emit("start", n.time, i);
          break;
        case "stopped":
          n.time !== 0 && this.emit("stop", n.time);
          break;
        case "paused":
          this.emit("pause", n.time);
          break;
      }
    }), this._tickSource.forEachTickBetween(t, e, (n, i) => {
      this.callback(n, i);
    }));
  }
  /**
   * Returns the scheduled state at the given time.
   * @param  time  The time to query.
   * @return  The name of the state input in setStateAtTime.
   * @example
   * const clock = new Tone.Clock();
   * clock.start("+0.1");
   * clock.getStateAtTime("+0.1"); // returns "started"
   */
  getStateAtTime(t) {
    const e = this.toSeconds(t);
    return this._state.getValueAtTime(e);
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this.context.off("tick", this._boundLoop), this._tickSource.dispose(), this._state.dispose(), this;
  }
}
yn.mixin(is);
class We extends R {
  constructor() {
    const t = I(We.getDefaults(), arguments, [
      "delayTime",
      "maxDelay"
    ]);
    super(t), this.name = "Delay";
    const e = this.toSeconds(t.maxDelay);
    this._maxDelay = Math.max(e, this.toSeconds(t.delayTime)), this._delayNode = this.input = this.output = this.context.createDelay(e), this.delayTime = new X({
      context: this.context,
      param: this._delayNode.delayTime,
      units: "time",
      value: t.delayTime,
      minValue: 0,
      maxValue: this.maxDelay
    }), Y(this, "delayTime");
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      delayTime: 0,
      maxDelay: 1
    });
  }
  /**
   * The maximum delay time. This cannot be changed after
   * the value is passed into the constructor.
   */
  get maxDelay() {
    return this._maxDelay;
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._delayNode.disconnect(), this.delayTime.dispose(), this;
  }
}
class He extends R {
  constructor() {
    const t = I(He.getDefaults(), arguments, [
      "volume"
    ]);
    super(t), this.name = "Volume", this.input = this.output = new U({
      context: this.context,
      gain: t.volume,
      units: "decibels"
    }), this.volume = this.output.gain, Y(this, "volume"), this._unmutedVolume = t.volume, this.mute = t.mute;
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      mute: !1,
      volume: 0
    });
  }
  /**
   * Mute the output.
   * @example
   * const vol = new Tone.Volume(-12).toDestination();
   * const osc = new Tone.Oscillator().connect(vol).start();
   * // mute the output
   * vol.mute = true;
   */
  get mute() {
    return this.volume.value === -1 / 0;
  }
  set mute(t) {
    !this.mute && t ? (this._unmutedVolume = this.volume.value, this.volume.value = -1 / 0) : this.mute && !t && (this.volume.value = this._unmutedVolume);
  }
  /**
   * clean up
   */
  dispose() {
    return super.dispose(), this.input.dispose(), this.volume.dispose(), this;
  }
}
class ai extends R {
  constructor() {
    const t = I(ai.getDefaults(), arguments);
    super(t), this.name = "Destination", this.input = new He({ context: this.context }), this.output = new U({ context: this.context }), this.volume = this.input.volume, ee(this.input, this.output, this.context.rawContext.destination), this.mute = t.mute, this._internalChannels = [
      this.input,
      this.context.rawContext.destination,
      this.output
    ];
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      mute: !1,
      volume: 0
    });
  }
  /**
   * Mute the output.
   * @example
   * const oscillator = new Tone.Oscillator().start().toDestination();
   * setTimeout(() => {
   * 	// mute the output
   * 	Tone.Destination.mute = true;
   * }, 1000);
   */
  get mute() {
    return this.input.mute;
  }
  set mute(t) {
    this.input.mute = t;
  }
  /**
   * Add a master effects chain. NOTE: this will disconnect any nodes which were previously
   * chained in the master effects chain.
   * @param args All arguments will be connected in a row and the Master will be routed through it.
   * @example
   * // route all audio through a filter and compressor
   * const lowpass = new Tone.Filter(800, "lowpass");
   * const compressor = new Tone.Compressor(-18);
   * Tone.Destination.chain(lowpass, compressor);
   */
  chain(...t) {
    return this.input.disconnect(), t.unshift(this.input), t.push(this.output), ee(...t), this;
  }
  /**
   * The maximum number of channels the system can output
   * @example
   * console.log(Tone.Destination.maxChannelCount);
   */
  get maxChannelCount() {
    return this.context.rawContext.destination.maxChannelCount;
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this.volume.dispose(), this;
  }
}
Kn((s) => {
  s.destination = new ai({ context: s });
});
ts((s) => {
  s.destination.dispose();
});
class Yh extends R {
  constructor() {
    super(...arguments), this.name = "Listener", this.positionX = new X({
      context: this.context,
      param: this.context.rawContext.listener.positionX
    }), this.positionY = new X({
      context: this.context,
      param: this.context.rawContext.listener.positionY
    }), this.positionZ = new X({
      context: this.context,
      param: this.context.rawContext.listener.positionZ
    }), this.forwardX = new X({
      context: this.context,
      param: this.context.rawContext.listener.forwardX
    }), this.forwardY = new X({
      context: this.context,
      param: this.context.rawContext.listener.forwardY
    }), this.forwardZ = new X({
      context: this.context,
      param: this.context.rawContext.listener.forwardZ
    }), this.upX = new X({
      context: this.context,
      param: this.context.rawContext.listener.upX
    }), this.upY = new X({
      context: this.context,
      param: this.context.rawContext.listener.upY
    }), this.upZ = new X({
      context: this.context,
      param: this.context.rawContext.listener.upZ
    });
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      forwardX: 0,
      forwardY: 0,
      forwardZ: -1,
      upX: 0,
      upY: 1,
      upZ: 0
    });
  }
  dispose() {
    return super.dispose(), this.positionX.dispose(), this.positionY.dispose(), this.positionZ.dispose(), this.forwardX.dispose(), this.forwardY.dispose(), this.forwardZ.dispose(), this.upX.dispose(), this.upY.dispose(), this.upZ.dispose(), this;
  }
}
Kn((s) => {
  s.listener = new Yh({ context: s });
});
ts((s) => {
  s.listener.dispose();
});
class ci extends se {
  constructor() {
    super(), this.name = "ToneAudioBuffers", this._buffers = /* @__PURE__ */ new Map(), this._loadingCount = 0;
    const t = I(ci.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls");
    this.baseUrl = t.baseUrl, Object.keys(t.urls).forEach((e) => {
      this._loadingCount++;
      const n = t.urls[e];
      this.add(e, n, this._bufferLoaded.bind(this, t.onload), t.onerror);
    });
  }
  static getDefaults() {
    return {
      baseUrl: "",
      onerror: Q,
      onload: Q,
      urls: {}
    };
  }
  /**
   * True if the buffers object has a buffer by that name.
   * @param  name  The key or index of the buffer.
   */
  has(t) {
    return this._buffers.has(t.toString());
  }
  /**
   * Get a buffer by name. If an array was loaded,
   * then use the array index.
   * @param  name  The key or index of the buffer.
   */
  get(t) {
    return j(this.has(t), `ToneAudioBuffers has no buffer named: ${t}`), this._buffers.get(t.toString());
  }
  /**
   * A buffer was loaded. decrement the counter.
   */
  _bufferLoaded(t) {
    this._loadingCount--, this._loadingCount === 0 && t && t();
  }
  /**
   * If the buffers are loaded or not
   */
  get loaded() {
    return Array.from(this._buffers).every(([t, e]) => e.loaded);
  }
  /**
   * Add a buffer by name and url to the Buffers
   * @param  name      A unique name to give the buffer
   * @param  url  Either the url of the bufer, or a buffer which will be added with the given name.
   * @param  callback  The callback to invoke when the url is loaded.
   * @param  onerror  Invoked if the buffer can't be loaded
   */
  add(t, e, n = Q, i = Q) {
    return te(e) ? (this.baseUrl && e.trim().substring(0, 11).toLowerCase() === "data:audio/" && (this.baseUrl = ""), this._buffers.set(t.toString(), new et(this.baseUrl + e, n, i))) : this._buffers.set(t.toString(), new et(e, n, i)), this;
  }
  dispose() {
    return super.dispose(), this._buffers.forEach((t) => t.dispose()), this._buffers.clear(), this;
  }
}
class Ie extends rn {
  constructor() {
    super(...arguments), this.name = "Ticks", this.defaultUnits = "i";
  }
  /**
   * Get the current time in the given units
   */
  _now() {
    return this.context.transport.ticks;
  }
  /**
   * Return the value of the beats in the current units
   */
  _beatsToUnits(t) {
    return this._getPPQ() * t;
  }
  /**
   * Returns the value of a second in the current units
   */
  _secondsToUnits(t) {
    return Math.floor(t / (60 / this._getBpm()) * this._getPPQ());
  }
  /**
   * Returns the value of a tick in the current time units
   */
  _ticksToUnits(t) {
    return t;
  }
  /**
   * Return the time in ticks
   */
  toTicks() {
    return this.valueOf();
  }
  /**
   * Return the time in seconds
   */
  toSeconds() {
    return this.valueOf() / this._getPPQ() * (60 / this._getBpm());
  }
}
class Hh extends kt {
  constructor() {
    super(...arguments), this.name = "Draw", this.expiration = 0.25, this.anticipation = 8e-3, this._events = new Ft(), this._boundDrawLoop = this._drawLoop.bind(this), this._animationFrame = -1;
  }
  /**
   * Schedule a function at the given time to be invoked
   * on the nearest animation frame.
   * @param  callback  Callback is invoked at the given time.
   * @param  time      The time relative to the AudioContext time to invoke the callback.
   * @example
   * Tone.Transport.scheduleRepeat(time => {
   * 	Tone.Draw.schedule(() => console.log(time), time);
   * }, 1);
   * Tone.Transport.start();
   */
  schedule(t, e) {
    return this._events.add({
      callback: t,
      time: this.toSeconds(e)
    }), this._events.length === 1 && (this._animationFrame = requestAnimationFrame(this._boundDrawLoop)), this;
  }
  /**
   * Cancel events scheduled after the given time
   * @param  after  Time after which scheduled events will be removed from the scheduling timeline.
   */
  cancel(t) {
    return this._events.cancel(this.toSeconds(t)), this;
  }
  /**
   * The draw loop
   */
  _drawLoop() {
    const t = this.context.currentTime;
    this._events.forEachBefore(t + this.anticipation, (e) => {
      t - e.time <= this.expiration && e.callback(), this._events.remove(e);
    }), this._events.length > 0 && (this._animationFrame = requestAnimationFrame(this._boundDrawLoop));
  }
  dispose() {
    return super.dispose(), this._events.dispose(), cancelAnimationFrame(this._animationFrame), this;
  }
}
Kn((s) => {
  s.draw = new Hh({ context: s });
});
ts((s) => {
  s.draw.dispose();
});
class Qh extends se {
  constructor() {
    super(...arguments), this.name = "IntervalTimeline", this._root = null, this._length = 0;
  }
  /**
   * The event to add to the timeline. All events must
   * have a time and duration value
   * @param  event  The event to add to the timeline
   */
  add(t) {
    j(Z(t.time), "Events must have a time property"), j(Z(t.duration), "Events must have a duration parameter"), t.time = t.time.valueOf();
    let e = new Jh(t.time, t.time + t.duration, t);
    for (this._root === null ? this._root = e : this._root.insert(e), this._length++; e !== null; )
      e.updateHeight(), e.updateMax(), this._rebalance(e), e = e.parent;
    return this;
  }
  /**
   * Remove an event from the timeline.
   * @param  event  The event to remove from the timeline
   */
  remove(t) {
    if (this._root !== null) {
      const e = [];
      this._root.search(t.time, e);
      for (const n of e)
        if (n.event === t) {
          this._removeNode(n), this._length--;
          break;
        }
    }
    return this;
  }
  /**
   * The number of items in the timeline.
   * @readOnly
   */
  get length() {
    return this._length;
  }
  /**
   * Remove events whose time time is after the given time
   * @param  after  The time to query.
   */
  cancel(t) {
    return this.forEachFrom(t, (e) => this.remove(e)), this;
  }
  /**
   * Set the root node as the given node
   */
  _setRoot(t) {
    this._root = t, this._root !== null && (this._root.parent = null);
  }
  /**
   * Replace the references to the node in the node's parent
   * with the replacement node.
   */
  _replaceNodeInParent(t, e) {
    t.parent !== null ? (t.isLeftChild() ? t.parent.left = e : t.parent.right = e, this._rebalance(t.parent)) : this._setRoot(e);
  }
  /**
   * Remove the node from the tree and replace it with
   * a successor which follows the schema.
   */
  _removeNode(t) {
    if (t.left === null && t.right === null)
      this._replaceNodeInParent(t, null);
    else if (t.right === null)
      this._replaceNodeInParent(t, t.left);
    else if (t.left === null)
      this._replaceNodeInParent(t, t.right);
    else {
      const e = t.getBalance();
      let n, i = null;
      if (e > 0)
        if (t.left.right === null)
          n = t.left, n.right = t.right, i = n;
        else {
          for (n = t.left.right; n.right !== null; )
            n = n.right;
          n.parent && (n.parent.right = n.left, i = n.parent, n.left = t.left, n.right = t.right);
        }
      else if (t.right.left === null)
        n = t.right, n.left = t.left, i = n;
      else {
        for (n = t.right.left; n.left !== null; )
          n = n.left;
        n.parent && (n.parent.left = n.right, i = n.parent, n.left = t.left, n.right = t.right);
      }
      t.parent !== null ? t.isLeftChild() ? t.parent.left = n : t.parent.right = n : this._setRoot(n), i && this._rebalance(i);
    }
    t.dispose();
  }
  /**
   * Rotate the tree to the left
   */
  _rotateLeft(t) {
    const e = t.parent, n = t.isLeftChild(), i = t.right;
    i && (t.right = i.left, i.left = t), e !== null ? n ? e.left = i : e.right = i : this._setRoot(i);
  }
  /**
   * Rotate the tree to the right
   */
  _rotateRight(t) {
    const e = t.parent, n = t.isLeftChild(), i = t.left;
    i && (t.left = i.right, i.right = t), e !== null ? n ? e.left = i : e.right = i : this._setRoot(i);
  }
  /**
   * Balance the BST
   */
  _rebalance(t) {
    const e = t.getBalance();
    e > 1 && t.left ? t.left.getBalance() < 0 ? this._rotateLeft(t.left) : this._rotateRight(t) : e < -1 && t.right && (t.right.getBalance() > 0 ? this._rotateRight(t.right) : this._rotateLeft(t));
  }
  /**
   * Get an event whose time and duration span the give time. Will
   * return the match whose "time" value is closest to the given time.
   * @return  The event which spans the desired time
   */
  get(t) {
    if (this._root !== null) {
      const e = [];
      if (this._root.search(t, e), e.length > 0) {
        let n = e[0];
        for (let i = 1; i < e.length; i++)
          e[i].low > n.low && (n = e[i]);
        return n.event;
      }
    }
    return null;
  }
  /**
   * Iterate over everything in the timeline.
   * @param  callback The callback to invoke with every item
   */
  forEach(t) {
    if (this._root !== null) {
      const e = [];
      this._root.traverse((n) => e.push(n)), e.forEach((n) => {
        n.event && t(n.event);
      });
    }
    return this;
  }
  /**
   * Iterate over everything in the array in which the given time
   * overlaps with the time and duration time of the event.
   * @param  time The time to check if items are overlapping
   * @param  callback The callback to invoke with every item
   */
  forEachAtTime(t, e) {
    if (this._root !== null) {
      const n = [];
      this._root.search(t, n), n.forEach((i) => {
        i.event && e(i.event);
      });
    }
    return this;
  }
  /**
   * Iterate over everything in the array in which the time is greater
   * than or equal to the given time.
   * @param  time The time to check if items are before
   * @param  callback The callback to invoke with every item
   */
  forEachFrom(t, e) {
    if (this._root !== null) {
      const n = [];
      this._root.searchAfter(t, n), n.forEach((i) => {
        i.event && e(i.event);
      });
    }
    return this;
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this._root !== null && this._root.traverse((t) => t.dispose()), this._root = null, this;
  }
}
class Jh {
  constructor(t, e, n) {
    this._left = null, this._right = null, this.parent = null, this.height = 0, this.event = n, this.low = t, this.high = e, this.max = this.high;
  }
  /**
   * Insert a node into the correct spot in the tree
   */
  insert(t) {
    t.low <= this.low ? this.left === null ? this.left = t : this.left.insert(t) : this.right === null ? this.right = t : this.right.insert(t);
  }
  /**
   * Search the tree for nodes which overlap
   * with the given point
   * @param  point  The point to query
   * @param  results  The array to put the results
   */
  search(t, e) {
    t > this.max || (this.left !== null && this.left.search(t, e), this.low <= t && this.high > t && e.push(this), !(this.low > t) && this.right !== null && this.right.search(t, e));
  }
  /**
   * Search the tree for nodes which are less
   * than the given point
   * @param  point  The point to query
   * @param  results  The array to put the results
   */
  searchAfter(t, e) {
    this.low >= t && (e.push(this), this.left !== null && this.left.searchAfter(t, e)), this.right !== null && this.right.searchAfter(t, e);
  }
  /**
   * Invoke the callback on this element and both it's branches
   * @param  {Function}  callback
   */
  traverse(t) {
    t(this), this.left !== null && this.left.traverse(t), this.right !== null && this.right.traverse(t);
  }
  /**
   * Update the height of the node
   */
  updateHeight() {
    this.left !== null && this.right !== null ? this.height = Math.max(this.left.height, this.right.height) + 1 : this.right !== null ? this.height = this.right.height + 1 : this.left !== null ? this.height = this.left.height + 1 : this.height = 0;
  }
  /**
   * Update the height of the node
   */
  updateMax() {
    this.max = this.high, this.left !== null && (this.max = Math.max(this.max, this.left.max)), this.right !== null && (this.max = Math.max(this.max, this.right.max));
  }
  /**
   * The balance is how the leafs are distributed on the node
   * @return  Negative numbers are balanced to the right
   */
  getBalance() {
    let t = 0;
    return this.left !== null && this.right !== null ? t = this.left.height - this.right.height : this.left !== null ? t = this.left.height + 1 : this.right !== null && (t = -(this.right.height + 1)), t;
  }
  /**
   * @returns true if this node is the left child of its parent
   */
  isLeftChild() {
    return this.parent !== null && this.parent.left === this;
  }
  /**
   * get/set the left node
   */
  get left() {
    return this._left;
  }
  set left(t) {
    this._left = t, t !== null && (t.parent = this), this.updateHeight(), this.updateMax();
  }
  /**
   * get/set the right node
   */
  get right() {
    return this._right;
  }
  set right(t) {
    this._right = t, t !== null && (t.parent = this), this.updateHeight(), this.updateMax();
  }
  /**
   * null out references.
   */
  dispose() {
    this.parent = null, this._left = null, this._right = null, this.event = null;
  }
}
class Kh extends se {
  /**
   * @param initialValue The value to return if there is no scheduled values
   */
  constructor(t) {
    super(), this.name = "TimelineValue", this._timeline = new Ft({
      memory: 10
    }), this._initialValue = t;
  }
  /**
   * Set the value at the given time
   */
  set(t, e) {
    return this._timeline.add({
      value: t,
      time: e
    }), this;
  }
  /**
   * Get the value at the given time
   */
  get(t) {
    const e = this._timeline.get(t);
    return e ? e.value : this._initialValue;
  }
}
class Et extends R {
  constructor() {
    super(I(Et.getDefaults(), arguments, [
      "context"
    ]));
  }
  connect(t, e = 0, n = 0) {
    return ss(this, t, e, n), this;
  }
}
class ie extends Et {
  constructor() {
    const t = I(ie.getDefaults(), arguments, ["mapping", "length"]);
    super(t), this.name = "WaveShaper", this._shaper = this.context.createWaveShaper(), this.input = this._shaper, this.output = this._shaper, Lt(t.mapping) || t.mapping instanceof Float32Array ? this.curve = Float32Array.from(t.mapping) : Ch(t.mapping) && this.setMap(t.mapping, t.length);
  }
  static getDefaults() {
    return Object.assign(z.getDefaults(), {
      length: 1024
    });
  }
  /**
   * Uses a mapping function to set the value of the curve.
   * @param mapping The function used to define the values.
   *                The mapping function take two arguments:
   *                the first is the value at the current position
   *                which goes from -1 to 1 over the number of elements
   *                in the curve array. The second argument is the array position.
   * @example
   * const shaper = new Tone.WaveShaper();
   * // map the input signal from [-1, 1] to [0, 10]
   * shaper.setMap((val, index) => (val + 1) * 5);
   */
  setMap(t, e = 1024) {
    const n = new Float32Array(e);
    for (let i = 0, r = e; i < r; i++) {
      const o = i / (r - 1) * 2 - 1;
      n[i] = t(o, i);
    }
    return this.curve = n, this;
  }
  /**
   * The array to set as the waveshaper curve. For linear curves
   * array length does not make much difference, but for complex curves
   * longer arrays will provide smoother interpolation.
   */
  get curve() {
    return this._shaper.curve;
  }
  set curve(t) {
    this._shaper.curve = t;
  }
  /**
   * Specifies what type of oversampling (if any) should be used when
   * applying the shaping curve. Can either be "none", "2x" or "4x".
   */
  get oversample() {
    return this._shaper.oversample;
  }
  set oversample(t) {
    const e = ["none", "2x", "4x"].some((n) => n.includes(t));
    j(e, "oversampling must be either 'none', '2x', or '4x'"), this._shaper.oversample = t;
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._shaper.disconnect(), this;
  }
}
class wn extends Et {
  constructor() {
    const t = I(wn.getDefaults(), arguments, [
      "value"
    ]);
    super(t), this.name = "Pow", this._exponentScaler = this.input = this.output = new ie({
      context: this.context,
      mapping: this._expFunc(t.value),
      length: 8192
    }), this._exponent = t.value;
  }
  static getDefaults() {
    return Object.assign(Et.getDefaults(), {
      value: 1
    });
  }
  /**
   * the function which maps the waveshaper
   * @param exponent exponent value
   */
  _expFunc(t) {
    return (e) => Math.pow(Math.abs(e), t);
  }
  /**
   * The value of the exponent.
   */
  get value() {
    return this._exponent;
  }
  set value(t) {
    this._exponent = t, this._exponentScaler.setMap(this._expFunc(this._exponent));
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._exponentScaler.dispose(), this;
  }
}
class he {
  /**
   * @param transport The transport object which the event belongs to
   */
  constructor(t, e) {
    this.id = he._eventId++, this._remainderTime = 0;
    const n = Object.assign(he.getDefaults(), e);
    this.transport = t, this.callback = n.callback, this._once = n.once, this.time = Math.floor(n.time), this._remainderTime = n.time - this.time;
  }
  static getDefaults() {
    return {
      callback: Q,
      once: !1,
      time: 0
    };
  }
  /**
   * Get the time and remainder time.
   */
  get floatTime() {
    return this.time + this._remainderTime;
  }
  /**
   * Invoke the event callback.
   * @param  time  The AudioContext time in seconds of the event
   */
  invoke(t) {
    if (this.callback) {
      const e = this.transport.bpm.getDurationOfTicks(1, t);
      this.callback(t + this._remainderTime * e), this._once && this.transport.clear(this.id);
    }
  }
  /**
   * Clean up
   */
  dispose() {
    return this.callback = void 0, this;
  }
}
he._eventId = 0;
class ui extends he {
  /**
   * @param transport The transport object which the event belongs to
   */
  constructor(t, e) {
    super(t, e), this._currentId = -1, this._nextId = -1, this._nextTick = this.time, this._boundRestart = this._restart.bind(this);
    const n = Object.assign(ui.getDefaults(), e);
    this.duration = n.duration, this._interval = n.interval, this._nextTick = n.time, this.transport.on("start", this._boundRestart), this.transport.on("loopStart", this._boundRestart), this.transport.on("ticks", this._boundRestart), this.context = this.transport.context, this._restart();
  }
  static getDefaults() {
    return Object.assign({}, he.getDefaults(), {
      duration: 1 / 0,
      interval: 1,
      once: !1
    });
  }
  /**
   * Invoke the callback. Returns the tick time which
   * the next event should be scheduled at.
   * @param  time  The AudioContext time in seconds of the event
   */
  invoke(t) {
    this._createEvents(t), super.invoke(t);
  }
  /**
   * Create an event on the transport on the nextTick
   */
  _createEvent() {
    return Bn(this._nextTick, this.floatTime + this.duration) ? this.transport.scheduleOnce(this.invoke.bind(this), new Ie(this.context, this._nextTick).toSeconds()) : -1;
  }
  /**
   * Push more events onto the timeline to keep up with the position of the timeline
   */
  _createEvents(t) {
    Bn(this._nextTick + this._interval, this.floatTime + this.duration) && (this._nextTick += this._interval, this._currentId = this._nextId, this._nextId = this.transport.scheduleOnce(this.invoke.bind(this), new Ie(this.context, this._nextTick).toSeconds()));
  }
  /**
   * Re-compute the events when the transport time has changed from a start/ticks/loopStart event
   */
  _restart(t) {
    this.transport.clear(this._currentId), this.transport.clear(this._nextId), this._nextTick = this.floatTime;
    const e = this.transport.getTicksAtTime(t);
    qe(e, this.time) && (this._nextTick = this.floatTime + Math.ceil((e - this.floatTime) / this._interval) * this._interval), this._currentId = this._createEvent(), this._nextTick += this._interval, this._nextId = this._createEvent();
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this.transport.clear(this._currentId), this.transport.clear(this._nextId), this.transport.off("start", this._boundRestart), this.transport.off("loopStart", this._boundRestart), this.transport.off("ticks", this._boundRestart), this;
  }
}
class rs extends kt {
  constructor() {
    const t = I(rs.getDefaults(), arguments);
    super(t), this.name = "Transport", this._loop = new Kh(!1), this._loopStart = 0, this._loopEnd = 0, this._scheduledEvents = {}, this._timeline = new Ft(), this._repeatedEvents = new Qh(), this._syncedSignals = [], this._swingAmount = 0, this._ppq = t.ppq, this._clock = new is({
      callback: this._processTick.bind(this),
      context: this.context,
      frequency: 0,
      units: "bpm"
    }), this._bindClockEvents(), this.bpm = this._clock.frequency, this._clock.frequency.multiplier = t.ppq, this.bpm.setValueAtTime(t.bpm, 0), Y(this, "bpm"), this._timeSignature = t.timeSignature, this._swingTicks = t.ppq / 2;
  }
  static getDefaults() {
    return Object.assign(kt.getDefaults(), {
      bpm: 120,
      loopEnd: "4m",
      loopStart: 0,
      ppq: 192,
      swing: 0,
      swingSubdivision: "8n",
      timeSignature: 4
    });
  }
  //-------------------------------------
  // 	TICKS
  //-------------------------------------
  /**
   * called on every tick
   * @param  tickTime clock relative tick time
   */
  _processTick(t, e) {
    if (this._loop.get(t) && e >= this._loopEnd && (this.emit("loopEnd", t), this._clock.setTicksAtTime(this._loopStart, t), e = this._loopStart, this.emit("loopStart", t, this._clock.getSecondsAtTime(t)), this.emit("loop", t)), this._swingAmount > 0 && e % this._ppq !== 0 && // not on a downbeat
    e % (this._swingTicks * 2) !== 0) {
      const n = e % (this._swingTicks * 2) / (this._swingTicks * 2), i = Math.sin(n * Math.PI) * this._swingAmount;
      t += new Ie(this.context, this._swingTicks * 2 / 3).toSeconds() * i;
    }
    zi(!0), this._timeline.forEachAtTime(e, (n) => n.invoke(t)), zi(!1);
  }
  //-------------------------------------
  // 	SCHEDULABLE EVENTS
  //-------------------------------------
  /**
   * Schedule an event along the timeline.
   * @param callback The callback to be invoked at the time.
   * @param time The time to invoke the callback at.
   * @return The id of the event which can be used for canceling the event.
   * @example
   * // schedule an event on the 16th measure
   * Tone.getTransport().schedule((time) => {
   * 	// invoked on measure 16
   * 	console.log("measure 16!");
   * }, "16:0:0");
   */
  schedule(t, e) {
    const n = new he(this, {
      callback: t,
      time: new rn(this.context, e).toTicks()
    });
    return this._addEvent(n, this._timeline);
  }
  /**
   * Schedule a repeated event along the timeline. The event will fire
   * at the `interval` starting at the `startTime` and for the specified
   * `duration`.
   * @param  callback   The callback to invoke.
   * @param  interval   The duration between successive callbacks. Must be a positive number.
   * @param  startTime  When along the timeline the events should start being invoked.
   * @param  duration How long the event should repeat.
   * @return  The ID of the scheduled event. Use this to cancel the event.
   * @example
   * const osc = new Tone.Oscillator().toDestination().start();
   * // a callback invoked every eighth note after the first measure
   * Tone.getTransport().scheduleRepeat((time) => {
   * 	osc.start(time).stop(time + 0.1);
   * }, "8n", "1m");
   */
  scheduleRepeat(t, e, n, i = 1 / 0) {
    const r = new ui(this, {
      callback: t,
      duration: new qt(this.context, i).toTicks(),
      interval: new qt(this.context, e).toTicks(),
      time: new rn(this.context, n).toTicks()
    });
    return this._addEvent(r, this._repeatedEvents);
  }
  /**
   * Schedule an event that will be removed after it is invoked.
   * @param callback The callback to invoke once.
   * @param time The time the callback should be invoked.
   * @returns The ID of the scheduled event.
   */
  scheduleOnce(t, e) {
    const n = new he(this, {
      callback: t,
      once: !0,
      time: new rn(this.context, e).toTicks()
    });
    return this._addEvent(n, this._timeline);
  }
  /**
   * Clear the passed in event id from the timeline
   * @param eventId The id of the event.
   */
  clear(t) {
    if (this._scheduledEvents.hasOwnProperty(t)) {
      const e = this._scheduledEvents[t.toString()];
      e.timeline.remove(e.event), e.event.dispose(), delete this._scheduledEvents[t.toString()];
    }
    return this;
  }
  /**
   * Add an event to the correct timeline. Keep track of the
   * timeline it was added to.
   * @returns the event id which was just added
   */
  _addEvent(t, e) {
    return this._scheduledEvents[t.id.toString()] = {
      event: t,
      timeline: e
    }, e.add(t), t.id;
  }
  /**
   * Remove scheduled events from the timeline after
   * the given time. Repeated events will be removed
   * if their startTime is after the given time
   * @param after Clear all events after this time.
   */
  cancel(t = 0) {
    const e = this.toTicks(t);
    return this._timeline.forEachFrom(e, (n) => this.clear(n.id)), this._repeatedEvents.forEachFrom(e, (n) => this.clear(n.id)), this;
  }
  //-------------------------------------
  // 	START/STOP/PAUSE
  //-------------------------------------
  /**
   * Bind start/stop/pause events from the clock and emit them.
   */
  _bindClockEvents() {
    this._clock.on("start", (t, e) => {
      e = new Ie(this.context, e).toSeconds(), this.emit("start", t, e);
    }), this._clock.on("stop", (t) => {
      this.emit("stop", t);
    }), this._clock.on("pause", (t) => {
      this.emit("pause", t);
    });
  }
  /**
   * Returns the playback state of the source, either "started", "stopped", or "paused"
   */
  get state() {
    return this._clock.getStateAtTime(this.now());
  }
  /**
   * Start the transport and all sources synced to the transport.
   * @param  time The time when the transport should start.
   * @param  offset The timeline offset to start the transport.
   * @example
   * // start the transport in one second starting at beginning of the 5th measure.
   * Tone.getTransport().start("+1", "4:0:0");
   */
  start(t, e) {
    this.context.resume();
    let n;
    return Z(e) && (n = this.toTicks(e)), this._clock.start(t, n), this;
  }
  /**
   * Stop the transport and all sources synced to the transport.
   * @param time The time when the transport should stop.
   * @example
   * Tone.getTransport().stop();
   */
  stop(t) {
    return this._clock.stop(t), this;
  }
  /**
   * Pause the transport and all sources synced to the transport.
   */
  pause(t) {
    return this._clock.pause(t), this;
  }
  /**
   * Toggle the current state of the transport. If it is
   * started, it will stop it, otherwise it will start the Transport.
   * @param  time The time of the event
   */
  toggle(t) {
    return t = this.toSeconds(t), this._clock.getStateAtTime(t) !== "started" ? this.start(t) : this.stop(t), this;
  }
  //-------------------------------------
  // 	SETTERS/GETTERS
  //-------------------------------------
  /**
   * The time signature as just the numerator over 4.
   * For example 4/4 would be just 4 and 6/8 would be 3.
   * @example
   * // common time
   * Tone.getTransport().timeSignature = 4;
   * // 7/8
   * Tone.getTransport().timeSignature = [7, 8];
   * // this will be reduced to a single number
   * Tone.getTransport().timeSignature; // returns 3.5
   */
  get timeSignature() {
    return this._timeSignature;
  }
  set timeSignature(t) {
    Lt(t) && (t = t[0] / t[1] * 4), this._timeSignature = t;
  }
  /**
   * When the Transport.loop = true, this is the starting position of the loop.
   */
  get loopStart() {
    return new qt(this.context, this._loopStart, "i").toSeconds();
  }
  set loopStart(t) {
    this._loopStart = this.toTicks(t);
  }
  /**
   * When the Transport.loop = true, this is the ending position of the loop.
   */
  get loopEnd() {
    return new qt(this.context, this._loopEnd, "i").toSeconds();
  }
  set loopEnd(t) {
    this._loopEnd = this.toTicks(t);
  }
  /**
   * If the transport loops or not.
   */
  get loop() {
    return this._loop.get(this.now());
  }
  set loop(t) {
    this._loop.set(t, this.now());
  }
  /**
   * Set the loop start and stop at the same time.
   * @example
   * // loop over the first measure
   * Tone.getTransport().setLoopPoints(0, "1m");
   * Tone.getTransport().loop = true;
   */
  setLoopPoints(t, e) {
    return this.loopStart = t, this.loopEnd = e, this;
  }
  /**
   * The swing value. Between 0-1 where 1 equal to the note + half the subdivision.
   */
  get swing() {
    return this._swingAmount;
  }
  set swing(t) {
    this._swingAmount = t;
  }
  /**
   * Set the subdivision which the swing will be applied to.
   * The default value is an 8th note. Value must be less
   * than a quarter note.
   */
  get swingSubdivision() {
    return new Ie(this.context, this._swingTicks).toNotation();
  }
  set swingSubdivision(t) {
    this._swingTicks = this.toTicks(t);
  }
  /**
   * The Transport's position in Bars:Beats:Sixteenths.
   * Setting the value will jump to that position right away.
   */
  get position() {
    const t = this.now(), e = this._clock.getTicksAtTime(t);
    return new Ie(this.context, e).toBarsBeatsSixteenths();
  }
  set position(t) {
    const e = this.toTicks(t);
    this.ticks = e;
  }
  /**
   * The Transport's position in seconds.
   * Setting the value will jump to that position right away.
   */
  get seconds() {
    return this._clock.seconds;
  }
  set seconds(t) {
    const e = this.now(), n = this._clock.frequency.timeToTicks(t, e);
    this.ticks = n;
  }
  /**
   * The Transport's loop position as a normalized value. Always
   * returns 0 if the Transport.loop = false.
   */
  get progress() {
    if (this.loop) {
      const t = this.now();
      return (this._clock.getTicksAtTime(t) - this._loopStart) / (this._loopEnd - this._loopStart);
    } else
      return 0;
  }
  /**
   * The Transport's current tick position.
   */
  get ticks() {
    return this._clock.ticks;
  }
  set ticks(t) {
    if (this._clock.ticks !== t) {
      const e = this.now();
      if (this.state === "started") {
        const n = this._clock.getTicksAtTime(e), i = this._clock.frequency.getDurationOfTicks(Math.ceil(n) - n, e), r = e + i;
        this.emit("stop", r), this._clock.setTicksAtTime(t, r), this.emit("start", r, this._clock.getSecondsAtTime(r));
      } else
        this.emit("ticks", e), this._clock.setTicksAtTime(t, e);
    }
  }
  /**
   * Get the clock's ticks at the given time.
   * @param  time  When to get the tick value
   * @return The tick value at the given time.
   */
  getTicksAtTime(t) {
    return this._clock.getTicksAtTime(t);
  }
  /**
   * Return the elapsed seconds at the given time.
   * @param  time  When to get the elapsed seconds
   * @return  The number of elapsed seconds
   */
  getSecondsAtTime(t) {
    return this._clock.getSecondsAtTime(t);
  }
  /**
   * Pulses Per Quarter note. This is the smallest resolution
   * the Transport timing supports. This should be set once
   * on initialization and not set again. Changing this value
   * after other objects have been created can cause problems.
   */
  get PPQ() {
    return this._clock.frequency.multiplier;
  }
  set PPQ(t) {
    this._clock.frequency.multiplier = t;
  }
  //-------------------------------------
  // 	SYNCING
  //-------------------------------------
  /**
   * Returns the time aligned to the next subdivision
   * of the Transport. If the Transport is not started,
   * it will return 0.
   * Note: this will not work precisely during tempo ramps.
   * @param  subdivision  The subdivision to quantize to
   * @return  The context time of the next subdivision.
   * @example
   * // the transport must be started, otherwise returns 0
   * Tone.getTransport().start();
   * Tone.getTransport().nextSubdivision("4n");
   */
  nextSubdivision(t) {
    if (t = this.toTicks(t), this.state !== "started")
      return 0;
    {
      const e = this.now(), n = this.getTicksAtTime(e), i = t - n % t;
      return this._clock.nextTickTime(i, e);
    }
  }
  /**
   * Attaches the signal to the tempo control signal so that
   * any changes in the tempo will change the signal in the same
   * ratio.
   *
   * @param signal
   * @param ratio Optionally pass in the ratio between the two signals.
   * 			Otherwise it will be computed based on their current values.
   */
  syncSignal(t, e) {
    const n = this.now();
    let i = this.bpm, r = 1 / (60 / i.getValueAtTime(n) / this.PPQ), o = [];
    if (t.units === "time") {
      const c = 0.015625 / r, u = new U(c), l = new wn(-1), h = new U(c);
      i.chain(u, l, h), i = h, r = 1 / r, o = [u, l, h];
    }
    e || (t.getValueAtTime(n) !== 0 ? e = t.getValueAtTime(n) / r : e = 0);
    const a = new U(e);
    return i.connect(a), a.connect(t._param), o.push(a), this._syncedSignals.push({
      initial: t.value,
      nodes: o,
      signal: t
    }), t.value = 0, this;
  }
  /**
   * Unsyncs a previously synced signal from the transport's control.
   * @see {@link syncSignal}.
   */
  unsyncSignal(t) {
    for (let e = this._syncedSignals.length - 1; e >= 0; e--) {
      const n = this._syncedSignals[e];
      n.signal === t && (n.nodes.forEach((i) => i.dispose()), n.signal.value = n.initial, this._syncedSignals.splice(e, 1));
    }
    return this;
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._clock.dispose(), ti(this, "bpm"), this._timeline.dispose(), this._repeatedEvents.dispose(), this;
  }
}
yn.mixin(rs);
Kn((s) => {
  s.transport = new rs({ context: s });
});
ts((s) => {
  s.transport.dispose();
});
class xt extends R {
  constructor(t) {
    super(t), this.input = void 0, this._state = new ni("stopped"), this._synced = !1, this._scheduled = [], this._syncedStart = Q, this._syncedStop = Q, this._state.memory = 100, this._state.increasing = !0, this._volume = this.output = new He({
      context: this.context,
      mute: t.mute,
      volume: t.volume
    }), this.volume = this._volume.volume, Y(this, "volume"), this.onstop = t.onstop;
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      mute: !1,
      onstop: Q,
      volume: 0
    });
  }
  /**
   * Returns the playback state of the source, either "started" or "stopped".
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/ahntone_c3.mp3", () => {
   * 	player.start();
   * 	console.log(player.state);
   * }).toDestination();
   */
  get state() {
    return this._synced ? this.context.transport.state === "started" ? this._state.getValueAtTime(this.context.transport.seconds) : "stopped" : this._state.getValueAtTime(this.now());
  }
  /**
   * Mute the output.
   * @example
   * const osc = new Tone.Oscillator().toDestination().start();
   * // mute the output
   * osc.mute = true;
   */
  get mute() {
    return this._volume.mute;
  }
  set mute(t) {
    this._volume.mute = t;
  }
  /**
   * Ensure that the scheduled time is not before the current time.
   * Should only be used when scheduled unsynced.
   */
  _clampToCurrentTime(t) {
    return this._synced ? t : Math.max(t, this.context.currentTime);
  }
  /**
   * Start the source at the specified time. If no time is given,
   * start the source now.
   * @param  time When the source should be started.
   * @example
   * const source = new Tone.Oscillator().toDestination();
   * source.start("+0.5"); // starts the source 0.5 seconds from now
   */
  start(t, e, n) {
    let i = Pt(t) && this._synced ? this.context.transport.seconds : this.toSeconds(t);
    if (i = this._clampToCurrentTime(i), !this._synced && this._state.getValueAtTime(i) === "started")
      j(qe(i, this._state.get(i).time), "Start time must be strictly greater than previous start time"), this._state.cancel(i), this._state.setStateAtTime("started", i), this.log("restart", i), this.restart(i, e, n);
    else if (this.log("start", i), this._state.setStateAtTime("started", i), this._synced) {
      const r = this._state.get(i);
      r && (r.offset = this.toSeconds(Pe(e, 0)), r.duration = n ? this.toSeconds(n) : void 0);
      const o = this.context.transport.schedule((a) => {
        this._start(a, e, n);
      }, i);
      this._scheduled.push(o), this.context.transport.state === "started" && this.context.transport.getSecondsAtTime(this.immediate()) > i && this._syncedStart(this.now(), this.context.transport.seconds);
    } else
      $r(this.context), this._start(i, e, n);
    return this;
  }
  /**
   * Stop the source at the specified time. If no time is given,
   * stop the source now.
   * @param  time When the source should be stopped.
   * @example
   * const source = new Tone.Oscillator().toDestination();
   * source.start();
   * source.stop("+0.5"); // stops the source 0.5 seconds from now
   */
  stop(t) {
    let e = Pt(t) && this._synced ? this.context.transport.seconds : this.toSeconds(t);
    if (e = this._clampToCurrentTime(e), this._state.getValueAtTime(e) === "started" || Z(this._state.getNextState("started", e))) {
      if (this.log("stop", e), !this._synced)
        this._stop(e);
      else {
        const n = this.context.transport.schedule(this._stop.bind(this), e);
        this._scheduled.push(n);
      }
      this._state.cancel(e), this._state.setStateAtTime("stopped", e);
    }
    return this;
  }
  /**
   * Restart the source.
   */
  restart(t, e, n) {
    return t = this.toSeconds(t), this._state.getValueAtTime(t) === "started" && (this._state.cancel(t), this._restart(t, e, n)), this;
  }
  /**
   * Sync the source to the Transport so that all subsequent
   * calls to `start` and `stop` are synced to the TransportTime
   * instead of the AudioContext time.
   *
   * @example
   * const osc = new Tone.Oscillator().toDestination();
   * // sync the source so that it plays between 0 and 0.3 on the Transport's timeline
   * osc.sync().start(0).stop(0.3);
   * // start the transport.
   * Tone.Transport.start();
   * // set it to loop once a second
   * Tone.Transport.loop = true;
   * Tone.Transport.loopEnd = 1;
   */
  sync() {
    return this._synced || (this._synced = !0, this._syncedStart = (t, e) => {
      if (qe(e, 0)) {
        const n = this._state.get(e);
        if (n && n.state === "started" && n.time !== e) {
          const i = e - this.toSeconds(n.time);
          let r;
          n.duration && (r = this.toSeconds(n.duration) - i), this._start(t, this.toSeconds(n.offset) + i, r);
        }
      }
    }, this._syncedStop = (t) => {
      const e = this.context.transport.getSecondsAtTime(Math.max(t - this.sampleTime, 0));
      this._state.getValueAtTime(e) === "started" && this._stop(t);
    }, this.context.transport.on("start", this._syncedStart), this.context.transport.on("loopStart", this._syncedStart), this.context.transport.on("stop", this._syncedStop), this.context.transport.on("pause", this._syncedStop), this.context.transport.on("loopEnd", this._syncedStop)), this;
  }
  /**
   * Unsync the source to the Transport.
   * @see {@link sync}
   */
  unsync() {
    return this._synced && (this.context.transport.off("stop", this._syncedStop), this.context.transport.off("pause", this._syncedStop), this.context.transport.off("loopEnd", this._syncedStop), this.context.transport.off("start", this._syncedStart), this.context.transport.off("loopStart", this._syncedStart)), this._synced = !1, this._scheduled.forEach((t) => this.context.transport.clear(t)), this._scheduled = [], this._state.cancel(0), this._stop(0), this;
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this.onstop = Q, this.unsync(), this._volume.dispose(), this._state.dispose(), this;
  }
}
class Tn extends Le {
  constructor() {
    const t = I(Tn.getDefaults(), arguments, ["url", "onload"]);
    super(t), this.name = "ToneBufferSource", this._source = this.context.createBufferSource(), this._internalChannels = [this._source], this._sourceStarted = !1, this._sourceStopped = !1, jt(this._source, this._gainNode), this._source.onended = () => this._stopSource(), this.playbackRate = new X({
      context: this.context,
      param: this._source.playbackRate,
      units: "positive",
      value: t.playbackRate
    }), this.loop = t.loop, this.loopStart = t.loopStart, this.loopEnd = t.loopEnd, this._buffer = new et(t.url, t.onload, t.onerror), this._internalChannels.push(this._source);
  }
  static getDefaults() {
    return Object.assign(Le.getDefaults(), {
      url: new et(),
      loop: !1,
      loopEnd: 0,
      loopStart: 0,
      onload: Q,
      onerror: Q,
      playbackRate: 1
    });
  }
  /**
   * The fadeIn time of the amplitude envelope.
   */
  get fadeIn() {
    return this._fadeIn;
  }
  set fadeIn(t) {
    this._fadeIn = t;
  }
  /**
   * The fadeOut time of the amplitude envelope.
   */
  get fadeOut() {
    return this._fadeOut;
  }
  set fadeOut(t) {
    this._fadeOut = t;
  }
  /**
   * The curve applied to the fades, either "linear" or "exponential"
   */
  get curve() {
    return this._curve;
  }
  set curve(t) {
    this._curve = t;
  }
  /**
   * Start the buffer
   * @param  time When the player should start.
   * @param  offset The offset from the beginning of the sample to start at.
   * @param  duration How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
   * @param  gain  The gain to play the buffer back at.
   */
  start(t, e, n, i = 1) {
    j(this.buffer.loaded, "buffer is either not set or not loaded");
    const r = this.toSeconds(t);
    this._startGain(r, i), this.loop ? e = Pe(e, this.loopStart) : e = Pe(e, 0);
    let o = Math.max(this.toSeconds(e), 0);
    if (this.loop) {
      const a = this.toSeconds(this.loopEnd) || this.buffer.duration, c = this.toSeconds(this.loopStart), u = a - c;
      Ns(o, a) && (o = (o - c) % u + c), Vt(o, this.buffer.duration) && (o = 0);
    }
    if (this._source.buffer = this.buffer.get(), this._source.loopEnd = this.toSeconds(this.loopEnd) || this.buffer.duration, Bn(o, this.buffer.duration) && (this._sourceStarted = !0, this._source.start(r, o)), Z(n)) {
      let a = this.toSeconds(n);
      a = Math.max(a, 0), this.stop(r + a);
    }
    return this;
  }
  _stopSource(t) {
    !this._sourceStopped && this._sourceStarted && (this._sourceStopped = !0, this._source.stop(this.toSeconds(t)), this._onended());
  }
  /**
   * If loop is true, the loop will start at this position.
   */
  get loopStart() {
    return this._source.loopStart;
  }
  set loopStart(t) {
    this._source.loopStart = this.toSeconds(t);
  }
  /**
   * If loop is true, the loop will end at this position.
   */
  get loopEnd() {
    return this._source.loopEnd;
  }
  set loopEnd(t) {
    this._source.loopEnd = this.toSeconds(t);
  }
  /**
   * The audio buffer belonging to the player.
   */
  get buffer() {
    return this._buffer;
  }
  set buffer(t) {
    this._buffer.set(t);
  }
  /**
   * If the buffer should loop once it's over.
   */
  get loop() {
    return this._source.loop;
  }
  set loop(t) {
    this._source.loop = t, this._sourceStarted && this.cancelStop();
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._source.onended = null, this._source.disconnect(), this._buffer.dispose(), this.playbackRate.dispose(), this;
  }
}
class ye extends xt {
  constructor() {
    const t = I(ye.getDefaults(), arguments, [
      "type"
    ]);
    super(t), this.name = "Noise", this._source = null, this._playbackRate = t.playbackRate, this.type = t.type, this._fadeIn = t.fadeIn, this._fadeOut = t.fadeOut;
  }
  static getDefaults() {
    return Object.assign(xt.getDefaults(), {
      fadeIn: 0,
      fadeOut: 0,
      playbackRate: 1,
      type: "white"
    });
  }
  /**
   * The type of the noise. Can be "white", "brown", or "pink".
   * @example
   * const noise = new Tone.Noise().toDestination().start();
   * noise.type = "brown";
   */
  get type() {
    return this._type;
  }
  set type(t) {
    if (j(t in Zi, "Noise: invalid type: " + t), this._type !== t && (this._type = t, this.state === "started")) {
      const e = this.now();
      this._stop(e), this._start(e);
    }
  }
  /**
   * The playback rate of the noise. Affects
   * the "frequency" of the noise.
   */
  get playbackRate() {
    return this._playbackRate;
  }
  set playbackRate(t) {
    this._playbackRate = t, this._source && (this._source.playbackRate.value = t);
  }
  /**
   * internal start method
   */
  _start(t) {
    const e = Zi[this._type];
    this._source = new Tn({
      url: e,
      context: this.context,
      fadeIn: this._fadeIn,
      fadeOut: this._fadeOut,
      loop: !0,
      onended: () => this.onstop(this),
      playbackRate: this._playbackRate
    }).connect(this.output), this._source.start(this.toSeconds(t), Math.random() * (e.duration - 1e-3));
  }
  /**
   * internal stop method
   */
  _stop(t) {
    this._source && (this._source.stop(this.toSeconds(t)), this._source = null);
  }
  /**
   * The fadeIn time of the amplitude envelope.
   */
  get fadeIn() {
    return this._fadeIn;
  }
  set fadeIn(t) {
    this._fadeIn = t, this._source && (this._source.fadeIn = this._fadeIn);
  }
  /**
   * The fadeOut time of the amplitude envelope.
   */
  get fadeOut() {
    return this._fadeOut;
  }
  set fadeOut(t) {
    this._fadeOut = t, this._source && (this._source.fadeOut = this._fadeOut);
  }
  _restart(t) {
    this._stop(t), this._start(t);
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._source && this._source.disconnect(), this;
  }
}
const Ne = 44100 * 5, gs = 2, Qt = {
  brown: null,
  pink: null,
  white: null
}, Zi = {
  get brown() {
    if (!Qt.brown) {
      const s = [];
      for (let t = 0; t < gs; t++) {
        const e = new Float32Array(Ne);
        s[t] = e;
        let n = 0;
        for (let i = 0; i < Ne; i++) {
          const r = Math.random() * 2 - 1;
          e[i] = (n + 0.02 * r) / 1.02, n = e[i], e[i] *= 3.5;
        }
      }
      Qt.brown = new et().fromArray(s);
    }
    return Qt.brown;
  },
  get pink() {
    if (!Qt.pink) {
      const s = [];
      for (let t = 0; t < gs; t++) {
        const e = new Float32Array(Ne);
        s[t] = e;
        let n, i, r, o, a, c, u;
        n = i = r = o = a = c = u = 0;
        for (let l = 0; l < Ne; l++) {
          const h = Math.random() * 2 - 1;
          n = 0.99886 * n + h * 0.0555179, i = 0.99332 * i + h * 0.0750759, r = 0.969 * r + h * 0.153852, o = 0.8665 * o + h * 0.3104856, a = 0.55 * a + h * 0.5329522, c = -0.7616 * c - h * 0.016898, e[l] = n + i + r + o + a + c + u + h * 0.5362, e[l] *= 0.11, u = h * 0.115926;
        }
      }
      Qt.pink = new et().fromArray(s);
    }
    return Qt.pink;
  },
  get white() {
    if (!Qt.white) {
      const s = [];
      for (let t = 0; t < gs; t++) {
        const e = new Float32Array(Ne);
        s[t] = e;
        for (let n = 0; n < Ne; n++)
          e[n] = Math.random() * 2 - 1;
      }
      Qt.white = new et().fromArray(s);
    }
    return Qt.white;
  }
};
function Ce(s, t) {
  return ht(this, void 0, void 0, function* () {
    const e = t / s.context.sampleRate, n = new es(1, e, s.context.sampleRate);
    return new s.constructor(Object.assign(s.get(), {
      // should do 2 iterations
      frequency: 2 / e,
      // zero out the detune
      detune: 0,
      context: n
    })).toDestination().start(0), (yield n.render()).getChannelData(0);
  });
}
class li extends Le {
  constructor() {
    const t = I(li.getDefaults(), arguments, ["frequency", "type"]);
    super(t), this.name = "ToneOscillatorNode", this._oscillator = this.context.createOscillator(), this._internalChannels = [this._oscillator], jt(this._oscillator, this._gainNode), this.type = t.type, this.frequency = new X({
      context: this.context,
      param: this._oscillator.frequency,
      units: "frequency",
      value: t.frequency
    }), this.detune = new X({
      context: this.context,
      param: this._oscillator.detune,
      units: "cents",
      value: t.detune
    }), Y(this, ["frequency", "detune"]);
  }
  static getDefaults() {
    return Object.assign(Le.getDefaults(), {
      detune: 0,
      frequency: 440,
      type: "sine"
    });
  }
  /**
   * Start the oscillator node at the given time
   * @param  time When to start the oscillator
   */
  start(t) {
    const e = this.toSeconds(t);
    return this.log("start", e), this._startGain(e), this._oscillator.start(e), this;
  }
  _stopSource(t) {
    this._oscillator.stop(t);
  }
  /**
   * Sets an arbitrary custom periodic waveform given a PeriodicWave.
   * @param  periodicWave PeriodicWave should be created with context.createPeriodicWave
   */
  setPeriodicWave(t) {
    return this._oscillator.setPeriodicWave(t), this;
  }
  /**
   * The oscillator type. Either 'sine', 'sawtooth', 'square', or 'triangle'
   */
  get type() {
    return this._oscillator.type;
  }
  set type(t) {
    this._oscillator.type = t;
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this.state === "started" && this.stop(), this._oscillator.disconnect(), this.frequency.dispose(), this.detune.dispose(), this;
  }
}
class at extends xt {
  constructor() {
    const t = I(at.getDefaults(), arguments, ["frequency", "type"]);
    super(t), this.name = "Oscillator", this._oscillator = null, this.frequency = new z({
      context: this.context,
      units: "frequency",
      value: t.frequency
    }), Y(this, "frequency"), this.detune = new z({
      context: this.context,
      units: "cents",
      value: t.detune
    }), Y(this, "detune"), this._partials = t.partials, this._partialCount = t.partialCount, this._type = t.type, t.partialCount && t.type !== "custom" && (this._type = this.baseType + t.partialCount.toString()), this.phase = t.phase;
  }
  static getDefaults() {
    return Object.assign(xt.getDefaults(), {
      detune: 0,
      frequency: 440,
      partialCount: 0,
      partials: [],
      phase: 0,
      type: "sine"
    });
  }
  /**
   * start the oscillator
   */
  _start(t) {
    const e = this.toSeconds(t), n = new li({
      context: this.context,
      onended: () => this.onstop(this)
    });
    this._oscillator = n, this._wave ? this._oscillator.setPeriodicWave(this._wave) : this._oscillator.type = this._type, this._oscillator.connect(this.output), this.frequency.connect(this._oscillator.frequency), this.detune.connect(this._oscillator.detune), this._oscillator.start(e);
  }
  /**
   * stop the oscillator
   */
  _stop(t) {
    const e = this.toSeconds(t);
    this._oscillator && this._oscillator.stop(e);
  }
  /**
   * Restart the oscillator. Does not stop the oscillator, but instead
   * just cancels any scheduled 'stop' from being invoked.
   */
  _restart(t) {
    const e = this.toSeconds(t);
    return this.log("restart", e), this._oscillator && this._oscillator.cancelStop(), this._state.cancel(e), this;
  }
  /**
   * Sync the signal to the Transport's bpm. Any changes to the transports bpm,
   * will also affect the oscillators frequency.
   * @example
   * const osc = new Tone.Oscillator().toDestination().start();
   * osc.frequency.value = 440;
   * // the ratio between the bpm and the frequency will be maintained
   * osc.syncFrequency();
   * // double the tempo
   * Tone.Transport.bpm.value *= 2;
   * // the frequency of the oscillator is doubled to 880
   */
  syncFrequency() {
    return this.context.transport.syncSignal(this.frequency), this;
  }
  /**
   * Unsync the oscillator's frequency from the Transport.
   * @see {@link syncFrequency}
   */
  unsyncFrequency() {
    return this.context.transport.unsyncSignal(this.frequency), this;
  }
  /**
   * Get a cached periodic wave. Avoids having to recompute
   * the oscillator values when they have already been computed
   * with the same values.
   */
  _getCachedPeriodicWave() {
    if (this._type === "custom")
      return at._periodicWaveCache.find((e) => e.phase === this._phase && Ph(e.partials, this._partials));
    {
      const t = at._periodicWaveCache.find((e) => e.type === this._type && e.phase === this._phase);
      return this._partialCount = t ? t.partialCount : this._partialCount, t;
    }
  }
  get type() {
    return this._type;
  }
  set type(t) {
    this._type = t;
    const e = ["sine", "square", "sawtooth", "triangle"].indexOf(t) !== -1;
    if (this._phase === 0 && e)
      this._wave = void 0, this._partialCount = 0, this._oscillator !== null && (this._oscillator.type = t);
    else {
      const n = this._getCachedPeriodicWave();
      if (Z(n)) {
        const { partials: i, wave: r } = n;
        this._wave = r, this._partials = i, this._oscillator !== null && this._oscillator.setPeriodicWave(this._wave);
      } else {
        const [i, r] = this._getRealImaginary(t, this._phase), o = this.context.createPeriodicWave(i, r);
        this._wave = o, this._oscillator !== null && this._oscillator.setPeriodicWave(this._wave), at._periodicWaveCache.push({
          imag: r,
          partialCount: this._partialCount,
          partials: this._partials,
          phase: this._phase,
          real: i,
          type: this._type,
          wave: this._wave
        }), at._periodicWaveCache.length > 100 && at._periodicWaveCache.shift();
      }
    }
  }
  get baseType() {
    return this._type.replace(this.partialCount.toString(), "");
  }
  set baseType(t) {
    this.partialCount && this._type !== "custom" && t !== "custom" ? this.type = t + this.partialCount : this.type = t;
  }
  get partialCount() {
    return this._partialCount;
  }
  set partialCount(t) {
    Mt(t, 0);
    let e = this._type;
    const n = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(this._type);
    if (n && (e = n[1]), this._type !== "custom")
      t === 0 ? this.type = e : this.type = e + t.toString();
    else {
      const i = new Float32Array(t);
      this._partials.forEach((r, o) => i[o] = r), this._partials = Array.from(i), this.type = this._type;
    }
  }
  /**
   * Returns the real and imaginary components based
   * on the oscillator type.
   * @returns [real: Float32Array, imaginary: Float32Array]
   */
  _getRealImaginary(t, e) {
    let i = 2048;
    const r = new Float32Array(i), o = new Float32Array(i);
    let a = 1;
    if (t === "custom") {
      if (a = this._partials.length + 1, this._partialCount = this._partials.length, i = a, this._partials.length === 0)
        return [r, o];
    } else {
      const c = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(t);
      c ? (a = parseInt(c[2], 10) + 1, this._partialCount = parseInt(c[2], 10), t = c[1], a = Math.max(a, 2), i = a) : this._partialCount = 0, this._partials = [];
    }
    for (let c = 1; c < i; ++c) {
      const u = 2 / (c * Math.PI);
      let l;
      switch (t) {
        case "sine":
          l = c <= a ? 1 : 0, this._partials[c - 1] = l;
          break;
        case "square":
          l = c & 1 ? 2 * u : 0, this._partials[c - 1] = l;
          break;
        case "sawtooth":
          l = u * (c & 1 ? 1 : -1), this._partials[c - 1] = l;
          break;
        case "triangle":
          c & 1 ? l = 2 * (u * u) * (c - 1 >> 1 & 1 ? -1 : 1) : l = 0, this._partials[c - 1] = l;
          break;
        case "custom":
          l = this._partials[c - 1];
          break;
        default:
          throw new TypeError("Oscillator: invalid type: " + t);
      }
      l !== 0 ? (r[c] = -l * Math.sin(e * c), o[c] = l * Math.cos(e * c)) : (r[c] = 0, o[c] = 0);
    }
    return [r, o];
  }
  /**
   * Compute the inverse FFT for a given phase.
   */
  _inverseFFT(t, e, n) {
    let i = 0;
    const r = t.length;
    for (let o = 0; o < r; o++)
      i += t[o] * Math.cos(o * n) + e[o] * Math.sin(o * n);
    return i;
  }
  /**
   * Returns the initial value of the oscillator when stopped.
   * E.g. a "sine" oscillator with phase = 90 would return an initial value of -1.
   */
  getInitialValue() {
    const [t, e] = this._getRealImaginary(this._type, 0);
    let n = 0;
    const i = Math.PI * 2, r = 32;
    for (let o = 0; o < r; o++)
      n = Math.max(this._inverseFFT(t, e, o / r * i), n);
    return Vh(-this._inverseFFT(t, e, this._phase) / n, -1, 1);
  }
  get partials() {
    return this._partials.slice(0, this.partialCount);
  }
  set partials(t) {
    this._partials = t, this._partialCount = this._partials.length, t.length && (this.type = "custom");
  }
  get phase() {
    return this._phase * (180 / Math.PI);
  }
  set phase(t) {
    this._phase = t * Math.PI / 180, this.type = this._type;
  }
  asArray() {
    return ht(this, arguments, void 0, function* (t = 1024) {
      return Ce(this, t);
    });
  }
  dispose() {
    return super.dispose(), this._oscillator !== null && this._oscillator.dispose(), this._wave = void 0, this.frequency.dispose(), this.detune.dispose(), this;
  }
}
at._periodicWaveCache = [];
class hi extends Et {
  constructor() {
    super(...arguments), this.name = "AudioToGain", this._norm = new ie({
      context: this.context,
      mapping: (t) => (t + 1) / 2
    }), this.input = this._norm, this.output = this._norm;
  }
  /**
   * clean up
   */
  dispose() {
    return super.dispose(), this._norm.dispose(), this;
  }
}
class $t extends z {
  constructor() {
    const t = I($t.getDefaults(), arguments, ["value"]);
    super(t), this.name = "Multiply", this.override = !1, this._mult = this.input = this.output = new U({
      context: this.context,
      minValue: t.minValue,
      maxValue: t.maxValue
    }), this.factor = this._param = this._mult.gain, this.factor.setValueAtTime(t.value, 0);
  }
  static getDefaults() {
    return Object.assign(z.getDefaults(), {
      value: 0
    });
  }
  dispose() {
    return super.dispose(), this._mult.dispose(), this;
  }
}
class bn extends xt {
  constructor() {
    const t = I(bn.getDefaults(), arguments, ["frequency", "type", "modulationType"]);
    super(t), this.name = "AMOscillator", this._modulationScale = new hi({ context: this.context }), this._modulationNode = new U({
      context: this.context
    }), this._carrier = new at({
      context: this.context,
      detune: t.detune,
      frequency: t.frequency,
      onstop: () => this.onstop(this),
      phase: t.phase,
      type: t.type
    }), this.frequency = this._carrier.frequency, this.detune = this._carrier.detune, this._modulator = new at({
      context: this.context,
      phase: t.phase,
      type: t.modulationType
    }), this.harmonicity = new $t({
      context: this.context,
      units: "positive",
      value: t.harmonicity
    }), this.frequency.chain(this.harmonicity, this._modulator.frequency), this._modulator.chain(this._modulationScale, this._modulationNode.gain), this._carrier.chain(this._modulationNode, this.output), Y(this, ["frequency", "detune", "harmonicity"]);
  }
  static getDefaults() {
    return Object.assign(at.getDefaults(), {
      harmonicity: 1,
      modulationType: "square"
    });
  }
  /**
   * start the oscillator
   */
  _start(t) {
    this._modulator.start(t), this._carrier.start(t);
  }
  /**
   * stop the oscillator
   */
  _stop(t) {
    this._modulator.stop(t), this._carrier.stop(t);
  }
  _restart(t) {
    this._modulator.restart(t), this._carrier.restart(t);
  }
  /**
   * The type of the carrier oscillator
   */
  get type() {
    return this._carrier.type;
  }
  set type(t) {
    this._carrier.type = t;
  }
  get baseType() {
    return this._carrier.baseType;
  }
  set baseType(t) {
    this._carrier.baseType = t;
  }
  get partialCount() {
    return this._carrier.partialCount;
  }
  set partialCount(t) {
    this._carrier.partialCount = t;
  }
  /**
   * The type of the modulator oscillator
   */
  get modulationType() {
    return this._modulator.type;
  }
  set modulationType(t) {
    this._modulator.type = t;
  }
  get phase() {
    return this._carrier.phase;
  }
  set phase(t) {
    this._carrier.phase = t, this._modulator.phase = t;
  }
  get partials() {
    return this._carrier.partials;
  }
  set partials(t) {
    this._carrier.partials = t;
  }
  asArray() {
    return ht(this, arguments, void 0, function* (t = 1024) {
      return Ce(this, t);
    });
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this.frequency.dispose(), this.detune.dispose(), this.harmonicity.dispose(), this._carrier.dispose(), this._modulator.dispose(), this._modulationNode.dispose(), this._modulationScale.dispose(), this;
  }
}
class xn extends xt {
  constructor() {
    const t = I(xn.getDefaults(), arguments, ["frequency", "type", "modulationType"]);
    super(t), this.name = "FMOscillator", this._modulationNode = new U({
      context: this.context,
      gain: 0
    }), this._carrier = new at({
      context: this.context,
      detune: t.detune,
      frequency: 0,
      onstop: () => this.onstop(this),
      phase: t.phase,
      type: t.type
    }), this.detune = this._carrier.detune, this.frequency = new z({
      context: this.context,
      units: "frequency",
      value: t.frequency
    }), this._modulator = new at({
      context: this.context,
      phase: t.phase,
      type: t.modulationType
    }), this.harmonicity = new $t({
      context: this.context,
      units: "positive",
      value: t.harmonicity
    }), this.modulationIndex = new $t({
      context: this.context,
      units: "positive",
      value: t.modulationIndex
    }), this.frequency.connect(this._carrier.frequency), this.frequency.chain(this.harmonicity, this._modulator.frequency), this.frequency.chain(this.modulationIndex, this._modulationNode), this._modulator.connect(this._modulationNode.gain), this._modulationNode.connect(this._carrier.frequency), this._carrier.connect(this.output), this.detune.connect(this._modulator.detune), Y(this, [
      "modulationIndex",
      "frequency",
      "detune",
      "harmonicity"
    ]);
  }
  static getDefaults() {
    return Object.assign(at.getDefaults(), {
      harmonicity: 1,
      modulationIndex: 2,
      modulationType: "square"
    });
  }
  /**
   * start the oscillator
   */
  _start(t) {
    this._modulator.start(t), this._carrier.start(t);
  }
  /**
   * stop the oscillator
   */
  _stop(t) {
    this._modulator.stop(t), this._carrier.stop(t);
  }
  _restart(t) {
    return this._modulator.restart(t), this._carrier.restart(t), this;
  }
  get type() {
    return this._carrier.type;
  }
  set type(t) {
    this._carrier.type = t;
  }
  get baseType() {
    return this._carrier.baseType;
  }
  set baseType(t) {
    this._carrier.baseType = t;
  }
  get partialCount() {
    return this._carrier.partialCount;
  }
  set partialCount(t) {
    this._carrier.partialCount = t;
  }
  /**
   * The type of the modulator oscillator
   */
  get modulationType() {
    return this._modulator.type;
  }
  set modulationType(t) {
    this._modulator.type = t;
  }
  get phase() {
    return this._carrier.phase;
  }
  set phase(t) {
    this._carrier.phase = t, this._modulator.phase = t;
  }
  get partials() {
    return this._carrier.partials;
  }
  set partials(t) {
    this._carrier.partials = t;
  }
  asArray() {
    return ht(this, arguments, void 0, function* (t = 1024) {
      return Ce(this, t);
    });
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this.frequency.dispose(), this.harmonicity.dispose(), this._carrier.dispose(), this._modulator.dispose(), this._modulationNode.dispose(), this.modulationIndex.dispose(), this;
  }
}
class Qe extends xt {
  constructor() {
    const t = I(Qe.getDefaults(), arguments, ["frequency", "width"]);
    super(t), this.name = "PulseOscillator", this._widthGate = new U({
      context: this.context,
      gain: 0
    }), this._thresh = new ie({
      context: this.context,
      mapping: (e) => e <= 0 ? -1 : 1
    }), this.width = new z({
      context: this.context,
      units: "audioRange",
      value: t.width
    }), this._triangle = new at({
      context: this.context,
      detune: t.detune,
      frequency: t.frequency,
      onstop: () => this.onstop(this),
      phase: t.phase,
      type: "triangle"
    }), this.frequency = this._triangle.frequency, this.detune = this._triangle.detune, this._triangle.chain(this._thresh, this.output), this.width.chain(this._widthGate, this._thresh), Y(this, ["width", "frequency", "detune"]);
  }
  static getDefaults() {
    return Object.assign(xt.getDefaults(), {
      detune: 0,
      frequency: 440,
      phase: 0,
      type: "pulse",
      width: 0.2
    });
  }
  /**
   * start the oscillator
   */
  _start(t) {
    t = this.toSeconds(t), this._triangle.start(t), this._widthGate.gain.setValueAtTime(1, t);
  }
  /**
   * stop the oscillator
   */
  _stop(t) {
    t = this.toSeconds(t), this._triangle.stop(t), this._widthGate.gain.cancelScheduledValues(t), this._widthGate.gain.setValueAtTime(0, t);
  }
  _restart(t) {
    this._triangle.restart(t), this._widthGate.gain.cancelScheduledValues(t), this._widthGate.gain.setValueAtTime(1, t);
  }
  /**
   * The phase of the oscillator in degrees.
   */
  get phase() {
    return this._triangle.phase;
  }
  set phase(t) {
    this._triangle.phase = t;
  }
  /**
   * The type of the oscillator. Always returns "pulse".
   */
  get type() {
    return "pulse";
  }
  /**
   * The baseType of the oscillator. Always returns "pulse".
   */
  get baseType() {
    return "pulse";
  }
  /**
   * The partials of the waveform. Cannot set partials for this waveform type
   */
  get partials() {
    return [];
  }
  /**
   * No partials for this waveform type.
   */
  get partialCount() {
    return 0;
  }
  /**
   * *Internal use* The carrier oscillator type is fed through the
   * waveshaper node to create the pulse. Using different carrier oscillators
   * changes oscillator's behavior.
   */
  set carrierType(t) {
    this._triangle.type = t;
  }
  asArray() {
    return ht(this, arguments, void 0, function* (t = 1024) {
      return Ce(this, t);
    });
  }
  /**
   * Clean up method.
   */
  dispose() {
    return super.dispose(), this._triangle.dispose(), this.width.dispose(), this._widthGate.dispose(), this._thresh.dispose(), this;
  }
}
class Cn extends xt {
  constructor() {
    const t = I(Cn.getDefaults(), arguments, ["frequency", "type", "spread"]);
    super(t), this.name = "FatOscillator", this._oscillators = [], this.frequency = new z({
      context: this.context,
      units: "frequency",
      value: t.frequency
    }), this.detune = new z({
      context: this.context,
      units: "cents",
      value: t.detune
    }), this._spread = t.spread, this._type = t.type, this._phase = t.phase, this._partials = t.partials, this._partialCount = t.partialCount, this.count = t.count, Y(this, ["frequency", "detune"]);
  }
  static getDefaults() {
    return Object.assign(at.getDefaults(), {
      count: 3,
      spread: 20,
      type: "sawtooth"
    });
  }
  /**
   * start the oscillator
   */
  _start(t) {
    t = this.toSeconds(t), this._forEach((e) => e.start(t));
  }
  /**
   * stop the oscillator
   */
  _stop(t) {
    t = this.toSeconds(t), this._forEach((e) => e.stop(t));
  }
  _restart(t) {
    this._forEach((e) => e.restart(t));
  }
  /**
   * Iterate over all of the oscillators
   */
  _forEach(t) {
    for (let e = 0; e < this._oscillators.length; e++)
      t(this._oscillators[e], e);
  }
  /**
   * The type of the oscillator
   */
  get type() {
    return this._type;
  }
  set type(t) {
    this._type = t, this._forEach((e) => e.type = t);
  }
  /**
   * The detune spread between the oscillators. If "count" is
   * set to 3 oscillators and the "spread" is set to 40,
   * the three oscillators would be detuned like this: [-20, 0, 20]
   * for a total detune spread of 40 cents.
   * @example
   * const fatOsc = new Tone.FatOscillator().toDestination().start();
   * fatOsc.spread = 70;
   */
  get spread() {
    return this._spread;
  }
  set spread(t) {
    if (this._spread = t, this._oscillators.length > 1) {
      const e = -t / 2, n = t / (this._oscillators.length - 1);
      this._forEach((i, r) => i.detune.value = e + n * r);
    }
  }
  /**
   * The number of detuned oscillators. Must be an integer greater than 1.
   * @example
   * const fatOsc = new Tone.FatOscillator("C#3", "sawtooth").toDestination().start();
   * // use 4 sawtooth oscillators
   * fatOsc.count = 4;
   */
  get count() {
    return this._oscillators.length;
  }
  set count(t) {
    if (Mt(t, 1), this._oscillators.length !== t) {
      this._forEach((e) => e.dispose()), this._oscillators = [];
      for (let e = 0; e < t; e++) {
        const n = new at({
          context: this.context,
          volume: -6 - t * 1.1,
          type: this._type,
          phase: this._phase + e / t * 360,
          partialCount: this._partialCount,
          onstop: e === 0 ? () => this.onstop(this) : Q
        });
        this.type === "custom" && (n.partials = this._partials), this.frequency.connect(n.frequency), this.detune.connect(n.detune), n.detune.overridden = !1, n.connect(this.output), this._oscillators[e] = n;
      }
      this.spread = this._spread, this.state === "started" && this._forEach((e) => e.start());
    }
  }
  get phase() {
    return this._phase;
  }
  set phase(t) {
    this._phase = t, this._forEach((e, n) => e.phase = this._phase + n / this.count * 360);
  }
  get baseType() {
    return this._oscillators[0].baseType;
  }
  set baseType(t) {
    this._forEach((e) => e.baseType = t), this._type = this._oscillators[0].type;
  }
  get partials() {
    return this._oscillators[0].partials;
  }
  set partials(t) {
    this._partials = t, this._partialCount = this._partials.length, t.length && (this._type = "custom", this._forEach((e) => e.partials = t));
  }
  get partialCount() {
    return this._oscillators[0].partialCount;
  }
  set partialCount(t) {
    this._partialCount = t, this._forEach((e) => e.partialCount = t), this._type = this._oscillators[0].type;
  }
  asArray() {
    return ht(this, arguments, void 0, function* (t = 1024) {
      return Ce(this, t);
    });
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this.frequency.dispose(), this.detune.dispose(), this._forEach((t) => t.dispose()), this;
  }
}
class Sn extends xt {
  constructor() {
    const t = I(Sn.getDefaults(), arguments, ["frequency", "modulationFrequency"]);
    super(t), this.name = "PWMOscillator", this.sourceType = "pwm", this._scale = new $t({
      context: this.context,
      value: 2
    }), this._pulse = new Qe({
      context: this.context,
      frequency: t.modulationFrequency
    }), this._pulse.carrierType = "sine", this.modulationFrequency = this._pulse.frequency, this._modulator = new at({
      context: this.context,
      detune: t.detune,
      frequency: t.frequency,
      onstop: () => this.onstop(this),
      phase: t.phase
    }), this.frequency = this._modulator.frequency, this.detune = this._modulator.detune, this._modulator.chain(this._scale, this._pulse.width), this._pulse.connect(this.output), Y(this, ["modulationFrequency", "frequency", "detune"]);
  }
  static getDefaults() {
    return Object.assign(xt.getDefaults(), {
      detune: 0,
      frequency: 440,
      modulationFrequency: 0.4,
      phase: 0,
      type: "pwm"
    });
  }
  /**
   * start the oscillator
   */
  _start(t) {
    t = this.toSeconds(t), this._modulator.start(t), this._pulse.start(t);
  }
  /**
   * stop the oscillator
   */
  _stop(t) {
    t = this.toSeconds(t), this._modulator.stop(t), this._pulse.stop(t);
  }
  /**
   * restart the oscillator
   */
  _restart(t) {
    this._modulator.restart(t), this._pulse.restart(t);
  }
  /**
   * The type of the oscillator. Always returns "pwm".
   */
  get type() {
    return "pwm";
  }
  /**
   * The baseType of the oscillator. Always returns "pwm".
   */
  get baseType() {
    return "pwm";
  }
  /**
   * The partials of the waveform. Cannot set partials for this waveform type
   */
  get partials() {
    return [];
  }
  /**
   * No partials for this waveform type.
   */
  get partialCount() {
    return 0;
  }
  /**
   * The phase of the oscillator in degrees.
   */
  get phase() {
    return this._modulator.phase;
  }
  set phase(t) {
    this._modulator.phase = t;
  }
  asArray() {
    return ht(this, arguments, void 0, function* (t = 1024) {
      return Ce(this, t);
    });
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._pulse.dispose(), this._scale.dispose(), this._modulator.dispose(), this;
  }
}
const Xi = {
  am: bn,
  fat: Cn,
  fm: xn,
  oscillator: at,
  pulse: Qe,
  pwm: Sn
};
class Un extends xt {
  constructor() {
    const t = I(Un.getDefaults(), arguments, ["frequency", "type"]);
    super(t), this.name = "OmniOscillator", this.frequency = new z({
      context: this.context,
      units: "frequency",
      value: t.frequency
    }), this.detune = new z({
      context: this.context,
      units: "cents",
      value: t.detune
    }), Y(this, ["frequency", "detune"]), this.set(t);
  }
  static getDefaults() {
    return Object.assign(at.getDefaults(), xn.getDefaults(), bn.getDefaults(), Cn.getDefaults(), Qe.getDefaults(), Sn.getDefaults());
  }
  /**
   * start the oscillator
   */
  _start(t) {
    this._oscillator.start(t);
  }
  /**
   * start the oscillator
   */
  _stop(t) {
    this._oscillator.stop(t);
  }
  _restart(t) {
    return this._oscillator.restart(t), this;
  }
  /**
   * The type of the oscillator. Can be any of the basic types: sine, square, triangle, sawtooth. Or
   * prefix the basic types with "fm", "am", or "fat" to use the FMOscillator, AMOscillator or FatOscillator
   * types. The oscillator could also be set to "pwm" or "pulse". All of the parameters of the
   * oscillator's class are accessible when the oscillator is set to that type, but throws an error
   * when it's not.
   * @example
   * const omniOsc = new Tone.OmniOscillator().toDestination().start();
   * omniOsc.type = "pwm";
   * // modulationFrequency is parameter which is available
   * // only when the type is "pwm".
   * omniOsc.modulationFrequency.value = 0.5;
   */
  get type() {
    let t = "";
    return ["am", "fm", "fat"].some((e) => this._sourceType === e) && (t = this._sourceType), t + this._oscillator.type;
  }
  set type(t) {
    t.substr(0, 2) === "fm" ? (this._createNewOscillator("fm"), this._oscillator = this._oscillator, this._oscillator.type = t.substr(2)) : t.substr(0, 2) === "am" ? (this._createNewOscillator("am"), this._oscillator = this._oscillator, this._oscillator.type = t.substr(2)) : t.substr(0, 3) === "fat" ? (this._createNewOscillator("fat"), this._oscillator = this._oscillator, this._oscillator.type = t.substr(3)) : t === "pwm" ? (this._createNewOscillator("pwm"), this._oscillator = this._oscillator) : t === "pulse" ? this._createNewOscillator("pulse") : (this._createNewOscillator("oscillator"), this._oscillator = this._oscillator, this._oscillator.type = t);
  }
  /**
   * The value is an empty array when the type is not "custom".
   * This is not available on "pwm" and "pulse" oscillator types.
   * @see {@link Oscillator.partials}
   */
  get partials() {
    return this._oscillator.partials;
  }
  set partials(t) {
    !this._getOscType(this._oscillator, "pulse") && !this._getOscType(this._oscillator, "pwm") && (this._oscillator.partials = t);
  }
  get partialCount() {
    return this._oscillator.partialCount;
  }
  set partialCount(t) {
    !this._getOscType(this._oscillator, "pulse") && !this._getOscType(this._oscillator, "pwm") && (this._oscillator.partialCount = t);
  }
  set(t) {
    return Reflect.has(t, "type") && t.type && (this.type = t.type), super.set(t), this;
  }
  /**
   * connect the oscillator to the frequency and detune signals
   */
  _createNewOscillator(t) {
    if (t !== this._sourceType) {
      this._sourceType = t;
      const e = Xi[t], n = this.now();
      if (this._oscillator) {
        const i = this._oscillator;
        i.stop(n), this.context.setTimeout(() => i.dispose(), this.blockTime);
      }
      this._oscillator = new e({
        context: this.context
      }), this.frequency.connect(this._oscillator.frequency), this.detune.connect(this._oscillator.detune), this._oscillator.connect(this.output), this._oscillator.onstop = () => this.onstop(this), this.state === "started" && this._oscillator.start(n);
    }
  }
  get phase() {
    return this._oscillator.phase;
  }
  set phase(t) {
    this._oscillator.phase = t;
  }
  /**
   * The source type of the oscillator.
   * @example
   * const omniOsc = new Tone.OmniOscillator(440, "fmsquare");
   * console.log(omniOsc.sourceType); // 'fm'
   */
  get sourceType() {
    return this._sourceType;
  }
  set sourceType(t) {
    let e = "sine";
    this._oscillator.type !== "pwm" && this._oscillator.type !== "pulse" && (e = this._oscillator.type), t === "fm" ? this.type = "fm" + e : t === "am" ? this.type = "am" + e : t === "fat" ? this.type = "fat" + e : t === "oscillator" ? this.type = e : t === "pulse" ? this.type = "pulse" : t === "pwm" && (this.type = "pwm");
  }
  _getOscType(t, e) {
    return t instanceof Xi[e];
  }
  /**
   * The base type of the oscillator.
   * @see {@link Oscillator.baseType}
   * @example
   * const omniOsc = new Tone.OmniOscillator(440, "fmsquare4");
   * console.log(omniOsc.sourceType, omniOsc.baseType, omniOsc.partialCount);
   */
  get baseType() {
    return this._oscillator.baseType;
  }
  set baseType(t) {
    !this._getOscType(this._oscillator, "pulse") && !this._getOscType(this._oscillator, "pwm") && t !== "pulse" && t !== "pwm" && (this._oscillator.baseType = t);
  }
  /**
   * The width of the oscillator when sourceType === "pulse".
   * @see {@link PWMOscillator}
   */
  get width() {
    if (this._getOscType(this._oscillator, "pulse"))
      return this._oscillator.width;
  }
  /**
   * The number of detuned oscillators when sourceType === "fat".
   * @see {@link FatOscillator.count}
   */
  get count() {
    if (this._getOscType(this._oscillator, "fat"))
      return this._oscillator.count;
  }
  set count(t) {
    this._getOscType(this._oscillator, "fat") && le(t) && (this._oscillator.count = t);
  }
  /**
   * The detune spread between the oscillators when sourceType === "fat".
   * @see {@link FatOscillator.count}
   */
  get spread() {
    if (this._getOscType(this._oscillator, "fat"))
      return this._oscillator.spread;
  }
  set spread(t) {
    this._getOscType(this._oscillator, "fat") && le(t) && (this._oscillator.spread = t);
  }
  /**
   * The type of the modulator oscillator. Only if the oscillator is set to "am" or "fm" types.
   * @see {@link AMOscillator} or {@link FMOscillator}
   */
  get modulationType() {
    if (this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am"))
      return this._oscillator.modulationType;
  }
  set modulationType(t) {
    (this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am")) && te(t) && (this._oscillator.modulationType = t);
  }
  /**
   * The modulation index when the sourceType === "fm"
   * @see {@link FMOscillator}.
   */
  get modulationIndex() {
    if (this._getOscType(this._oscillator, "fm"))
      return this._oscillator.modulationIndex;
  }
  /**
   * Harmonicity is the frequency ratio between the carrier and the modulator oscillators.
   * @see {@link AMOscillator} or {@link FMOscillator}
   */
  get harmonicity() {
    if (this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am"))
      return this._oscillator.harmonicity;
  }
  /**
   * The modulationFrequency Signal of the oscillator when sourceType === "pwm"
   * see {@link PWMOscillator}
   * @min 0.1
   * @max 5
   */
  get modulationFrequency() {
    if (this._getOscType(this._oscillator, "pwm"))
      return this._oscillator.modulationFrequency;
  }
  asArray() {
    return ht(this, arguments, void 0, function* (t = 1024) {
      return Ce(this, t);
    });
  }
  dispose() {
    return super.dispose(), this.detune.dispose(), this.frequency.dispose(), this._oscillator.dispose(), this;
  }
}
class os extends z {
  constructor() {
    super(I(os.getDefaults(), arguments, ["value"])), this.override = !1, this.name = "Add", this._sum = new U({ context: this.context }), this.input = this._sum, this.output = this._sum, this.addend = this._param, ee(this._constantSource, this._sum);
  }
  static getDefaults() {
    return Object.assign(z.getDefaults(), {
      value: 0
    });
  }
  dispose() {
    return super.dispose(), this._sum.dispose(), this;
  }
}
class de extends Et {
  constructor() {
    const t = I(de.getDefaults(), arguments, [
      "min",
      "max"
    ]);
    super(t), this.name = "Scale", this._mult = this.input = new $t({
      context: this.context,
      value: t.max - t.min
    }), this._add = this.output = new os({
      context: this.context,
      value: t.min
    }), this._min = t.min, this._max = t.max, this.input.connect(this.output);
  }
  static getDefaults() {
    return Object.assign(Et.getDefaults(), {
      max: 1,
      min: 0
    });
  }
  /**
   * The minimum output value. This number is output when the value input value is 0.
   */
  get min() {
    return this._min;
  }
  set min(t) {
    this._min = t, this._setRange();
  }
  /**
   * The maximum output value. This number is output when the value input value is 1.
   */
  get max() {
    return this._max;
  }
  set max(t) {
    this._max = t, this._setRange();
  }
  /**
   * set the values
   */
  _setRange() {
    this._add.value = this._min, this._mult.value = this._max - this._min;
  }
  dispose() {
    return super.dispose(), this._add.dispose(), this._mult.dispose(), this;
  }
}
class di extends Et {
  constructor() {
    super(I(di.getDefaults(), arguments)), this.name = "Zero", this._gain = new U({ context: this.context }), this.output = this._gain, this.input = void 0, jt(this.context.getConstant(0), this._gain);
  }
  /**
   * clean up
   */
  dispose() {
    return super.dispose(), eo(this.context.getConstant(0), this._gain), this;
  }
}
class je extends R {
  constructor() {
    const t = I(je.getDefaults(), arguments, [
      "frequency",
      "min",
      "max"
    ]);
    super(t), this.name = "LFO", this._stoppedValue = 0, this._units = "number", this.convert = !0, this._fromType = X.prototype._fromType, this._toType = X.prototype._toType, this._is = X.prototype._is, this._clampValue = X.prototype._clampValue, this._oscillator = new at(t), this.frequency = this._oscillator.frequency, this._amplitudeGain = new U({
      context: this.context,
      gain: t.amplitude,
      units: "normalRange"
    }), this.amplitude = this._amplitudeGain.gain, this._stoppedSignal = new z({
      context: this.context,
      units: "audioRange",
      value: 0
    }), this._zeros = new di({ context: this.context }), this._a2g = new hi({ context: this.context }), this._scaler = this.output = new de({
      context: this.context,
      max: t.max,
      min: t.min
    }), this.units = t.units, this.min = t.min, this.max = t.max, this._oscillator.chain(this._amplitudeGain, this._a2g, this._scaler), this._zeros.connect(this._a2g), this._stoppedSignal.connect(this._a2g), Y(this, ["amplitude", "frequency"]), this.phase = t.phase;
  }
  static getDefaults() {
    return Object.assign(at.getDefaults(), {
      amplitude: 1,
      frequency: "4n",
      max: 1,
      min: 0,
      type: "sine",
      units: "number"
    });
  }
  /**
   * Start the LFO.
   * @param time The time the LFO will start
   */
  start(t) {
    return t = this.toSeconds(t), this._stoppedSignal.setValueAtTime(0, t), this._oscillator.start(t), this;
  }
  /**
   * Stop the LFO.
   * @param  time The time the LFO will stop
   */
  stop(t) {
    return t = this.toSeconds(t), this._stoppedSignal.setValueAtTime(this._stoppedValue, t), this._oscillator.stop(t), this;
  }
  /**
   * Sync the start/stop/pause to the transport
   * and the frequency to the bpm of the transport
   * @example
   * const lfo = new Tone.LFO("8n");
   * lfo.sync().start(0);
   * // the rate of the LFO will always be an eighth note, even as the tempo changes
   */
  sync() {
    return this._oscillator.sync(), this._oscillator.syncFrequency(), this;
  }
  /**
   * unsync the LFO from transport control
   */
  unsync() {
    return this._oscillator.unsync(), this._oscillator.unsyncFrequency(), this;
  }
  /**
   * After the oscillator waveform is updated, reset the `_stoppedSignal` value to match the updated waveform
   */
  _setStoppedValue() {
    this._stoppedValue = this._oscillator.getInitialValue(), this._stoppedSignal.value = this._stoppedValue;
  }
  /**
   * The minimum output of the LFO.
   */
  get min() {
    return this._toType(this._scaler.min);
  }
  set min(t) {
    t = this._fromType(t), this._scaler.min = t;
  }
  /**
   * The maximum output of the LFO.
   */
  get max() {
    return this._toType(this._scaler.max);
  }
  set max(t) {
    t = this._fromType(t), this._scaler.max = t;
  }
  /**
   * The type of the oscillator.
   * @see {@link Oscillator.type}
   */
  get type() {
    return this._oscillator.type;
  }
  set type(t) {
    this._oscillator.type = t, this._setStoppedValue();
  }
  /**
   * The oscillator's partials array.
   * @see {@link Oscillator.partials}
   */
  get partials() {
    return this._oscillator.partials;
  }
  set partials(t) {
    this._oscillator.partials = t, this._setStoppedValue();
  }
  /**
   * The phase of the LFO.
   */
  get phase() {
    return this._oscillator.phase;
  }
  set phase(t) {
    this._oscillator.phase = t, this._setStoppedValue();
  }
  /**
   * The output units of the LFO.
   */
  get units() {
    return this._units;
  }
  set units(t) {
    const e = this.min, n = this.max;
    this._units = t, this.min = e, this.max = n;
  }
  /**
   * Returns the playback state of the source, either "started" or "stopped".
   */
  get state() {
    return this._oscillator.state;
  }
  /**
   * @param node the destination to connect to
   * @param outputNum the optional output number
   * @param inputNum the input number
   */
  connect(t, e, n) {
    return (t instanceof X || t instanceof z) && (this.convert = t.convert, this.units = t.units), ss(this, t, e, n), this;
  }
  dispose() {
    return super.dispose(), this._oscillator.dispose(), this._stoppedSignal.dispose(), this._zeros.dispose(), this._scaler.dispose(), this._a2g.dispose(), this._amplitudeGain.dispose(), this.amplitude.dispose(), this;
  }
}
function no(s, t = 1 / 0) {
  const e = /* @__PURE__ */ new WeakMap();
  return function(n, i) {
    Reflect.defineProperty(n, i, {
      configurable: !0,
      enumerable: !0,
      get: function() {
        return e.get(this);
      },
      set: function(r) {
        Mt(r, s, t), e.set(this, r);
      }
    });
  };
}
function re(s, t = 1 / 0) {
  const e = /* @__PURE__ */ new WeakMap();
  return function(n, i) {
    Reflect.defineProperty(n, i, {
      configurable: !0,
      enumerable: !0,
      get: function() {
        return e.get(this);
      },
      set: function(r) {
        Mt(this.toSeconds(r), s, t), e.set(this, r);
      }
    });
  };
}
class as extends xt {
  constructor() {
    const t = I(as.getDefaults(), arguments, [
      "url",
      "onload"
    ]);
    super(t), this.name = "Player", this._activeSources = /* @__PURE__ */ new Set(), this._buffer = new et({
      onload: this._onload.bind(this, t.onload),
      onerror: t.onerror,
      reverse: t.reverse,
      url: t.url
    }), this.autostart = t.autostart, this._loop = t.loop, this._loopStart = t.loopStart, this._loopEnd = t.loopEnd, this._playbackRate = t.playbackRate, this.fadeIn = t.fadeIn, this.fadeOut = t.fadeOut;
  }
  static getDefaults() {
    return Object.assign(xt.getDefaults(), {
      autostart: !1,
      fadeIn: 0,
      fadeOut: 0,
      loop: !1,
      loopEnd: 0,
      loopStart: 0,
      onload: Q,
      onerror: Q,
      playbackRate: 1,
      reverse: !1
    });
  }
  /**
   * Load the audio file as an audio buffer.
   * Decodes the audio asynchronously and invokes
   * the callback once the audio buffer loads.
   * Note: this does not need to be called if a url
   * was passed in to the constructor. Only use this
   * if you want to manually load a new url.
   * @param url The url of the buffer to load. Filetype support depends on the browser.
   */
  load(t) {
    return ht(this, void 0, void 0, function* () {
      return yield this._buffer.load(t), this._onload(), this;
    });
  }
  /**
   * Internal callback when the buffer is loaded.
   */
  _onload(t = Q) {
    t(), this.autostart && this.start();
  }
  /**
   * Internal callback when the buffer is done playing.
   */
  _onSourceEnd(t) {
    this.onstop(this), this._activeSources.delete(t), this._activeSources.size === 0 && !this._synced && this._state.getValueAtTime(this.now()) === "started" && (this._state.cancel(this.now()), this._state.setStateAtTime("stopped", this.now()));
  }
  /**
   * Play the buffer at the given startTime. Optionally add an offset
   * and/or duration which will play the buffer from a position
   * within the buffer for the given duration.
   *
   * @param  time When the player should start.
   * @param  offset The offset from the beginning of the sample to start at.
   * @param  duration How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
   */
  start(t, e, n) {
    return super.start(t, e, n), this;
  }
  /**
   * Internal start method
   */
  _start(t, e, n) {
    this._loop ? e = Pe(e, this._loopStart) : e = Pe(e, 0);
    const i = this.toSeconds(e), r = n;
    n = Pe(n, Math.max(this._buffer.duration - i, 0));
    let o = this.toSeconds(n);
    o = o / this._playbackRate, t = this.toSeconds(t);
    const a = new Tn({
      url: this._buffer,
      context: this.context,
      fadeIn: this.fadeIn,
      fadeOut: this.fadeOut,
      loop: this._loop,
      loopEnd: this._loopEnd,
      loopStart: this._loopStart,
      onended: this._onSourceEnd.bind(this),
      playbackRate: this._playbackRate
    }).connect(this.output);
    !this._loop && !this._synced && (this._state.cancel(t + o), this._state.setStateAtTime("stopped", t + o, {
      implicitEnd: !0
    })), this._activeSources.add(a), this._loop && Pt(r) ? a.start(t, i) : a.start(t, i, o - this.toSeconds(this.fadeOut));
  }
  /**
   * Stop playback.
   */
  _stop(t) {
    const e = this.toSeconds(t);
    this._activeSources.forEach((n) => n.stop(e));
  }
  /**
   * Stop and then restart the player from the beginning (or offset)
   * @param  time When the player should start.
   * @param  offset The offset from the beginning of the sample to start at.
   * @param  duration How long the sample should play. If no duration is given,
   * 					it will default to the full length of the sample (minus any offset)
   */
  restart(t, e, n) {
    return super.restart(t, e, n), this;
  }
  _restart(t, e, n) {
    var i;
    (i = [...this._activeSources].pop()) === null || i === void 0 || i.stop(t), this._start(t, e, n);
  }
  /**
   * Seek to a specific time in the player's buffer. If the
   * source is no longer playing at that time, it will stop.
   * @param offset The time to seek to.
   * @param when The time for the seek event to occur.
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gurgling_theremin_1.mp3", () => {
   * 	player.start();
   * 	// seek to the offset in 1 second from now
   * 	player.seek(0.4, "+1");
   * }).toDestination();
   */
  seek(t, e) {
    const n = this.toSeconds(e);
    if (this._state.getValueAtTime(n) === "started") {
      const i = this.toSeconds(t);
      this._stop(n), this._start(n, i);
    }
    return this;
  }
  /**
   * Set the loop start and end. Will only loop if loop is set to true.
   * @param loopStart The loop start time
   * @param loopEnd The loop end time
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/malevoices_aa2_F3.mp3").toDestination();
   * // loop between the given points
   * player.setLoopPoints(0.2, 0.3);
   * player.loop = true;
   * player.autostart = true;
   */
  setLoopPoints(t, e) {
    return this.loopStart = t, this.loopEnd = e, this;
  }
  /**
   * If loop is true, the loop will start at this position.
   */
  get loopStart() {
    return this._loopStart;
  }
  set loopStart(t) {
    this._loopStart = t, this.buffer.loaded && Mt(this.toSeconds(t), 0, this.buffer.duration), this._activeSources.forEach((e) => {
      e.loopStart = t;
    });
  }
  /**
   * If loop is true, the loop will end at this position.
   */
  get loopEnd() {
    return this._loopEnd;
  }
  set loopEnd(t) {
    this._loopEnd = t, this.buffer.loaded && Mt(this.toSeconds(t), 0, this.buffer.duration), this._activeSources.forEach((e) => {
      e.loopEnd = t;
    });
  }
  /**
   * The audio buffer belonging to the player.
   */
  get buffer() {
    return this._buffer;
  }
  set buffer(t) {
    this._buffer.set(t);
  }
  /**
   * If the buffer should loop once it's over.
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/breakbeat.mp3").toDestination();
   * player.loop = true;
   * player.autostart = true;
   */
  get loop() {
    return this._loop;
  }
  set loop(t) {
    if (this._loop !== t && (this._loop = t, this._activeSources.forEach((e) => {
      e.loop = t;
    }), t)) {
      const e = this._state.getNextState("stopped", this.now());
      e && this._state.cancel(e.time);
    }
  }
  /**
   * Normal speed is 1. The pitch will change with the playback rate.
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/femalevoices_aa2_A5.mp3").toDestination();
   * // play at 1/4 speed
   * player.playbackRate = 0.25;
   * // play as soon as the buffer is loaded
   * player.autostart = true;
   */
  get playbackRate() {
    return this._playbackRate;
  }
  set playbackRate(t) {
    this._playbackRate = t;
    const e = this.now(), n = this._state.getNextState("stopped", e);
    n && n.implicitEnd && (this._state.cancel(n.time), this._activeSources.forEach((i) => i.cancelStop())), this._activeSources.forEach((i) => {
      i.playbackRate.setValueAtTime(t, e);
    });
  }
  /**
   * If the buffer should be reversed. Note that this sets the underlying {@link ToneAudioBuffer.reverse}, so
   * if multiple players are pointing at the same ToneAudioBuffer, they will all be reversed.
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/chime_1.mp3").toDestination();
   * player.autostart = true;
   * player.reverse = true;
   */
  get reverse() {
    return this._buffer.reverse;
  }
  set reverse(t) {
    this._buffer.reverse = t;
  }
  /**
   * If the buffer is loaded
   */
  get loaded() {
    return this._buffer.loaded;
  }
  dispose() {
    return super.dispose(), this._activeSources.forEach((t) => t.dispose()), this._activeSources.clear(), this._buffer.dispose(), this;
  }
}
Gt([
  re(0)
], as.prototype, "fadeIn", void 0);
Gt([
  re(0)
], as.prototype, "fadeOut", void 0);
class so extends Et {
  constructor() {
    super(...arguments), this.name = "Abs", this._abs = new ie({
      context: this.context,
      mapping: (t) => Math.abs(t) < 1e-3 ? 0 : Math.abs(t)
    }), this.input = this._abs, this.output = this._abs;
  }
  /**
   * clean up
   */
  dispose() {
    return super.dispose(), this._abs.dispose(), this;
  }
}
class io extends Et {
  constructor() {
    super(...arguments), this.name = "GainToAudio", this._norm = new ie({
      context: this.context,
      mapping: (t) => Math.abs(t) * 2 - 1
    }), this.input = this._norm, this.output = this._norm;
  }
  /**
   * clean up
   */
  dispose() {
    return super.dispose(), this._norm.dispose(), this;
  }
}
class ro extends Et {
  constructor() {
    super(...arguments), this.name = "Negate", this._multiply = new $t({
      context: this.context,
      value: -1
    }), this.input = this._multiply, this.output = this._multiply;
  }
  /**
   * clean up
   * @returns {Negate} this
   */
  dispose() {
    return super.dispose(), this._multiply.dispose(), this;
  }
}
class cs extends z {
  constructor() {
    super(I(cs.getDefaults(), arguments, ["value"])), this.override = !1, this.name = "Subtract", this._sum = new U({ context: this.context }), this.input = this._sum, this.output = this._sum, this._neg = new ro({ context: this.context }), this.subtrahend = this._param, ee(this._constantSource, this._neg, this._sum);
  }
  static getDefaults() {
    return Object.assign(z.getDefaults(), {
      value: 0
    });
  }
  dispose() {
    return super.dispose(), this._neg.dispose(), this._sum.dispose(), this;
  }
}
class us extends Et {
  constructor() {
    super(I(us.getDefaults(), arguments)), this.name = "GreaterThanZero", this._thresh = this.output = new ie({
      context: this.context,
      length: 127,
      mapping: (t) => t <= 0 ? 0 : 1
    }), this._scale = this.input = new $t({
      context: this.context,
      value: 1e4
    }), this._scale.connect(this._thresh);
  }
  dispose() {
    return super.dispose(), this._scale.dispose(), this._thresh.dispose(), this;
  }
}
class pi extends z {
  constructor() {
    const t = I(pi.getDefaults(), arguments, ["value"]);
    super(t), this.name = "GreaterThan", this.override = !1, this._subtract = this.input = new cs({
      context: this.context,
      value: t.value
    }), this._gtz = this.output = new us({
      context: this.context
    }), this.comparator = this._param = this._subtract.subtrahend, Y(this, "comparator"), this._subtract.connect(this._gtz);
  }
  static getDefaults() {
    return Object.assign(z.getDefaults(), {
      value: 0
    });
  }
  dispose() {
    return super.dispose(), this._gtz.dispose(), this._subtract.dispose(), this.comparator.dispose(), this;
  }
}
class fi extends de {
  constructor() {
    const t = I(fi.getDefaults(), arguments, ["min", "max", "exponent"]);
    super(t), this.name = "ScaleExp", this.input = this._exp = new wn({
      context: this.context,
      value: t.exponent
    }), this._exp.connect(this._mult);
  }
  static getDefaults() {
    return Object.assign(de.getDefaults(), {
      exponent: 1
    });
  }
  /**
   * Instead of interpolating linearly between the {@link min} and
   * {@link max} values, setting the exponent will interpolate between
   * the two values with an exponential curve.
   */
  get exponent() {
    return this._exp.value;
  }
  set exponent(t) {
    this._exp.value = t;
  }
  dispose() {
    return super.dispose(), this._exp.dispose(), this;
  }
}
class Ht extends R {
  constructor() {
    const t = I(Ht.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]);
    super(t), this.name = "Envelope", this._sig = new z({
      context: this.context,
      value: 0
    }), this.output = this._sig, this.input = void 0, this.attack = t.attack, this.decay = t.decay, this.sustain = t.sustain, this.release = t.release, this.attackCurve = t.attackCurve, this.releaseCurve = t.releaseCurve, this.decayCurve = t.decayCurve;
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      attack: 0.01,
      attackCurve: "linear",
      decay: 0.1,
      decayCurve: "exponential",
      release: 1,
      releaseCurve: "exponential",
      sustain: 0.5
    });
  }
  /**
   * Read the current value of the envelope. Useful for
   * synchronizing visual output to the envelope.
   */
  get value() {
    return this.getValueAtTime(this.now());
  }
  /**
   * Get the curve
   * @param  curve
   * @param  direction  In/Out
   * @return The curve name
   */
  _getCurve(t, e) {
    if (te(t))
      return t;
    {
      let n;
      for (n in On)
        if (On[n][e] === t)
          return n;
      return t;
    }
  }
  /**
   * Assign a the curve to the given name using the direction
   * @param  name
   * @param  direction In/Out
   * @param  curve
   */
  _setCurve(t, e, n) {
    if (te(n) && Reflect.has(On, n)) {
      const i = On[n];
      ge(i) ? t !== "_decayCurve" && (this[t] = i[e]) : this[t] = i;
    } else if (Lt(n) && t !== "_decayCurve")
      this[t] = n;
    else
      throw new Error("Envelope: invalid curve: " + n);
  }
  /**
   * The shape of the attack.
   * Can be any of these strings:
   * * "linear"
   * * "exponential"
   * * "sine"
   * * "cosine"
   * * "bounce"
   * * "ripple"
   * * "step"
   *
   * Can also be an array which describes the curve. Values
   * in the array are evenly subdivided and linearly
   * interpolated over the duration of the attack.
   * @example
   * return Tone.Offline(() => {
   * 	const env = new Tone.Envelope(0.4).toDestination();
   * 	env.attackCurve = "linear";
   * 	env.triggerAttack();
   * }, 1, 1);
   */
  get attackCurve() {
    return this._getCurve(this._attackCurve, "In");
  }
  set attackCurve(t) {
    this._setCurve("_attackCurve", "In", t);
  }
  /**
   * The shape of the release. See the attack curve types.
   * @example
   * return Tone.Offline(() => {
   * 	const env = new Tone.Envelope({
   * 		release: 0.8
   * 	}).toDestination();
   * 	env.triggerAttack();
   * 	// release curve could also be defined by an array
   * 	env.releaseCurve = [1, 0.3, 0.4, 0.2, 0.7, 0];
   * 	env.triggerRelease(0.2);
   * }, 1, 1);
   */
  get releaseCurve() {
    return this._getCurve(this._releaseCurve, "Out");
  }
  set releaseCurve(t) {
    this._setCurve("_releaseCurve", "Out", t);
  }
  /**
   * The shape of the decay either "linear" or "exponential"
   * @example
   * return Tone.Offline(() => {
   * 	const env = new Tone.Envelope({
   * 		sustain: 0.1,
   * 		decay: 0.5
   * 	}).toDestination();
   * 	env.decayCurve = "linear";
   * 	env.triggerAttack();
   * }, 1, 1);
   */
  get decayCurve() {
    return this._getCurve(this._decayCurve, "Out");
  }
  set decayCurve(t) {
    this._setCurve("_decayCurve", "Out", t);
  }
  /**
   * Trigger the attack/decay portion of the ADSR envelope.
   * @param  time When the attack should start.
   * @param velocity The velocity of the envelope scales the vales.
   *                             number between 0-1
   * @example
   * const env = new Tone.AmplitudeEnvelope().toDestination();
   * const osc = new Tone.Oscillator().connect(env).start();
   * // trigger the attack 0.5 seconds from now with a velocity of 0.2
   * env.triggerAttack("+0.5", 0.2);
   */
  triggerAttack(t, e = 1) {
    this.log("triggerAttack", t, e), t = this.toSeconds(t);
    let i = this.toSeconds(this.attack);
    const r = this.toSeconds(this.decay), o = this.getValueAtTime(t);
    if (o > 0) {
      const a = 1 / i;
      i = (1 - o) / a;
    }
    if (i < this.sampleTime)
      this._sig.cancelScheduledValues(t), this._sig.setValueAtTime(e, t);
    else if (this._attackCurve === "linear")
      this._sig.linearRampTo(e, i, t);
    else if (this._attackCurve === "exponential")
      this._sig.targetRampTo(e, i, t);
    else {
      this._sig.cancelAndHoldAtTime(t);
      let a = this._attackCurve;
      for (let c = 1; c < a.length; c++)
        if (a[c - 1] <= o && o <= a[c]) {
          a = this._attackCurve.slice(c), a[0] = o;
          break;
        }
      this._sig.setValueCurveAtTime(a, t, i, e);
    }
    if (r && this.sustain < 1) {
      const a = e * this.sustain, c = t + i;
      this.log("decay", c), this._decayCurve === "linear" ? this._sig.linearRampToValueAtTime(a, r + c) : this._sig.exponentialApproachValueAtTime(a, c, r);
    }
    return this;
  }
  /**
   * Triggers the release of the envelope.
   * @param  time When the release portion of the envelope should start.
   * @example
   * const env = new Tone.AmplitudeEnvelope().toDestination();
   * const osc = new Tone.Oscillator({
   * 	type: "sawtooth"
   * }).connect(env).start();
   * env.triggerAttack();
   * // trigger the release half a second after the attack
   * env.triggerRelease("+0.5");
   */
  triggerRelease(t) {
    this.log("triggerRelease", t), t = this.toSeconds(t);
    const e = this.getValueAtTime(t);
    if (e > 0) {
      const n = this.toSeconds(this.release);
      n < this.sampleTime ? this._sig.setValueAtTime(0, t) : this._releaseCurve === "linear" ? this._sig.linearRampTo(0, n, t) : this._releaseCurve === "exponential" ? this._sig.targetRampTo(0, n, t) : (j(Lt(this._releaseCurve), "releaseCurve must be either 'linear', 'exponential' or an array"), this._sig.cancelAndHoldAtTime(t), this._sig.setValueCurveAtTime(this._releaseCurve, t, n, e));
    }
    return this;
  }
  /**
   * Get the scheduled value at the given time. This will
   * return the unconverted (raw) value.
   * @example
   * const env = new Tone.Envelope(0.5, 1, 0.4, 2);
   * env.triggerAttackRelease(2);
   * setInterval(() => console.log(env.getValueAtTime(Tone.now())), 100);
   */
  getValueAtTime(t) {
    return this._sig.getValueAtTime(t);
  }
  /**
   * triggerAttackRelease is shorthand for triggerAttack, then waiting
   * some duration, then triggerRelease.
   * @param duration The duration of the sustain.
   * @param time When the attack should be triggered.
   * @param velocity The velocity of the envelope.
   * @example
   * const env = new Tone.AmplitudeEnvelope().toDestination();
   * const osc = new Tone.Oscillator().connect(env).start();
   * // trigger the release 0.5 seconds after the attack
   * env.triggerAttackRelease(0.5);
   */
  triggerAttackRelease(t, e, n = 1) {
    return e = this.toSeconds(e), this.triggerAttack(e, n), this.triggerRelease(e + this.toSeconds(t)), this;
  }
  /**
   * Cancels all scheduled envelope changes after the given time.
   */
  cancel(t) {
    return this._sig.cancelScheduledValues(this.toSeconds(t)), this;
  }
  /**
   * Connect the envelope to a destination node.
   */
  connect(t, e = 0, n = 0) {
    return ss(this, t, e, n), this;
  }
  /**
   * Render the envelope curve to an array of the given length.
   * Good for visualizing the envelope curve. Rescales the duration of the
   * envelope to fit the length.
   */
  asArray() {
    return ht(this, arguments, void 0, function* (t = 1024) {
      const e = t / this.context.sampleRate, n = new es(1, e, this.context.sampleRate), i = this.toSeconds(this.attack) + this.toSeconds(this.decay), r = i + this.toSeconds(this.release), o = r * 0.1, a = r + o, c = new this.constructor(Object.assign(this.get(), {
        attack: e * this.toSeconds(this.attack) / a,
        decay: e * this.toSeconds(this.decay) / a,
        release: e * this.toSeconds(this.release) / a,
        context: n
      }));
      return c._sig.toDestination(), c.triggerAttackRelease(e * (i + o) / a, 0), (yield n.render()).getChannelData(0);
    });
  }
  dispose() {
    return super.dispose(), this._sig.dispose(), this;
  }
}
Gt([
  re(0)
], Ht.prototype, "attack", void 0);
Gt([
  re(0)
], Ht.prototype, "decay", void 0);
Gt([
  no(0, 1)
], Ht.prototype, "sustain", void 0);
Gt([
  re(0)
], Ht.prototype, "release", void 0);
const On = (() => {
  let t, e;
  const n = [];
  for (t = 0; t < 128; t++)
    n[t] = Math.sin(t / 127 * (Math.PI / 2));
  const i = [], r = 6.4;
  for (t = 0; t < 127; t++) {
    e = t / 127;
    const p = Math.sin(e * (Math.PI * 2) * r - Math.PI / 2) + 1;
    i[t] = p / 10 + e * 0.83;
  }
  i[127] = 1;
  const o = [], a = 5;
  for (t = 0; t < 128; t++)
    o[t] = Math.ceil(t / 127 * a) / a;
  const c = [];
  for (t = 0; t < 128; t++)
    e = t / 127, c[t] = 0.5 * (1 - Math.cos(Math.PI * e));
  const u = [];
  for (t = 0; t < 128; t++) {
    e = t / 127;
    const p = Math.pow(e, 3) * 4 + 0.2, f = Math.cos(p * Math.PI * 2 * e);
    u[t] = Math.abs(f * (1 - e));
  }
  function l(p) {
    const f = new Array(p.length);
    for (let d = 0; d < p.length; d++)
      f[d] = 1 - p[d];
    return f;
  }
  function h(p) {
    return p.slice(0).reverse();
  }
  return {
    bounce: {
      In: l(u),
      Out: u
    },
    cosine: {
      In: n,
      Out: h(n)
    },
    exponential: "exponential",
    linear: "linear",
    ripple: {
      In: i,
      Out: l(i)
    },
    sine: {
      In: c,
      Out: l(c)
    },
    step: {
      In: o,
      Out: l(o)
    }
  };
})();
class Be extends R {
  constructor() {
    const t = I(Be.getDefaults(), arguments);
    super(t), this._scheduledEvents = [], this._synced = !1, this._original_triggerAttack = this.triggerAttack, this._original_triggerRelease = this.triggerRelease, this._syncedRelease = (e) => this._original_triggerRelease(e), this._volume = this.output = new He({
      context: this.context,
      volume: t.volume
    }), this.volume = this._volume.volume, Y(this, "volume");
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      volume: 0
    });
  }
  /**
   * Sync the instrument to the Transport. All subsequent calls of
   * {@link triggerAttack} and {@link triggerRelease} will be scheduled along the transport.
   * @example
   * const fmSynth = new Tone.FMSynth().toDestination();
   * fmSynth.volume.value = -6;
   * fmSynth.sync();
   * // schedule 3 notes when the transport first starts
   * fmSynth.triggerAttackRelease("C4", "8n", 0);
   * fmSynth.triggerAttackRelease("E4", "8n", "8n");
   * fmSynth.triggerAttackRelease("G4", "8n", "4n");
   * // start the transport to hear the notes
   * Tone.Transport.start();
   */
  sync() {
    return this._syncState() && (this._syncMethod("triggerAttack", 1), this._syncMethod("triggerRelease", 0), this.context.transport.on("stop", this._syncedRelease), this.context.transport.on("pause", this._syncedRelease), this.context.transport.on("loopEnd", this._syncedRelease)), this;
  }
  /**
   * set _sync
   */
  _syncState() {
    let t = !1;
    return this._synced || (this._synced = !0, t = !0), t;
  }
  /**
   * Wrap the given method so that it can be synchronized
   * @param method Which method to wrap and sync
   * @param  timePosition What position the time argument appears in
   */
  _syncMethod(t, e) {
    const n = this["_original_" + t] = this[t];
    this[t] = (...i) => {
      const r = i[e], o = this.context.transport.schedule((a) => {
        i[e] = a, n.apply(this, i);
      }, r);
      this._scheduledEvents.push(o);
    };
  }
  /**
   * Unsync the instrument from the Transport
   */
  unsync() {
    return this._scheduledEvents.forEach((t) => this.context.transport.clear(t)), this._scheduledEvents = [], this._synced && (this._synced = !1, this.triggerAttack = this._original_triggerAttack, this.triggerRelease = this._original_triggerRelease, this.context.transport.off("stop", this._syncedRelease), this.context.transport.off("pause", this._syncedRelease), this.context.transport.off("loopEnd", this._syncedRelease)), this;
  }
  /**
   * Trigger the attack and then the release after the duration.
   * @param  note     The note to trigger.
   * @param  duration How long the note should be held for before
   *                         triggering the release. This value must be greater than 0.
   * @param time  When the note should be triggered.
   * @param  velocity The velocity the note should be triggered at.
   * @example
   * const synth = new Tone.Synth().toDestination();
   * // trigger "C4" for the duration of an 8th note
   * synth.triggerAttackRelease("C4", "8n");
   */
  triggerAttackRelease(t, e, n, i) {
    const r = this.toSeconds(n), o = this.toSeconds(e);
    return this.triggerAttack(t, r, i), this.triggerRelease(r + o), this;
  }
  /**
   * clean up
   * @returns {Instrument} this
   */
  dispose() {
    return super.dispose(), this._volume.dispose(), this.unsync(), this._scheduledEvents = [], this;
  }
}
class Ue extends Be {
  constructor() {
    const t = I(Ue.getDefaults(), arguments);
    super(t), this.portamento = t.portamento, this.onsilence = t.onsilence;
  }
  static getDefaults() {
    return Object.assign(Be.getDefaults(), {
      detune: 0,
      onsilence: Q,
      portamento: 0
    });
  }
  /**
   * Trigger the attack of the note optionally with a given velocity.
   * @param  note The note to trigger.
   * @param  time When the note should start.
   * @param  velocity The velocity determines how "loud" the note will be.
   * @example
   * const synth = new Tone.Synth().toDestination();
   * // trigger the note a half second from now at half velocity
   * synth.triggerAttack("C4", "+0.5", 0.5);
   */
  triggerAttack(t, e, n = 1) {
    this.log("triggerAttack", t, e, n);
    const i = this.toSeconds(e);
    return this._triggerEnvelopeAttack(i, n), this.setNote(t, i), this;
  }
  /**
   * Trigger the release portion of the envelope.
   * @param  time If no time is given, the release happens immediately.
   * @example
   * const synth = new Tone.Synth().toDestination();
   * synth.triggerAttack("C4");
   * // trigger the release a second from now
   * synth.triggerRelease("+1");
   */
  triggerRelease(t) {
    this.log("triggerRelease", t);
    const e = this.toSeconds(t);
    return this._triggerEnvelopeRelease(e), this;
  }
  /**
   * Set the note at the given time. If no time is given, the note
   * will set immediately.
   * @param note The note to change to.
   * @param  time The time when the note should be set.
   * @example
   * const synth = new Tone.Synth().toDestination();
   * synth.triggerAttack("C4");
   * // change to F#6 in one quarter note from now.
   * synth.setNote("F#6", "+4n");
   */
  setNote(t, e) {
    const n = this.toSeconds(e), i = t instanceof Rt ? t.toFrequency() : t;
    if (this.portamento > 0 && this.getLevelAtTime(n) > 0.05) {
      const r = this.toSeconds(this.portamento);
      this.frequency.exponentialRampTo(i, r, n);
    } else
      this.frequency.setValueAtTime(i, n);
    return this;
  }
}
Gt([
  re(0)
], Ue.prototype, "portamento", void 0);
class mi extends Ht {
  constructor() {
    super(I(mi.getDefaults(), arguments, [
      "attack",
      "decay",
      "sustain",
      "release"
    ])), this.name = "AmplitudeEnvelope", this._gainNode = new U({
      context: this.context,
      gain: 0
    }), this.output = this._gainNode, this.input = this._gainNode, this._sig.connect(this._gainNode.gain), this.output = this._gainNode, this.input = this._gainNode;
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this._gainNode.dispose(), this;
  }
}
class Gn extends Ue {
  constructor() {
    const t = I(Gn.getDefaults(), arguments);
    super(t), this.name = "Synth", this.oscillator = new Un(Object.assign({
      context: this.context,
      detune: t.detune,
      onstop: () => this.onsilence(this)
    }, t.oscillator)), this.frequency = this.oscillator.frequency, this.detune = this.oscillator.detune, this.envelope = new mi(Object.assign({
      context: this.context
    }, t.envelope)), this.oscillator.chain(this.envelope, this.output), Y(this, ["oscillator", "frequency", "detune", "envelope"]);
  }
  static getDefaults() {
    return Object.assign(Ue.getDefaults(), {
      envelope: Object.assign($i(Ht.getDefaults(), Object.keys(R.getDefaults())), {
        attack: 5e-3,
        decay: 0.1,
        release: 1,
        sustain: 0.3
      }),
      oscillator: Object.assign($i(Un.getDefaults(), [
        ...Object.keys(xt.getDefaults()),
        "frequency",
        "detune"
      ]), {
        type: "triangle"
      })
    });
  }
  /**
   * start the attack portion of the envelope
   * @param time the time the attack should start
   * @param velocity the velocity of the note (0-1)
   */
  _triggerEnvelopeAttack(t, e) {
    if (this.envelope.triggerAttack(t, e), this.oscillator.start(t), this.envelope.sustain === 0) {
      const n = this.toSeconds(this.envelope.attack), i = this.toSeconds(this.envelope.decay);
      this.oscillator.stop(t + n + i);
    }
  }
  /**
   * start the release portion of the envelope
   * @param time the time the release should start
   */
  _triggerEnvelopeRelease(t) {
    this.envelope.triggerRelease(t), this.oscillator.stop(t + this.toSeconds(this.envelope.release));
  }
  getLevelAtTime(t) {
    return t = this.toSeconds(t), this.envelope.getValueAtTime(t);
  }
  /**
   * clean up
   */
  dispose() {
    return super.dispose(), this.oscillator.dispose(), this.envelope.dispose(), this;
  }
}
class zn extends R {
  constructor() {
    const t = I(zn.getDefaults(), arguments, ["frequency", "type"]);
    super(t), this.name = "BiquadFilter", this._filter = this.context.createBiquadFilter(), this.input = this.output = this._filter, this.Q = new X({
      context: this.context,
      units: "number",
      value: t.Q,
      param: this._filter.Q
    }), this.frequency = new X({
      context: this.context,
      units: "frequency",
      value: t.frequency,
      param: this._filter.frequency
    }), this.detune = new X({
      context: this.context,
      units: "cents",
      value: t.detune,
      param: this._filter.detune
    }), this.gain = new X({
      context: this.context,
      units: "decibels",
      convert: !1,
      value: t.gain,
      param: this._filter.gain
    }), this.type = t.type;
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      Q: 1,
      type: "lowpass",
      frequency: 350,
      detune: 0,
      gain: 0
    });
  }
  /**
   * The type of this BiquadFilterNode. For a complete list of types and their attributes, see the
   * [Web Audio API](https://webaudio.github.io/web-audio-api/#dom-biquadfiltertype-lowpass)
   */
  get type() {
    return this._filter.type;
  }
  set type(t) {
    j([
      "lowpass",
      "highpass",
      "bandpass",
      "lowshelf",
      "highshelf",
      "notch",
      "allpass",
      "peaking"
    ].indexOf(t) !== -1, `Invalid filter type: ${t}`), this._filter.type = t;
  }
  /**
   * Get the frequency response curve. This curve represents how the filter
   * responses to frequencies between 20hz-20khz.
   * @param  len The number of values to return
   * @return The frequency response curve between 20-20kHz
   */
  getFrequencyResponse(t = 128) {
    const e = new Float32Array(t);
    for (let o = 0; o < t; o++) {
      const c = Math.pow(o / t, 2) * 19980 + 20;
      e[o] = c;
    }
    const n = new Float32Array(t), i = new Float32Array(t), r = this.context.createBiquadFilter();
    return r.type = this.type, r.Q.value = this.Q.value, r.frequency.value = this.frequency.value, r.gain.value = this.gain.value, r.getFrequencyResponse(e, n, i), n;
  }
  dispose() {
    return super.dispose(), this._filter.disconnect(), this.Q.dispose(), this.frequency.dispose(), this.gain.dispose(), this.detune.dispose(), this;
  }
}
class _i extends R {
  constructor() {
    const t = I(_i.getDefaults(), arguments, [
      "frequency",
      "type",
      "rolloff"
    ]);
    super(t), this.name = "Filter", this.input = new U({ context: this.context }), this.output = new U({ context: this.context }), this._filters = [], this._filters = [], this.Q = new z({
      context: this.context,
      units: "positive",
      value: t.Q
    }), this.frequency = new z({
      context: this.context,
      units: "frequency",
      value: t.frequency
    }), this.detune = new z({
      context: this.context,
      units: "cents",
      value: t.detune
    }), this.gain = new z({
      context: this.context,
      units: "decibels",
      convert: !1,
      value: t.gain
    }), this._type = t.type, this.rolloff = t.rolloff, Y(this, ["detune", "frequency", "gain", "Q"]);
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      Q: 1,
      detune: 0,
      frequency: 350,
      gain: 0,
      rolloff: -12,
      type: "lowpass"
    });
  }
  /**
   * The type of the filter. Types: "lowpass", "highpass",
   * "bandpass", "lowshelf", "highshelf", "notch", "allpass", or "peaking".
   */
  get type() {
    return this._type;
  }
  set type(t) {
    j([
      "lowpass",
      "highpass",
      "bandpass",
      "lowshelf",
      "highshelf",
      "notch",
      "allpass",
      "peaking"
    ].indexOf(t) !== -1, `Invalid filter type: ${t}`), this._type = t, this._filters.forEach((n) => n.type = t);
  }
  /**
   * The rolloff of the filter which is the drop in db
   * per octave. Implemented internally by cascading filters.
   * Only accepts the values -12, -24, -48 and -96.
   */
  get rolloff() {
    return this._rolloff;
  }
  set rolloff(t) {
    const e = le(t) ? t : parseInt(t, 10), n = [-12, -24, -48, -96];
    let i = n.indexOf(e);
    j(i !== -1, `rolloff can only be ${n.join(", ")}`), i += 1, this._rolloff = e, this.input.disconnect(), this._filters.forEach((r) => r.disconnect()), this._filters = new Array(i);
    for (let r = 0; r < i; r++) {
      const o = new zn({
        context: this.context
      });
      o.type = this._type, this.frequency.connect(o.frequency), this.detune.connect(o.detune), this.Q.connect(o.Q), this.gain.connect(o.gain), this._filters[r] = o;
    }
    this._internalChannels = this._filters, ee(this.input, ...this._internalChannels, this.output);
  }
  /**
   * Get the frequency response curve. This curve represents how the filter
   * responses to frequencies between 20hz-20khz.
   * @param  len The number of values to return
   * @return The frequency response curve between 20-20kHz
   */
  getFrequencyResponse(t = 128) {
    const e = new zn({
      context: this.context,
      frequency: this.frequency.value,
      gain: this.gain.value,
      Q: this.Q.value,
      type: this._type,
      detune: this.detune.value
    }), n = new Float32Array(t).map(() => 1);
    return this._filters.forEach(() => {
      e.getFrequencyResponse(t).forEach((r, o) => n[o] *= r);
    }), e.dispose(), n;
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._filters.forEach((t) => {
      t.dispose();
    }), ti(this, ["detune", "frequency", "gain", "Q"]), this.frequency.dispose(), this.Q.dispose(), this.detune.dispose(), this.gain.dispose(), this;
  }
}
class ls extends Gn {
  constructor() {
    const t = I(ls.getDefaults(), arguments);
    super(t), this.name = "MembraneSynth", this.portamento = 0, this.pitchDecay = t.pitchDecay, this.octaves = t.octaves, Y(this, ["oscillator", "envelope"]);
  }
  static getDefaults() {
    return Re(Ue.getDefaults(), Gn.getDefaults(), {
      envelope: {
        attack: 1e-3,
        attackCurve: "exponential",
        decay: 0.4,
        release: 1.4,
        sustain: 0.01
      },
      octaves: 10,
      oscillator: {
        type: "sine"
      },
      pitchDecay: 0.05
    });
  }
  setNote(t, e) {
    const n = this.toSeconds(e), i = this.toFrequency(t instanceof Rt ? t.toFrequency() : t), r = i * this.octaves;
    return this.oscillator.frequency.setValueAtTime(r, n), this.oscillator.frequency.exponentialRampToValueAtTime(i, n + this.toSeconds(this.pitchDecay)), this;
  }
  dispose() {
    return super.dispose(), this;
  }
}
Gt([
  no(0)
], ls.prototype, "octaves", void 0);
Gt([
  re(0)
], ls.prototype, "pitchDecay", void 0);
const gi = /* @__PURE__ */ new Set();
function yi(s) {
  gi.add(s);
}
function oo(s, t) {
  const e = (
    /* javascript */
    `registerProcessor("${s}", ${t})`
  );
  gi.add(e);
}
function td() {
  return Array.from(gi).join(`
`);
}
class ed extends R {
  constructor(t) {
    super(t), this.name = "ToneAudioWorklet", this.workletOptions = {}, this.onprocessorerror = Q;
    const e = URL.createObjectURL(new Blob([td()], { type: "text/javascript" })), n = this._audioWorkletName();
    this._dummyGain = this.context.createGain(), this._dummyParam = this._dummyGain.gain, this.context.addAudioWorkletModule(e).then(() => {
      this.disposed || (this._worklet = this.context.createAudioWorkletNode(n, this.workletOptions), this._worklet.onprocessorerror = this.onprocessorerror.bind(this), this.onReady(this._worklet));
    });
  }
  dispose() {
    return super.dispose(), this._dummyGain.disconnect(), this._worklet && (this._worklet.port.postMessage("dispose"), this._worklet.disconnect()), this;
  }
}
const nd = (
  /* javascript */
  `
	/**
	 * The base AudioWorkletProcessor for use in Tone.js. Works with the {@link ToneAudioWorklet}. 
	 */
	class ToneAudioWorkletProcessor extends AudioWorkletProcessor {

		constructor(options) {
			
			super(options);
			/**
			 * If the processor was disposed or not. Keep alive until it's disposed.
			 */
			this.disposed = false;
		   	/** 
			 * The number of samples in the processing block
			 */
			this.blockSize = 128;
			/**
			 * the sample rate
			 */
			this.sampleRate = sampleRate;

			this.port.onmessage = (event) => {
				// when it receives a dispose 
				if (event.data === "dispose") {
					this.disposed = true;
				}
			};
		}
	}
`
);
yi(nd);
const sd = (
  /* javascript */
  `
	/**
	 * Abstract class for a single input/output processor. 
	 * has a 'generate' function which processes one sample at a time
	 */
	class SingleIOProcessor extends ToneAudioWorkletProcessor {

		constructor(options) {
			super(Object.assign(options, {
				numberOfInputs: 1,
				numberOfOutputs: 1
			}));
			/**
			 * Holds the name of the parameter and a single value of that
			 * parameter at the current sample
			 * @type { [name: string]: number }
			 */
			this.params = {}
		}

		/**
		 * Generate an output sample from the input sample and parameters
		 * @abstract
		 * @param input number
		 * @param channel number
		 * @param parameters { [name: string]: number }
		 * @returns number
		 */
		generate(){}

		/**
		 * Update the private params object with the 
		 * values of the parameters at the given index
		 * @param parameters { [name: string]: Float32Array },
		 * @param index number
		 */
		updateParams(parameters, index) {
			for (const paramName in parameters) {
				const param = parameters[paramName];
				if (param.length > 1) {
					this.params[paramName] = parameters[paramName][index];
				} else {
					this.params[paramName] = parameters[paramName][0];
				}
			}
		}

		/**
		 * Process a single frame of the audio
		 * @param inputs Float32Array[][]
		 * @param outputs Float32Array[][]
		 */
		process(inputs, outputs, parameters) {
			const input = inputs[0];
			const output = outputs[0];
			// get the parameter values
			const channelCount = Math.max(input && input.length || 0, output.length);
			for (let sample = 0; sample < this.blockSize; sample++) {
				this.updateParams(parameters, sample);
				for (let channel = 0; channel < channelCount; channel++) {
					const inputSample = input && input.length ? input[channel][sample] : 0;
					output[channel][sample] = this.generate(inputSample, channel, this.params);
				}
			}
			return !this.disposed;
		}
	};
`
);
yi(sd);
const id = (
  /* javascript */
  `
	/**
	 * A multichannel buffer for use within an AudioWorkletProcessor as a delay line
	 */
	class DelayLine {
		
		constructor(size, channels) {
			this.buffer = [];
			this.writeHead = []
			this.size = size;

			// create the empty channels
			for (let i = 0; i < channels; i++) {
				this.buffer[i] = new Float32Array(this.size);
				this.writeHead[i] = 0;
			}
		}

		/**
		 * Push a value onto the end
		 * @param channel number
		 * @param value number
		 */
		push(channel, value) {
			this.writeHead[channel] += 1;
			if (this.writeHead[channel] > this.size) {
				this.writeHead[channel] = 0;
			}
			this.buffer[channel][this.writeHead[channel]] = value;
		}

		/**
		 * Get the recorded value of the channel given the delay
		 * @param channel number
		 * @param delay number delay samples
		 */
		get(channel, delay) {
			let readHead = this.writeHead[channel] - Math.floor(delay);
			if (readHead < 0) {
				readHead += this.size;
			}
			return this.buffer[channel][readHead];
		}
	}
`
);
yi(id);
const ao = "feedback-comb-filter", rd = (
  /* javascript */
  `
	class FeedbackCombFilterWorklet extends SingleIOProcessor {

		constructor(options) {
			super(options);
			this.delayLine = new DelayLine(this.sampleRate, options.channelCount || 2);
		}

		static get parameterDescriptors() {
			return [{
				name: "delayTime",
				defaultValue: 0.1,
				minValue: 0,
				maxValue: 1,
				automationRate: "k-rate"
			}, {
				name: "feedback",
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 0.9999,
				automationRate: "k-rate"
			}];
		}

		generate(input, channel, parameters) {
			const delayedSample = this.delayLine.get(channel, parameters.delayTime * this.sampleRate);
			this.delayLine.push(channel, input + delayedSample * parameters.feedback);
			return delayedSample;
		}
	}
`
);
oo(ao, rd);
class vi extends ed {
  constructor() {
    const t = I(vi.getDefaults(), arguments, ["delayTime", "resonance"]);
    super(t), this.name = "FeedbackCombFilter", this.input = new U({ context: this.context }), this.output = new U({ context: this.context }), this.delayTime = new X({
      context: this.context,
      value: t.delayTime,
      units: "time",
      minValue: 0,
      maxValue: 1,
      param: this._dummyParam,
      swappable: !0
    }), this.resonance = new X({
      context: this.context,
      value: t.resonance,
      units: "normalRange",
      param: this._dummyParam,
      swappable: !0
    }), Y(this, ["resonance", "delayTime"]);
  }
  _audioWorkletName() {
    return ao;
  }
  /**
   * The default parameters
   */
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      delayTime: 0.1,
      resonance: 0.5
    });
  }
  onReady(t) {
    ee(this.input, t, this.output);
    const e = t.parameters.get("delayTime");
    this.delayTime.setParam(e);
    const n = t.parameters.get("feedback");
    this.resonance.setParam(n);
  }
  dispose() {
    return super.dispose(), this.input.dispose(), this.output.dispose(), this.delayTime.dispose(), this.resonance.dispose(), this;
  }
}
class wi extends R {
  constructor() {
    const t = I(wi.getDefaults(), arguments, ["frequency", "type"]);
    super(t), this.name = "OnePoleFilter", this._frequency = t.frequency, this._type = t.type, this.input = new U({ context: this.context }), this.output = new U({ context: this.context }), this._createFilter();
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      frequency: 880,
      type: "lowpass"
    });
  }
  /**
   * Create a filter and dispose the old one
   */
  _createFilter() {
    const t = this._filter, e = this.toFrequency(this._frequency), n = 1 / (2 * Math.PI * e);
    if (this._type === "lowpass") {
      const i = 1 / (n * this.context.sampleRate), r = i - 1;
      this._filter = this.context.createIIRFilter([i, 0], [1, r]);
    } else {
      const i = 1 / (n * this.context.sampleRate) - 1;
      this._filter = this.context.createIIRFilter([1, -1], [1, i]);
    }
    this.input.chain(this._filter, this.output), t && this.context.setTimeout(() => {
      this.disposed || (this.input.disconnect(t), t.disconnect());
    }, this.blockTime);
  }
  /**
   * The frequency value.
   */
  get frequency() {
    return this._frequency;
  }
  set frequency(t) {
    this._frequency = t, this._createFilter();
  }
  /**
   * The OnePole Filter type, either "highpass" or "lowpass"
   */
  get type() {
    return this._type;
  }
  set type(t) {
    this._type = t, this._createFilter();
  }
  /**
   * Get the frequency response curve. This curve represents how the filter
   * responses to frequencies between 20hz-20khz.
   * @param  len The number of values to return
   * @return The frequency response curve between 20-20kHz
   */
  getFrequencyResponse(t = 128) {
    const e = new Float32Array(t);
    for (let r = 0; r < t; r++) {
      const a = Math.pow(r / t, 2) * 19980 + 20;
      e[r] = a;
    }
    const n = new Float32Array(t), i = new Float32Array(t);
    return this._filter.getFrequencyResponse(e, n, i), n;
  }
  dispose() {
    return super.dispose(), this.input.dispose(), this.output.dispose(), this._filter.disconnect(), this;
  }
}
class hs extends Be {
  constructor() {
    const t = I(hs.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls");
    super(t), this.name = "Sampler", this._activeSources = /* @__PURE__ */ new Map();
    const e = {};
    Object.keys(t.urls).forEach((n) => {
      const i = parseInt(n, 10);
      if (j(Nn(n) || le(i) && isFinite(i), `url key is neither a note or midi pitch: ${n}`), Nn(n)) {
        const r = new Rt(this.context, n).toMidi();
        e[r] = t.urls[n];
      } else le(i) && isFinite(i) && (e[i] = t.urls[i]);
    }), this._buffers = new ci({
      urls: e,
      onload: t.onload,
      baseUrl: t.baseUrl,
      onerror: t.onerror
    }), this.attack = t.attack, this.release = t.release, this.curve = t.curve, this._buffers.loaded && Promise.resolve().then(t.onload);
  }
  static getDefaults() {
    return Object.assign(Be.getDefaults(), {
      attack: 0,
      baseUrl: "",
      curve: "exponential",
      onload: Q,
      onerror: Q,
      release: 0.1,
      urls: {}
    });
  }
  /**
   * Returns the difference in steps between the given midi note at the closets sample.
   */
  _findClosest(t) {
    let n = 0;
    for (; n < 96; ) {
      if (this._buffers.has(t + n))
        return -n;
      if (this._buffers.has(t - n))
        return n;
      n++;
    }
    throw new Error(`No available buffers for note: ${t}`);
  }
  /**
   * @param  notes	The note to play, or an array of notes.
   * @param  time     When to play the note
   * @param  velocity The velocity to play the sample back.
   */
  triggerAttack(t, e, n = 1) {
    return this.log("triggerAttack", t, e, n), Array.isArray(t) || (t = [t]), t.forEach((i) => {
      const r = to(new Rt(this.context, i).toFrequency()), o = Math.round(r), a = r - o, c = this._findClosest(o), u = o - c, l = this._buffers.get(u), h = Kr(c + a), p = new Tn({
        url: l,
        context: this.context,
        curve: this.curve,
        fadeIn: this.attack,
        fadeOut: this.release,
        playbackRate: h
      }).connect(this.output);
      p.start(e, 0, l.duration / h, n), Lt(this._activeSources.get(o)) || this._activeSources.set(o, []), this._activeSources.get(o).push(p), p.onended = () => {
        if (this._activeSources && this._activeSources.has(o)) {
          const f = this._activeSources.get(o), d = f.indexOf(p);
          d !== -1 && f.splice(d, 1);
        }
      };
    }), this;
  }
  /**
   * @param  notes	The note to release, or an array of notes.
   * @param  time     	When to release the note.
   */
  triggerRelease(t, e) {
    return this.log("triggerRelease", t, e), Array.isArray(t) || (t = [t]), t.forEach((n) => {
      const i = new Rt(this.context, n).toMidi();
      if (this._activeSources.has(i) && this._activeSources.get(i).length) {
        const r = this._activeSources.get(i);
        e = this.toSeconds(e), r.forEach((o) => {
          o.stop(e);
        }), this._activeSources.set(i, []);
      }
    }), this;
  }
  /**
   * Release all currently active notes.
   * @param  time     	When to release the notes.
   */
  releaseAll(t) {
    const e = this.toSeconds(t);
    return this._activeSources.forEach((n) => {
      for (; n.length; )
        n.shift().stop(e);
    }), this;
  }
  sync() {
    return this._syncState() && (this._syncMethod("triggerAttack", 1), this._syncMethod("triggerRelease", 1)), this;
  }
  /**
   * Invoke the attack phase, then after the duration, invoke the release.
   * @param  notes	The note to play and release, or an array of notes.
   * @param  duration The time the note should be held
   * @param  time     When to start the attack
   * @param  velocity The velocity of the attack
   */
  triggerAttackRelease(t, e, n, i = 1) {
    const r = this.toSeconds(n);
    return this.triggerAttack(t, r, i), Lt(e) ? (j(Lt(t), "notes must be an array when duration is array"), t.forEach((o, a) => {
      const c = e[Math.min(a, e.length - 1)];
      this.triggerRelease(o, r + this.toSeconds(c));
    })) : this.triggerRelease(t, r + this.toSeconds(e)), this;
  }
  /**
   * Add a note to the sampler.
   * @param  note      The buffer's pitch.
   * @param  url  Either the url of the buffer, or a buffer which will be added with the given name.
   * @param  callback  The callback to invoke when the url is loaded.
   */
  add(t, e, n) {
    if (j(Nn(t) || isFinite(t), `note must be a pitch or midi: ${t}`), Nn(t)) {
      const i = new Rt(this.context, t).toMidi();
      this._buffers.add(i, e, n);
    } else
      this._buffers.add(t, e, n);
    return this;
  }
  /**
   * If the buffers are loaded or not
   */
  get loaded() {
    return this._buffers.loaded;
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this._buffers.dispose(), this._activeSources.forEach((t) => {
      t.forEach((e) => e.dispose());
    }), this._activeSources.clear(), this;
  }
}
Gt([
  re(0)
], hs.prototype, "attack", void 0);
Gt([
  re(0)
], hs.prototype, "release", void 0);
class ds extends R {
  constructor() {
    const t = I(ds.getDefaults(), arguments, ["fade"]);
    super(t), this.name = "CrossFade", this._panner = this.context.createStereoPanner(), this._split = this.context.createChannelSplitter(2), this._g2a = new io({ context: this.context }), this.a = new U({
      context: this.context,
      gain: 0
    }), this.b = new U({
      context: this.context,
      gain: 0
    }), this.output = new U({ context: this.context }), this._internalChannels = [this.a, this.b], this.fade = new z({
      context: this.context,
      units: "normalRange",
      value: t.fade
    }), Y(this, "fade"), this.context.getConstant(1).connect(this._panner), this._panner.connect(this._split), this._panner.channelCount = 1, this._panner.channelCountMode = "explicit", jt(this._split, this.a.gain, 0), jt(this._split, this.b.gain, 1), this.fade.chain(this._g2a, this._panner.pan), this.a.connect(this.output), this.b.connect(this.output);
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      fade: 0.5
    });
  }
  dispose() {
    return super.dispose(), this.a.dispose(), this.b.dispose(), this.output.dispose(), this.fade.dispose(), this._g2a.dispose(), this._panner.disconnect(), this._split.disconnect(), this;
  }
}
class Ge extends R {
  constructor(t) {
    super(t), this.name = "Effect", this._dryWet = new ds({ context: this.context }), this.wet = this._dryWet.fade, this.effectSend = new U({ context: this.context }), this.effectReturn = new U({ context: this.context }), this.input = new U({ context: this.context }), this.output = this._dryWet, this.input.fan(this._dryWet.a, this.effectSend), this.effectReturn.connect(this._dryWet.b), this.wet.setValueAtTime(t.wet, 0), this._internalChannels = [this.effectReturn, this.effectSend], Y(this, "wet");
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      wet: 1
    });
  }
  /**
   * chains the effect in between the effectSend and effectReturn
   */
  connectEffect(t) {
    return this._internalChannels.push(t), this.effectSend.chain(t, this.effectReturn), this;
  }
  dispose() {
    return super.dispose(), this._dryWet.dispose(), this.effectSend.dispose(), this.effectReturn.dispose(), this.wet.dispose(), this;
  }
}
class ps extends R {
  constructor() {
    const t = I(ps.getDefaults(), arguments, [
      "pan"
    ]);
    super(t), this.name = "Panner", this._panner = this.context.createStereoPanner(), this.input = this._panner, this.output = this._panner, this.pan = new X({
      context: this.context,
      param: this._panner.pan,
      value: t.pan,
      minValue: -1,
      maxValue: 1
    }), this._panner.channelCount = t.channelCount, this._panner.channelCountMode = "explicit", Y(this, "pan");
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      pan: 0,
      channelCount: 1
    });
  }
  dispose() {
    return super.dispose(), this._panner.disconnect(), this.pan.dispose(), this;
  }
}
class fs extends R {
  constructor() {
    const t = I(fs.getDefaults(), arguments, ["smoothing"]);
    super(t), this.name = "Follower", this._abs = this.input = new so({ context: this.context }), this._lowpass = this.output = new wi({
      context: this.context,
      frequency: 1 / this.toSeconds(t.smoothing),
      type: "lowpass"
    }), this._abs.connect(this._lowpass), this._smoothing = t.smoothing;
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      smoothing: 0.05
    });
  }
  /**
   * The amount of time it takes a value change to arrive at the updated value.
   */
  get smoothing() {
    return this._smoothing;
  }
  set smoothing(t) {
    this._smoothing = t, this._lowpass.frequency = 1 / this.toSeconds(this.smoothing);
  }
  dispose() {
    return super.dispose(), this._abs.dispose(), this._lowpass.dispose(), this;
  }
}
const od = "bit-crusher", ad = (
  /* javascript */
  `
	class BitCrusherWorklet extends SingleIOProcessor {

		static get parameterDescriptors() {
			return [{
				name: "bits",
				defaultValue: 12,
				minValue: 1,
				maxValue: 16,
				automationRate: 'k-rate'
			}];
		}

		generate(input, _channel, parameters) {
			const step = Math.pow(0.5, parameters.bits - 1);
			const val = step * Math.floor(input / step + 0.5);
			return val;
		}
	}
`
);
oo(od, ad);
class Je extends R {
  constructor() {
    const t = I(Je.getDefaults(), arguments, [
      "channels"
    ]);
    super(t), this.name = "Split", this._splitter = this.input = this.output = this.context.createChannelSplitter(t.channels), this._internalChannels = [this._splitter];
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      channels: 2
    });
  }
  dispose() {
    return super.dispose(), this._splitter.disconnect(), this;
  }
}
class Se extends R {
  constructor() {
    const t = I(Se.getDefaults(), arguments, [
      "channels"
    ]);
    super(t), this.name = "Merge", this._merger = this.output = this.input = this.context.createChannelMerger(t.channels);
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      channels: 2
    });
  }
  dispose() {
    return super.dispose(), this._merger.disconnect(), this;
  }
}
class Yi extends R {
  constructor(t) {
    super(t), this.name = "StereoEffect", this.input = new U({ context: this.context }), this.input.channelCount = 2, this.input.channelCountMode = "explicit", this._dryWet = this.output = new ds({
      context: this.context,
      fade: t.wet
    }), this.wet = this._dryWet.fade, this._split = new Je({ context: this.context, channels: 2 }), this._merge = new Se({ context: this.context, channels: 2 }), this.input.connect(this._split), this.input.connect(this._dryWet.a), this._merge.connect(this._dryWet.b), Y(this, ["wet"]);
  }
  /**
   * Connect the left part of the effect
   */
  connectEffectLeft(...t) {
    this._split.connect(t[0], 0, 0), ee(...t), jt(t[t.length - 1], this._merge, 0, 0);
  }
  /**
   * Connect the right part of the effect
   */
  connectEffectRight(...t) {
    this._split.connect(t[0], 1, 0), ee(...t), jt(t[t.length - 1], this._merge, 0, 1);
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      wet: 1
    });
  }
  dispose() {
    return super.dispose(), this._dryWet.dispose(), this._split.dispose(), this._merge.dispose(), this;
  }
}
class Hi extends Yi {
  constructor(t) {
    super(t), this.feedback = new z({
      context: this.context,
      value: t.feedback,
      units: "normalRange"
    }), this._feedbackL = new U({ context: this.context }), this._feedbackR = new U({ context: this.context }), this._feedbackSplit = new Je({ context: this.context, channels: 2 }), this._feedbackMerge = new Se({ context: this.context, channels: 2 }), this._merge.connect(this._feedbackSplit), this._feedbackMerge.connect(this._split), this._feedbackSplit.connect(this._feedbackL, 0, 0), this._feedbackL.connect(this._feedbackMerge, 0, 0), this._feedbackSplit.connect(this._feedbackR, 1, 0), this._feedbackR.connect(this._feedbackMerge, 0, 1), this.feedback.fan(this._feedbackL.gain, this._feedbackR.gain), Y(this, ["feedback"]);
  }
  static getDefaults() {
    return Object.assign(Yi.getDefaults(), {
      feedback: 0.5
    });
  }
  dispose() {
    return super.dispose(), this.feedback.dispose(), this._feedbackL.dispose(), this._feedbackR.dispose(), this._feedbackSplit.dispose(), this._feedbackMerge.dispose(), this;
  }
}
class Ti extends Hi {
  constructor() {
    const t = I(Ti.getDefaults(), arguments, [
      "frequency",
      "delayTime",
      "depth"
    ]);
    super(t), this.name = "Chorus", this._depth = t.depth, this._delayTime = t.delayTime / 1e3, this._lfoL = new je({
      context: this.context,
      frequency: t.frequency,
      min: 0,
      max: 1
    }), this._lfoR = new je({
      context: this.context,
      frequency: t.frequency,
      min: 0,
      max: 1,
      phase: 180
    }), this._delayNodeL = new We({ context: this.context }), this._delayNodeR = new We({ context: this.context }), this.frequency = this._lfoL.frequency, Y(this, ["frequency"]), this._lfoL.frequency.connect(this._lfoR.frequency), this.connectEffectLeft(this._delayNodeL), this.connectEffectRight(this._delayNodeR), this._lfoL.connect(this._delayNodeL.delayTime), this._lfoR.connect(this._delayNodeR.delayTime), this.depth = this._depth, this.type = t.type, this.spread = t.spread;
  }
  static getDefaults() {
    return Object.assign(Hi.getDefaults(), {
      frequency: 1.5,
      delayTime: 3.5,
      depth: 0.7,
      type: "sine",
      spread: 180,
      feedback: 0,
      wet: 0.5
    });
  }
  /**
   * The depth of the effect. A depth of 1 makes the delayTime
   * modulate between 0 and 2*delayTime (centered around the delayTime).
   */
  get depth() {
    return this._depth;
  }
  set depth(t) {
    this._depth = t;
    const e = this._delayTime * t;
    this._lfoL.min = Math.max(this._delayTime - e, 0), this._lfoL.max = this._delayTime + e, this._lfoR.min = Math.max(this._delayTime - e, 0), this._lfoR.max = this._delayTime + e;
  }
  /**
   * The delayTime in milliseconds of the chorus. A larger delayTime
   * will give a more pronounced effect. Nominal range a delayTime
   * is between 2 and 20ms.
   */
  get delayTime() {
    return this._delayTime * 1e3;
  }
  set delayTime(t) {
    this._delayTime = t / 1e3, this.depth = this._depth;
  }
  /**
   * The oscillator type of the LFO.
   */
  get type() {
    return this._lfoL.type;
  }
  set type(t) {
    this._lfoL.type = t, this._lfoR.type = t;
  }
  /**
   * Amount of stereo spread. When set to 0, both LFO's will be panned centrally.
   * When set to 180, LFO's will be panned hard left and right respectively.
   */
  get spread() {
    return this._lfoR.phase - this._lfoL.phase;
  }
  set spread(t) {
    this._lfoL.phase = 90 - t / 2, this._lfoR.phase = t / 2 + 90;
  }
  /**
   * Start the effect.
   */
  start(t) {
    return this._lfoL.start(t), this._lfoR.start(t), this;
  }
  /**
   * Stop the lfo
   */
  stop(t) {
    return this._lfoL.stop(t), this._lfoR.stop(t), this;
  }
  /**
   * Sync the filter to the transport.
   * @see {@link LFO.sync}
   */
  sync() {
    return this._lfoL.sync(), this._lfoR.sync(), this;
  }
  /**
   * Unsync the filter from the transport.
   */
  unsync() {
    return this._lfoL.unsync(), this._lfoR.unsync(), this;
  }
  dispose() {
    return super.dispose(), this._lfoL.dispose(), this._lfoR.dispose(), this._delayNodeL.dispose(), this._delayNodeR.dispose(), this.frequency.dispose(), this;
  }
}
class bi extends Ge {
  constructor() {
    const t = I(bi.getDefaults(), arguments, ["distortion"]);
    super(t), this.name = "Distortion", this._shaper = new ie({
      context: this.context,
      length: 4096
    }), this._distortion = t.distortion, this.connectEffect(this._shaper), this.distortion = t.distortion, this.oversample = t.oversample;
  }
  static getDefaults() {
    return Object.assign(Ge.getDefaults(), {
      distortion: 0.4,
      oversample: "none"
    });
  }
  /**
   * The amount of distortion. Nominal range is between 0 and 1.
   */
  get distortion() {
    return this._distortion;
  }
  set distortion(t) {
    this._distortion = t;
    const e = t * 100, n = Math.PI / 180;
    this._shaper.setMap((i) => Math.abs(i) < 1e-3 ? 0 : (3 + e) * i * 20 * n / (Math.PI + e * Math.abs(i)));
  }
  /**
   * The oversampling of the effect. Can either be "none", "2x" or "4x".
   */
  get oversample() {
    return this._shaper.oversample;
  }
  set oversample(t) {
    this._shaper.oversample = t;
  }
  dispose() {
    return super.dispose(), this._shaper.dispose(), this;
  }
}
class Qi extends Ge {
  constructor(t) {
    super(t), this.name = "FeedbackEffect", this._feedbackGain = new U({
      context: this.context,
      gain: t.feedback,
      units: "normalRange"
    }), this.feedback = this._feedbackGain.gain, Y(this, "feedback"), this.effectReturn.chain(this._feedbackGain, this.effectSend);
  }
  static getDefaults() {
    return Object.assign(Ge.getDefaults(), {
      feedback: 0.125
    });
  }
  dispose() {
    return super.dispose(), this._feedbackGain.dispose(), this.feedback.dispose(), this;
  }
}
class xi extends Qi {
  constructor() {
    const t = I(xi.getDefaults(), arguments, ["delayTime", "feedback"]);
    super(t), this.name = "FeedbackDelay", this._delayNode = new We({
      context: this.context,
      delayTime: t.delayTime,
      maxDelay: t.maxDelay
    }), this.delayTime = this._delayNode.delayTime, this.connectEffect(this._delayNode), Y(this, "delayTime");
  }
  static getDefaults() {
    return Object.assign(Qi.getDefaults(), {
      delayTime: 0.25,
      maxDelay: 1
    });
  }
  dispose() {
    return super.dispose(), this._delayNode.dispose(), this.delayTime.dispose(), this;
  }
}
class Ci extends Ge {
  constructor() {
    const t = I(Ci.getDefaults(), arguments, [
      "decay"
    ]);
    super(t), this.name = "Reverb", this._convolver = this.context.createConvolver(), this.ready = Promise.resolve();
    const e = this.toSeconds(t.decay);
    Mt(e, 1e-3), this._decay = e;
    const n = this.toSeconds(t.preDelay);
    Mt(n, 0), this._preDelay = n, this.generate(), this.connectEffect(this._convolver);
  }
  static getDefaults() {
    return Object.assign(Ge.getDefaults(), {
      decay: 1.5,
      preDelay: 0.01
    });
  }
  /**
   * The duration of the reverb.
   */
  get decay() {
    return this._decay;
  }
  set decay(t) {
    t = this.toSeconds(t), Mt(t, 1e-3), this._decay = t, this.generate();
  }
  /**
   * The amount of time before the reverb is fully ramped in.
   */
  get preDelay() {
    return this._preDelay;
  }
  set preDelay(t) {
    t = this.toSeconds(t), Mt(t, 0), this._preDelay = t, this.generate();
  }
  /**
   * Generate the Impulse Response. Returns a promise while the IR is being generated.
   * @return Promise which returns this object.
   */
  generate() {
    return ht(this, void 0, void 0, function* () {
      const t = this.ready, e = new es(2, this._decay + this._preDelay, this.context.sampleRate), n = new ye({ context: e }), i = new ye({ context: e }), r = new Se({ context: e });
      n.connect(r, 0, 0), i.connect(r, 0, 1);
      const o = new U({ context: e }).toDestination();
      r.connect(o), n.start(0), i.start(0), o.gain.setValueAtTime(0, 0), o.gain.setValueAtTime(1, this._preDelay), o.gain.exponentialApproachValueAtTime(0, this._preDelay, this.decay);
      const a = e.render();
      return this.ready = a.then(Q), yield t, this._convolver.buffer = (yield a).get(), this;
    });
  }
  dispose() {
    return super.dispose(), this._convolver.disconnect(), this;
  }
}
class pt extends R {
  constructor() {
    const t = I(pt.getDefaults(), arguments, [
      "solo"
    ]);
    super(t), this.name = "Solo", this.input = this.output = new U({
      context: this.context
    }), pt._allSolos.has(this.context) || pt._allSolos.set(this.context, /* @__PURE__ */ new Set()), pt._allSolos.get(this.context).add(this), this.solo = t.solo;
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      solo: !1
    });
  }
  /**
   * Isolates this instance and mutes all other instances of Solo.
   * Only one instance can be soloed at a time. A soloed
   * instance will report `solo=false` when another instance is soloed.
   */
  get solo() {
    return this._isSoloed();
  }
  set solo(t) {
    t ? this._addSolo() : this._removeSolo(), pt._allSolos.get(this.context).forEach((e) => e._updateSolo());
  }
  /**
   * If the current instance is muted, i.e. another instance is soloed
   */
  get muted() {
    return this.input.gain.value === 0;
  }
  /**
   * Add this to the soloed array
   */
  _addSolo() {
    pt._soloed.has(this.context) || pt._soloed.set(this.context, /* @__PURE__ */ new Set()), pt._soloed.get(this.context).add(this);
  }
  /**
   * Remove this from the soloed array
   */
  _removeSolo() {
    pt._soloed.has(this.context) && pt._soloed.get(this.context).delete(this);
  }
  /**
   * Is this on the soloed array
   */
  _isSoloed() {
    return pt._soloed.has(this.context) && pt._soloed.get(this.context).has(this);
  }
  /**
   * Returns true if no one is soloed
   */
  _noSolos() {
    return !pt._soloed.has(this.context) || // or has a solo set but doesn't include any items
    pt._soloed.has(this.context) && pt._soloed.get(this.context).size === 0;
  }
  /**
   * Solo the current instance and unsolo all other instances.
   */
  _updateSolo() {
    this._isSoloed() ? this.input.gain.value = 1 : this._noSolos() ? this.input.gain.value = 1 : this.input.gain.value = 0;
  }
  dispose() {
    return super.dispose(), pt._allSolos.get(this.context).delete(this), this._removeSolo(), this;
  }
}
pt._allSolos = /* @__PURE__ */ new Map();
pt._soloed = /* @__PURE__ */ new Map();
class Si extends R {
  constructor() {
    const t = I(Si.getDefaults(), arguments, [
      "pan",
      "volume"
    ]);
    super(t), this.name = "PanVol", this._panner = this.input = new ps({
      context: this.context,
      pan: t.pan,
      channelCount: t.channelCount
    }), this.pan = this._panner.pan, this._volume = this.output = new He({
      context: this.context,
      volume: t.volume
    }), this.volume = this._volume.volume, this._panner.connect(this._volume), this.mute = t.mute, Y(this, ["pan", "volume"]);
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      mute: !1,
      pan: 0,
      volume: 0,
      channelCount: 1
    });
  }
  /**
   * Mute/unmute the volume
   */
  get mute() {
    return this._volume.mute;
  }
  set mute(t) {
    this._volume.mute = t;
  }
  dispose() {
    return super.dispose(), this._panner.dispose(), this.pan.dispose(), this._volume.dispose(), this.volume.dispose(), this;
  }
}
class Me extends R {
  constructor() {
    const t = I(Me.getDefaults(), arguments, [
      "volume",
      "pan"
    ]);
    super(t), this.name = "Channel", this._solo = this.input = new pt({
      solo: t.solo,
      context: this.context
    }), this._panVol = this.output = new Si({
      context: this.context,
      pan: t.pan,
      volume: t.volume,
      mute: t.mute,
      channelCount: t.channelCount
    }), this.pan = this._panVol.pan, this.volume = this._panVol.volume, this._solo.connect(this._panVol), Y(this, ["pan", "volume"]);
  }
  static getDefaults() {
    return Object.assign(R.getDefaults(), {
      pan: 0,
      volume: 0,
      mute: !1,
      solo: !1,
      channelCount: 1
    });
  }
  /**
   * Solo/unsolo the channel. Soloing is only relative to other {@link Channel}s and {@link Solo} instances
   */
  get solo() {
    return this._solo.solo;
  }
  set solo(t) {
    this._solo.solo = t;
  }
  /**
   * If the current instance is muted, i.e. another instance is soloed,
   * or the channel is muted
   */
  get muted() {
    return this._solo.muted || this.mute;
  }
  /**
   * Mute/unmute the volume
   */
  get mute() {
    return this._panVol.mute;
  }
  set mute(t) {
    this._panVol.mute = t;
  }
  /**
   * Get the gain node belonging to the bus name. Create it if
   * it doesn't exist
   * @param name The bus name
   */
  _getBus(t) {
    return Me.buses.has(t) || Me.buses.set(t, new U({ context: this.context })), Me.buses.get(t);
  }
  /**
   * Send audio to another channel using a string. `send` is a lot like
   * {@link connect}, except it uses a string instead of an object. This can
   * be useful in large applications to decouple sections since {@link send}
   * and {@link receive} can be invoked separately in order to connect an object
   * @param name The channel name to send the audio
   * @param volume The amount of the signal to send.
   * 	Defaults to 0db, i.e. send the entire signal
   * @returns Returns the gain node of this connection.
   */
  send(t, e = 0) {
    const n = this._getBus(t), i = new U({
      context: this.context,
      units: "decibels",
      gain: e
    });
    return this.connect(i), i.connect(n), i;
  }
  /**
   * Receive audio from a channel which was connected with {@link send}.
   * @param name The channel name to receive audio from.
   */
  receive(t) {
    return this._getBus(t).connect(this), this;
  }
  dispose() {
    return super.dispose(), this._panVol.dispose(), this.pan.dispose(), this.volume.dispose(), this._solo.dispose(), this;
  }
}
Me.buses = /* @__PURE__ */ new Map();
bt().transport;
function cd() {
  return bt().transport;
}
bt().destination;
bt().destination;
function ud() {
  return bt().destination;
}
bt().listener;
bt().draw;
bt();
const Ds = ud();
Ds.channelCount = Ds.maxChannelCount;
const co = new Se({ channels: 32 }), Es = Array.from({ length: 32 }, (s, t) => new U(1));
function J(s, t) {
  t !== void 0 && (t instanceof je || t instanceof z || t instanceof Ht || t instanceof fs || t instanceof U || t instanceof de ? t.connect(s) : s.value = t);
}
function ut(s) {
  return typeof s == "number" ? s : s instanceof z ? s.value : 0;
}
function ys(s) {
  return typeof s == "number" ? new z(s) : s;
}
function ld(s) {
  const t = ut(s);
  return [-12, -24, -48, -96].includes(t) ? t : -12;
}
function Dn(s, t = 220) {
  const e = new at(220, s).sync().start("0.05");
  return J(e.frequency, t), e;
}
function tn(s, t = 1, e = 1, n = "sine", i = "sine") {
  const r = new xn(220, n, i).sync().start("0.05");
  return J(r.frequency, s), J(r.harmonicity, t), J(r.modulationIndex, e), r;
}
function en(s = 220, t = 1, e = "sine", n = "sine") {
  const i = new bn(220, e, n).sync().start("0.05");
  return J(i.frequency, s), J(i.harmonicity, t), i;
}
function hd(s = 220, t = 0.5) {
  const e = new Sn(220).sync().start("0.05");
  return J(e.frequency, s), J(e.modulationFrequency, t), e;
}
function nn(s = 220, t = 10, e = "sine") {
  const n = new Cn(220, e, ut(t)).sync().start("0.05");
  return J(n.frequency, s), n;
}
function vs(s, t = "lowpass", e = 1e3, n = 1, i = -12) {
  const r = new _i(1e3, t);
  return r.set({ rolloff: ld(i), Q: ut(n) }), J(r.frequency, e), J(r.Q, n), s.connect(r), r;
}
function sn(s, t = 0.5, e = 0, n = 1) {
  const i = new je({ min: ut(e), max: ut(n), type: s }).sync().start("0.05");
  return J(i.frequency, t), i;
}
let Is = [], $n = Es;
const uo = {
  core: {
    value: (s) => s
  },
  // Signals
  signals: {
    sig: (s) => new z(s),
    s: (s) => new z(s),
    add: (s, t) => {
      const e = new os(ut(t));
      return J(e.addend, t), s.connect(e), e;
    },
    mul: (s, t) => {
      const e = new $t(ut(t));
      return J(e.factor, ys(t)), s.connect(e), e;
    },
    sub: (s, t) => {
      const e = new cs(ut(t));
      return J(e.subtrahend, ys(t)), s.connect(e), e;
    },
    ...Object.fromEntries([so, pi, us, ro, io, hi, wn, de, fi].map((s) => [s.name.toLowerCase().replace(/_/g, ""), (e, ...n) => {
      const i = new s(...n);
      return e.connect(i), i;
    }]))
  },
  // AudioSignals
  oscillators: {
    sine: (s = 220) => Dn("sine", s),
    tri: (s = 220) => Dn("triangle", s),
    square: (s = 220) => Dn("square", s),
    saw: (s = 220) => Dn("sawtooth", s),
    fm: (s = 220, t = 1, e = 1) => tn(s, t, e),
    fmsine: (s = 220, t = 1, e = 1) => tn(s, t, e, "sine"),
    fmtri: (s = 220, t = 1, e = 1) => tn(s, t, e, "triangle"),
    fmsquare: (s = 220, t = 1, e = 1) => tn(s, t, e, "square"),
    fmsaw: (s = 220, t = 1, e = 1) => tn(s, t, e, "sawtooth"),
    am: (s = 220, t = 1) => en(s, t),
    amsine: (s = 220, t = 1) => en(s, t, "sine"),
    amtri: (s = 220, t = 1) => en(s, t, "triangle"),
    amsquare: (s = 220, t = 1) => en(s, t, "square"),
    amsaw: (s = 220, t = 1) => en(s, t, "sawtooth"),
    pulse: (s = 220, t = 0.5) => {
      const e = new Qe(220, ut(t)).sync().start("0.05");
      return J(e.frequency, s), J(e.width, t), e;
    },
    pwm: (s = 220, t = 0.5) => hd(s, t),
    fat: (s = 220, t = 10) => nn(s, t),
    fatsine: (s = 220, t = 10) => nn(s, t, "sine"),
    fattri: (s = 220, t = 10) => nn(s, t, "triangle"),
    fatsquare: (s = 220, t = 10) => nn(s, t, "square"),
    fatsaw: (s = 220, t = 10) => nn(s, t, "sawtooth")
  },
  noise: {
    white: () => new ye("white").start(0),
    pink: () => new ye("pink").start(0),
    brown: () => new ye("brown").start(0)
  },
  // ControlSignals
  lfos: {
    lfo: (s, t = 0, e = 1) => sn("sine", s, t, e),
    lfosine: (s, t = 0, e = 1) => sn("sine", s, t, e),
    lfotri: (s, t = 0, e = 1) => sn("triangle", s, t, e),
    lfosquare: (s, t = 0, e = 1) => sn("square", s, t, e),
    lfosaw: (s, t = 0, e = 1) => sn("sawtooth", s, t, e)
  },
  envelopes: {
    adsr: (s = 100, t = 100, e = 0.5, n = 800) => (s /= 1e3, t /= 1e3, n /= 1e3, new Ht({ attack: s, decay: t, sustain: e, release: n }))
  },
  modifiers: {
    amp: (s, t) => {
      const e = new U(1);
      return J(e.gain, t), s.connect(e), e;
    }
  },
  metering: {
    follow: (s, t = 0.01) => {
      const e = new fs(ut(t)), n = new z();
      return s.connect(e), e.connect(n), n;
    }
  },
  filters: {
    hpf: (s, t = 1e3, e = 1, n = -12) => vs(s, "highpass", t, e, n),
    lpf: (s, t = 1e3, e = 1, n = -12) => vs(s, "lowpass", t, e, n),
    bpf: (s, t = 1e3, e = 1, n = -12) => vs(s, "bandpass", t, e, n),
    fbf: (s, t = 0.5, e = 0.5) => {
      const n = new vi({
        delayTime: ut(t),
        resonance: ut(e)
      });
      return J(n.delayTime, t), J(n.resonance, e), s.connect(n), n;
    }
  },
  effects: {
    reverb: (s, t = 0.5, e = 1e3) => {
      const n = new Ci(ut(e) / 1e3);
      return J(n.wet, t), s.connect(n), n;
    },
    delay: (s, t = 0.5, e = 0.5, n = 0.5) => {
      const i = new xi({
        delayTime: ut(e),
        feedback: ut(n),
        wet: ut(t)
      });
      return J(i.wet, t), J(i.delayTime, e), J(i.feedback, n), s.connect(i), i;
    },
    dist: (s, t = 0.5, e = 0.5) => {
      const n = new bi(ut(e));
      return J(n.wet, t), s.connect(n), n;
    },
    chorus: (s, t = 0.5, e = 1, n = 5e-3, i = 0.7) => {
      const r = new Ti({
        wet: ut(t),
        frequency: ut(e),
        feedback: ut(n),
        depth: ut(i)
      });
      return J(r.wet, t), J(r.frequency, e), J(r.feedback, n), s.connect(r), r;
    }
  },
  routing: {
    pan: (s, t = 0.5) => {
      const e = ys(t), n = new de(-1, 1);
      e.connect(n);
      const i = new ps(ut(n));
      return J(i.pan, n), s.connect(i), i;
    },
    out: (s, ...t) => {
      const e = new U(0);
      s.connect(e), t = t.length > 0 ? t : [0, 1];
      const n = new Je(t.length);
      return e.connect(n), t.forEach((i, r) => n.connect(co, r, i)), e;
    },
    bus: (s, t) => {
      if (typeof s == "number") {
        const e = s, n = new We(0.01);
        return $n[e].connect(n), n;
      } else {
        const e = s;
        return e.connect($n[t || 0]), e;
      }
    },
    stack: (...s) => {
      if (s.length === 0)
        throw new Error("No nodes provided to stack");
      const t = new U(1);
      return s.forEach((e) => {
        e.gain?.rampTo(1, 0.1), e.connect(t), Is.push(() => {
          e.gain?.rampTo(0, 0.1), setTimeout(() => e.dispose(), 1e3);
        });
      }), t;
    }
  }
}, Ms = Object.values(uo).reduce((s, t) => (Object.entries(t).forEach(([e, n]) => {
  s[e] = n;
}), s)), dd = Object.entries(uo).reduce((s, [t, e]) => ({
  ...s,
  [t]: Object.keys(e)
}), {}), pd = {
  _signal: (s) => (t, e, n) => (n ? s.rampTo(t, n / 1e3, e) : s.setValueAtTime(t, e), s),
  _envelope: (s) => (t) => {
    const { a: e = 10, d: n = 10, s: i = 0.5, r = 800 } = t;
    return s.set({ attack: e / 1e3, decay: n / 1e3, sustain: i, release: r / 1e3 }), s;
  }
};
function fd(s) {
  return Object.entries(s).reduce((t, [e, n]) => {
    const i = pd[n.constructor.name.toLowerCase()];
    return t[e] = i ? i(n) : () => {
    }, t;
  }, {});
}
const md = (s, t) => {
  Is = [], $n = t || $n;
  const e = new Function(
    ...Object.keys(Ms),
    s
  )(...Object.values(Ms)), { inputs: n, output: i } = e;
  return {
    inputs: fd(n || {}),
    output: i,
    dispose: () => {
      e.output?.gain?.rampTo(0, 0.5), Is.forEach((r) => r()), setTimeout(() => i?.dispose?.(), 1e3);
    }
  };
};
class ve {
  type;
  inputs;
  id;
  // Optional identifier for the Node
  constructor(t, e = [], n) {
    this.type = t, this.inputs = e, this.id = n;
  }
  /**
   * Transpiles a single Node into a line of JavaScript code.
   */
  toCode(t, e, n, i) {
    let r = `let ${e} = ${t.type}(${n.join(",")});`;
    return r += i ? ` inputs = {...inputs, ${i}: ${e}};` : "", r;
  }
  /**
   * Compiles the Node and its dependencies into a series of JavaScript lines.
   * Returns an object containing the lines of code and the last reference.
   */
  toScript() {
    let t = Array.from(lo(this));
    const e = (r) => typeof r != "object" ? r : `v${t.indexOf(r)}`;
    let n = [];
    for (let r in t) {
      const o = t[r], a = o.inputs.map(e), c = e(o);
      n.push(o.toCode(o, c, a, o.id));
    }
    const i = e(t[t.length - 1]);
    return {
      lines: n,
      last: i
    };
  }
}
function Ji(s) {
  return s instanceof ve ? s : new ve("value", [s]);
}
function* lo(s, t = /* @__PURE__ */ new Set()) {
  if (!(!(s instanceof ve) || t.has(s))) {
    t.add(ve);
    for (let e of s.inputs)
      yield* lo(e, t);
    yield s;
  }
}
function _d(s) {
  return ve.prototype[s] = function(...t) {
    const e = typeof t[0] == "string" ? t[0] : void 0;
    return e && t.shift(), new ve(s, [this, ...t].map(Ji), e);
  }, (...t) => {
    const e = typeof t[0] == "string" ? t[0] : void 0;
    return e && t.shift(), new ve(s, t.map(Ji), e);
  };
}
class gd {
  /**
   * AudioContext to use. Currently not used, but there for future compatibility.
   */
  _context = bt();
  /**
   * Transport to use. Currently not used, but there for future compatibility.
   */
  _transport;
  /**
   * A 32 channel output bus that merges all audio outputs into a single stream.
   */
  _outputs = co;
  /**
   * A collection of Gain nodes that can be used as busses in the ZMod environment.
   */
  _busses = Es;
  /**
   * A collection of Nodes that can be used in the ZMod environment.
   * These are dynamically registered from a provided library - meaning we can change synth engine in future.
   */
  _nodes = {};
  /**
   * The ZMod scripting language transpiled to JavaScript.
   */
  _transpiledCode = "";
  /**
       * The current audio patch created from the transpiled code.
  e current audio patch created from the transpiled cod/tonee.
       * Contains the inputs and output of the audio graph, and a dispose method to clean up resources.
       */
  _patch;
  /**
   * Flag to indicate if the current patch is new or has changed since the last run.
   */
  _isNewPatch = !1;
  /**
   * Library Keys - a list of categorised Node types available in the ZMod environment.
   * Useful for UI generation.
   */
  libraryKeys = dd;
  constructor(t) {
    this._context = t?.context || bt(), this._transport = t?.transport || cd(), this._busses = t?.busses || Es, this.loadNodes(Ms);
  }
  /**
   * A library of Nodes - oscillators, filters, etc. that can be used in the ZMod environment.
   * This method registers the Nodes from the provided library
   * @param library 
   */
  loadNodes(t) {
    this._nodes = Object.keys(t).reduce((e, n) => (e[n] = _d(n), e), {});
  }
  /**
   * Parses the Zen Modular code and prepares it for transpilation.
   * This method modifies the code to ensure it is in a format that can be executed as JavaScript.
   * 
   * @param code The Zen Modular code to parse.
   * @returns The parsed code ready for transpilation.
   */
  parseCode(t) {
    return t = t.replace(/;/g, ""), t = t.replace(/(\(|,)([a-zA-Z_][a-zA-Z0-9_]*)(?=\)|,)/g, (e, n, i) => `${n}'${i}'`), t = t.replace(/#(e\d*)/g, (e, n) => `adsr('${n}')`), t = t.replace(/#([a-zA-Z_][a-zA-Z0-9_]*)/g, (e, n) => `s('${n}')`), t;
  }
  /**
   * @param code Set Zen Modular code to be transpiled into JavaScript.
   * Transpiles the code into a series of JavaScript lines that can be executed to create an audio graph.
   */
  set(t) {
    try {
      const n = new Function(
        ...Object.keys(this._nodes),
        `return (${this.parseCode(t)});`
      )(...Object.values(this._nodes)).toScript(), i = `let inputs = {};
${n.lines.join(`
`)}
return {inputs, output: ${n.last}};`;
      this._isNewPatch = i !== this._transpiledCode, this._transpiledCode = i;
    } catch (e) {
      console.error("Error during transpilation:", e);
    }
    return this;
  }
  /**
   * Get the inputs of the current patch.
   * These are the controllable parameters of the audio graph.
   */
  get inputs() {
    return this._patch?.inputs || {};
  }
  /**
   * Build the audio graph from the transpiled code and start it.
   */
  start() {
    try {
      this._isNewPatch && (this._busses.forEach((t) => t.disconnect()), this._patch?.dispose(), this._patch = md(this._transpiledCode, this._busses)), this._patch?.output?.gain?.rampTo(0.25, 0.1), this._transport?.start();
    } catch (t) {
      console.error("Error compiling code:", t);
    }
    return this;
  }
  /**
   * Stop the transport, pausing the audio graph without deleting it.
   * @returns ZMod
   */
  stop() {
    return this._transport?.stop(), this._patch?.output?.gain?.rampTo(0, 0.1), this;
  }
  /**
   * Clears the current audio patch and resets the state.
   * You need to parse more code before you can run it again.
   */
  clear() {
    return this._transport?.stop(), this._patch?.dispose(), this._patch = null, this._transpiledCode = "", this._isNewPatch = !1, this;
  }
  /**
   * Play: triggers any input functions with matching names.
   */
  play(t = {}, e) {
    Object.keys(this.inputs).forEach(
      (r) => t[r] && this.inputs[r](t[r], e)
    );
    const { dur: n = 1e3 } = t, i = Object.entries(t).filter(([r]) => /^([adsr])\d*$/.test(r)).reduce((r, [o, a]) => {
      const [, c, u = ""] = o.match(/^([adsr])(\d*)$/), l = `e${u}`;
      return {
        ...r,
        [l]: {
          ...r[l] || {},
          [c]: a
        }
      };
    }, { e: {} });
    return Object.keys(this.inputs).filter((r) => /^e\d*$/.test(r)).forEach((r) => {
      const o = i[r] || {};
      this.inputs[r](o).triggerAttackRelease(n / 1e3, e);
    }), this;
  }
  /**
   * Mutate: triggers any input functions with matching names passing a lag time.
   */
  mutate(t = {}, e, n) {
    return Object.keys(this.inputs).forEach(
      (i) => t[i] !== void 0 && this.inputs[i](t[i], e, n)
    ), this;
  }
  /**
   * Cut any envelopes are currently playing.
   */
  cut(t, e = 10) {
    return Object.keys(this.inputs).filter((n) => /^e\d*$/.test(n)).forEach((n) => {
      this.inputs[n]({}).triggerRelease(t, e / 1e3);
    }), this;
  }
  /**
   * Disconnects ZMod's output bus.
   */
  disconnect() {
    return this._outputs.disconnect(), this;
  }
  /**
   * Connect Zmod's output bus to an AudioNode.
   * This allows you to route the audio output to any AudioNode in the Web Audio API
   * @param args The AudioNode to connect to, and optional output and input indices.
   * @returns The ZMod instance for method chaining.
   */
  connect(t, e) {
    if (e !== void 0) {
      const n = [e].flat(), i = new Je(32), r = new Se(n.length);
      this._outputs.connect(i), [e].flat().forEach((o, a) => {
        i.connect(r, o, a);
      }), r.connect(t);
    } else
      this._outputs.connect(t);
    return this;
  }
  toDestination() {
    return this._outputs.connect(Ds), this;
  }
}
const yd = document.getElementById("start"), vd = document.getElementById("stop"), un = document.getElementById("code"), wd = document.getElementById("nodes");
localStorage.getItem("zmod-code") && (un.value = localStorage.getItem("zmod-code") || "");
const ki = new gd().toDestination();
wd.innerHTML = Object.entries(ki.libraryKeys).filter(([s, t]) => s !== "core").map(([s, t]) => `<p><strong>${s}</strong>: ${t.join(", ")}</p>`).join("");
const ho = () => ki.set(un.value).start(), po = () => ki.stop();
yd?.addEventListener("click", ho);
vd?.addEventListener("click", po);
un?.addEventListener("keydown", (s) => {
  s.shiftKey && s.key === "Enter" && (s.preventDefault(), localStorage.setItem("zmod-code", un.value), ho());
});
un?.addEventListener("keydown", (s) => {
  s.key === "Escape" && (s.preventDefault(), po());
});
