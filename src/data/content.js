/** YouTube portfolio video: plain 11-char id, or full watch / youtu.be / embed URL. */
export const FEATURE_PORTFOLIO_YOUTUBE_ID = '914ajpP5lag'

const EN_TIMELINE = [
  {
    year: '2017–2022',
    title: 'High school: electrical engineering & code',
    body: 'Five years at the Vocational High School of Electrical Engineering, Varna. Built a foundation in OOP, C#, .NET, Xamarin, Blazor, MySQL, and network protocols — alongside real electronics and hardware coursework.',
    image: '/images/high-school-room.jpg',
  },
  {
    year: '2022–2023',
    title: 'Quanterall — first real codebase',
    body: "Started as mandatory school practice, earned a place in Quanterall's internship programme. Built a Kotlin Android app against a live API, studied Erlang and functional programming deeply enough to implement a graph with DFT and BFT traversal, then moved to Elixir — building the backend for a Discord-inspired messaging service.",
    image: '/images/quanteral-internship.jpg',
  },
  {
    year: '2022–2026',
    title: "TU Varna — bachelor's degree",
    body: "Four-year bachelor's in Software & Internet Technologies at the Technical University of Varna. Covered algorithms, OOP, databases, networks, operating systems, web technologies, software architecture, design patterns, low-level programming, project management, and leadership.",
    image: '/images/TU-Varna.jpg',
  },
  {
    year: 'Jun–Oct 2024',
    title: 'First season in the USA · Vermont Tent Company',
    body: "Spent the summer working in Vermont's event and wedding industry — fully immersed in an English-speaking, multicultural team. Learned to be adaptable, resourceful, and independent far from home.",
    image: '/images/vermont-tent-company.jpeg',
  },
  {
    year: '2023–2025',
    title: 'YouTube content creator',
    body: 'Built a monetised YouTube channel alongside university. One video testing the political biases of GPT-4 vs Gemini went viral with 200,000+ views — an early, hands-on exploration of LLM behaviour and science communication.',
    image: '/images/research-projects.webp',
  },
  {
    year: '2024–2025',
    title: 'Projects & research',
    body: 'Productive solo and team period: built the Winery operations platform (Java, team project), PipePrompt Android app (Kotlin + Jetpack Compose) backed by a Flask/Gemini dispatcher API deployed on Railway, ShopAssist web crawler (ASP.NET + AI ranking), and co-authored a cybersecurity team management paper presented at the TU-Varna Student Science Session.',
    image: '/images/research-projects.webp',
  },
  {
    year: 'May 2025 – now',
    title: 'Second USA season, ISP internship & final year',
    body: 'Returned to Vermont (Jun–Oct 2025) — took on greater responsibilities and helped train new staff, building leadership and communication skills. Completed a network infrastructure internship at Asparuhovo Net (ISP operations, protocols, Cisco Packet Tracer). Now in the final stretch: building DopeyUserAPI (Elixir/Phoenix, PostgreSQL, Docker, Oban, Prometheus, Grafana) and graduating June 2026.',
    image: '/images/isp-work.jpg',
  },
]

/**
 * PROJECTS — flat array. Squarified treemap packer sorts descending by value
 * and fills the container pixel-perfectly without empty space.
 *
 * value — relative size weight (arbitrary scale).
 *   Each tile's pixel area = (value / sum_of_all_values) x containerArea.
 *   Tile w/h are derived dynamically; the same value can produce different
 *   shapes depending on the available container geometry.
 *
 * Higher value = proportionally larger tile area.
 */
