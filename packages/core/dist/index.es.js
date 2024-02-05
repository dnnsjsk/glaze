var A = Object.defineProperty;
var y = (d, e, i) => e in d ? A(d, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : d[e] = i;
var l = (d, e, i) => (y(d, typeof e != "symbol" ? e + "" : e, i), i);
const n = class n {
  static isObject(e) {
    return e && typeof e == "object" && !Array.isArray(e) && !(e instanceof HTMLElement);
  }
  static mergeDeep(e, ...i) {
    if (!i.length)
      return e;
    const r = i.shift();
    if (this.isObject(e) && this.isObject(r))
      for (const t in r)
        this.isObject(r[t]) ? (e[t] || Object.assign(e, { [t]: {} }), this.mergeDeep(e[t], r[t])) : Object.assign(e, { [t]: r[t] });
    return i.length ? this.mergeDeep(e, ...i) : e;
  }
  static generateUniqueId() {
    return Math.random().toString(36).substring(2, 15);
  }
  static getSelectorFromBracket(e) {
    const i = /^\[([^\]]+)]:(.*)/, r = e.match(i);
    return r ? {
      content: r[1],
      restOfString: r[2]
    } : null;
  }
  static castValue(e, i, r) {
    if (typeof e != "string")
      return e;
    const t = e.replace(/^\[|]$/g, "").replaceAll("_", " ");
    return t.startsWith("&") ? this.getSelectorOrElement(
      i,
      e,
      ["trigger"].includes(r)
    ) : t === "true" || t === "false" ? t === "true" : isNaN(Number(t)) ? t : t.includes(".") ? parseFloat(t) : parseInt(t, 10);
  }
  static parseTimeline(e) {
    var t;
    const i = /(?:@(\w+):)?tl(?:\/(\w+))?/, r = e.match(i);
    if (r) {
      const c = r[1], s = { id: r[2] ?? "", matchMedia: this.bp };
      if (c) {
        if (!((t = this.matchMedias) != null && t[c]))
          return null;
        s.matchMedia = this.matchMedias[c];
      }
      return s;
    } else
      return null;
  }
  static parseMediaQueries(e) {
    const i = {};
    return e.split(" ").forEach((t) => {
      var s;
      const c = t.match(/@(\w+):/);
      if (!c) {
        i[this.bp] || (i[this.bp] = []), i[this.bp].push(t);
        return;
      }
      const o = c[1];
      (s = this.matchMedias) != null && s[o] && (i[this.matchMedias[o]] || (i[this.matchMedias[o]] = []), i[this.matchMedias[o]].push(t.replace(c[0], "")));
    }), i;
  }
  static parseToObject(e, i = !1, r) {
    const t = {};
    return e.split(" ").forEach((o) => {
      var g;
      const s = this.getSelectorFromBracket(o);
      s && (o = s.restOfString, t.selector = {}, t.selector.value = s.content);
      const a = o.split(":").filter((f) => !f.includes("@")), [u, h] = a;
      if (!h && i) {
        const f = o.split("-"), m = f[0], p = f[1];
        if (!m || !p)
          return;
        t[m] = this.castValue(p, r, m);
        return;
      }
      if (u === "tl" && h.startsWith("[")) {
        t.tl = {
          value: (g = this.getSelectorFromBracket(h + ":")) == null ? void 0 : g.content
        };
        return;
      }
      if (!h)
        return;
      const O = h.split("|");
      t[u] || (t[u] = {}), O.forEach((f) => {
        if (!f)
          return;
        let [m, p] = f.split(/-(.+)/);
        p = this.castValue(p, r, m);
        const E = m.split(".");
        let b = t[u];
        E.forEach((M, j) => {
          j === E.length - 1 ? b[M] = p : (b[M] || (b[M] = {}), b = b[M]);
        });
      });
    }), t;
  }
  static collect() {
    const e = [], i = this.getElements(), r = (t) => t === "tl" || t.includes("tl/") || t.endsWith(":tl");
    i.forEach((t) => {
      const c = this.getAttribute(t), o = c.split(" ");
      if (o.some((s) => r(s))) {
        const s = this.parseTimeline(c), a = [];
        [
          ...this.getElements(t),
          ...s != null && s.id ? document.querySelectorAll(
            `[${this.config.dataAttribute}*="tl:${s.id}"]`
          ) : []
        ].forEach((h) => {
          a.push(h);
        });
        const u = this.parseToObject(
          o.filter((h) => !r(h)).join(" "),
          !0,
          t
        );
        e.push(t), this.timelines.push({
          id: (s == null ? void 0 : s.id) || this.generateUniqueId(),
          data: u,
          matchMedia: (s == null ? void 0 : s.matchMedia) || this.bp,
          elements: a
        });
        return;
      }
    }), i.forEach((t) => {
      var o;
      if (e.includes(t))
        return;
      const c = (o = this.timelines.find(
        (s) => s.elements.some((a) => a === t) && s.matchMedia
      )) == null ? void 0 : o.matchMedia;
      this.elements.push(
        ...Object.entries(
          this.parseMediaQueries(this.getAttribute(t))
        ).map(([s, a]) => ({
          matchMedia: s ?? c,
          element: t,
          data: this.parseToObject(a.join(" "), !1, t)
        }))
      );
    }), this.elements.forEach((t) => {
      this.data.has(t.element) || this.data.set(t.element, {});
      const c = {
        [t.matchMedia]: t.data
      };
      this.data.set(t.element, {
        ...this.data.get(t.element),
        ...c
      });
    });
  }
  static init() {
    const e = this.gsap.matchMedia(), i = (r, t, c) => {
      var s;
      const o = t.tl ? (s = Object.values(t.tl)) == null ? void 0 : s[0] : void 0;
      if (t.to && t.from) {
        c ? c.fromTo(
          this.getSelectorOrElement(r, t),
          t.from,
          t.to,
          o
        ) : this.gsap.fromTo(
          this.getSelectorOrElement(r, t),
          t.from,
          t.to
        );
        return;
      }
      if (t.to || t.from) {
        const a = t.to ? "to" : "from";
        c ? c[a](
          this.getSelectorOrElement(r, t),
          t[a],
          o
        ) : this.gsap[a](this.getSelectorOrElement(r, t), t[a]);
      }
    };
    e.add(
      Object.fromEntries(
        Object.values({
          [this.bp]: this.bp,
          ...this.matchMedias || {}
        }).map((r) => [r, r])
      ),
      (r) => {
        const t = [];
        this.timelines.forEach((c) => {
          const o = this.gsap.timeline(c.data || {});
          t.push({
            elements: c.elements,
            timeline: o
          });
        }), this.data.forEach((c, o) => {
          var u;
          let s = {};
          Object.entries(c).forEach(([h, O]) => {
            var g;
            (g = r.conditions) != null && g[h] && (s = this.mergeDeep(s, O));
          });
          const a = (u = t.find(
            ({ elements: h }) => h.includes(o)
          )) == null ? void 0 : u.timeline;
          i(o, s, a);
        });
      }
    );
  }
  constructor(e) {
    if (!e.gsap.core) {
      console.error("Glaze: GSAP is not defined");
      return;
    }
    return n.config = {
      ...n.config,
      ...e
    }, n.matchMedias = e.breakpoints, n.gsap = e.gsap.core, n.collect(), n.init(), {
      gsap: n.gsap,
      config: n.config,
      matchMedias: n.matchMedias,
      elements: n.elements,
      timelines: n.timelines,
      data: n.data
    };
  }
};
l(n, "bp", "(min-width: 1px)"), l(n, "gsap"), l(n, "config", {
  dataAttribute: "data-animate"
}), l(n, "matchMedias", {}), l(n, "elements", []), l(n, "timelines", []), l(n, "data", /* @__PURE__ */ new Map()), l(n, "getAttributeString", (e = !1) => `${e ? "[" : ""}${n.config.dataAttribute}${e ? "]" : ""}`), l(n, "getAttribute", (e) => (e.getAttribute(n.getAttributeString()) || "").trim()), l(n, "getElements", (e = document) => e.querySelectorAll(n.getAttributeString(!0))), l(n, "getSelectorOrElement", (e, i, r = !1) => {
  var c;
  const t = typeof i != "string" ? (c = i == null ? void 0 : i.selector) == null ? void 0 : c.value : "";
  if (t) {
    if (t.startsWith("&")) {
      const s = t == null ? void 0 : t.replace("&", ":scope");
      return r ? e.querySelector(s) : e.querySelectorAll(s);
    }
    return t;
  }
  return e;
});
let S = n;
export {
  S as Glaze
};
