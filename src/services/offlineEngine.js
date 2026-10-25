// src/services/offlineEngine.js - 100% Offline Academic Engine & Local Storage
// Powers StudyGenie AI anywhere without network, internet, or backend servers.

const STORAGE_KEYS = {
  USER: 'studygenie_user',
  TOKEN: 'studygenie_token',
  TASKS: 'studygenie_offline_tasks',
  NOTES: 'studygenie_offline_notes',
  DOUBTS: 'studygenie_offline_doubts',
  QUIZZES: 'studygenie_offline_quizzes',
  PROGRESS: 'studygenie_offline_progress',
  LOGGED_HOURS: 'studygenie_offline_hours'
};

// Safe LocalStorage helpers
export const getLocal = (key, defaultVal) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

export const setLocal = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage save notice:', e);
  }
};

// Initial default tasks if user starts offline
const DEFAULT_TASKS = [
  {
    id: 'offline-task-1',
    _id: 'offline-task-1',
    title: 'Review Calculus: Multivariable Integration & Polar Coordinates',
    subject: 'Mathematics',
    priority: 'High',
    duration: 2.0,
    completed: false,
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM'
  },
  {
    id: 'offline-task-2',
    _id: 'offline-task-2',
    title: 'Solve Electromagnetism: Gauss Law & Electric Potential Problems',
    subject: 'Physics',
    priority: 'High',
    duration: 1.5,
    completed: true,
    date: new Date().toISOString().split('T')[0],
    time: '02:00 PM'
  },
  {
    id: 'offline-task-3',
    _id: 'offline-task-3',
    title: 'Implement Binary Search Trees & AVL Balancing in C++/Python',
    subject: 'Computer Science',
    priority: 'Medium',
    duration: 1.0,
    completed: false,
    date: new Date().toISOString().split('T')[0],
    time: '04:30 PM'
  }
];

// Initial default notes for offline study
const DEFAULT_NOTES = [
  {
    id: 'offline-note-1',
    _id: 'offline-note-1',
    title: 'Calculus: Fundamental Theorems & Vector Fields',
    subject: 'Mathematics',
    date: 'Today',
    duration: '25 min read',
    summary: 'Stokes Theorem and the Divergence Theorem equate boundary integrals to interior flux. Essential for electromagnetism and fluid mechanics.',
    keyPoints: [
      'Green Theorem relates line integrals to double integrals across closed curves in 2D.',
      'Divergence Theorem: Flux of vector field F through closed surface S equals triple integral of divergence of F over volume V.',
      'Stokes Theorem: Circulation of vector field F along curve C equals flux of curl of F across enclosed surface.'
    ],
    flashcards: [
      { question: 'What does the Divergence Theorem relate?', answer: 'It relates the surface flux of a vector field to the volume integral of its divergence.' },
      { question: 'What is the condition for a conservative vector field?', answer: 'Curl of F must be zero, meaning F can be written as the gradient of a scalar potential function.' },
      { question: 'What is Green Theorem a special case of?', answer: 'Green Theorem is the 2D planar version of Stokes Theorem.' }
    ]
  },
  {
    id: 'offline-note-2',
    _id: 'offline-note-2',
    title: 'Data Structures: Hash Tables & Collision Resolution',
    subject: 'Computer Science',
    date: 'Yesterday',
    duration: '18 min read',
    summary: 'Hash tables offer O(1) average lookup, insertion, and deletion by mapping keys to array indices using a deterministic hash function.',
    keyPoints: [
      'Chaining handles collisions by maintaining a linked list or red-black tree at each bucket.',
      'Open Addressing probes alternative indices (linear probing, quadratic probing, double hashing).',
      'Load Factor (alpha = n/k) determines when dynamic resizing/rehashing is triggered.'
    ],
    flashcards: [
      { question: 'What is the average time complexity of Hash Table lookup?', answer: 'O(1) constant time under uniform hashing.' },
      { question: 'What is primary clustering in linear probing?', answer: 'The tendency for occupied slots to form contiguous blocks, degrading search performance to O(n).' },
      { question: 'What is a typical threshold load factor to rehash?', answer: 'Typically 0.70 to 0.75.' }
    ]
  }
];

// ─────────────────────────────────────────────────────────────
// 1. OFFLINE AUTHENTICATION SERVICE
// ─────────────────────────────────────────────────────────────
export const offlineAuth = {
  login: (email, password) => {
    const savedUser = getLocal(STORAGE_KEYS.USER, null);
    if (savedUser && savedUser.email?.toLowerCase() === email?.toLowerCase()) {
      return {
        success: true,
        token: getLocal(STORAGE_KEYS.TOKEN, 'offline_jwt_token_sg'),
        user: savedUser,
        isOfflineMode: true
      };
    }

    // Universal offline student account
    const cleanName = email.split('@')[0].replace(/[._-]/g, ' ') || 'Student';
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    const offlineUser = {
      id: 'offline-user-1',
      _id: 'offline-user-1',
      name: formattedName,
      email: email,
      university: 'Academic Institute',
      major: 'Computer Science & Engineering',
      role: 'student',
      isOffline: true
    };

    setLocal(STORAGE_KEYS.USER, offlineUser);
    setLocal(STORAGE_KEYS.TOKEN, 'offline_jwt_token_sg');

    return {
      success: true,
      token: 'offline_jwt_token_sg',
      user: offlineUser,
      isOfflineMode: true
    };
  },

  register: (name, email, password, university, major) => {
    const offlineUser = {
      id: `offline-${Date.now()}`,
      _id: `offline-${Date.now()}`,
      name: name || 'Academic Scholar',
      email: email,
      university: university || 'University',
      major: major || 'Engineering / Sciences',
      role: 'student',
      isOffline: true
    };

    setLocal(STORAGE_KEYS.USER, offlineUser);
    setLocal(STORAGE_KEYS.TOKEN, 'offline_jwt_token_sg');

    return {
      success: true,
      token: 'offline_jwt_token_sg',
      user: offlineUser,
      isOfflineMode: true
    };
  },

  getOfflineGuestUser: () => {
    const existing = getLocal(STORAGE_KEYS.USER, null);
    if (existing) return existing;

    const guest = {
      id: 'offline-guest-student',
      _id: 'offline-guest-student',
      name: 'Scholar Student',
      email: 'student@studygenie.ai',
      university: 'Stanford University',
      major: 'Computer Science',
      role: 'student',
      isOffline: true
    };
    setLocal(STORAGE_KEYS.USER, guest);
    setLocal(STORAGE_KEYS.TOKEN, 'offline_jwt_token_sg');
    return guest;
  }
};