const EN_PROJECTS = [
  {
    id: 'winery',
    title: 'Winery',
    value: 15,
    body: 'Team university project — a full winery management platform with role-based access for CEO, managers, warehouse workers, and accountants. Built in Java with a strong focus on software architecture and design patterns; features order processing, inventory tracking, worker performance scoring, automated task generation, and real-time notifications.',
    tags: ['Java', 'OOP', 'Team project', 'SQL', 'Role-based access'],
    link: 'https://github.com/KostadinTodorov/winery',
    image: '/images/winary-app.png',
  },
  {
    id: 'shop-assist',
    title: 'ShopAssist',
    value: 15,
    body: 'An ASP.NET web crawler that collects product listings from e-commerce sites, filters them against user-defined criteria, and ranks the best matches. An AI-based layer explains and scores results in natural language — making it easy to compare options without trawling through pages.',
    tags: ['C#', 'ASP.NET', 'Web scraping', 'AI', 'In progress'],
    link: '#',
    image: '/images/ShopAssist.jpg',
  },
  {
    id: 'dopey-user-api',
    title: 'DopeyUserAPI',
    value: 25,
    body: 'A production-grade authentication and user management API built in Elixir/Phoenix. Covers registration, login, email verification, password reset, and OAuth social auth. Backed by PostgreSQL, containerised with Docker, uses Oban for background jobs, and ships with Prometheus + Grafana observability out of the box.',
    tags: ['Elixir', 'Phoenix', 'PostgreSQL', 'Docker', 'OAuth', 'Oban', 'Grafana'],
    link: 'https://github.com/KamenKarchev',
    image: '/images/DopeyAPI.jpg',
  },
  {
    id: 'pipe-prompt',
    title: 'PipePrompt',
    value: 10,
    body: 'Android app in Kotlin and Jetpack Compose for fast, structured AI prompt workflows. The backend is a Flask/Python dispatcher API deployed on Railway — it routes prompts to Gemini 2.5 Flash, supports base64 image inputs for multimodal queries, and can relay responses directly to Telegram.',
    tags: ['Kotlin', 'Jetpack Compose', 'Android', 'Python', 'Flask', 'Gemini API', 'Railway'],
    link: 'https://github.com/KamenKarchev/PipePrompt-BackEnd',
    image: '/images/project-pipeprompt.jpg',
  },
  {
    id: 'punch-pro',
    title: 'PunchPro',
    value: 10,
    body: 'A JavaScript front-end project — an interactive UI experiment focused on responsive composition, smooth animations, and component-driven layout.',
    tags: ['JavaScript', 'HTML', 'CSS'],
    link: 'https://github.com/KamenKarchev/PunchPro',
    image: '/images/project-punchpro.jpg',
  },
  {
    id: 'fsm-java',
    title: 'Finite-State Machine',
    value: 10,
    body: 'OOP course project: a command-line finite-state machine in Java. Implements state transitions, input parsing, and acceptance logic — operated entirely through CLI commands.',
    tags: ['Java', 'OOP', 'Automata'],
    link: 'https://github.com/KamenKarchev/oop1-project-T4--Finite-state_machine-',
    image: '/images/finite-state-machine.png',
  },
  // {
  //   id: 'front-end-ui',
  //   title: 'Front-end UI Lab',
  //   value: 10,
  //   body: 'A TypeScript front-end lab pushing UI components, layout experiments, and interactive patterns.',
  //   tags: ['TypeScript', 'UI', 'Frontend'],
  //   link: 'https://github.com/KamenKarchev/front-end-more-ui-',
  //   image: '/images/project-frontend-ui.jpg',
  // },
  // {
  //   id: 'students-compiler',
  //   title: 'Students Compiler',
  //   value: 55,
  //   body: 'A Java compiler-style project processing student records — parsing, validation, and structured output.',
  //   tags: ['Java', 'Compiler', 'Parsing'],
  //   link: 'https://github.com/KamenKarchev/students_compiler',
  //   image: '/images/project-students-compiler.jpg',
  // },
  // {
  //   id: 'backend-tests',
  //   title: 'Back-end Test Suite',
  //   value: 55,
  //   body: 'A Java back-end testing project — unit and integration tests covering service layers and API contracts.',
  //   tags: ['Java', 'Testing', 'Backend'],
  //   link: 'https://github.com/KamenKarchev/back-end-tests-',
  //   image: '/images/project-backend-tests.jpg',
  // },
  {
    id: 'hospital-app',
    title: 'HospitalApp',
    value: 5,
    body: 'An early C# desktop application — a hospital management system built as a high school OOP assignment using .NET and Windows Forms.',
    tags: ['C#', 'OOP', '.NET'],
    link: 'https://github.com/KamenKarchev/HospitalApp',
    image: '/images/project-hospital-app.jpg',
  },
]

