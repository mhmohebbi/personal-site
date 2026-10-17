// Single source of truth for everything on the site: the homepage, the web CV,
// the PDF CV, structured data and the sitemap are all rendered from this file.
//
// Prose fields (lede, about, summary, desc, text) are trusted HTML. Everything
// else is escaped when rendered.

export const site = {
  // Overridden at build time by the SITE_URL environment variable (set by the
  // GitHub Pages workflow), so canonical links follow wherever the site is served.
  url: 'https://hosseinmohebbi.com',
  lang: 'en',
  title: 'Hossein Mohebbi',
  description:
    'Hossein Mohebbi is a machine learning researcher working on reinforcement learning, causal inference and robust machine learning. He builds RL environments for expert domains and works on computer-use agents.',
};

export const profile = {
  name: 'Hossein Mohebbi',
  role: 'Machine Learning Researcher',
  email: 'hossein.mohebbi@uwaterloo.ca',
  portrait: 'assets/img/portrait.jpg',
  links: {
    scholar: 'https://scholar.google.ca/citations?user=X4afmQ8AAAAJ',
    github: 'https://github.com/mhmohebbi',
    linkedin: 'https://www.linkedin.com/in/hossein-mohebbi',
  },
  lede: `I’m a machine learning researcher working on reinforcement learning, causal inference and robust learning. Lately I’ve been focused on computer-use agents and RL environments for expert domains.`,
  affiliation: [
    'Researcher at an AI lab in stealth',
    'MMath, University of Waterloo',
    'Previously Google, Vector Institute and Amazon Robotics',
  ],
  about: [
    `Most of my work circles one question: <em>how do we get more out of the models and data we already have?</em> That has meant reinforcement learning as a decision layer over pretrained models, counterfactual augmentation when labelled data are scarce, and now computer-use agents and multi-agent systems.`,
    `I did my MMath in Computer Science at the University of Waterloo with <a href="https://cs.uwaterloo.ca/~ppoupart/">Pascal Poupart</a>, writing a thesis on counterfactual data augmentation whose core method appeared at ICML 2026. During the degree I was a researcher at the Vector Institute and a Student Researcher at Google, where I worked with Suraj Kothawade on reinforcement learning for image generation.`,
    `I also have years of production engineering behind me: distributed systems for Amazon Robotics’ fulfillment network and, during my undergraduate degree, co-op terms at BitGo, Amazon, StackAdapt, ApplyBoard, IBM and High&nbsp;Q.`,
  ],
  interests:
    'Reinforcement learning, causal inference and robust machine learning, with applications across tabular and generative settings. My current focus is computer-use agents and multi-agent systems.',
};

// Newest first. `date` is shown as written.
export const news = [
  {
    date: 'Jul 2026',
    text: `Presented <a href="#pub-crda">CRDA</a> at ICML 2026 in Seoul, and at the RIKEN–Vector–NAIRL Workshop.`,
  },
  {
    date: 'Jun 2026',
    text: `CRDA is on <a href="https://arxiv.org/abs/2606.28460">arXiv</a>, with a <a href="https://crda-project.github.io">project page</a> and <a href="https://github.com/mhmohebbi/CRDA">code</a>: <code>pip install crda</code>.`,
  },
  { date: 'May 2026', text: 'Talk on CRDA at Vector Institute Community Day, Toronto.' },
  {
    date: 'Nov 2025',
    text: `<a href="https://arxiv.org/abs/2511.11780">Image-POSER</a> is on arXiv.`,
  },
  { date: 'Oct 2025', text: 'Talk on Image-POSER at Vector Institute Research Day, Toronto.' },
  { date: 'Aug 2025', text: 'Started research on computer-use agents at an AI lab in stealth.' },
];