// ─────────────────────────────────────────────────────────────
// 2. OFFLINE PLANNER SERVICE
// ─────────────────────────────────────────────────────────────
export const offlinePlanner = {
  getTasks: () => {
    let tasks = getLocal(STORAGE_KEYS.TASKS, null);
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      tasks = DEFAULT_TASKS;
      setLocal(STORAGE_KEYS.TASKS, tasks);
    }
    return {
      success: true,
      tasks,
      aiSuggestion: {
        title: 'Deep Focus Session: High Priority Tasks',
        reason: 'Optimal circadian retention window for problem solving.',
        priority: 'High'
      }
    };
  },

  createTask: (taskData) => {
    const tasks = offlinePlanner.getTasks().tasks;
    const newTask = {
      id: `task-${Date.now()}`,
      _id: `task-${Date.now()}`,
      title: taskData.title,
      subject: taskData.subject || 'General Study',
      priority: taskData.priority || 'Medium',
      duration: parseFloat(taskData.duration) || 1.5,
      completed: false,
      date: taskData.date || new Date().toISOString().split('T')[0],
      time: taskData.time || '10:00 AM'
    };
    const updated = [newTask, ...tasks];
    setLocal(STORAGE_KEYS.TASKS, updated);
    return { success: true, task: newTask };
  },

  updateTask: (id, updates) => {
    const tasks = offlinePlanner.getTasks().tasks;
    const updated = tasks.map(t => (t.id === id || t._id === id) ? { ...t, ...updates } : t);
    setLocal(STORAGE_KEYS.TASKS, updated);
    return { success: true };
  },

  deleteTask: (id) => {
    const tasks = offlinePlanner.getTasks().tasks;
    const updated = tasks.filter(t => t.id !== id && t._id !== id);
    setLocal(STORAGE_KEYS.TASKS, updated);
    return { success: true };
  }
};