const EN_CONTACT = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/kamen-karchev-4014a519a',
    text: 'linkedin.com/in/kamen-karchev',
    external: true,
    brand: 'linkedin',
    gradient: 'linear-gradient(100deg, #0077b5 0%, #00a0dc 60%, #0e76a8 100%)',
    description: 'Professional profile and work history',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/KamenKarchev',
    text: 'github.com/KamenKarchev',
    external: true,
    brand: 'github',
    gradient: 'linear-gradient(100deg, #161b22 0%, #30363d 60%, #21262d 100%)',
    description: 'Open-source projects and code',
  },
  {
    label: 'Email',
    href: 'mailto:kamen.karchev03@gmail.com',
    text: 'kamen.karchev03@gmail.com',
    brand: 'email',
    gradient: 'linear-gradient(100deg, #d85b50 0%, #bb4a4f 60%, #c0392b 100%)',
    description: 'Best way to reach me directly',
  },
  {
    label: 'Certificates',
    text: 'Diplomas & credentials',
    brand: 'certificates',
    gradient: 'linear-gradient(100deg, #5f5247 0%, #8b7355 50%, #a68b6b 100%)',
    description: 'High school, professional qualification, science session',
  },
]

const BG_TIMELINE = [
  {
    year: '2017–2022',
    title: 'Гимназия: електротехника и код',
    body: 'Пет години в Професионалната гимназия по електротехника, Варна. Изградих основа в ООП, C#, .NET, Xamarin, Blazor, MySQL и мрежови протоколи — успоредно с реални курсове по електроника и хардуер.',
    image: '/images/high-school-room.jpg',
  },
  {
    year: '2022–2023',
    title: 'Quanterall — първа реална кодова база',
    body: 'Започнах като задължителна училищна практика, след което спечелих място в стажантската програма на Quanterall. Изградих Kotlin Android приложение с реален API, изучавах Erlang и функционално програмиране (вкл. графи с DFT/BFT обхождане), след което преминах към Elixir — изграждайки backend за messaging услуга, вдъхновена от Discord.',
    image: '/images/quanteral-internship.jpg',
  },
  {
    year: '2022–2026',
    title: 'ТУ Варна — бакалавър',
    body: 'Четиригодишна бакалавърска програма „Софтуерни и интернет технологии“ в Технически университет - Варна. Покрих алгоритми, ООП, бази данни, мрежи, операционни системи, уеб технологии, софтуерна архитектура, design patterns, програмиране на ниско ниво и управление на проекти.',
    image: '/images/TU-Varna.jpg',
  },
  {
    year: 'юни–окт 2024',
    title: 'Първи сезон в САЩ · Vermont Tent Company',
    body: 'Прекарах лятото работейки в събитийната индустрия на Върмонт — напълно потопен в англоговорящ, мултикултурен екип. Научих се на адаптивност, находчивост и самостоятелност далеч от дома.',
    image: '/images/vermont-tent-company.jpeg',
  },
  {
    year: '2023–2025',
    title: 'Създател на съдържание в YouTube',
    body: 'Изградих монетизиран YouTube канал успоредно с университета. Едно видео, сравняващо политическите пристрастия на GPT-4 и Gemini, стана вирусно с над 200 000 гледания — ранен практически поглед към поведението на LLM и научната комуникация.',
    image: '/images/research-projects.webp',
  },
  {
    year: '2024–2025',
    title: 'Проекти и изследователска работа',
    body: 'Продуктивен самостоятелен и екипен период: изградихме платформа за винарна (Java, екипен проект), PipePrompt Android приложение (Kotlin + Jetpack Compose) с Flask/Gemini dispatcher API в Railway, ShopAssist web crawler (ASP.NET + AI ranking) и съавторствах доклад за киберсигурност, представен на Студентската научна сесия в ТУ-Варна.',
    image: '/images/research-projects.webp',
  },
  {
    year: 'май 2025 – сега',
    title: 'Втори сезон в САЩ, ISP стаж и последна година',
    body: 'Завърнах се във Върмонт (юни–окт 2025) — поех повече отговорности и обучавах нови кадри. Завърших стаж по мрежова инфраструктура в Аспарухово Нет (ISP операции, протоколи, Cisco Packet Tracer). Сега на финалната права: изграждам DopeyUserAPI (Elixir/Phoenix, PostgreSQL, Docker, Oban, Prometheus, Grafana) и се дипломирам през юни 2026.',
    image: '/images/isp-work.jpg',
  },
]

