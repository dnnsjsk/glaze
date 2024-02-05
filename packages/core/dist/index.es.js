var y = Object.defineProperty;
var A = (m, t, i) => t in m ? y(m, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : m[t] = i;
var l = (m, t, i) => (A(m, typeof t != "symbol" ? t + "" : t, i), i);
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
      const c = s[1], a = { id: s[2] ?? "", matchMedia: this.bp };
      if (c) {
        if (!((e = this.matchMedias) != null && e[c]))
          return null;
        a.matchMedia = this.matchMedias[c];
      }
      return a;
    } else
      return null;
  }
  static parseMediaQueries(t) {
    const i = {};
    return t.split(" ").forEach((e) => {
      var a;
      const c = e.match(/@(\w+):/);
      if (!c) {
        i[this.bp] || (i[this.bp] = []), i[this.bp].push(e);
        return;
      }
      const r = c[1];
      (a = this.matchMedias) != null && a[r] && (i[this.matchMedias[r]] || (i[this.matchMedias[r]] = []), i[this.matchMedias[r]].push(e.replace(c[0], "")));
    }), i;
  }
  static parseToObject(t, i = !1) {
    const s = {};
    return t.split(" ").forEach((c) => {
      var g;
      const r = this.getSelectorFromBracket(c);
      r && (c = r.restOfString, s.selector = {}, s.selector.value = r.content);
      const a = c.split(":").filter((u) => !u.includes("@")), [h, o] = a;
      if (!o && i) {
        const u = c.split("-"), b = u[0], p = u[1];
        if (!b || !p)
          return;
        s[b] = this.castValue(p);
        return;
      }
      if (h === "tl" && o.startsWith("[")) {
        s.tl = {
          value: (g = this.getSelectorFromBracket(o + ":")) == null ? void 0 : g.content
        };
        return;
      }
      if (!o)
        return;
      const f = o.split("|");
      s[h] || (s[h] = {}), f.forEach((u) => {
        if (!u)
          return;
        let [b, p] = u.split(/-(.+)/);
        p = this.castValue(p);
        const O = b.split(".");
        let d = s[h];
        O.forEach((M, S) => {
          S === O.length - 1 ? d[M] = p : (d[M] || (d[M] = {}), d = d[M]);
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
        const r = this.parseTimeline(e), a = [];
        [
          ...this.getElements(s),
          ...r != null && r.id ? document.querySelectorAll(
            `[${this.config.dataAttribute}*="tl:${r.id}"]`
          ) : []
        ].forEach((o) => {
          a.push(o);
        });
        const h = this.parseToObject(
          c.filter(
            (o) => o !== "tl" && !o.includes("tl/") && !o.endsWith(":tl")
          ).join(" "),
          !0
        );
        this.adjustValuesByKey(h, ["trigger"], (o) => this.getSelectorOrElement(s, o, !0)), t.push(s), this.timelines.push({
          id: (r == null ? void 0 : r.id) || this.generateUniqueId(),
          data: h,
          matchMedia: (r == null ? void 0 : r.matchMedia) || this.bp,
          elements: a
        });
        return;
      }
    }), i.forEach((s) => {
      var c;
      if (t.includes(s))
        return;
      const e = (c = this.timelines.find(
        (r) => r.elements.some((a) => a === s) && r.matchMedia
      )) == null ? void 0 : c.matchMedia;
      this.elements.push(
        ...Object.entries(
          this.parseMediaQueries(this.getAttribute(s))
        ).map(([r, a]) => ({
          matchMedia: r ?? e,
          element: s,
          data: this.parseToObject(a.join(" "))
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
      var a;
      const r = e.tl ? (a = Object.values(e.tl)) == null ? void 0 : a[0] : void 0;
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
        const h = e.to ? "to" : "from";
        c ? c[h](
          this.getSelectorOrElement(s, e),
          e[h],
          r
        ) : this.gsap[h](this.getSelectorOrElement(s, e), e[h]);
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
          var o;
          let a = {};
          Object.entries(c).forEach(([f, g]) => {
            var u;
            (u = s.conditions) != null && u[f] && (a = this.mergeDeep(a, g));
          }), this.adjustValuesByKey(a, ["trigger"], (f) => this.getSelectorOrElement(r, f, !0));
          const h = (o = e.find(
            ({ elements: f }) => f.includes(r)
          )) == null ? void 0 : o.timeline;
          i(r, a, h);
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
l(n, "bp", "(min-width: 1px)"), l(n, "gsap"), l(n, "config", {
  dataAttribute: "data-animate"
}), l(n, "matchMedias", {}), l(n, "elements", []), l(n, "timelines", []), l(n, "data", /* @__PURE__ */ new Map()), l(n, "getAttributeString", (t = !1) => `${t ? "[" : ""}${n.config.dataAttribute}${t ? "]" : ""}`), l(n, "getAttribute", (t) => (t.getAttribute(n.getAttributeString()) || "").trim()), l(n, "getElements", (t = document) => t.querySelectorAll(n.getAttributeString(!0))), l(n, "getSelectorOrElement", (t, i, s = !1) => {
  var c;
  const e = typeof i != "string" ? (c = i == null ? void 0 : i.selector) == null ? void 0 : c.value : "";
  if (e) {
    if (e.startsWith("&")) {
      const a = e == null ? void 0 : e.replace("&", ":scope");
      return s ? t.querySelector(a) : t.querySelectorAll(a);
    }
    return e;
  }
  return t;
});
let E = n;
export {
  E as Glaze
};