// ─────────────────────────────────────────────────────────────
// 3. OFFLINE ACADEMIC AI DOUBT SOLVER
// ─────────────────────────────────────────────────────────────
export const offlineSolver = {
  getHistory: () => {
    const doubts = getLocal(STORAGE_KEYS.DOUBTS, []);
    return {
      success: true,
      doubts,
      faqs: [
        {
          id: 'faq-1',
          question: 'What is the difference between BFS and DFS?',
          subject: 'Computer Science',
          answer: {
            title: 'Graph Traversal Complexity',
            equation: 'O(V + E)',
            equationSubtitle: 'Breadth-First vs Depth-First Search',
            explanation: 'BFS uses a Queue and visits neighbor vertices level by level (finding shortest unweighted paths). DFS uses a Stack/Recursion exploring deep down branches before backtracking.'
          }
        },
        {
          id: 'faq-2',
          question: 'How does Newtons Second Law explain momentum conservation?',
          subject: 'Physics',
          answer: {
            title: 'Newtonian Impulse & Momentum',
            equation: 'F = \\frac{dp}{dt} = m a',
            equationSubtitle: 'Rate of Change of Momentum',
            explanation: 'When external net force F_ext = 0, dp/dt = 0, implying total linear momentum p remains constant over time.'
          }
        },
        {
          id: 'faq-3',
          question: 'What is the chain rule in calculus?',
          subject: 'Mathematics',
          answer: {
            title: 'Composite Function Differentiation',
            equation: '\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)',
            equationSubtitle: 'Chain Rule Formulation',
            explanation: 'To differentiate a composite function, differentiate the outer function evaluated at inner function, and multiply by derivative of inner function.'
          }
        }
      ]
    };
  },

  solveQuery: (query, image = null) => {
    const qLower = query.toLowerCase();

    // Subject Classification & Rich Academic Formula Generation
    let subject = 'General Academic';
    let title = `Academic Solution: ${query.slice(0, 40)}`;
    let equation = 'E = mc^2';
    let equationSubtitle = 'Universal Physical Equivalence';
    let explanation = '';
    let keyPoints = [];

    if (qLower.includes('pythagor') || qLower.includes('triangle') || qLower.includes('geometry') || qLower.includes('hypotenuse')) {
      subject = 'Geometry & Trigonometry';
      title = 'Pythagorean Theorem & Euclidean Right Triangles';
      equation = 'a^2 + b^2 = c^2 \\iff c = \\sqrt{a^2 + b^2}';
      equationSubtitle = 'Pythagorean Geometric Relation for Right-Angled Triangles';
      explanation = `### Geometric Resolution for: **"${query}"**\n\n1. **Core Principle**: In any Euclidean right-angled triangle, the area of the square whose side is the hypotenuse ($c$) is equal to the sum of the areas of the squares on the other two legs ($a$ and $b$).\n2. **Algebraic Formula**: $$a^2 + b^2 = c^2$$\n- **Hypotenuse**: $c = \\sqrt{a^2 + b^2}$\n- **Adjacent Leg**: $a = \\sqrt{c^2 - b^2}$\n- **Opposite Leg**: $b = \\sqrt{c^2 - a^2}$\n3. **Practical Verification (Pythagorean Triples)**:\n- For legs $a = 3$ and $b = 4$: $c = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$.\n- For legs $a = 5$ and $b = 12$: $c = \\sqrt{25 + 144} = \\sqrt{169} = 13$.\n4. **Generalization**: In non-right triangles, this generalizes to the Law of Cosines: $c^2 = a^2 + b^2 - 2ab\\cos(C)$.`;
      keyPoints = [
        { title: 'Hypotenuse Definition', text: 'The hypotenuse is strictly the longest side directly opposite the 90-degree right angle.' },
        { title: 'Coordinate Distance', text: 'Forms the foundational metric for Euclidean distance between two points (x1, y1) and (x2, y2).' },
        { title: 'Converse of Pythagorean Theorem', text: 'If a triangle satisfies a^2 + b^2 = c^2, it is guaranteed to be a right-angled triangle.' }
      ];
    } else if (qLower.includes('space') || qLower.includes('universe') || qLower.includes('astronomy') || qLower.includes('black hole') || qLower.includes('galaxy') || qLower.includes('cosmos') || qLower.includes('planet')) {
      subject = 'Astrophysics & Cosmology';
      title = 'Spacetime Curvature & Cosmic Metric Expansion';
      equation = 'ds^2 = -c^2\\left(1 - \\frac{2GM}{rc^2}\\right)dt^2 + \\left(1 - \\frac{2GM}{rc^2}\\right)^{-1}dr^2 + r^2 d\\Omega^2';
      equationSubtitle = 'General Relativity & Schwarzschild Geometry';
      explanation = `### Comprehensive Overview of Outer Space & The Cosmos\n\n**Outer Space** is the continuous physical fabric known as **spacetime**.\n\n1. **General Relativity**: Mass and energy curve 4D spacetime. Objects in free fall travel along natural geodesics within this curved geometry.\n2. **Cosmic Energy Budget**:\n- **Dark Energy (~68.3%)**: A uniform vacuum pressure accelerating metric expansion.\n- **Dark Matter (~26.8%)**: Gravitational scaffolding holding galaxies together.\n- **Baryonic Matter (~4.9%)**: Stars, planets, interstellar gas, and living organisms.\n3. **Hubble's Law**: The universe expands homogeneously according to $v = H_0 \\cdot d$.`;
      keyPoints = [
        { title: 'Dynamic Spacetime', text: 'Space is flexible, stretching and vibrating as gravitational waves propagate at the speed of light.' },
        { title: 'Dark Energy Dominance', text: 'Over 95% of the total energy density of the cosmos consists of Dark Energy and Dark Matter.' },
        { title: 'The Quantum Vacuum', text: 'Outer space contains continuous zero-point quantum field fluctuations and 2.73K CMB radiation.' }
      ];
    } else if (qLower.includes('java') || qLower.includes('jvm') || qLower.includes('bytecode') || qLower.includes('oop') || qLower.includes('spring') || qLower.includes('servlet')) {
      subject = 'Java & Software Architecture';
      title = 'JVM Runtime Architecture & Object-Oriented Design';
      equation = '\\text{Java Source (.java)} \\xrightarrow{\\text{javac}} \\text{Bytecode (.class)} \\xrightarrow{\\text{JVM}} \\text{Native Machine Code}';
      equationSubtitle = 'JVM Execution Pipeline & "Write Once, Run Anywhere" Architecture';
      explanation = `### Academic Analysis of Java & The JVM Platform\n\n1. **Platform Independence**: Source code compiles into architecture-neutral Bytecode (.class), which runs on any JVM.\n2. **Four Pillars of OOP**:\n- **Encapsulation**: Hiding state with private fields and exposing vetted public methods.\n- **Inheritance**: Code reusability and hierarchy via \`extends\`.\n- **Polymorphism**: Dynamic method dispatch and method overloading.\n- **Abstraction**: Concealing implementation details behind Interfaces (\`implements\`).\n3. **Memory Management**: The JVM allocates method execution frames on the Stack, while all instantiated objects live in Heap memory managed by automated Garbage Collection (G1GC).`;
      keyPoints = [
        { title: 'Bytecode & JIT Compilation', text: 'The HotSpot JIT compiler compiles frequently executed bytecode loops into native machine instructions at runtime.' },
        { title: 'Automated Garbage Collection', text: 'Reclaims orphaned Heap memory automatically, preventing memory leaks and segmentation faults.' },
        { title: 'Strong Static Typing', text: 'Compile-time type checking and exception handling ensure resilient enterprise software architectures.' }
      ];
    } else if (qLower.includes('python') || qLower.includes('django') || qLower.includes('flask')) {
      subject = 'Python Programming';
      title = 'Python Dynamic Typing, CPython & Execution Model';
      equation = '\\text{Python (.py)} \\xrightarrow{\\text{Parser}} \\text{Bytecode (.pyc)} \\xrightarrow{\\text{PVM + GIL}} \\text{Execution Engine}';
      equationSubtitle = 'CPython Runtime, Global Interpreter Lock (GIL) & Bytecode';
      explanation = `### Analysis of Python Language & Runtime\n\n1. **Interpreted & Dynamic**: Types are bound to objects at runtime rather than variable names.\n2. **Memory Model**: Utilizes reference counting with a generational cyclic garbage collector.\n3. **Global Interpreter Lock (GIL)**: Mutex ensuring thread-safe reference counting in CPython.`;
      keyPoints = [
        { title: 'Dynamic Typing', text: 'Variables are pointers to typed objects dynamically evaluated at runtime.' },
        { title: 'Rich Standard Library', text: 'Extensive ecosystem powering modern AI, Machine Learning, and Data Science.' }
      ];
    } else if (qLower.includes('calculus') || qLower.includes('derivative') || qLower.includes('integral') || qLower.includes('limit') || qLower.includes('differentiat')) {
      subject = 'Calculus & Analysis';
      title = 'Differential & Integral Calculus Derivation';
      equation = '\\int_{a}^{b} f(x) dx = F(b) - F(a)';
      equationSubtitle = 'Fundamental Theorem of Calculus';
      explanation = `### Step-by-Step Resolution for: **"${query}"**\n\n1. **Formal Definition**: The fundamental theorem connects differentiation and integration as inverse mathematical operations.\n2. **Analytical Evaluation**: Let $F(x)$ be an antiderivative of $f(x)$ on $[a, b]$. By Riemann summation, partitioning the domain into $n$ subintervals of width $\\Delta x$ yields the exact accumulation area.\n3. **Application & Verification**: Check continuity across the interval and confirm boundary behavior to prevent divergence or non-removable singularities.`;
      keyPoints = [
        { title: 'Antiderivative Existence', text: 'If f is continuous on [a,b], then F(x) = ∫ f(t)dt is uniformly differentiable.' },
        { title: 'Boundary Constraints', text: 'Ensure asymptotes, discontinuities, and domain boundaries are evaluated with proper limits.' },
        { title: 'Verification', text: 'Differentiate the resulting primitive F(x) to ensure d/dx[F(x)] = f(x).' }
      ];
    } else if (qLower.includes('matrix') || qLower.includes('eigen') || qLower.includes('vector') || qLower.includes('linear algebra')) {
      subject = 'Linear Algebra';
      title = 'Matrix Transformation & Eigen-Decomposition';
      equation = 'A \\mathbf{v} = \\lambda \\mathbf{v} \\iff \\det(A - \\lambda I) = 0';
      equationSubtitle = 'Characteristic Equation & Spectral Theorem';
      explanation = `### Step-by-Step Resolution for: **"${query}"**\n\n1. **Linear Transformation**: A matrix $A$ acts as a linear map transforming vectors in $\\mathbb{R}^n$.\n2. **Eigenvector Invariance**: Eigenvectors $\\mathbf{v}$ are vectors whose direction is unchanged by transformation $A$, scaling purely by scalar eigenvalue $\\lambda$.\n3. **Computation Steps**: Calculate $\\det(A - \\lambda I) = 0$ to derive the characteristic polynomial roots, then substitute each $\\lambda$ back into $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ to solve the null space.`;
      keyPoints = [
        { title: 'Characteristic Polynomial', text: 'Solve det(A - λI) = 0 to extract all algebraic eigenvalues.' },
        { title: 'Geometric Multiplicity', text: 'The dimension of the nullspace of (A - λI) gives the number of linearly independent eigenvectors.' },
        { title: 'Diagonalizability', text: 'A is diagonalizable if and only if algebraic multiplicity equals geometric multiplicity for all eigenvalues.' }
      ];
    } else if (qLower.includes('physics') || qLower.includes('force') || qLower.includes('gravity') || qLower.includes('velocity') || qLower.includes('energy') || qLower.includes('quantum') || qLower.includes('magnetic') || qLower.includes('electric') || qLower.includes('newton')) {
      subject = 'Physics & Dynamics';
      title = 'Fundamental Physical Laws & Field Derivation';
      equation = '\\mathbf{F}_{\\text{net}} = m\\mathbf{a} \\quad \\text{and} \\quad E = \\frac{1}{2}mv^2 + mgh';
      equationSubtitle = 'Newton\'s Second Law & Conservation of Mechanical Energy';
      explanation = `### Physical Analysis for: **"${query}"**\n\n1. **Conservation Laws**: Physical systems strictly obey energy conservation, linear/angular momentum conservation, and boundary constraints.\n2. **Equation Formulation**: Formulate free-body dynamics by isolating the system boundary: $\\mathbf{F}_{\\text{net}} = m\\mathbf{a}$.\n3. **Dimensional Consistency**: Validate that units across both sides of the derived expression match rigorously ($[M L T^{-2}]$ for forces).`;
      keyPoints = [
        { title: 'Newtonian Dynamics', text: 'Net external force creates proportional acceleration inversely related to inertial mass.' },
        { title: 'Energy Equilibrium', text: 'Total mechanical energy E = K + U remains constant in conservative potential fields.' }
      ];
    } else if (qLower.includes('data structure') || qLower.includes('algorithm') || qLower.includes('tree') || qLower.includes('graph') || qLower.includes('sort') || qLower.includes('complexity') || qLower.includes('hash') || qLower.includes('binary')) {
      subject = 'Computer Science & DSA';
      title = 'Algorithmic Complexity & Data Structure Analysis';
      equation = 'T(n) = a T(n/b) + O(n^d) \\implies T(n) = \\Theta(n^{\\log_b a})';
      equationSubtitle = 'Master Theorem for Divide & Conquer Algorithms';
      explanation = `### Algorithmic Breakdown for: **"${query}"**\n\n1. **Optimal Data Representation**: Evaluate tradeoff between contiguous array memory (cache spatial locality) vs pointer-linked dynamic structures.\n2. **Asymptotic Complexity**: Rigorously analyze Worst-Case $O(n)$, Average-Case $\\Theta(n)$, and Space Complexity $O(n)$.\n3. **Edge Case Handling**: Validate against empty inputs, duplicates, boundary overflows, and recursion stack exhaustion.`;
      keyPoints = [
        { title: 'Time Complexity', text: 'Determine amortized cost per operation to prevent hidden O(n^2) bottlenecks.' },
        { title: 'Auxiliary Space', text: 'Check in-place mutation constraints to ensure minimal additional memory usage.' },
        { title: 'Invariant Maintenance', text: 'Maintain loop invariants and inductive base cases across all iterations.' }
      ];
    } else if (qLower.includes('chemistry') || qLower.includes('reaction') || qLower.includes('acid') || qLower.includes('base') || qLower.includes('organic') || qLower.includes('equilibrium')) {
      subject = 'Chemistry';
      title = 'Thermodynamics & Reaction Kinetics';
      equation = '\\Delta G^\\circ = \\Delta H^\\circ - T \\Delta S^\\circ = -RT \\ln K_{eq}';
      equationSubtitle = 'Gibbs Free Energy & Chemical Equilibrium';
      explanation = `### Chemical Resolution for: **"${query}"**\n\n1. **Thermodynamic Spontaneity**: A reaction is thermodynamically spontaneous when $\\Delta G < 0$.\n2. **Kinetics vs Equilibrium**: Reaction rates depend on activation energy $E_a$ (Arrhenius equation), whereas yield is governed by $K_{eq}$.\n3. **Mechanistic Pathway**: Track nucleophilic/electrophilic centers and electron density distributions.`;
      keyPoints = [
        { title: 'Le Chateliers Principle', text: 'Systems at equilibrium shift to counteract external perturbations in concentration, pressure, or temperature.' },
        { title: 'Transition State Theory', text: 'Catalysts lower the free energy of activation without altering standard free energy ΔG°.' },
        { title: 'Stoichiometric Balancing', text: 'Preserve mass and charge balance across all half-reactions.' }
      ];
    } else if (qLower.includes('biology') || qLower.includes('cell') || qLower.includes('photosynthe') || qLower.includes('dna') || qLower.includes('rna') || qLower.includes('gene')) {
      subject = 'Biology & Genetics';
      title = 'Cellular Biology & Molecular Genetics';
      equation = '6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{Photons, Chlorophyll}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2';
      equationSubtitle = 'Biochemical Photosynthesis & Metabolic Energy Synthesis';
      explanation = `### Biological Mechanisms for: **"${query}"**\n\n1. **Cellular Energy Production**: Sunlight photons excite electrons in Photosystem II, driving photophosphorylation to synthesize ATP and NADPH.\n2. **Molecular Genetics**: DNA transcribes into mRNA within the cell nucleus, which is then translated by ribosomes into functional protein structures.\n3. **Homeostasis**: Biological systems employ negative feedback loops to regulate internal cellular equilibrium.`;
      keyPoints = [
        { title: 'ATP Synthesis', text: 'Chemiosmosis across membranes generates ATP via ATP Synthase enzyme complexes.' },
        { title: 'Genetic Code Conservation', text: 'Universal triplet codon sequences direct precise amino acid polypeptide chain synthesis.' }
      ];
    } else if (qLower.includes('taylor')) {
      subject = 'Calculus & Mathematical Analysis';
      title = 'Taylor Series Analytical Expansion';
      equation = 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n';
      equationSubtitle = 'Taylor & Maclaurin Polynomial Approximation';
      explanation = `### Mathematical Derivation for: **"${query}"**\n\n1. **Taylor Theorem**: Represents an infinitely differentiable function $f(x)$ as a power series centered at $x = a$.\n2. **Truncation & Error**: The remainder term $R_n(x)$ (Lagrange error bound) quantifies polynomial convergence.\n3. **Maclaurin Form**: When centered at $a = 0$, the series simplifies to the standard Maclaurin expansion.`;
      keyPoints = [
        { title: 'Radius of Convergence', text: 'Evaluate convergence via the Ratio Test: L = lim |a_{n+1}/a_n| < 1.' },
        { title: 'Polynomial Approximation', text: 'Higher-order derivative terms provide increasingly accurate local function approximation.' }
      ];
    } else {
      // Dynamic topic-specific solution for ANY other question
      const cleanTopic = query.replace(/(explain|what is|how does|define|describe|solve|tell me about)\s*/gi, '').trim() || query;
      subject = 'Academic Problem Solving';
      title = `Conceptual Breakdown: ${cleanTopic.slice(0, 36)}`;
      equation = '\\text{Subject Model: } \\mathbf{' + cleanTopic.slice(0, 18).replace(/[^a-zA-Z0-9 ]/g, '') + '} \\iff \\text{Fundamental Axioms}';
      equationSubtitle = `Governing Academic Principles: ${cleanTopic.slice(0, 35)}`;
      explanation = `### Academic Analysis for: **"${cleanTopic}"**\n\n1. **Core Concept Definition**: **${cleanTopic}** is a foundational topic in its respective academic discipline. It defines systematic principles, operational rules, and verified methodologies.\n2. **Key Theoretical Framework**: To analyze ${cleanTopic}, deconstruct the problem into governing relationships, variable parameters, and boundary conditions.\n3. **Application & Verification**: Test assumptions against verified test cases and evaluate edge conditions to guarantee mathematical and empirical consistency.`;
      keyPoints = [
        { title: 'Operational Definition', text: `Clarify the defining criteria and initial parameters governing ${cleanTopic}.` },
        { title: 'Systematic Decomposition', text: 'Break multi-variable challenges into verifiable sub-steps to ensure rigorous analytical validity.' },
        { title: 'Domain Verification', text: 'Verify physical dimensions, logical consistency, and empirical boundaries.' }
      ];
    }

    const newDoubt = {
      id: `doubt-${Date.now()}`,
      sender: 'ai',
      model: 'StudyGenie Offline Academic Engine',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'rich-doubt',
      title,
      equation,
      equationSubtitle,
      explanation,
      keyPoints,
      subject
    };

    // Save to offline doubts history
    const existing = getLocal(STORAGE_KEYS.DOUBTS, []);
    setLocal(STORAGE_KEYS.DOUBTS, [newDoubt, ...existing]);

    return {
      success: true,
      chat: {
        id: newDoubt.id,
        answer: {
          title,
          equation,
          equationSubtitle,
          explanation,
          keyPoints
        }
      }
    };
  }
};