const BG_PROJECTS = [
  {
    id: 'winery',
    title: 'Winery',
    value: 15,
    body: 'Университетски екипен проект — цялостна система за управление на винарна с ролеви достъп за CEO, мениджъри, складови работници и счетоводители. Изграден на Java със силен фокус върху софтуерната архитектура и design patterns; включва обработка на поръчки, проследяване на инвентар, оценяване на работници и известия в реално време.',
    tags: ['Java', 'ООП', 'Екипен проект', 'SQL', 'Ролеви достъп'],
    link: 'https://github.com/KostadinTodorov/winery',
    image: '/images/winary-app.png',
  },
  {
    id: 'shop-assist',
    title: 'ShopAssist',
    value: 15,
    body: 'ASP.NET web crawler, който събира продуктови обяви от онлайн магазини, филтрира ги по зададени критерии и класира най-добрите съвпадения. AI слой обяснява и оценява резултатите на естествен език — улеснявайки сравняването на опции без лутане из страниците.',
    tags: ['C#', 'ASP.NET', 'Web scraping', 'AI', 'В разработка'],
    link: '#',
    image: '/images/ShopAssist.jpg',
  },
  {
    id: 'dopey-user-api',
    title: 'DopeyUserAPI',
    value: 25,
    body: 'Production-grade API за автентикация и управление на потребители, изграден с Elixir/Phoenix. Покрива регистрация, логин, email верификация, смяна на парола и OAuth. Поддържан от PostgreSQL, контейнеризиран с Docker, използва Oban за background jobs и идва с готова Prometheus + Grafana интеграция.',
    tags: ['Elixir', 'Phoenix', 'PostgreSQL', 'Docker', 'OAuth', 'Oban', 'Grafana'],
    link: 'https://github.com/KamenKarchev',
    image: '/images/DopeyAPI.jpg',
  },
  {
    id: 'pipe-prompt',
    title: 'PipePrompt',
    value: 10,
    body: 'Android приложение (Kotlin + Jetpack Compose) за бързи AI prompt workflows. Backend-ът е Flask/Python dispatcher API в Railway — маршрутизира заявки към Gemini 2.5 Flash, поддържа base64 изображения за мултимодални заявки и може да препраща отговори директно към Telegram.',
    tags: ['Kotlin', 'Jetpack Compose', 'Android', 'Python', 'Flask', 'Gemini API', 'Railway'],
    link: 'https://github.com/KamenKarchev/PipePrompt-BackEnd',
    image: '/images/project-pipeprompt.jpg',
  },
  {
    id: 'punch-pro',
    title: 'PunchPro',
    value: 10,
    body: 'JavaScript front-end проект — интерактивен UI експеримент, фокусиран върху responsive композиция, плавни анимации и компонентно-ориентиран layout.',
    tags: ['JavaScript', 'HTML', 'CSS'],
    link: 'https://github.com/KamenKarchev/PunchPro',
    image: '/images/project-punchpro.jpg',
  },
  {
    id: 'fsm-java',
    title: 'Finite-State Machine',
    value: 10,
    body: 'ООП курсов проект: command-line finite-state machine на Java. Имплементира преходи между състояния, input parsing и acceptance logic — управлява се изцяло чрез CLI команди.',
    tags: ['Java', 'ООП', 'Автомати'],
    link: 'https://github.com/KamenKarchev/oop1-project-T4--Finite-state_machine-',
    image: '/images/finite-state-machine.png',
  },
  // {
  //   id: 'front-end-ui',
  //   title: 'Front-end UI Lab',
  //   value: 10,
  //   body: 'TypeScript front-end lab за UI компоненти, layout експерименти и интерактивни patterns.',
  //   tags: ['TypeScript', 'UI', 'Frontend'],
  //   link: 'https://github.com/KamenKarchev/front-end-more-ui-',
  //   image: '/images/project-frontend-ui.jpg',
  // },
  // {
  //   id: 'students-compiler',
  //   title: 'Students Compiler',
  //   value: 55,
  //   body: 'Java compiler-style проект за обработка на студентски записи - parsing, validation и структуриран output.',
  //   tags: ['Java', 'Compiler', 'Parsing'],
  //   link: 'https://github.com/KamenKarchev/students_compiler',
  //   image: '/images/project-students-compiler.jpg',
  // },
  // {
  //   id: 'backend-tests',
  //   title: 'Back-end Test Suite',
  //   value: 55,
  //   body: 'Java back-end testing проект - unit и integration tests за service layers и API contracts.',
  //   tags: ['Java', 'Testing', 'Backend'],
  //   link: 'https://github.com/KamenKarchev/back-end-tests-',
  //   image: '/images/project-backend-tests.jpg',
  // },
  {
    id: 'hospital-app',
    title: 'HospitalApp',
    value: 5,
    body: 'Ранно C# desktop приложение — система за управление на болница, изградена като училищно ООП задание с помощта на .NET и Windows Forms.',
    tags: ['C#', 'ООП', '.NET'],
    link: 'https://github.com/KamenKarchev/HospitalApp',
    image: '/images/project-hospital-app.jpg',
  },
]

