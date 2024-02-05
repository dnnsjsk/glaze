function j(s, o, n = !1) {
  var d;
  const e = typeof o != "string" ? (d = o == null ? void 0 : o.selector) == null ? void 0 : d.value : "";
  if (e) {
    if (e.startsWith("&")) {
      const p = e == null ? void 0 : e.replace("&", ":scope");
      return n ? s.querySelector(p) : s.querySelectorAll(p);
    }
    return e;
  }
  return s;
}
function S(s) {
  return s && typeof s == "object" && !Array.isArray(s) && !(s instanceof HTMLElement);
}
function T(s, ...o) {
  if (!o.length)
    return s;
  const n = o.shift();
  if (S(s) && S(n))
    for (const e in n)
      S(n[e]) ? (s[e] || Object.assign(s, { [e]: {} }), T(s[e], n[e])) : Object.assign(s, { [e]: n[e] });
  return o.length ? T(s, ...o) : s;
}
function $(s) {
  const o = /^\[([^\]]+)]:(.*)/, n = s.match(o);
  return n ? {
    content: n[1],
    restOfString: n[2]
  } : null;
}
function v(s, o, n) {
  if (typeof s != "string")
    return s;
  const e = s.replace(/^\[|]$/g, "").replaceAll("_", " ");
  return e.startsWith("&") ? j(o, s, ["trigger"].includes(n)) : e === "true" || e === "false" ? e === "true" : isNaN(Number(e)) ? e : e.includes(".") ? parseFloat(e) : parseInt(e, 10);
}
function k(s, o = !1, n) {
  const e = {};
  return s.split(" ").forEach((h) => {
    var A;
    const p = $(h);
    p && (h = p.restOfString, e.selector = {}, e.selector.value = p.content);
    const y = h.split(":").filter((m) => !m.includes("@")), [g, b] = y;
    if (!b && o) {
      const m = h.split("-"), l = m[0], u = m[1];
      if (!l || !u)
        return;
      e[l] = v(u, n, l);
      return;
    }
    if (g === "tl" && b.startsWith("[")) {
      e.tl = {
        value: (A = $(b + ":")) == null ? void 0 : A.content
      };
      return;
    }
    if (!b)
      return;
    const O = b.split("|");
    e[g] || (e[g] = {}), O.forEach((m) => {
      if (!m)
        return;
      let [l, u] = m.split(/-(.+)/);
      u = v(u, n, l);
      const f = l.split(".");
      let t = e[g];
      f.forEach((r, i) => {
        i === f.length - 1 ? t[r] = u : (t[r] || (t[r] = {}), t = t[r]);
      });
    });
  }), e;
}
function w(s) {
  const o = "(min-width: 1024px)", n = {}, e = [], d = [], h = /* @__PURE__ */ new Map(), p = (l) => (l.getAttribute(g()) || "").trim(), y = (l = document) => l.querySelectorAll(g(!0)), g = (l = !1) => `${l ? "[" : ""}${s.dataAttribute}${l ? "]" : ""}`;
  function b(l) {
    const u = /(?:@(\w+):)?tl(?:\/(\w+))?/, f = l.match(u);
    if (f) {
      const t = f[1], i = { id: f[2] ?? "", matchMedia: o };
      if (t) {
        if (!(n != null && n[t]))
          return null;
        i.matchMedia = n[t];
      }
      return i;
    } else
      return null;
  }
  function O(l) {
    const u = {};
    return l.split(" ").forEach((t) => {
      const r = t.match(/@(\w+):/);
      if (!r) {
        u[o] || (u[o] = []), u[o].push(t);
        return;
      }
      const i = r[1];
      n != null && n[i] && (u[n[i]] || (u[n[i]] = []), u[n[i]].push(t.replace(r[0], "")));
    }), u;
  }
  function A() {
    const l = [], u = y(), f = (t) => t === "tl" || t.includes("tl/") || t.endsWith(":tl");
    u.forEach((t) => {
      const r = p(t), i = r.split(" ");
      if (i.some((c) => f(c))) {
        const c = b(r), a = [];
        [
          ...y(t),
          ...c != null && c.id ? document.querySelectorAll(
            `[${s.dataAttribute}*="tl:${c.id}"]`
          ) : []
        ].forEach((E) => {
          a.push(E);
        });
        const M = k(
          i.filter((E) => !f(E)).join(" "),
          !0,
          t
        );
        l.push(t), d.push({
          id: (c == null ? void 0 : c.id) || Math.random().toString(36).substring(2, 15),
          data: M,
          matchMedia: (c == null ? void 0 : c.matchMedia) || o,
          elements: a
        });
        return;
      }
    }), u.forEach((t) => {
      var i;
      if (l.includes(t))
        return;
      const r = (i = d.find(
        (c) => c.elements.some((a) => a === t) && c.matchMedia
      )) == null ? void 0 : i.matchMedia;
      e.push(
        ...Object.entries(O(p(t))).map(
          ([c, a]) => ({
            matchMedia: c ?? r,
            element: t,
            data: k(a.join(" "), !1, t)
          })
        )
      );
    }), e.forEach((t) => {
      h.has(t.element) || h.set(t.element, {});
      const r = {
        [t.matchMedia]: t.data
      };
      h.set(t.element, {
        ...h.get(t.element),
        ...r
      });
    });
  }
  function m() {
    const l = gsap.matchMedia(), u = (f, t, r) => {
      var c;
      const i = t.tl ? (c = Object.values(t.tl)) == null ? void 0 : c[0] : void 0;
      if (t.to && t.from) {
        r ? r.fromTo(
          j(f, t),
          t.from,
          t.to,
          i
        ) : gsap.fromTo(j(f, t), t.from, t.to);
        return;
      }
      if (t.to || t.from) {
        const a = t.to ? "to" : "from";
        r ? r[a](
          j(f, t),
          t[a],
          i
        ) : gsap[a](j(f, t), t[a]);
      }
    };
    l.add(
      Object.fromEntries(
        Object.values({
          [o]: o,
          ...n || {}
        }).map((f) => [f, f])
      ),
      (f) => {
        const t = [];
        d.forEach((r) => {
          const i = gsap.timeline(r.data || {});
          t.push({
            elements: r.elements,
            timeline: i
          });
        }), h.forEach((r, i) => {
          var M;
          let c = {};
          Object.entries(r).forEach(([E, q]) => {
            var W;
            (W = f.conditions) != null && W[E] && (c = T(c, q));
          });
          const a = (M = t.find(
            ({ elements: E }) => E.includes(i)
          )) == null ? void 0 : M.timeline;
          u(i, c, a);
        });
      }
    );
  }
  A(), m();
}
export {
  w as glaze
};