// ─────────────────────────────────────────────────────────────
// 4. OFFLINE NOTES GENERATOR
// ─────────────────────────────────────────────────────────────
export const offlineNotes = {
  getNotes: () => {
    let notes = getLocal(STORAGE_KEYS.NOTES, null);
    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      notes = DEFAULT_NOTES;
      setLocal(STORAGE_KEYS.NOTES, notes);
    }
    return { success: true, notes };
  },

  createFromTextOrFile: (title, contentText, subject = 'Academic Notes') => {
    const notes = offlineNotes.getNotes().notes;
    const cleanContent = contentText || 'Key academic notes and takeaways derived from document analysis.';

    // Generate smart flashcards from text
    const sentences = cleanContent.split(/[.?!]\s+/).filter(s => s.trim().length > 15);
    const generatedFlashcards = sentences.slice(0, 3).map((sentence, idx) => ({
      question: `Core concept ${idx + 1} from ${title}: What is the primary takeaway?`,
      answer: sentence.trim()
    }));

    if (generatedFlashcards.length === 0) {
      generatedFlashcards.push(
        { question: `What is the key theorem of ${title}?`, answer: 'Foundational analytical properties and conservation rules.' },
        { question: `How is ${title} applied in practice?`, answer: 'By structuring system boundaries and testing edge conditions.' }
      );
    }

    const newNote = {
      id: `note-${Date.now()}`,
      _id: `note-${Date.now()}`,
      title: title || 'Smart Study Summary',
      subject: subject || 'General Academic',
      date: 'Just now',
      duration: `${Math.max(1, Math.ceil(cleanContent.length / 500))} min read`,
      summary: cleanContent.slice(0, 300) + (cleanContent.length > 300 ? '...' : ''),
      keyPoints: [
        `Primary focus: ${title} structural breakdown and conceptual principles.`,
        `Analytical verification of fundamental formulas and systemic relationships.`,
        `Application guidelines for exams, problem-solving, and laboratory research.`
      ],
      flashcards: generatedFlashcards
    };

    const updated = [newNote, ...notes];
    setLocal(STORAGE_KEYS.NOTES, updated);
    return { success: true, note: newNote };
  },

  deleteNote: (id) => {
    const notes = offlineNotes.getNotes().notes;
    const updated = notes.filter(n => n.id !== id && n._id !== id);
    setLocal(STORAGE_KEYS.NOTES, updated);
    return { success: true };
  }
};