const BG_CONTACT = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/kamen-karchev-4014a519a',
    text: 'linkedin.com/in/kamen-karchev',
    external: true,
    brand: 'linkedin',
    gradient: 'linear-gradient(100deg, #0077b5 0%, #00a0dc 60%, #0e76a8 100%)',
    description: 'Професионален профил и трудов опит',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/KamenKarchev',
    text: 'github.com/KamenKarchev',
    external: true,
    brand: 'github',
    gradient: 'linear-gradient(100deg, #161b22 0%, #30363d 60%, #21262d 100%)',
    description: 'Open-source проекти и код',
  },
  {
    label: 'Email',
    href: 'mailto:kamen.karchev03@gmail.com',
    text: 'kamen.karchev03@gmail.com',
    brand: 'email',
    gradient: 'linear-gradient(100deg, #d85b50 0%, #bb4a4f 60%, #c0392b 100%)',
    description: 'Най-добрият начин за директна връзка',
  },
  {
    label: 'Сертификати',
    text: 'Дипломи и квалификации',
    brand: 'certificates',
    gradient: 'linear-gradient(100deg, #5f5247 0%, #8b7355 50%, #a68b6b 100%)',
    description: 'Средно образование, професионална квалификация, научна сесия',
  },
]

/**
 * Freelance capacity — the single source of truth for what the availability
 * page claims.
 *
 * The scarcity on that page is legitimate only because it is true: capacity
 * genuinely is limited and one slot genuinely is taken. When a slot actually
 * fills, flip its `status` to 'taken' here and give it a real project — that
 * is the only edit needed, in both locales. Nothing derives availability from
 * anywhere else, so telling the truth stays the easy path.
 *
 * Do not add countdowns, viewer counts, recent-activity feeds, testimonials,
 * or client logos to this data. If it isn't a fact about a real project, it
 * does not belong here.
 */
const FREELANCE_SLOT_COUNT = 5

function freelanceSlots(taken) {
  const open = Array.from({ length: FREELANCE_SLOT_COUNT - taken.length }, (_, i) => ({
    id: `open-${i + 1}`,
    status: 'open',
  }))
  return [...taken, ...open]
}

