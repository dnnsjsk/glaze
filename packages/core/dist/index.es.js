function S(s, i, l = !1) {
  var p;
  const e = typeof i != "string" ? (p = i == null ? void 0 : i.selector) == null ? void 0 : p.value : "";
  if (e) {
    if (e.startsWith("&")) {
      const d = e == null ? void 0 : e.replace("&", ":scope");
      return l ? s.querySelector(d) : s.querySelectorAll(d);
    }
    return e;
  }
  return s;
}
function W(s) {
  return s && typeof s == "object" && !Array.isArray(s) && !(s instanceof HTMLElement);
}
function $(s, ...i) {
  if (!i.length)
    return s;
  const l = i.shift();
  if (W(s) && W(l))
    for (const e in l)
      W(l[e]) ? (s[e] || Object.assign(s, { [e]: {} }), $(s[e], l[e])) : Object.assign(s, { [e]: l[e] });
  return i.length ? $(s, ...i) : s;
}
function q(s) {
  const i = /^\[([^\]]+)]:(.*)/, l = s.match(i);
  return l ? {
    content: l[1],
    restOfString: l[2]
  } : null;
}
function x(s, i, l) {
  if (typeof s != "string")
    return s;
  const e = s.replace(/^\[|]$/g, "").replaceAll("_", " ");
  return e.startsWith("&") ? S(i, s, ["trigger"].includes(l)) : e === "true" || e === "false" ? e === "true" : isNaN(Number(e)) ? e : e.includes(".") ? parseFloat(e) : parseInt(e, 10);
}
function N(s, i = !1, l) {
  const e = {};
  return s.split(" ").forEach((u) => {
    var O;
    const d = q(u);
    d && (u = d.restOfString, e.selector = {}, e.selector.value = d.content);
    const M = u.split(":").filter((b) => !b.includes("@")), [m, g] = M;
    if (!g && i) {
      const b = u.split("-"), E = b[0], A = b[1];
      if (!E || !A)
        return;
      e[E] = x(A, l, E);
      return;
    }
    if (m === "tl" && g.startsWith("[")) {
      e.tl = {
        value: (O = q(g + ":")) == null ? void 0 : O.content
      };
      return;
    }
    if (!g)
      return;
    const k = g.split("|");
    e[m] || (e[m] = {}), k.forEach((b) => {
      if (!b)
        return;
      let [E, A] = b.split(/-(.+)/);
      A = x(A, l, E);
      const T = E.split(".");
      let j = e[m];
      T.forEach((c, a) => {
        a === T.length - 1 ? j[c] = A : (j[c] || (j[c] = {}), j = j[c]);
      });
    });
  }), e;
}
function F(s) {
  var j;
  if (!((j = s.gsap) != null && j.core))
    throw new Error("GSAP not found");
  const i = {
    dataAttribute: "data-animate",
    breakpoints: {
      default: "(min-width: 1px)",
      ...(s == null ? void 0 : s.breakpoints) || {}
    }
  }, l = i.dataAttribute, e = s.gsap.core, p = i.breakpoints.default, u = i.breakpoints, d = [], M = [], m = /* @__PURE__ */ new Map(), g = (c) => (c.getAttribute(O()) || "").trim(), k = (c = document) => c.querySelectorAll(O(!0)), O = (c = !1) => `${c ? "[" : ""}${l}${c ? "]" : ""}`;
  function b(c) {
    const a = /(?:@(\w+):)?tl(?:\/(\w+))?/, f = c.match(a);
    if (f) {
      const t = f[1], o = { id: f[2] ?? "", matchMedia: p };
      if (t) {
        if (!(u != null && u[t]))
          return null;
        o.matchMedia = u[t];
      }
      return o;
    } else
      return null;
  }
  function E(c) {
    const a = {};
    return c.split(" ").forEach((t) => {
      const r = t.match(/@(\w+):/);
      if (!r) {
        a[p] || (a[p] = []), a[p].push(t);
        return;
      }
      const o = r[1];
      u != null && u[o] && (a[u[o]] || (a[u[o]] = []), a[u[o]].push(t.replace(r[0], "")));
    }), a;
  }
  function A() {
    const c = [], a = k(), f = (t) => t === "tl" || t.includes("tl/") || t.endsWith(":tl");
    a.forEach((t) => {
      const r = g(t), o = r.split(" ");
      if (o.some((n) => f(n))) {
        const n = b(r), h = [];
        [
          ...k(t),
          ...n != null && n.id ? document.querySelectorAll(
            `[${l}*="tl:${n.id}"]`
          ) : []
        ].forEach((y) => {
          h.push(y);
        });
        const w = N(
          o.filter((y) => !f(y)).join(" "),
          !0,
          t
        );
        c.push(t), M.push({
          id: (n == null ? void 0 : n.id) || Math.random().toString(36).substring(2, 15),
          data: w,
          matchMedia: (n == null ? void 0 : n.matchMedia) || p,
          elements: h
        });
        return;
      }
    }), a.forEach((t) => {
      var o;
      if (c.includes(t))
        return;
      const r = (o = M.find(
        (n) => n.elements.some((h) => h === t) && n.matchMedia
      )) == null ? void 0 : o.matchMedia;
      d.push(
        ...Object.entries(E(g(t))).map(
          ([n, h]) => ({
            matchMedia: n ?? r,
            element: t,
            data: N(h.join(" "), !1, t)
          })
        )
      );
    }), d.forEach((t) => {
      m.has(t.element) || m.set(t.element, {});
      const r = {
        [t.matchMedia]: t.data
      };
      m.set(t.element, {
        ...m.get(t.element),
        ...r
      });
    });
  }
  function T() {
    const c = e.matchMedia(), a = (f, t, r) => {
      var n;
      const o = t.tl ? (n = Object.values(t.tl)) == null ? void 0 : n[0] : void 0;
      if (t.to && t.from) {
        r ? r.fromTo(
          S(f, t),
          t.from,
          t.to,
          o
        ) : e.fromTo(S(f, t), t.from, t.to);
        return;
      }
      if (t.to || t.from) {
        const h = t.to ? "to" : "from";
        r ? r[h](
          S(f, t),
          t[h],
          o
        ) : e[h](S(f, t), t[h]);
      }
    };
    c.add(
      Object.fromEntries(
        Object.values({
          [p]: p,
          ...u || {}
        }).map((f) => [f, f])
      ),
      (f) => {
        const t = [];
        M.forEach((r) => {
          const o = e.timeline(r.data || {});
          t.push({
            elements: r.elements,
            timeline: o
          });
        }), m.forEach((r, o) => {
          var w;
          let n = {};
          Object.entries(r).forEach(([y, V]) => {
            var v;
            (v = f.conditions) != null && v[y] && (n = $(n, V));
          });
          const h = (w = t.find(
            ({ elements: y }) => y.includes(o)
          )) == null ? void 0 : w.timeline;
          a(o, n, h);
        });
      }
    );
  }
  A(), T();
}
export {
  F as glaze
};