// ─────────────────────────────────────────────────────────────
// 5. OFFLINE QUIZ GENERATOR & EVALUATOR
// ─────────────────────────────────────────────────────────────
const QUESTION_BANK = {
  pythagoras: [
    {
      question: "What is the algebraic formulation of the Pythagorean Theorem for a right triangle with legs a, b and hypotenuse c?",
      options: ["a^2 + b^2 = c^2", "a + b = c", "a^2 - b^2 = c^2", "a * b = c^2 / 2"],
      correctAnswer: 0,
      explanation: "In Euclidean geometry, the Pythagorean theorem establishes that the sum of the squares of the legs equals the square of the hypotenuse: a^2 + b^2 = c^2."
    },
    {
      question: "In a right-angled triangle with legs of lengths 3 and 4, what is the length of the hypotenuse c?",
      options: ["5", "7", "6", "25"],
      correctAnswer: 0,
      explanation: "c = sqrt(3^2 + 4^2) = sqrt(9 + 16) = sqrt(25) = 5."
    },
    {
      question: "Which of the following integer sets forms a valid Pythagorean Triple?",
      options: ["5, 12, 13", "3, 5, 7", "4, 6, 8", "2, 3, 4"],
      correctAnswer: 0,
      explanation: "5^2 + 12^2 = 25 + 144 = 169 = 13^2, confirming a valid right triangle."
    },
    {
      question: "If a triangle has sides satisfying a^2 + b^2 < c^2, what classification of triangle is it?",
      options: ["Obtuse triangle", "Acute triangle", "Right triangle", "Equilateral triangle"],
      correctAnswer: 0,
      explanation: "When c^2 > a^2 + b^2, the angle opposite side c is greater than 90 degrees, making the triangle obtuse."
    }
  ],
  space: [
    {
      question: "According to modern cosmological consensus, what constitutes approximately 68% of the total energy density of the universe?",
      options: ["Dark Energy", "Dark Matter", "Intergalactic Hydrogen Gas", "Luminous Stellar Matter"],
      correctAnswer: 0,
      explanation: "Dark Energy accounts for approximately 68.3% of the universe's total energy density and accelerates cosmic metric expansion."
    },
    {
      question: "What does Einstein's General Theory of Relativity describe gravity as?",
      options: [
        "The geometric curvature of 4D spacetime caused by mass and energy",
        "An instantaneous Newtonian attractive force mediated by gravitons",
        "An electromagnetic dipole interaction between planetary cores",
        "A consequence of atmospheric pressure differentials"
      ],
      correctAnswer: 0,
      explanation: "General Relativity establishes that mass and energy warp spacetime, and objects freely fall along geodesics."
    },
    {
      question: "What is the boundary surrounding a black hole beyond which neither light nor matter can escape?",
      options: ["The Event Horizon", "The Accretion Disk", "The Photosphere", "The Roche Limit"],
      correctAnswer: 0,
      explanation: "The Event Horizon is the critical radius where escape velocity equals the speed of light."
    }
  ],
  java: [
    {
      question: "Which component executes architecture-neutral Java bytecode into native machine code at runtime?",
      options: [
        "Java Virtual Machine (JVM) with JIT Compiler",
        "Java Development Kit (JDK) javac compiler",
        "Host Operating System Kernel",
        "Application Server Servlet Container"
      ],
      correctAnswer: 0,
      explanation: "The JVM's Just-In-Time (JIT) compiler compiles frequently executed bytecode instructions into native CPU instructions."
    },
    {
      question: "Where are object instances and arrays allocated in the Java memory runtime model?",
      options: ["Heap Memory", "Stack Memory", "Program Counter (PC) Register", "Native Method Stack"],
      correctAnswer: 0,
      explanation: "All Java objects and arrays are dynamically allocated on the shared Heap and managed by the Garbage Collector."
    },
    {
      question: "Which OOP concept is demonstrated by declaring class fields 'private' and providing 'public' getter and setter methods?",
      options: ["Encapsulation", "Polymorphism", "Multiple Inheritance", "Dynamic Dispatch"],
      correctAnswer: 0,
      explanation: "Encapsulation hides the internal state of an object and enforces controlled access through public methods."
    }
  ],
  python: [
    {
      question: "What mechanism in CPython prevents multiple native OS threads from executing Python bytecodes simultaneously?",
      options: ["Global Interpreter Lock (GIL)", "Thread Local Storage (TLS)", "Dynamic Dispatch Engine", "Cyclic Garbage Collector"],
      correctAnswer: 0,
      explanation: "CPython uses the GIL to synchronize memory management and prevent race conditions in reference-counting."
    },
    {
      question: "Which of the following data types in Python is IMMUTABLE?",
      options: ["Tuple (tuple)", "List (list)", "Dictionary (dict)", "Set (set)"],
      correctAnswer: 0,
      explanation: "Tuples, strings, and integers are immutable in Python; their contents cannot be modified in place after creation."
    }
  ],
  mathematics: [
    {
      question: "What is the derivative of f(x) = ln(3x^2 + 1)?",
      options: ["6x / (3x^2 + 1)", "3x / (3x^2 + 1)", "1 / (3x^2 + 1)", "6 / (3x + 1)"],
      correctAnswer: 0,
      explanation: "By the chain rule: d/dx[ln(u)] = (1/u) * u'. Here u = 3x^2 + 1, so u' = 6x. The derivative is 6x / (3x^2 + 1)."
    },
    {
      question: "Which of the following matrices has an inverse?",
      options: ["[[2, 1], [1, 2]]", "[[1, 2], [2, 4]]", "[[0, 0], [1, 3]]", "[[3, 6], [1, 2]]"],
      correctAnswer: 0,
      explanation: "A square matrix is invertible if and only if det(A) ≠ 0. For [[2,1],[1,2]], det = (2*2) - (1*1) = 3 ≠ 0."
    },
    {
      question: "What is the value of lim(x -> 0) of sin(5x) / x?",
      options: ["5", "0", "1", "Undefined"],
      correctAnswer: 0,
      explanation: "Using the standard limit lim(u -> 0) sin(u)/u = 1: lim(x -> 0) 5 * [sin(5x) / 5x] = 5 * 1 = 5."
    }
  ],
  physics: [
    {
      question: "According to Faradays Law, what does an induced electromotive force (EMF) depend upon?",
      options: [
        "The time rate of change of magnetic flux",
        "The constant magnitude of magnetic field",
        "The total electrical resistance of the wire only",
        "The speed of light in vacuum"
      ],
      correctAnswer: 0,
      explanation: "Faradays Law states that EMF = -dPhi_B / dt, proportional to the time rate of change of magnetic flux."
    },
    {
      question: "What is the work done by a centripetal force acting on an object in uniform circular motion?",
      options: ["Zero", "Positive and equal to kinetic energy", "Negative", "Depends on radius"],
      correctAnswer: 0,
      explanation: "Work = F * d * cos(theta). Centripetal force acts perpendicular to instantaneous displacement (theta = 90 deg, cos 90 = 0), so work is always zero."
    }
  ],
  computer_science: [
    {
      question: "What is the average time complexity of searching in a Balanced Binary Search Tree (AVL / Red-Black)?",
      options: ["O(log n)", "O(1)", "O(n)", "O(n log n)"],
      correctAnswer: 0,
      explanation: "Because the tree height is guaranteed to be bounded by O(log n), lookup takes O(log n) time."
    },
    {
      question: "Which data structure follows the LIFO (Last In, First Out) principle?",
      options: ["Stack", "Queue", "Priority Queue", "Circular Array"],
      correctAnswer: 0,
      explanation: "A Stack operates on Last-In, First-Out (LIFO) order using push and pop operations."
    }
  ]
};

