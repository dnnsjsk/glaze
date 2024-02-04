var A = Object.defineProperty;
var y = (p, t, i) => t in p ? A(p, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : p[t] = i;
var h = (p, t, i) => (y(p, typeof t != "symbol" ? t + "" : t, i), i);
const n = class n {
  static isObject(t) {
    return t && typeof t == "object" && !Array.isArray(t);
  }
  static mergeDeep(t, ...i) {
    if (!i.length)
      return t;
    const s = i.shift();
    if (this.isObject(t) && this.isObject(s))
      for (const e in s)
        this.isObject(s[e]) ? (t[e] || Object.assign(t, { [e]: {} }), this.mergeDeep(t[e], s[e])) : Object.assign(t, { [e]: s[e] });
    return i.length ? this.mergeDeep(t, ...i) : t;
  }
  static adjustValuesByKey(t, i, s) {
    Object.keys(t).forEach((e) => {
      i.includes(e) ? t[e] = s(t[e]) : typeof t[e] == "object" && t[e] !== null && !Array.isArray(t[e]) ? this.adjustValuesByKey(t[e], i, s) : Array.isArray(t[e]) && t[e].forEach((c) => {
        typeof c == "object" && c !== null && this.adjustValuesByKey(c, i, s);
      });
    });
  }
  static generateUniqueId() {
    return Math.random().toString(36).substring(2, 15);
  }
  static getSelectorFromBracket(t) {
    const i = /^\[([^\]]+)]:(.*)/, s = t.match(i);
    return s ? {
      content: s[1],
      restOfString: s[2]
    } : null;
  }
  static castValue(t) {
    if (typeof t != "string")
      return t;
    const i = t.replace(/^\[|]$/g, "");
    return i === "true" || i === "false" ? i === "true" : isNaN(Number(i)) ? i : i.includes(".") ? parseFloat(i) : parseInt(i, 10);
  }
  static parseTimeline(t) {
    var e;
    const i = /(?:@(\w+):)?tl(?:\/(\w+))?/, s = t.match(i);
    if (s) {
      const c = s[1], o = { id: s[2] ?? "", matchMedia: this.bp };
      if (c) {
        if (!((e = this.matchMedias) != null && e[c]))
          return null;
        o.matchMedia = this.matchMedias[c];
      }
      return o;
    } else
      return null;
  }
  static parseMediaQueries(t) {
    const i = {};
    return t.split(" ").forEach((e) => {
      var o;
      const c = e.match(/@(\w+):/);
      if (!c) {
        i[this.bp] || (i[this.bp] = []), i[this.bp].push(e);
        return;
      }
      const r = c[1];
      (o = this.matchMedias) != null && o[r] && (i[this.matchMedias[r]] || (i[this.matchMedias[r]] = []), i[this.matchMedias[r]].push(e.replace(c[0], "")));
    }), i;
  }
  static parseToObject(t, i = !1) {
    const s = {};
    return t.split(" ").forEach((c) => {
      var g;
      const r = this.getSelectorFromBracket(c);
      r && (c = r.restOfString, s.selector = {}, s.selector.value = r.content);
      const o = c.split(":").filter((l) => !l.includes("@")), [a, u] = o;
      if (!u && i) {
        const l = c.split("-"), b = l[0], m = l[1];
        if (!b || !m)
          return;
        s[b] = this.castValue(m);
        return;
      }
      if (a === "tl" && u.startsWith("[")) {
        s.tl = {
          value: (g = this.getSelectorFromBracket(u + ":")) == null ? void 0 : g.content
        };
        return;
      }
      const f = u.split("|");
      s[a] || (s[a] = {}), f.forEach((l) => {
        if (!l)
          return;
        let [b, m] = l.split(/-(.+)/);
        m = this.castValue(m);
        const O = b.split(".");
        let d = s[a];
        O.forEach((M, S) => {
          S === O.length - 1 ? d[M] = m : (d[M] || (d[M] = {}), d = d[M]);
        });
      });
    }), s;
  }
  static collect() {
    const t = [], i = this.getElements();
    i.forEach((s) => {
      const e = this.getAttribute(s), c = e.split(" ");
      if (c.some(
        (r) => r === "tl" || r.includes("tl/") || r.endsWith(":tl")
      )) {
        const r = this.parseTimeline(e), o = [];
        [
          ...this.getElements(s),
          ...r != null && r.id ? document.querySelectorAll(
            `[${this.config.dataAttribute}*="tl:${r.id}"]`
          ) : []
        ].forEach((a) => {
          o.push(a);
        }), t.push(s), this.timelines.push({
          id: (r == null ? void 0 : r.id) || this.generateUniqueId(),
          data: this.parseToObject(
            c.filter(
              (a) => a !== "tl" && !a.includes("tl/") && !a.endsWith(":tl")
            ).join(" "),
            !0
          ),
          matchMedia: (r == null ? void 0 : r.matchMedia) || this.bp,
          elements: o
        });
        return;
      }
    }), i.forEach((s) => {
      var c;
      if (t.includes(s))
        return;
      const e = (c = this.timelines.find(
        (r) => r.elements.some((o) => o === s) && r.matchMedia
      )) == null ? void 0 : c.matchMedia;
      this.elements.push(
        ...Object.entries(
          this.parseMediaQueries(this.getAttribute(s))
        ).map(([r, o]) => ({
          matchMedia: r ?? e,
          element: s,
          data: this.parseToObject(o.join(" "))
        }))
      );
    }), this.elements.forEach((s) => {
      this.data.has(s.element) || this.data.set(s.element, {});
      const e = {
        [s.matchMedia]: s.data
      };
      this.data.set(s.element, {
        ...this.data.get(s.element),
        ...e
      });
    });
  }
  static init() {
    const t = this.gsap.matchMedia(), i = (s, e, c) => {
      var o;
      const r = e.tl ? (o = Object.values(e.tl)) == null ? void 0 : o[0] : void 0;
      if (e.to && e.from) {
        c ? c.fromTo(
          this.getSelectorOrElement(s, e),
          e.from,
          e.to,
          r
        ) : this.gsap.fromTo(
          this.getSelectorOrElement(s, e),
          e.from,
          e.to
        );
        return;
      }
      if (e.to || e.from) {
        const a = e.to ? "to" : "from";
        c ? c[a](
          this.getSelectorOrElement(s, e),
          e[a],
          r
        ) : this.gsap[a](this.getSelectorOrElement(s, e), e[a]);
      }
    };
    t.add(
      Object.fromEntries(
        Object.values({
          [this.bp]: this.bp,
          ...this.matchMedias || {}
        }).map((s) => [s, s])
      ),
      (s) => {
        const e = [];
        this.timelines.forEach((c) => {
          const r = this.gsap.timeline(c.data || {});
          e.push({
            elements: c.elements,
            timeline: r
          });
        }), this.data.forEach((c, r) => {
          var u;
          let o = {};
          Object.entries(c).forEach(([f, g]) => {
            var l;
            (l = s.conditions) != null && l[f] && (o = this.mergeDeep(o, g));
          }), this.adjustValuesByKey(o, ["trigger"], (f) => this.getSelectorOrElement(r, f, !0));
          const a = (u = e.find(
            ({ elements: f }) => f.includes(r)
          )) == null ? void 0 : u.timeline;
          i(r, o, a);
        });
      }
    );
  }
  constructor(t) {
    if (!t.gsap.core) {
      console.error("Glaze: GSAP is not defined");
      return;
    }
    return n.config = {
      ...n.config,
      ...t
    }, n.matchMedias = t.breakpoints, n.gsap = t.gsap.core, n.collect(), n.init(), {
      gsap: n.gsap,
      config: n.config,
      matchMedias: n.matchMedias,
      elements: n.elements,
      timelines: n.timelines,
      data: n.data
    };
  }
};
h(n, "bp", "(min-width: 1px)"), h(n, "gsap"), h(n, "config", {
  dataAttribute: "data-animate"
}), h(n, "matchMedias", {}), h(n, "elements", []), h(n, "timelines", []), h(n, "data", /* @__PURE__ */ new Map()), h(n, "getAttributeString", (t = !1) => `${t ? "[" : ""}${n.config.dataAttribute}${t ? "]" : ""}`), h(n, "getAttribute", (t) => (t.getAttribute(n.getAttributeString()) || "").trim()), h(n, "getElements", (t = document) => t.querySelectorAll(n.getAttributeString(!0))), h(n, "getSelectorOrElement", (t, i, s = !1) => {
  var c;
  const e = typeof i != "string" ? (c = i == null ? void 0 : i.selector) == null ? void 0 : c.value : "";
  if (e) {
    if (e.startsWith("&")) {
      const o = e == null ? void 0 : e.replace("&", ":scope");
      return s ? t.querySelector(o) : t.querySelectorAll(o);
    }
    return e;
  }
  return t;
});
let E = n;
export {
  E as Glaze
};