// Research threads on the homepage, each paired with an interactive figure.
export const research = [
  {
    id: 'computer-use',
    figure: 'trajectory',
    when: 'Current · since 2025',
    title: 'Learning to use computers from people',
    text: [
      `Agents that read the screen and act through a mouse and keyboard are held back less by architecture than by data: there is no large, open record of how people actually use computers. At a lab that is still in stealth, I work on closing that gap: large-scale human computer-use trajectories (sequences of screenshot–action pairs), the pipelines that turn raw interaction logs into training data, open computer-use agent models, and benchmarks that measure what those agents can reliably do.`,
      `The models, benchmarks and datasets are intended for open release.`,
    ],
    caption: `<b>Figure 1.</b> A computer-use trajectory <i>τ</i> = (<i>s</i><sub>0</sub>, <i>a</i><sub>0</sub>, <i>s</i><sub>1</sub>, <i>a</i><sub>1</sub>, …). At each step the agent observes a screenshot <i>s<sub>t</sub></i> and emits a low-level action <i>a<sub>t</sub></i>: click, type, key or scroll. Human trajectories like this one are the raw material for training and evaluating agents.`,
  },
  {
    id: 'image-poser',
    figure: 'poser',
    when: '2025 · Google',
    title: 'Reinforcement learning over generative experts',
    text: [
      `No single image model is best at everything. Image-POSER casts image generation and editing as a Markov decision process. A long, compositional prompt is broken into subtasks, and at each step a learned policy chooses which expert to call from a registry of pretrained text-to-image and image-to-image models. A vision–language critic inspects every intermediate image and supplies step-wise reward, so the policy learns when to generate, when to edit, and with which model.`,
      `It outperforms frontier baselines on alignment, fidelity and aesthetics, and human evaluators consistently prefer its outputs.`,
    ],
    paper: 'image-poser',
    caption: `<b>Figure 2.</b> Image-POSER. The policy <i>π</i> routes each subtask to one expert from a registry of pretrained text-to-image (T2I) and image-to-image (I2I) models. A vision–language critic scores the intermediate image <i>s<sub>t</sub></i> and returns reward <i>r<sub>t</sub></i>. (Schematic; expert names are placeholders.)`,
  },
  {
    id: 'crda',
    figure: 'crda',
    when: '2023–2026 · Waterloo & Vector Institute',
    title: 'Counterfactual data augmentation',
    text: [
      `Once a regressor has captured the systematic part of the data, what remains — the residual — behaves like noise, and that noise should not change when certain features do. CRDA perturbs statistically screened features and re-attaches each observation’s residual, producing counterfactual training samples without collecting anything new.`,
      `The method is model-agnostic and comes with a finite-sample consistency result for the screening filter and a causal robustness bound. Across benchmark datasets it reduces average MSE by 22.9% for MLP regressors and 6.4% for XGBoost. It is the basis of my master’s thesis and appeared at ICML 2026.`,
    ],
    paper: 'crda',
    caption: `<b>Figure 3.</b> Residual reuse in one dimension. A base regressor <i>f</i> explains the systematic part of each observation (<i>x</i>, <i>y</i>), leaving a residual <i>ε</i> = <i>y</i> − <i>f</i>(<i>x</i>). Perturbing <i>x</i> and re-attaching <i>ε</i> gives counterfactual samples (<i>x</i>′, <i>f</i>(<i>x</i>′) + <i>ε</i>) that lie on the residual-shifted curve. Hover or tap to pick an observation.`,
  },
];

export const publications = [
  {
    id: 'crda',
    group: 'Conference papers',
    title: 'Counterfactual Residual Data Augmentation for Regression',
    authors: ['Hossein Mohebbi', 'Oliver Schulte', 'Ke Li', 'Pascal Poupart'],
    venue: 'International Conference on Machine Learning (ICML)',
    venueShort: 'ICML 2026',
    venueLong: '43rd International Conference on Machine Learning (ICML 2026), Seoul, South Korea',
    year: 2026,
    summary:
      'A model-agnostic augmentation method for tabular regression that treats residuals as invariant noise under perturbations of statistically screened features, with consistency and robustness guarantees.',
    links: [
      { label: 'Paper', href: 'https://arxiv.org/abs/2606.28460' },
      { label: 'Project page', href: 'https://crda-project.github.io' },
      { label: 'Code', href: 'https://github.com/mhmohebbi/CRDA' },
    ],
    arxiv: '2606.28460',
    bibtex: `@inproceedings{mohebbi2026crda,
  title     = {Counterfactual Residual Data Augmentation for Regression},
  author    = {Mohebbi, Hossein and Schulte, Oliver and Li, Ke and Poupart, Pascal},
  booktitle = {Proceedings of the 43rd International Conference on Machine Learning},
  year      = {2026}
}`,
  },
  {
    id: 'image-poser',
    group: 'Preprints',
    title: 'Image-POSER: Reflective RL for Multi-Expert Image Generation and Editing',
    authors: [
      'Hossein Mohebbi',
      'Mohammed Abdulrahman',
      'Yanting Miao',
      'Pascal Poupart',
      'Suraj Kothawade',
    ],
    equal: ['Hossein Mohebbi', 'Mohammed Abdulrahman'],
    venue: 'Under review',
    venueShort: 'Preprint',
    venueLong: 'Under review',
    year: 2025,
    summary:
      'Reinforcement learning orchestrates a registry of pretrained image generation and editing experts, supervised step by step by a vision–language critic.',
    links: [{ label: 'Paper', href: 'https://arxiv.org/abs/2511.11780' }],
    arxiv: '2511.11780',
    bibtex: `@article{mohebbi2025imageposer,
  title   = {Image-{POSER}: Reflective {RL} for Multi-Expert Image Generation and Editing},
  author  = {Mohebbi, Hossein and Abdulrahman, Mohammed and Miao, Yanting and Poupart, Pascal and Kothawade, Suraj},
  journal = {arXiv preprint arXiv:2511.11780},
  year    = {2025}
}`,
  },
  {
    id: 'thesis',
    group: 'Thesis',
    title: 'Counterfactual Data Augmentation for Regression',
    authors: ['Hossein Mohebbi'],
    venue: 'MMath thesis, University of Waterloo',
    venueShort: 'Thesis',
    venueLong: 'MMath thesis, University of Waterloo, 2026. Advisor: Pascal Poupart',
    year: 2026,
    links: [
      { label: 'UWSpace', href: 'https://uwspace.uwaterloo.ca/items/55383602-cdd7-4b78-b425-73fd89bb54f1' },
    ],
    bibtex: `@mastersthesis{mohebbi2026thesis,
  title  = {Counterfactual Data Augmentation for Regression},
  author = {Mohebbi, Hossein},
  school = {University of Waterloo},
  type   = {{MMath} thesis},
  year   = {2026}
}`,
  },
];

