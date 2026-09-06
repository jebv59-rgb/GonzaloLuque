/* =========================================================
   Willy Luque — Datos del sitio
   -----------------------------------------------------------
   Este archivo ES la base de datos del sitio. Todo lo que ves
   en la página sale de acá. En "Modo admin" podés editar todo
   desde el navegador; el botón "Publicar" genera una versión
   nueva de este mismo archivo para que la reemplaces en tu
   repositorio de GitHub — así los invitados ven los cambios.

   Cada campo tiene la forma { value: ..., visible: true/false }.
   visible=false = el invitado no lo ve, pero vos sí (atenuado)
   cuando estás en modo admin.
   ========================================================= */
window.SITE_DATA = {
  meta: {
    siteTitle: "Willy Luque — Dashboard Comercial",
    lastUpdate: { value: "05/09/2026", visible: true }
  },

  profile: {
    name: { value: "Willy Luque", visible: true },
    fullName: { value: "Gonzalo Ariel Luque", visible: true },
    location: { value: "San Francisco, Córdoba, Argentina", visible: true },
    roleLine1: { value: "Supervisor de Ventas @ RIMSA S.A.", visible: true },
    roleLine2: { value: "Referente de Sistemas, Red Activa 2026", visible: true },
    lead: {
      value: "Convierto planillas de ventas en dashboards que todo un equipo realmente usa. Más de 17 años en la calle vendiendo consumo masivo, y los últimos construyendo las herramientas que siempre quise tener.",
      visible: true
    }
  },

  stats: [
    { id: "st1", label: "años en consumo masivo", value: "17+", visible: true },
    { id: "st2", label: "vendedores con reporting propio", value: "13", visible: true },
    { id: "st3", label: "herramientas propias en producción", value: "5", visible: true }
  ],

  sections: {
    about: true,
    experience: true,
    projects: true,
    skills: true,
    education: true,
    contact: true
  },

  about: {
    paragraphs: [
      {
        id: "ap1",
        value: "Superviso el equipo comercial de RIMSA S.A. en San Francisco (Córdoba) y además soy el referente de sistemas de la sucursal para la iniciativa Red Activa 2026 de Arcor. Después de más de 17 años en la calle —13 como vendedor y los últimos como supervisor— aprendí que tomar mejores decisiones comerciales se reduce a una cosa: tener los datos correctos, a tiempo, en un formato que cualquiera del equipo pueda entender.",
        visible: true
      },
      {
        id: "ap2",
        value: "Por eso empecé a construir mis propias herramientas: dashboards en HTML, pipelines en Python que convierten planillas de Excel en reportes y PDFs automáticos, y pequeñas utilidades web para mi equipo y para otras empresas, como MURIEL S.A.",
        visible: true
      }
    ],
    highlights: [
      { id: "ah1", value: "Lidero y acompaño a un equipo de vendedores hacia sus objetivos mensuales", visible: true },
      { id: "ah2", value: "Gestiono cuentas corrientes y riesgo crediticio de la cartera de clientes", visible: true },
      { id: "ah3", value: "Coordino con reposición para sostener la ejecución en cada punto de venta", visible: true },
      { id: "ah4", value: "Construyo los pipelines Excel → Python → HTML detrás de cada dashboard", visible: true },
      { id: "ah5", value: "Evalúo el desempeño de la distribuidora para el checklist Red Activa 2026 de Arcor", visible: true }
    ]
  },

  experience: [
    {
      id: "exp1",
      company: "RIM SA",
      role: "Supervisor de Ventas",
      meta: "Semisenior · San Francisco, Córdoba",
      period: "Jun 2023 — Actualidad",
      badge: "Referente de Sistemas — Red Activa 2026",
      badgeVisible: true,
      current: true,
      visible: true,
      bullets: [
        { id: "b1", value: "Lidero el equipo de vendedores, monitoreando su desempeño y dando feedback constructivo", visible: true },
        { id: "b2", value: "Respondo por el cumplimiento de los objetivos de venta y resuelvo desvíos", visible: true },
        { id: "b3", value: "Gestiono las cuentas corrientes de clientes, cuidando la cobranza y el riesgo crediticio", visible: true },
        { id: "b4", value: "Coordino con el área de reposición la ejecución de estrategias de merchandising", visible: true },
        { id: "b5", value: "Identifico y desarrollo nuevas oportunidades de negocio", visible: true }
      ]
    },
    {
      id: "exp2",
      company: "JebSA — Distribuidora directa de Arcor",
      role: "Vendedor",
      meta: "Senior · San Francisco, Córdoba",
      period: "Nov 2009 — Jun 2023 · 13 años",
      badge: "",
      badgeVisible: false,
      current: false,
      visible: true,
      bullets: [
        { id: "b6", value: "Manejo de cartera de clientes y sus cuentas corrientes", visible: true },
        { id: "b7", value: "Ventas por objetivos y cobertura completa del canal", visible: true }
      ]
    }
  ],

  projects: [
    {
      id: "pr1",
      title: "Dashboard RIMSA Unificado",
      description: "Un solo dashboard en HTML que unifica ventas, cobranzas y segmentación de clientes, regenerado automáticamente desde Excel con un pipeline en Python.",
      status: "En producción",
      statusKind: "good",
      visible: true,
      tags: [
        { id: "t1", value: "Python", visible: true },
        { id: "t2", value: "Pandas", visible: true },
        { id: "t3", value: "HTML/CSS/JS", visible: true },
        { id: "t4", value: "Excel", visible: true }
      ]
    },
    {
      id: "pr2",
      title: "Dashboard Arcor Rafaela (Consumo Masivo)",
      description: "Un pipeline que genera automáticamente un PDF de desempeño personalizado para cada uno de los 13 vendedores del territorio, listo para compartir cada mañana.",
      status: "En producción",
      statusKind: "good",
      visible: true,
      tags: [
        { id: "t5", value: "Python", visible: true },
        { id: "t6", value: "Generación de PDF", visible: true },
        { id: "t7", value: "Automatización", visible: true }
      ]
    },
    {
      id: "pr3",
      title: "Red Activa 2026",
      description: "Herramienta de checklist y análisis de brechas para evaluar a la distribuidora según el estándar Red Activa de Arcor, hecha para mi rol de referente de sistemas de la sucursal.",
      status: "En curso",
      statusKind: "warning",
      visible: true,
      tags: [
        { id: "t8", value: "Excel", visible: true },
        { id: "t9", value: "Checklist", visible: true },
        { id: "t10", value: "Análisis de brechas", visible: true }
      ]
    },
    {
      id: "pr4",
      title: "Dashboard de Logística",
      description: "Seguimiento diario de las hojas de ruta de los choferes: kilos y bultos entregados, por chofer y por zona.",
      status: "Activo · desde mayo 2026",
      statusKind: "good",
      visible: true,
      tags: [
        { id: "t11", value: "Python", visible: true },
        { id: "t12", value: "Excel", visible: true },
        { id: "t13", value: "Dashboard HTML", visible: true }
      ]
    },
    {
      id: "pr5",
      title: "Comparador de Precios (Muriel)",
      description: "Herramienta que corre 100% en el navegador para comparar varias listas de precios y promociones comerciales de MURIEL S.A., con cálculo automático de IVA.",
      status: "En producción",
      statusKind: "good",
      visible: true,
      tags: [
        { id: "t14", value: "HTML", visible: true },
        { id: "t15", value: "JavaScript", visible: true },
        { id: "t16", value: "Cálculo de IVA", visible: true }
      ]
    }
  ],

  skills: {
    bars: [
      { id: "sk1", name: "Microsoft Excel", level: 100, visible: true },
      { id: "sk2", name: "Claude AI", level: 100, visible: true },
      { id: "sk3", name: "HTML / CSS / JS", level: 66, visible: true },
      { id: "sk4", name: "Photoshop CC", level: 66, visible: true },
      { id: "sk5", name: "Python", level: 33, visible: true }
    ],
    chips: [
      { id: "c1", value: "Liderazgo de equipos de venta", visible: true },
      { id: "c2", value: "Cuentas corrientes", visible: true },
      { id: "c3", value: "Diseño de dashboards", visible: true },
      { id: "c4", value: "Pipelines Excel → Python", visible: true },
      { id: "c5", value: "Automatización de reportes", visible: true },
      { id: "c6", value: "Segmentación de clientes", visible: true },
      { id: "c7", value: "Coordinación de merchandising", visible: true },
      { id: "c8", value: "Negociación comercial", visible: true }
    ]
  },

  education: [
    { id: "ed1", title: "Bachiller — Administración de Pequeñas y Medianas Empresas", meta: "IMPEN N°145 · Córdoba · 1996–2001", visible: true }
  ],

  languages: [
    { id: "lg1", name: "Español", level: "Nativo", visible: true },
    { id: "lg2", name: "Inglés", level: "Básico", visible: true }
  ],

  contact: {
    email: { value: "jebv59@gmail.com", visible: true },
    github: { value: "github.com/willyluque", url: "https://github.com/willyluque", visible: true },
    instagram: { value: "@willyluque", url: "https://www.instagram.com/willyluque", visible: true },
    location: { value: "San Francisco, Córdoba, Argentina", visible: true }
  }
};
