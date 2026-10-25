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

    if (qLower.includes('calculus') || qLower.includes('derivative') || qLower.includes('integral') || qLower.includes('limit') || qLower.includes('differentiat')) {
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
    } else if (qLower.includes('physics') || qLower.includes('force') || qLower.includes('gravity') || qLower.includes('velocity') || qLower.includes('energy') || qLower.includes('quantum') || qLower.includes('magnetic') || qLower.includes('electric')) {
      subject = 'Physics & Dynamics';
      title = 'Fundamental Physical Laws & Field Derivation';
      equation = '\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}, \\quad \\nabla \\cdot \\mathbf{B} = 0';
      equationSubtitle = 'Maxwell-Faraday Electromagnetic Induction';
      explanation = `### Physical Analysis for: **"${query}"**\n\n1. **Conservation Laws**: Physical systems strictly obey energy conservation, linear/angular momentum conservation, and gauge symmetries.\n2. **Equation Formulation**: Formulate free-body dynamics or field fluxes by isolating the system boundary.\n3. **Dimensional Consistency**: Validate that units across both sides of the derived expression match rigorously ($[M L T^{-2}]$ for forces, $[M L^2 T^{-2}]$ for energy).`;
      keyPoints = [
        { title: 'Newtonian & Relativistic Invariance', text: 'Verify if particle velocity approaches c before adopting classical approximations.' },
        { title: 'Field Flux Integration', text: 'Use symmetry (Gaussian cylinders/spheres or Ampere loops) to simplify complex flux integrals.' },
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
    } else {
      subject = 'Academic Problem Solving';
      title = `Academic Solution: ${query.slice(0, 36)}`;
      equation = 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n';
      equationSubtitle = 'Taylor Series Analytical Expansion';
      explanation = `### Structured Solution for: **"${query}"**\n\n1. **Core Concept Definition**: This inquiry centers around systematic principles of academic analysis and verification.\n2. **Step-by-Step Resolution**: Break composite components into elemental, verifiable sub-steps while observing governing boundary constraints.\n3. **Practical Application**: Verify with known edge cases and standard test values for structural validity.`;
      keyPoints = [
        { title: 'Foundational Theory', text: 'Grounded in formal scientific principles and rigorous systematic methodology.' },
        { title: 'Analytical Decomposition', text: 'Deconstruct complex multi-variable problems into self-contained sub-units.' },
        { title: 'Empirical Verification', text: 'Test against known baseline scenarios to validate predictive accuracy.' }
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
  mathematics: [
    {
      question: "What is the derivative of f(x) = ln(3x^2 + 1)?",
      options: ["6x / (3x^2 + 1)", "3x / (3x^2 + 1)", "1 / (3x^2 + 1)", "6 / (3x + 1)"],
      correctAnswer: 0,
      explanation: "By the chain rule: d/dx[ln(u)] = (1/u) * u'. Here u = 3x^2 + 1, so u' = 6x. The derivative is 6x / (3x^2 + 1)."
    },
    {
      question: "Which of the following matrices has an inverse?",
      options: ["[[1, 2], [2, 4]]", "[[2, 1], [1, 2]]", "[[0, 0], [1, 3]]", "[[3, 6], [1, 2]]"],
      correctAnswer: 1,
      explanation: "A square matrix is invertible if and only if det(A) ≠ 0. For [[2,1],[1,2]], det = (2*2) - (1*1) = 3 ≠ 0."
    },
    {
      question: "What is the value of lim(x -> 0) of sin(5x) / x?",
      options: ["0", "1", "5", "Undefined"],
      correctAnswer: 2,
      explanation: "Using the standard limit lim(u -> 0) sin(u)/u = 1: lim(x -> 0) 5 * [sin(5x) / 5x] = 5 * 1 = 5."
    }
  ],
  physics: [
    {
      question: "According to Faradays Law, what does an induced electromotive force (EMF) depend upon?",
      options: [
        "The constant magnitude of magnetic field",
        "The time rate of change of magnetic flux",
        "The total electrical resistance of the wire only",
        "The speed of light in vacuum"
      ],
      correctAnswer: 1,
      explanation: "Faradays Law states that EMF = -dPhi_B / dt, proportional to the time rate of change of magnetic flux."
    },
    {
      question: "What is the work done by a centripetal force acting on an object in uniform circular motion?",
      options: ["Zero", "Positive and equal to kinetic energy", "Negative", "Depends on radius"],
      correctAnswer: 0,
      explanation: "Work = F * d * cos(theta). Centripetal force acts perpendicular to instantaneous displacement (theta = 90 deg, cos 90 = 0), so work is always zero."
    },
    {
      question: "What is the kinetic energy of a mass m moving at non-relativistic velocity v?",
      options: ["m * v", "(1/2) * m * v^2", "m * g * h", "m * v^2"],
      correctAnswer: 1,
      explanation: "Classical kinetic energy is defined as (1/2) m v^2."
    }
  ],
  computer_science: [
    {
      question: "What is the average time complexity of searching in a Balanced Binary Search Tree (AVL / Red-Black)?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctAnswer: 1,
      explanation: "Because the tree height is guaranteed to be bounded by O(log n), lookup takes O(log n) time."
    },
    {
      question: "Which data structure follows the LIFO (Last In, First Out) principle?",
      options: ["Queue", "Stack", "Priority Queue", "Circular Array"],
      correctAnswer: 1,
      explanation: "A Stack operates on Last-In, First-Out (LIFO) order using push and pop operations."
    },
    {
      question: "In relational databases, which normal form eliminates transitive dependencies?",
      options: ["1NF", "2NF", "3NF", "BCNF"],
      correctAnswer: 2,
      explanation: "Third Normal Form (3NF) requires 2NF plus no non-prime attribute is transitively dependent on any candidate key."
    }
  ]
};

export const offlineQuiz = {
  generate: (topic = 'Mathematics', difficulty = 'Medium') => {
    const tLower = (topic || '').toLowerCase();
    let pool = QUESTION_BANK.mathematics;

    if (tLower.includes('physic') || tLower.includes('wave') || tLower.includes('electric') || tLower.includes('force')) {
      pool = QUESTION_BANK.physics;
    } else if (tLower.includes('computer') || tLower.includes('data') || tLower.includes('code') || tLower.includes('algo')) {
      pool = QUESTION_BANK.computer_science;
    }

    const quiz = {
      id: `offline-quiz-${Date.now()}`,
      _id: `offline-quiz-${Date.now()}`,
      topic: topic || 'Academic Proficiency',
      difficulty: difficulty || 'Medium',
      questions: pool.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
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
