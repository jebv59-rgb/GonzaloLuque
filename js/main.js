/* =========================================================
   Willy Luque — Dashboard Comercial
   Motor de render + modo admin (editar / ocultar / publicar)
   Sin frameworks, sin dependencias externas.
   ========================================================= */
(function () {
  "use strict";

  var ADMIN_PASSWORD = "willy2026"; // <-- CAMBIÁ ESTO antes de publicar. Ver README: no es seguridad real.
  var DRAFT_KEY = "wl_admin_draft_v1";
  var SESSION_KEY = "wl_admin_session_v1";

  var isAdmin = false;
  var data = null; // objeto de trabajo (clon de SITE_DATA o del borrador)

  /* ---------- utilidades ---------- */
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function uid(prefix) { return prefix + "_" + Math.random().toString(36).slice(2, 9); }

  // completa campos nuevos que un borrador viejo guardado en este navegador todavía no tenga
  function ensureDataShape(d) {
    if (!d.profile.photo) d.profile.photo = { value: "", visible: true };
    if (!d.contact.phone) d.contact.phone = { value: "Agregá tu teléfono", visible: true };
    if (!d.references) d.references = [];
    return d;
  }

  // redimensiona y recorta a cuadrado una imagen elegida por el usuario, devuelve un data URL liviano
  function resizeImageToSquareDataURL(file, maxSize, quality, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var size = Math.min(img.width, img.height);
        var sx = (img.width - size) / 2, sy = (img.height - size) / 2;
        var canvas = document.createElement("canvas");
        canvas.width = maxSize; canvas.height = maxSize;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize);
        callback(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  // arma un link de wa.me a partir de cualquier texto de teléfono (usa +54 9 de Argentina si no lo tiene puesto)
  function waLink(value) {
    var digits = (value || "").replace(/\D/g, "");
    if (!digits) return "https://wa.me/";
    if (digits.slice(0, 2) !== "54") digits = "54" + digits;
    if (digits.slice(0, 3) !== "549") digits = "549" + digits.slice(2);
    return "https://wa.me/" + digits;
  }
  function el(tag, cls, children) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    (children || []).forEach(function (c) {
      if (c == null) return;
      if (typeof c === "string") e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    });
    return e;
  }

  var saveTimer = null;
  function scheduleSave() {
    if (!isAdmin) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (e) { /* noop */ }
    }, 300);
  }

  /* ---------- helpers de UI reutilizables ---------- */

  // span/elemento editable inline, ligado a obj[key]
  function editable(obj, key, tag, cls) {
    var node = el(tag || "span", cls || "");
    node.textContent = obj[key];
    if (isAdmin) {
      node.setAttribute("contenteditable", "true");
      node.addEventListener("input", function () {
        obj[key] = node.textContent;
        scheduleSave();
      });
      node.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" && tag !== "TEXTAREA") { ev.preventDefault(); node.blur(); }
      });
    }
    return node;
  }

  // switch de visibilidad ligado a obj.visible; onToggle(cb) para re-render
  function visToggle(obj, onToggle) {
    var label = el("label", "vis-toggle");
    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = obj.visible !== false;
    var slider = el("span", "vis-slider");
    var txt = el("span", "vis-label", [input.checked ? "visible" : "oculto"]);
    input.addEventListener("change", function () {
      obj.visible = input.checked;
      txt.textContent = input.checked ? "visible" : "oculto";
      scheduleSave();
      if (onToggle) onToggle();
    });
    label.appendChild(input);
    label.appendChild(slider);
    label.appendChild(txt);
    return label;
  }

  function smallX(onClick, title) {
    var b = el("button", "small-x", ["×"]);
    b.type = "button";
    b.title = title || "Eliminar";
    b.addEventListener("click", onClick);
    return b;
  }

  function addRowBtn(label, onClick) {
    var b = el("button", "add-row-btn", [label]);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }

  /* ---------- render: HERO ---------- */
  function renderHero() {
    document.getElementById("brandName").textContent = data.profile.name.value;
    document.getElementById("footerName").textContent = data.profile.name.value;

    var dateNode = document.getElementById("navDate");
    if (dateNode) {
      dateNode.textContent = "Actualizado: " + data.meta.lastUpdate.value;
      if (isAdmin) {
        dateNode.setAttribute("contenteditable", "true");
        dateNode.onblur = function () {
          data.meta.lastUpdate.value = dateNode.textContent.replace(/^Actualizado:\s*/, "");
          scheduleSave();
        };
      } else {
        dateNode.removeAttribute("contenteditable");
        dateNode.onblur = null;
      }
    }

    setEditableTarget("heroLocation", data.profile.location);
    setEditableTarget("heroName", data.profile.name, ["brandName", "footerName"]);
    setEditableTarget("heroRole1", data.profile.roleLine1);
    setEditableTarget("heroRole2", data.profile.roleLine2);
    setEditableTarget("heroLead", data.profile.lead);
    setEditableTarget("heroFullName", data.profile.fullName);
    setEditableTarget("footerLocation", data.profile.location);

    var wrap = document.getElementById("statsRow");
    wrap.innerHTML = "";
    data.stats.forEach(function (st) {
      var card = el("div", "stat-card" + (st.visible === false ? " is-hidden-item" : ""));
      card.appendChild(editable(st, "value", "div", "stat-num mono"));
      card.appendChild(editable(st, "label", "div", "stat-label"));
      if (isAdmin) card.appendChild(visToggle(st, renderHero));
      wrap.appendChild(card);
    });

    var avatarPhoto = document.getElementById("avatarPhoto");
    var avatarCore = document.getElementById("avatarCore");
    var removePhotoBtn = document.getElementById("removePhotoBtn");
    var hasPhoto = !!(data.profile.photo && data.profile.photo.value);
    if (avatarPhoto && avatarCore) {
      if (hasPhoto) {
        avatarPhoto.src = data.profile.photo.value;
        avatarPhoto.hidden = false;
        avatarCore.hidden = true;
      } else {
        avatarPhoto.hidden = true;
        avatarPhoto.removeAttribute("src");
        avatarCore.hidden = false;
      }
    }
    if (removePhotoBtn) removePhotoBtn.hidden = !hasPhoto;
  }

  // helper: pinta un campo {value,visible} en un nodo existente por id (sin toggle propio, para textos "core")
  // mirrorIds: otros elementos de solo-eco que deben reflejar el mismo texto en vivo (ej. nombre en el nav y el footer)
  function setEditableTarget(id, fieldObj, mirrorIds) {
    var node = document.getElementById(id);
    if (!node) return;
    node.textContent = fieldObj.value;
    if (isAdmin) {
      node.setAttribute("contenteditable", "true");
      node.oninput = function () {
        fieldObj.value = node.textContent;
        (mirrorIds || []).forEach(function (mid) {
          var m = document.getElementById(mid);
          if (m) m.textContent = node.textContent;
        });
        scheduleSave();
      };
    } else {
      node.removeAttribute("contenteditable");
      node.oninput = null;
    }
  }

  /* ---------- render: SOBRE MI ---------- */
  function renderAbout() {
    var pWrap = document.getElementById("aboutParagraphs");
    pWrap.innerHTML = "";
    data.about.paragraphs.forEach(function (p) {
      var row = el("div", "item-row" + (p.visible === false ? " is-hidden-item" : ""));
      var txt = editable(p, "value", "p");
      txt.style.fontSize = "17px";
      txt.style.color = "var(--ink-secondary)";
      row.appendChild(txt);
      if (isAdmin) {
        row.appendChild(visToggle(p, renderAbout));
        row.appendChild(smallX(function () {
          data.about.paragraphs = data.about.paragraphs.filter(function (x) { return x.id !== p.id; });
          scheduleSave(); renderAbout();
        }));
      }
      pWrap.appendChild(row);
    });
    if (isAdmin) {
      pWrap.appendChild(addRowBtn("+ agregar párrafo", function () {
        data.about.paragraphs.push({ id: uid("ap"), value: "Nuevo párrafo…", visible: true });
        scheduleSave(); renderAbout();
      }));
    }

    var hWrap = document.getElementById("aboutHighlights");
    hWrap.innerHTML = "";
    data.about.highlights.forEach(function (h) {
      var li = el("li", h.visible === false ? "is-hidden-item" : "");
      li.appendChild(el("span", "dot"));
      li.appendChild(editable(h, "value", "span"));
      if (isAdmin) {
        li.appendChild(visToggle(h, renderAbout));
        li.appendChild(smallX(function () {
          data.about.highlights = data.about.highlights.filter(function (x) { return x.id !== h.id; });
          scheduleSave(); renderAbout();
        }));
      }
      hWrap.appendChild(li);
    });
    if (isAdmin) {
      var liAdd = el("li");
      liAdd.appendChild(addRowBtn("+ agregar ítem", function () {
        data.about.highlights.push({ id: uid("ah"), value: "Nuevo ítem…", visible: true });
        scheduleSave(); renderAbout();
      }));
      hWrap.appendChild(liAdd);
    }
  }

  /* ---------- render: EXPERIENCIA ---------- */
  function renderTimeline() {
    var wrap = document.getElementById("timeline");
    wrap.innerHTML = "";
    data.experience.forEach(function (exp) {
      var item = el("div", "tl-item" + (exp.current ? " is-current" : "") + (exp.visible === false ? " is-hidden-item" : ""));
      var card = el("div", "tl-card");

      var head = el("div", "tl-head");
      head.appendChild(editable(exp, "company", "h3"));
      head.appendChild(editable(exp, "period", "span", "tl-period mono"));
      card.appendChild(head);
      card.appendChild(editable(exp, "meta", "div", "tl-meta mono"));

      var body = el("div", "tl-body");
      var ul = el("ul");
      exp.bullets.forEach(function (b) {
        var li = el("li", (b.visible === false ? "is-hidden-item" : ""));
        li.style.display = "flex"; li.style.alignItems = "flex-start"; li.style.gap = "8px";
        var span = editable(b, "value", "span");
        span.style.flex = "1";
        li.appendChild(span);
        if (isAdmin) {
          li.appendChild(visToggle(b, renderTimeline));
          li.appendChild(smallX(function () {
            exp.bullets = exp.bullets.filter(function (x) { return x.id !== b.id; });
            scheduleSave(); renderTimeline();
          }));
        }
        ul.appendChild(li);
      });
      body.appendChild(ul);
      if (isAdmin) {
        body.appendChild(addRowBtn("+ agregar punto", function () {
          exp.bullets.push({ id: uid("b"), value: "Nuevo punto…", visible: true });
          scheduleSave(); renderTimeline();
        }));
      }

      if (exp.badgeVisible !== false && (exp.badge || isAdmin)) {
        var badgeWrap = el("div");
        var badge = el("span", "badge" + (exp.badgeVisible === false ? " is-hidden-item" : ""), ["◆ "]);
        badge.appendChild(editable(exp, "badge", "span"));
        badgeWrap.appendChild(badge);
        if (isAdmin) badgeWrap.appendChild(visToggle({ get visible() { return exp.badgeVisible; }, set visible(v) { exp.badgeVisible = v; } }, renderTimeline));
        body.appendChild(badgeWrap);
      }

      card.appendChild(body);
      item.appendChild(card);

      if (isAdmin) {
        var rowActions = el("div", "item-row");
        rowActions.style.marginTop = "10px";
        rowActions.appendChild(visToggle(exp, renderTimeline));
        rowActions.appendChild(smallX(function () {
          data.experience = data.experience.filter(function (x) { return x.id !== exp.id; });
          scheduleSave(); renderTimeline();
        }, "Eliminar esta experiencia"));
        item.appendChild(rowActions);
      }

      wrap.appendChild(item);
    });

    if (isAdmin) {
      wrap.appendChild(addRowBtn("+ agregar experiencia laboral", function () {
        data.experience.push({
          id: uid("exp"), company: "Nueva empresa", role: "Puesto", meta: "Nivel · Ciudad",
          period: "Inicio — Fin", badge: "", badgeVisible: false, current: false, visible: true, bullets: []
        });
        scheduleSave(); renderTimeline();
      }));
    }
  }

  /* ---------- render: PROYECTOS ---------- */
  function renderProjects() {
    var wrap = document.getElementById("projectsGrid");
    wrap.innerHTML = "";
    data.projects.forEach(function (pr) {
      var card = el("div", "project-card" + (pr.visible === false ? " is-hidden-item" : ""));
      var topColor = pr.statusKind === "warning" ? "var(--status-warning)" : pr.statusKind === "critical" ? "var(--status-critical)" : "var(--series-blue)";
      var topbar = el("div", "project-top"); topbar.style.background = topColor;
      card.appendChild(topbar);

      if (isAdmin) {
        var del = el("div", "project-delete");
        del.appendChild(smallX(function () {
          data.projects = data.projects.filter(function (x) { return x.id !== pr.id; });
          scheduleSave(); renderProjects();
        }, "Eliminar proyecto"));
        card.appendChild(del);
      }

      var body = el("div", "project-body");
      var head = el("div", "project-head");
      var status = el("span", "status-pill" + (pr.statusKind === "warning" ? " warning" : ""));
      status.appendChild(el("span", "pulse"));
      status.appendChild(editable(pr, "status", "span"));
      head.appendChild(status);
      body.appendChild(head);

      body.appendChild(editable(pr, "title", "h3"));
      body.appendChild(editable(pr, "description", "p"));

      var tagsWrap = el("div", "project-tags");
      pr.tags.forEach(function (t) {
        var tag = el("span", "tag" + (t.visible === false ? " is-hidden-item" : ""));
        tag.appendChild(editable(t, "value", "span"));
        if (isAdmin) {
          tag.appendChild(smallX(function () {
            pr.tags = pr.tags.filter(function (x) { return x.id !== t.id; });
            scheduleSave(); renderProjects();
          }));
        }
        tagsWrap.appendChild(tag);
      });
      body.appendChild(tagsWrap);

      if (isAdmin) {
        var controls = el("div", "item-row");
        controls.style.marginTop = "6px";
        controls.appendChild(addRowBtn("+ tag", function () {
          pr.tags.push({ id: uid("t"), value: "nuevo", visible: true });
          scheduleSave(); renderProjects();
        }));
        controls.appendChild(visToggle(pr, renderProjects));
        body.appendChild(controls);
      }

      card.appendChild(body);
      wrap.appendChild(card);
    });

    var addBtn = document.getElementById("addProjectBtn");
    addBtn.hidden = !isAdmin;
    addBtn.onclick = function () {
      data.projects.push({
        id: uid("pr"), title: "Nuevo proyecto", description: "Descripción del proyecto…",
        status: "En curso", statusKind: "warning", visible: true, tags: []
      });
      scheduleSave(); renderProjects();
    };
  }

  /* ---------- render: SKILLS ---------- */
  function renderSkills() {
    var barsWrap = document.getElementById("skillBars");
    barsWrap.innerHTML = "";
    data.skills.bars.forEach(function (sk) {
      var row = el("div", "skill-row" + (sk.visible === false ? " is-hidden-item" : ""));
      var head = el("div", "skill-row-head");
      head.appendChild(editable(sk, "name", "b"));

      var right = el("div", "item-row");
      var levelInput;
      if (isAdmin) {
        levelInput = document.createElement("input");
        levelInput.type = "number"; levelInput.min = 0; levelInput.max = 100; levelInput.value = sk.level;
        levelInput.style.width = "54px"; levelInput.style.fontFamily = "var(--font-mono)";
        levelInput.style.fontSize = "12.5px"; levelInput.style.border = "1px solid var(--border-strong)";
        levelInput.style.borderRadius = "6px"; levelInput.style.padding = "2px 4px";
        levelInput.addEventListener("input", function () {
          sk.level = Math.max(0, Math.min(100, parseInt(levelInput.value, 10) || 0));
          fill.style.width = sk.level + "%";
          scheduleSave();
        });
        right.appendChild(levelInput);
      } else {
        right.appendChild(el("span", "mono", [sk.level + "%"]));
      }
      head.appendChild(right);
      row.appendChild(head);

      var bar = el("div", "skill-bar");
      var fill = el("div", "skill-bar-fill");
      fill.style.width = sk.level + "%";
      bar.appendChild(fill);
      row.appendChild(bar);

      if (isAdmin) {
        var actions = el("div", "item-row");
        actions.style.marginTop = "6px";
        actions.appendChild(visToggle(sk, renderSkills));
        actions.appendChild(smallX(function () {
          data.skills.bars = data.skills.bars.filter(function (x) { return x.id !== sk.id; });
          scheduleSave(); renderSkills();
        }));
        row.appendChild(actions);
      }
      barsWrap.appendChild(row);
    });
    if (isAdmin) {
      barsWrap.appendChild(addRowBtn("+ agregar herramienta", function () {
        data.skills.bars.push({ id: uid("sk"), name: "Nueva herramienta", level: 50, visible: true });
        scheduleSave(); renderSkills();
      }));
    }

    var chipsWrap = document.getElementById("skillChips");
    chipsWrap.innerHTML = "";
    data.skills.chips.forEach(function (c) {
      var chip = el("span", "chip" + (c.visible === false ? " is-hidden-item" : ""));
      chip.appendChild(editable(c, "value", "span"));
      if (isAdmin) {
        chip.appendChild(smallX(function () {
          data.skills.chips = data.skills.chips.filter(function (x) { return x.id !== c.id; });
          scheduleSave(); renderSkills();
        }));
      }
      chipsWrap.appendChild(chip);
    });
    if (isAdmin) {
      chipsWrap.appendChild(addRowBtn("+ agregar", function () {
        data.skills.chips.push({ id: uid("c"), value: "nueva habilidad", visible: true });
        scheduleSave(); renderSkills();
      }));
    }
  }

  /* ---------- render: EDUCACION / IDIOMAS ---------- */
  function renderEduLang() {
    var eduWrap = document.getElementById("eduList");
    eduWrap.innerHTML = "";
    data.education.forEach(function (ed) {
      var row = el("div", "edu-item" + (ed.visible === false ? " is-hidden-item" : ""));
      row.appendChild(editable(ed, "title", "b"));
      row.appendChild(editable(ed, "meta", "span"));
      if (isAdmin) {
        var actions = el("div", "item-row"); actions.style.marginTop = "6px";
        actions.appendChild(visToggle(ed, renderEduLang));
        actions.appendChild(smallX(function () {
          data.education = data.education.filter(function (x) { return x.id !== ed.id; });
          scheduleSave(); renderEduLang();
        }));
        row.appendChild(actions);
      }
      eduWrap.appendChild(row);
    });
    if (isAdmin) {
      eduWrap.appendChild(addRowBtn("+ agregar estudio", function () {
        data.education.push({ id: uid("ed"), title: "Título / institución", meta: "Detalle · Año", visible: true });
        scheduleSave(); renderEduLang();
      }));
    }

    var langWrap = document.getElementById("langList");
    langWrap.innerHTML = "";
    data.languages.forEach(function (lg) {
      var row = el("div", "lang-item" + (lg.visible === false ? " is-hidden-item" : ""));
      row.appendChild(editable(lg, "name", "span"));
      var right = el("div", "item-row");
      var levelSpan = editable(lg, "level", "span", "lang-level");
      right.appendChild(levelSpan);
      if (isAdmin) {
        right.appendChild(visToggle(lg, renderEduLang));
        right.appendChild(smallX(function () {
          data.languages = data.languages.filter(function (x) { return x.id !== lg.id; });
          scheduleSave(); renderEduLang();
        }));
      }
      row.appendChild(right);
      langWrap.appendChild(row);
    });
    if (isAdmin) {
      langWrap.appendChild(addRowBtn("+ agregar idioma", function () {
        data.languages.push({ id: uid("lg"), name: "Idioma", level: "Nivel", visible: true });
        scheduleSave(); renderEduLang();
      }));
    }
  }

  /* ---------- render: CONTACTO ---------- */
  function renderContact() {
    var wrap = document.getElementById("contactLinks");
    wrap.innerHTML = "";

    function contactRow(icon, obj, hrefPrefix, labelText, mirrorValueId) {
      var visible = obj.visible !== false;
      var row = el("a", "contact-link" + (visible ? "" : " is-hidden-item"));
      row.href = obj.url ? obj.url : (hrefPrefix || "#") + obj.value;
      if (hrefPrefix === "mailto:" || hrefPrefix === "tel:" || obj.url) { row.target = obj.url ? "_blank" : ""; row.rel = "noopener"; }
      row.appendChild(el("span", "ico", [icon]));
      var mid = el("span");
      mid.appendChild(el("span", "label", [labelText]));
      var valSpan = editable(obj, "value", "span", "value");
      if (mirrorValueId) {
        // mantiene sincronizada la tarjeta de contacto rápido mientras se edita acá
        valSpan.addEventListener("input", function () {
          var m = document.getElementById(mirrorValueId);
          if (m) m.textContent = obj.value;
        });
      }
      mid.appendChild(valSpan);
      row.appendChild(mid);
      if (isAdmin) {
        row.addEventListener("click", function (ev) { ev.preventDefault(); });
        row.appendChild(visToggle(obj, refreshContactViews));
      }
      return row;
    }

    // fila derivada (no editable): usa el mismo teléfono de arriba pero como link directo a WhatsApp
    function whatsappRow() {
      var phone = data.contact.phone;
      var visible = phone.visible !== false;
      var row = el("a", "contact-link" + (visible ? "" : " is-hidden-item"));
      row.href = waLink(phone.value);
      row.target = "_blank"; row.rel = "noopener";
      row.appendChild(el("span", "ico", ["💬"]));
      var mid = el("span");
      mid.appendChild(el("span", "label", ["WhatsApp"]));
      mid.appendChild(el("span", "value", [phone.value]));
      row.appendChild(mid);
      if (isAdmin) row.addEventListener("click", function (ev) { ev.preventDefault(); });
      return row;
    }

    wrap.appendChild(contactRow("✉️", data.contact.email, "mailto:", "Email", "miniEmailValue"));
    wrap.appendChild(contactRow("📞", data.contact.phone, "tel:", "Llamada", "miniPhoneValue"));
    wrap.appendChild(whatsappRow());
    wrap.appendChild(contactRow("💻", data.contact.github, "", "GitHub"));
    wrap.appendChild(contactRow("📷", data.contact.instagram, "", "Instagram"));
    wrap.appendChild(contactRow("📍", data.contact.location, "", "Ubicación", "miniLocationValue"));
  }

  /* ---------- render: CONTACTO RÁPIDO (tarjeta de perfil) ---------- */
  // Espejo de solo lectura de email / teléfono / ubicación — se edita desde la sección "Contacto" de abajo.
  function renderMiniContact() {
    var wrap = document.getElementById("miniContact");
    if (!wrap) return;
    wrap.innerHTML = "";

    // href: si se pasa, la fila es un link clickeable (mailto / tel / wa.me); displayText anula el texto mostrado
    function miniRow(icon, obj, valueId, href, displayText) {
      var visible = obj.visible !== false;
      var row = el(href ? "a" : "div", "mini-contact-row" + (visible ? "" : " is-hidden-item"));
      if (href) {
        row.href = href;
        row.target = "_blank"; row.rel = "noopener";
        if (isAdmin) row.addEventListener("click", function (ev) { ev.preventDefault(); });
      }
      row.appendChild(el("span", "ico", [icon]));
      var val = el("span", "value", [displayText != null ? displayText : obj.value]);
      val.id = valueId;
      row.appendChild(val);
      return row;
    }

    wrap.appendChild(miniRow("✉️", data.contact.email, "miniEmailValue", "mailto:" + data.contact.email.value));
    wrap.appendChild(miniRow("📞", data.contact.phone, "miniPhoneValue", "tel:" + data.contact.phone.value));
    wrap.appendChild(miniRow("💬", data.contact.phone, "miniWhatsappValue", waLink(data.contact.phone.value), "Escribime por WhatsApp"));
    wrap.appendChild(miniRow("📍", data.contact.location, "miniLocationValue"));
  }

  function refreshContactViews() {
    renderMiniContact();
    renderContact();
  }

  /* ---------- render: REFERENCIAS (tarjeta de perfil) ---------- */
  function renderReferences() {
    var wrap = document.getElementById("referencesList");
    if (!wrap) return;
    wrap.innerHTML = "";
    data.references.forEach(function (ref) {
      var row = el("div", "reference-item" + (ref.visible === false ? " is-hidden-item" : ""));
      row.appendChild(editable(ref, "name", "b"));
      row.appendChild(editable(ref, "role", "span", "ref-role"));
      row.appendChild(editable(ref, "contact", "span", "ref-contact"));
      if (isAdmin) {
        var actions = el("div", "reference-row-actions");
        actions.appendChild(visToggle(ref, renderReferences));
        actions.appendChild(smallX(function () {
          data.references = data.references.filter(function (x) { return x.id !== ref.id; });
          scheduleSave(); renderReferences();
        }, "Eliminar referencia"));
        row.appendChild(actions);
      }
      wrap.appendChild(row);
    });
    if (isAdmin) {
      wrap.appendChild(addRowBtn("+ agregar referencia", function () {
        data.references.push({ id: uid("ref"), name: "Nombre y Apellido", role: "Cargo · Empresa", contact: "Teléfono o email", visible: true });
        scheduleSave(); renderReferences();
      }));
    }
  }

  /* ---------- visibilidad de secciones completas ---------- */
  function renderSectionToggles() {
    document.querySelectorAll("section[data-section-key]").forEach(function (sec) {
      var key = sec.getAttribute("data-section-key");
      var hidden = data.sections[key] === false;
      sec.setAttribute("data-hidden", hidden ? "true" : "false");

      var head = sec.querySelector(".section-head");
      if (!head) return;
      var existing = head.querySelector(".section-vis-toggle");
      if (existing) existing.remove();
      if (isAdmin) {
        var wrapToggle = visToggle(
          { get visible() { return data.sections[key] !== false; }, set visible(v) { data.sections[key] = v; } },
          function () { renderSectionToggles(); }
        );
        wrapToggle.classList.add("section-vis-toggle");
        wrapToggle.style.marginTop = "10px";
        head.appendChild(wrapToggle);
      }
    });
  }

  /* ---------- render completo ---------- */
  function renderAll() {
    renderHero();
    renderAbout();
    renderTimeline();
    renderProjects();
    renderSkills();
    renderEduLang();
    renderReferences();
    renderContact();
    renderMiniContact();
    renderSectionToggles();
  }

  /* ---------- modo admin: login / logout / publicar / descartar ---------- */
  var adminBar = document.getElementById("adminBar");
  var adminToggleBtn = document.getElementById("adminToggleBtn");
  var loginOverlay = document.getElementById("loginOverlay");
  var passwordInput = document.getElementById("passwordInput");
  var loginError = document.getElementById("loginError");

  function openLogin() {
    loginOverlay.hidden = false;
    loginError.hidden = true;
    passwordInput.value = "";
    setTimeout(function () { passwordInput.focus(); }, 50);
  }
  function closeLogin() { loginOverlay.hidden = true; }

  function enterAdmin() {
    isAdmin = true;
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) { /* noop */ }
    var draft = null;
    try { draft = localStorage.getItem(DRAFT_KEY); } catch (e) { /* noop */ }
    data = ensureDataShape(draft ? JSON.parse(draft) : clone(window.SITE_DATA));
    document.body.classList.add("admin-mode");
    adminBar.hidden = false;
    adminToggleBtn.textContent = "🔓 Salir del modo admin";
    renderAll();
  }

  function exitAdmin() {
    isAdmin = false;
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* noop */ }
    data = ensureDataShape(clone(window.SITE_DATA)); // los invitados siempre ven lo publicado, nunca el borrador
    document.body.classList.remove("admin-mode");
    adminBar.hidden = true;
    adminToggleBtn.textContent = "🔒 Modo admin";
    renderAll();
  }

  adminToggleBtn.addEventListener("click", function () {
    if (isAdmin) exitAdmin(); else openLogin();
  });
  document.getElementById("cancelLoginBtn").addEventListener("click", closeLogin);
  document.getElementById("exitAdminBtn").addEventListener("click", exitAdmin);
  loginOverlay.addEventListener("click", function (e) { if (e.target === loginOverlay) closeLogin(); });

  function tryLogin() {
    if (passwordInput.value === ADMIN_PASSWORD) {
      closeLogin();
      enterAdmin();
    } else {
      loginError.hidden = false;
    }
  }
  document.getElementById("confirmLoginBtn").addEventListener("click", tryLogin);
  passwordInput.addEventListener("keydown", function (e) { if (e.key === "Enter") tryLogin(); });

  document.getElementById("discardBtn").addEventListener("click", function () {
    if (!confirm("¿Descartar todos los cambios sin publicar y volver a la última versión publicada?")) return;
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* noop */ }
    data = ensureDataShape(clone(window.SITE_DATA));
    renderAll();
  });

  document.getElementById("publishBtn").addEventListener("click", function () {
    var json = JSON.stringify(data, null, 2);
    var fileContent =
      "/* =========================================================\n" +
      "   Willy Luque — Datos del sitio (generado por el modo admin)\n" +
      "   Reemplazá js/data.js por este archivo en tu repo de GitHub\n" +
      "   y subí el cambio para publicarlo.\n" +
      "   ========================================================= */\n" +
      "window.SITE_DATA = " + json + ";\n";
    var blob = new Blob([fileContent], { type: "text/javascript" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    alert("Se descargó data.js. Reemplazá el archivo js/data.js de tu repo por este y subí el cambio (git add, commit, push) para que los invitados vean los cambios.");
  });

  /* ---------- año, menú móvil, scrollspy (igual que antes) ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { navLinks.classList.remove("open"); });
    });
  }

  /* ---------- arranque ---------- */
  var hadSession = false;
  try { hadSession = sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) { /* noop */ }

  if (hadSession) {
    enterAdmin();
  } else {
    data = ensureDataShape(clone(window.SITE_DATA));
    renderAll();
  }

  /* ---------- foto de perfil ---------- */
  var photoInput = document.getElementById("photoInput");
  var choosePhotoBtn = document.getElementById("choosePhotoBtn");
  var removePhotoBtnEl = document.getElementById("removePhotoBtn");
  if (choosePhotoBtn && photoInput) {
    choosePhotoBtn.addEventListener("click", function () { photoInput.click(); });
    photoInput.addEventListener("change", function () {
      var file = photoInput.files && photoInput.files[0];
      photoInput.value = "";
      if (!file) return;
      resizeImageToSquareDataURL(file, 480, 0.85, function (dataUrl) {
        data.profile.photo.value = dataUrl;
        data.profile.photo.visible = true;
        scheduleSave();
        renderHero();
      });
    });
  }
  if (removePhotoBtnEl) {
    removePhotoBtnEl.addEventListener("click", function () {
      data.profile.photo.value = "";
      scheduleSave();
      renderHero();
    });
  }
})();