export const offlineQuiz = {
  generate: (topic = 'General Academic', difficulty = 'Medium') => {
    const tLower = (topic || '').toLowerCase();
    let pool = null;

    if (tLower.includes('pythagor') || tLower.includes('triangle') || tLower.includes('geometry') || tLower.includes('hypotenuse')) {
      pool = QUESTION_BANK.pythagoras;
    } else if (tLower.includes('space') || tLower.includes('universe') || tLower.includes('astronomy') || tLower.includes('cosmos')) {
      pool = QUESTION_BANK.space;
    } else if (tLower.includes('java') || tLower.includes('jvm') || tLower.includes('oop')) {
      pool = QUESTION_BANK.java;
    } else if (tLower.includes('python')) {
      pool = QUESTION_BANK.python;
    } else if (tLower.includes('physic') || tLower.includes('wave') || tLower.includes('force')) {
      pool = QUESTION_BANK.physics;
    } else if (tLower.includes('computer') || tLower.includes('data') || tLower.includes('code') || tLower.includes('algo')) {
      pool = QUESTION_BANK.computer_science;
    } else if (tLower.includes('calculus') || tLower.includes('math') || tLower.includes('derivative') || tLower.includes('integral')) {
      pool = QUESTION_BANK.mathematics;
    } else {
      // Dynamic topic question generator for any custom topic
      const cleanTitle = (topic || 'Academic Subject').replace(/(explain|what is|how does|quiz on)\s*/gi, '').trim().slice(0, 32);
      pool = [
        {
          question: `What is the core conceptual foundation of "${cleanTitle}"?`,
          options: [
            `Understanding its defining principles and standard operational frameworks`,
            `Arbitrary execution of unverified assumptions`,
            `Complete avoidance of standard industry models`,
            `Disregarding foundational boundary conditions`
          ],
          correctAnswer: 0,
          explanation: `Comprehensive mastery of ${cleanTitle} requires a firm understanding of its foundational principles and theoretical framework.`
        },
        {
          question: `How are complex challenges in "${cleanTitle}" typically resolved in practice?`,
          options: [
            `By decomposing complex problems into modular, verifiable sub-components`,
            `By trial-and-error without logging or verification`,
            `By removing all architectural constraints`,
            `By guessing intermediate variable values`
          ],
          correctAnswer: 0,
          explanation: `Academic and professional methodologies rely on systematic modular decomposition to analyze and solve problems reliably.`
        },
        {
          question: `Why is verification and boundary testing critical in "${cleanTitle}"?`,
          options: [
            `To ensure stability, correctness, and adherence to formal specifications`,
            `To increase computational overhead unnecessarily`,
            `To bypass security and validation layers`,
            `It is not necessary in modern workflows`
          ],
          correctAnswer: 0,
          explanation: `Verification ensures results are repeatable, edge cases are accounted for, and solutions remain robust.`
        }
      ];
    }

    const quiz = {
      id: `offline-quiz-${Date.now()}`,
      _id: `offline-quiz-${Date.now()}`,
      title: `${topic.slice(0, 36)} (${difficulty} Quiz)`,
      topic: topic || 'Academic Proficiency',
      difficulty: difficulty || 'Medium',
      questions: pool.map(q => ({
        question: q.question,
        questionText: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        correctAnswerIndex: q.correctAnswer,
        explanation: q.explanation
      }))
    };

    return { success: true, quiz };
  },

  submit: (quiz, userAnswers) => {
    let score = 0;
    const total = quiz.questions.length;
    const review = quiz.questions.map((q, idx) => {
      const selected = userAnswers[idx];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) score += 1;
      return {
        question: q.question,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation
      };
    });

    const percentage = Math.round((score / total) * 100);

    // Save score to local progress
    const progress = offlineProgress.getMetrics();
    const currentCompleted = progress.quizzesCompleted || 0;
    const updatedProgress = {
      ...progress,
      quizzesCompleted: currentCompleted + 1,
      avgScore: Math.round(((progress.avgScore || 85) + percentage) / 2)
    };
    setLocal(STORAGE_KEYS.PROGRESS, updatedProgress);

    return {
      success: true,
      score,
      totalQuestions: total,
      percentage,
      review
    };
  }
};