const FREELANCE_SLOTS = {
  en: freelanceSlots([
    {
      id: 'history-interactive',
      status: 'taken',
      title: 'History Interactive',
      body: 'A platform for map generation and community interaction, built for the Rewriting History channel.',
      tags: ['Elixir', 'Phoenix', 'SVG'],
    },
  ]),
  bg: freelanceSlots([
    {
      id: 'history-interactive',
      status: 'taken',
      title: 'History Interactive',
      body: 'Платформа за генериране на карти и общностно взаимодействие, изградена за канала Rewriting History.',
      tags: ['Elixir', 'Phoenix', 'SVG'],
    },
  ]),
}

export const CONTENT = {
  en: {
    nav: {
      brandName: 'Kamen Karchev',
      brandTagline: 'Portfolio — editorial',
      links: [
        { to: '/', label: 'Home' },
        { href: '/#feature', label: 'Video / About' },
        { href: '/#projects', label: 'Projects' },
        { to: '/freelance', label: 'Availability' },
        { href: '/#contact', label: 'Contact' },
      ],
    },
    languageSwitch: {
      currentLabel: 'Current language',
      options: {
        en: { code: 'EN', name: 'English', flag: '🇬🇧' },
        bg: { code: 'BG', name: 'Bulgarian', flag: '🇧🇬' },
      },
      ariaLabel: {
        en: 'Switch language to English',
        bg: 'Switch language to Bulgarian',
      },
    },
    masthead: {
      left: ['Varna edition', 'Portfolio website', 'Classic paper × digital news'],
      title: 'Kamen Karchev',
      right: ['Issue two', 'Elixir · Java · React · Kotlin', 'Dark and light themes'],
      bottom: [
        'Video portfolio · project links · contact information',
        'Newspaper structure with minimal futuristic finish',
        'Varna, Bulgaria',
      ],
    },
    hero: {
      eyebrow: 'Front page',
      title: 'Full-Stack Developer, Striving for Innovation and Clean Architecture',
      body: "I build software that's reliable, maintainable, and actually enjoyable to use — backend systems in Elixir and Java, mobile apps in Kotlin, and interfaces in React. Graduating June 2026.",
      actions: {
        feature: 'Watch and read',
        projects: 'Open projects',
        contact: 'Contact',
      },
      portraitAlt: 'Kamen Karchev portrait',
      portraitName: 'Kamen Karchev',
      portraitMeta: 'Software engineering student · Varna, Bulgaria',
      // "Currently building" bar. The live styling is a metaphor for active
      // work — deliberately no viewer counts, no "live now", no launch date,
      // because none of those would be true.
      building: {
        status: 'Currently building',
        title: 'History Interactive',
        blurb: 'A platform for map generation and community interaction',
        channelLabel: 'For the channel',
        channel: 'Rewriting History',
      },
      pullQuote: '"Curious by nature, creative by habit — I build things I would actually want to use."',
      quickCards: [
        { label: 'Role', value: 'Full-stack · backend focus' },
        { label: 'Graduating', value: 'TU Varna · June 2026' },
        { label: 'Focus', value: 'Elixir · Java · Kotlin · React' },
      ],
    },
    sections: {
      feature: { eyebrow: 'Lead article', title: 'Video portfolio and about me' },
      projects: { eyebrow: 'Second article', title: 'Projects' },
      contact: { eyebrow: 'Back page', title: 'Links and contact' },
    },
    feature: {
      eyebrow: 'Headline feature',
      title: 'Start with the voice, then follow the path that built it.',
      deck: "Vocational high school, a bachelor's degree, software internships, two seasons living and working in the USA, and a growing body of solo and team projects.",
      videoTitle: 'Video portfolio',
      videoLabel: 'Video portfolio',
      videoMeta: "A short introduction — who I am, what I build, and where I'm headed next.",
      emptyVideo: 'Set FEATURE_PORTFOLIO_YOUTUBE_ID in src/data/content.js to the 11-character id or a full YouTube / youtu.be URL.',
      body: "I didn't arrive at software from a single direction. Curiosity, hands-on work across different industries, and time spent abroad all shaped how I approach problems — and how I build solutions.",
      timelineEyebrow: 'Timeline',
      timeline: EN_TIMELINE,
    },
    projects: {
      eyebrow: 'Work article',
      title: 'Projects sized by importance.',
      deck: 'Arranged like a portfolio heatmap — the most substantial work gets the most space; nothing gets dropped.',
      items: EN_PROJECTS,
    },
    freelance: {
      eyebrow: 'Availability',
      title: 'Five project slots.',
      deck: 'I take on a limited number of client projects at a time so each one gets real attention. This page reflects what is actually free right now.',
      openLabel: 'Open',
      takenLabel: 'Taken',
      openCta: 'Request this slot',
      availabilitySummary: (open, total) =>
        `${open} of ${total} slots open`,
      slots: FREELANCE_SLOTS.en,
    },
    contact: {
      eyebrow: 'Back page',
      title: 'Final-year student, open to roles where the work actually matters.',
      deck: "Graduating TU Varna in June 2026. I work with Elixir, Java, Kotlin, C#, and React. I'm looking for roles where I can keep building real things. Reach out through any channel below.",
      items: EN_CONTACT,
      cvHref: 'https://kamenkarchev.com/cv',
      certificates: {
        title: 'Certificates',
        ariaLabel: 'Certificates and diplomas',
        closeLabel: 'Back to contact links',
        links: [
          { href: '/documents/High_School_Diploma', label: 'High school diploma' },
          { href: '/documents/Professional_Qualification_Certificate', label: 'Professional qualification certificate' },
          { href: '/documents/Student_Science_Session_Certificate.pdf', label: 'Student science session certificate' },
        ],
      },
    },
    footer: {
      copyright: '© 2026 Kamen Karchev',
      tagline: 'Varna edition · Classic paper × digital news',
    },
  },

  bg: {
    nav: {
      brandName: 'Камен Кaрчев',
      brandTagline: 'Портфолио — editorial',
      links: [
        { to: '/', label: 'Начало' },
        { href: '/#feature', label: 'Видео / За мен' },
        { href: '/#projects', label: 'Проекти' },
        { to: '/freelance', label: 'Наличност' },
        { href: '/#contact', label: 'Контакти' },
      ],
    },
    languageSwitch: {
      currentLabel: 'Текущ език',
      options: {
        en: { code: 'EN', name: 'Английски', flag: '🇬🇧' },
        bg: { code: 'BG', name: 'Български', flag: '🇧🇬' },
      },
      ariaLabel: {
        en: 'Превключи езика на английски',
        bg: 'Превключи езика на български',
      },
    },
    masthead: {
      left: ['Варненско издание', 'Портфолио сайт', 'Класически вестник × дигитални новини'],
      title: 'Камен Карчев',
      right: ['Втори брой', 'Elixir · Java · React · Kotlin', 'Тъмна и светла тема'],
      bottom: [
        'Видео портфолио · проекти · контакти',
        'Вестникарска структура с минимален футуристичен завършек',
        'Варна, България',
      ],
    },
    hero: {
      eyebrow: 'Първа страница',
      title: 'Full-Stack разработчик, стремящ се към иновации и чиста архитектура',
      body: 'Изграждам софтуер, който е надежден, лесен за поддръжка и приятен за използване — backend системи на Elixir и Java, мобилни приложения с Kotlin и интерфейси с React. Дипломирам се през юни 2026.',
      actions: {
        feature: 'Гледай и чети',
        projects: 'Отвори проектите',
        contact: 'Контакт',
      },
      portraitAlt: 'Портрет на Камен Карчев',
      portraitName: 'Камен Карчев',
      portraitMeta: 'Студент по софтуерно инженерство · Варна, България',
      building: {
        status: 'В момента изграждам',
        title: 'History Interactive',
        blurb: 'Платформа за генериране на карти и общностно взаимодействие',
        channelLabel: 'За канала',
        channel: 'Rewriting History',
      },
      pullQuote: '"Любопитен по природа, креативен по навик — изграждам неща, които самият аз бих искал да използвам."',
      quickCards: [
        { label: 'Роля', value: 'Full-stack · backend фокус' },
        { label: 'Дипломиране', value: 'ТУ Варна · юни 2026' },
        { label: 'Фокус', value: 'Elixir · Java · Kotlin · React' },
      ],
    },
    sections: {
      feature: { eyebrow: 'Водеща статия', title: 'Видео портфолио и за мен' },
      projects: { eyebrow: 'Втора статия', title: 'Проекти' },
      contact: { eyebrow: 'Последна страница', title: 'Линкове и контакт' },
    },
    feature: {
      eyebrow: 'Водещ материал',
      title: 'Първо гласът, после пътят, който го изгради.',
      deck: 'Електротехническа гимназия, бакалавърска степен, софтуерни стажове, два сезона работа в САЩ и нарастващо портфолио от самостоятелни и екипни проекти.',
      videoTitle: 'Видео портфолио',
      videoLabel: 'Видео портфолио',
      videoMeta: 'Кратко представяне — кой съм, какво създавам и накъде продължавам.',
      emptyVideo: 'Задай FEATURE_PORTFOLIO_YOUTUBE_ID в src/data/content.js като 11-символен id или пълен YouTube / youtu.be URL.',
      body: 'Не стигнах до софтуера само от една посока. Любопитството, работата в различни индустрии и времето прекарано в чужбина оформиха начина, по който подхождам към проблемите — и как изграждам решенията им.',
      timelineEyebrow: 'Времева линия',
      timeline: BG_TIMELINE,
    },
    freelance: {
      eyebrow: 'Наличност',
      title: 'Пет проектни места.',
      deck: 'Работя с ограничен брой клиентски проекти едновременно, за да получи всеки истинско внимание. Тази страница отразява какво е свободно в момента.',
      openLabel: 'Свободно',
      takenLabel: 'Заето',
      openCta: 'Заяви това място',
      availabilitySummary: (open, total) =>
        `${open} от ${total} свободни места`,
      slots: FREELANCE_SLOTS.bg,
    },
    projects: {
      eyebrow: 'Работна статия',
      title: 'Проекти, оразмерени по значение.',
      deck: 'Подредени като portfolio heatmap — най-значимата работа получава най-много място; нищо не отпада от мрежата.',
      items: BG_PROJECTS,
    },
    contact: {
      eyebrow: 'Последна страница',
      title: 'Студент в последна година, отворен към роли, където работата наистина има значение.',
      deck: 'Дипломирам се в ТУ Варна през юни 2026. Работя с Elixir, Java, Kotlin, C# и React. Търся роли, където мога да продължа да изграждам реални продукти. Свържи се с мен чрез каналите по-долу.',
      items: BG_CONTACT,
      cvHref: 'https://kamenkarchev.com/cv',
      certificates: {
        title: 'Сертификати',
        ariaLabel: 'Сертификати и дипломи',
        closeLabel: 'Обратно към контактите',
        links: [
          { href: '/documents/High_School_Diploma', label: 'Диплома за средно образование' },
          { href: '/documents/Professional_Qualification_Certificate', label: 'Свидетелство за професионална квалификация' },
          { href: '/documents/Student_Science_Session_Certificate.pdf', label: 'Сертификат от студентска научна сесия' },
        ],
      },
    },
    footer: {
      copyright: '© 2026 Камен Карчев',
      tagline: 'Варненско издание · Класически вестник × дигитални новини',
    },
  },
}

export const NAV_LINKS = CONTENT.en.nav.links
export const QUICK_CARDS = CONTENT.en.hero.quickCards
export const TIMELINE = CONTENT.en.feature.timeline
export const PROJECTS = CONTENT.en.projects.items
export { EN_PROJECTS, BG_PROJECTS }
export const CONTACT = CONTENT.en.contact.items