export const experience = {
  research: [
    {
      role: 'Researcher',
      org: 'AI lab in stealth',
      dates: 'Aug 2025 – Present',
      desc: 'Computer-use agents: open agent models, benchmark design, and processing pipelines for large-scale human trajectory data (screenshot–action pairs).',
      bullets: [
        'Research on open-source computer-use agent models and on benchmark design for computer use',
        'Processing pipelines that turn large-scale human computer-use trajectories (screenshot–action pairs) into training and evaluation data',
      ],
    },
    {
      role: 'Student Researcher',
      org: 'Google',
      dates: 'Jan – Dec 2025',
      desc: 'Built Image-POSER in a sponsored collaboration with Pascal Poupart (Waterloo) and Suraj Kothawade (Google); studied the efficiency and inference cost of unified image-generation models.',
      note: 'Sponsored research collaboration with Pascal Poupart (Waterloo) and Suraj Kothawade (Google)',
      bullets: [
        'Built Image-POSER, a reflective RL framework that casts image generation and editing as an MDP and learns to orchestrate a registry of pretrained text-to-image and image-to-image experts, supervised step by step by a vision–language model critic',
        'Investigated methods for improving the efficiency and inference-time cost of unified image generation models',
      ],
    },
    {
      role: 'Machine Learning Researcher',
      org: 'Vector Institute',
      dates: 'Sep 2023 – Dec 2025',
      desc: 'Developed CRDA and its supporting theory; ran distributed experiments on Alliance Canada HPC clusters.',
      bullets: [
        'Developed CRDA, a model-agnostic counterfactual augmentation method for tabular regression that reuses residuals as invariant noise under perturbations of statistically screened features; reduced MLP regressor MSE by 22.9% and XGBoost MSE by 6.4% on average across benchmark datasets',
        'Derived supporting theory, including a finite-sample filter consistency result and a causal robustness bound',
        'Ran distributed experiments on Alliance Canada HPC clusters',
      ],
    },
    {
      role: 'Research Assistant',
      org: 'University of Waterloo',
      dates: 'Sep – Dec 2019',
      desc: 'With Mohammad Kohandel: statistical modelling of how cancer stem cells respond to chemotherapy and immunotherapy.',
      note: 'Advised by Prof. Mohammad Kohandel',
      bullets: [
        'Researched interactions of cancer stem cells and their response to chemotherapy and immunotherapy',
        'Preprocessed and analyzed large experimental datasets to support the development of a statistical model',
      ],
    },
  ],
  industry: [
    {
      role: 'Software Development Engineer',
      org: 'Amazon Robotics',
      dates: 'Jul 2023 – Feb 2025',
      desc: 'Distributed services for large-scale automated material handling, running continuously in Amazon’s robotic fulfillment centres.',
      bullets: [
        'Built and operated production software for Amazon Robotics, the organization behind the robotic fulfillment systems deployed across Amazon’s global warehouse network',
        'Designed distributed services for large-scale automated material handling, running continuously in live fulfillment centres',
      ],
    },
  ],
  coop: [
    { org: 'BitGo', dates: 'Jan – Apr 2023', desc: 'Ethereum staking infrastructure; unstaking support for the Shapella upgrade.' },
    { org: 'Amazon', dates: 'May – Aug 2022', desc: 'AWS region-build automation; cut RDS admin-database builds from two days to 40 minutes.' },
    { org: 'StackAdapt', dates: 'Jan – Apr 2022', desc: 'Backend services for roles and permissions; front-end tooling.' },
    { org: 'ApplyBoard', dates: 'Sep 2020 – Apr 2021', desc: 'An eligibility API matching students with academic programs.' },
    { org: 'IBM', dates: 'Jan – Apr 2020', desc: 'Extensions for QRadar, IBM’s security analytics platform.' },
    { org: 'High Q', dates: 'May – Aug 2019', desc: 'Control and monitoring software for quantum-computing hardware.' },
  ],
};