// ─────────────────────────────────────────────────────────────
// 6. OFFLINE PROGRESS & METRICS
// ─────────────────────────────────────────────────────────────
export const offlineProgress = {
  getMetrics: () => {
    const saved = getLocal(STORAGE_KEYS.PROGRESS, null);
    const tasks = offlinePlanner.getTasks().tasks;
    const completedTasksCount = tasks.filter(t => t.completed).length;

    const baseHours = parseFloat(getLocal(STORAGE_KEYS.LOGGED_HOURS, 12.5));

    if (saved) {
      return {
        ...saved,
        completedTasks: completedTasksCount,
        totalTasks: tasks.length,
        studyHours: baseHours
      };
    }

    const defaultMetrics = {
      studyHours: baseHours,
      completedTasks: completedTasksCount,
      totalTasks: tasks.length,
      currentStreak: 5,
      quizzesCompleted: 4,
      avgScore: 88,
      weeklyDistribution: [
        { day: 'Mon', hours: 2.5 },
        { day: 'Tue', hours: 3.0 },
        { day: 'Wed', hours: 1.5 },
        { day: 'Thu', hours: 2.0 },
        { day: 'Fri', hours: 3.5 },
        { day: 'Sat', hours: 2.0 },
        { day: 'Sun', hours: 1.0 }
      ],
      subjectBreakdown: [
        { subject: 'Mathematics', hours: 5.5, percentage: 38 },
        { subject: 'Physics', hours: 4.0, percentage: 28 },
        { subject: 'Computer Science', hours: 3.5, percentage: 24 },
        { subject: 'Chemistry', hours: 1.5, percentage: 10 }
      ]
    };

    setLocal(STORAGE_KEYS.PROGRESS, defaultMetrics);
    return defaultMetrics;
  },

  logHours: (addedHours) => {
    const current = parseFloat(getLocal(STORAGE_KEYS.LOGGED_HOURS, 12.5));
    const newTotal = parseFloat((current + addedHours).toFixed(1));
    setLocal(STORAGE_KEYS.LOGGED_HOURS, newTotal);

    const metrics = offlineProgress.getMetrics();
    metrics.studyHours = newTotal;
    setLocal(STORAGE_KEYS.PROGRESS, metrics);
    return metrics;
  }
};