export const education = [
  {
    degree: 'Master of Mathematics (MMath), Computer Science',
    org: 'University of Waterloo',
    location: 'Waterloo, ON',
    dates: '2023 – 2026',
    details: ['Thesis: <i>Counterfactual Data Augmentation for Regression</i>', 'Advisor: Pascal Poupart'],
  },
  {
    degree: 'Bachelor of Computer Science (BCS), Honours, Co-operative Program',
    org: 'University of Waterloo',
    location: 'Waterloo, ON',
    dates: '2018 – 2023',
    details: ['Human–Computer Interaction Option', 'Dean’s Honours'],
  },
];

export const talks = [
  { date: 'Jul 2026', kind: 'Poster', title: 'Counterfactual Residual Data Augmentation for Regression', venue: 'ICML 2026, Seoul' },
  { date: 'Jul 2026', kind: 'Poster', title: 'Counterfactual Residual Data Augmentation for Regression', venue: 'RIKEN–Vector–NAIRL Workshop, Seoul' },
  { date: 'May 2026', kind: 'Talk', title: 'Counterfactual Residual Data Augmentation for Regression', venue: 'Vector Institute Community Day, Toronto' },
  { date: 'Oct 2025', kind: 'Talk', title: 'Image-POSER: Reflective RL for Multi-Expert Image Generation', venue: 'Vector Institute Research Day, Toronto' },
];

export const teaching = [
  {
    date: 'Fall 2024',
    role: 'Teaching Assistant',
    course: 'CS 114: Principles of Computing for Science',
    org: 'University of Waterloo',
    bullets: ['Led tutorials and marked assignments and exams'],
  },
  {
    date: 'Spring 2024',
    role: 'Teaching Assistant',
    course: 'CS 231: Algorithmic Problem Solving',
    org: 'University of Waterloo',
    bullets: ['Led tutorials and marked assignments and exams'],
  },
  {
    date: 'May 2024',
    role: 'Teaching Assistant',
    course: 'Reinforcement Learning Bootcamp',
    org: 'Vector Institute',
    desc: 'Taught foundational RL and ran hands-on workshops for ten industry partner teams, guiding their proof-of-concept projects.',
    bullets: [
      'Taught foundational reinforcement learning methods and ran hands-on workshops for 10 industry partner teams',
      'Worked directly with teams to develop proof-of-concept RL projects, presented at the closing showcase',
    ],
  },
  {
    date: 'Fall 2023',
    role: 'Guest Lecturer',
    course: 'CS 458: Computer Security and Privacy',
    org: 'University of Waterloo',
    desc: 'Deep RL for smart-contract security: a DQN agent that finds fund-leaking (“prodigal”) vulnerabilities in Ethereum contracts.',
    bullets: [
      'Lectured on deep reinforcement learning for smart contract security: a DQN agent that interacts with Ethereum contracts to discover and exploit fund-leaking (“prodigal”) vulnerabilities, with applications to pre-deployment testing',
    ],
  },
];

export const honours = [
  { date: '2026', title: 'President’s Graduate Scholarship', org: 'University of Waterloo' },
  { date: '2026', title: 'Ontario Graduate Scholarship' },
  { date: '2020', title: 'President’s Research Award', org: 'University of Waterloo' },
  { date: '2019', title: 'President’s Scholarship of Distinction', org: 'University of Waterloo' },
  { date: '2018 – 2023', title: 'Dean’s Honours List', org: 'University of Waterloo' },
];

export const skills = [
  { area: 'Languages', items: 'Python, C, C++, Java, JavaScript/TypeScript, SQL' },
  { area: 'Machine learning', items: 'PyTorch, Hugging Face diffusers, Stable-Baselines3' },
  { area: 'Infrastructure', items: 'Slurm (Alliance Canada), Weights & Biases, AWS, Git' },
];
