// Auto-ported from the official AI Engineering Program Guide (course list,
// prerequisites, and elective pools verified against the program's PDF
// course descriptions). Edit here to update course data across the whole
// /program-guide page.

export const NAME_MAP = {
  "BAS 011":"Mathematics (1)",       "BAS 012":"Mathematics (2)",
  "BAS 021":"Mechanics (1)",         "BAS 022":"Mechanics (2)",
  "BAS 031":"Physics (1)",           "BAS 032":"Physics (2)",
  "BAS 041":"Fundamentals of Engineering Chemistry",
  "BAS 115":"Linear Algebra",        "BAS 116":"Mathematical Methods for Engineers",
  "BAS 216":"Statistics & Data Analysis",
  "BAS 217":"Discrete & Numerical Mathematics",
  "BAS 218":"Advanced Engineering Mathematics",
  "BAS 311":"Statistical Learning",  "BAS 315":"Optimization Methods",
  "PDE 051":"Principles of Manufacturing Engineering",
  "PDE 052":"Engineering Drawing",
  "ENG 111":"Technical Report Writing","ENG 312":"Project Management",
  "ELE 151":"Electric Power & Machines",
  "UNR 061":"English Language (1)",  "UNR 021":"History of Engineering & Technology",
  "UNR 121":"Research & Analysis Skills","UNR 181":"Law & Human Rights",
  "UNR 241":"Communication & Presentation Skills","UNR 261":"Professional Ethics",
  "UNR 471":"Marketing",
  "CSE 042":"Intro to Computer Systems",
  "CSE 111":"Programming (1)",       "CSE 112":"Algorithms & Data Structures",
  "CSE 141":"Digital Design",        "CSE 151":"Introduction to Artificial Intelligence",
  "CSE 212":"Database Systems",      "CSE 221":"Automatic Control",
  "CSE 251":"Machine Learning",      "CSE 313":"Data Management",
  "CSE 315":"Embedded Systems",      "CSE 317":"Computer Architecture",
  "CSE 331":"Programming (2)",       "CSE 351":"Deep Learning",
  "CSE 423":"Robotics",              "CSE 451":"Big Data Science",
  "CSE 452":"AI Applications",
  "CSE 316":"Decision-Making Systems","CSE 318":"Human-Computer Interaction",
  "CSE 319":"Bioinformatics",        "CSE 335":"Data Visualization & Analysis",
  "CSE 352":"Cognitive Psychology",
  "CSE 412":"Soft Computing",        "CSE 413":"High-Performance Computing Systems",
  "CSE 414":"Data Mining",           "CSE 454":"Advanced Deep Learning",
  "CSE 455":"Natural Language Processing",
  "CSE 456":"AI Applications in Medical Systems",
  "CSE 457":"Reinforcement Learning","CSE 458":"AI in Signal & Audio Processing",
  "CSE 459":"Machine Learning in Arts",
  "ECE 121":"Electric Circuits",     "ECE 122":"Electronics",
  "ECE 223":"Measurements & Instruments",
  "ECE 224":"Sensors, Actuators & Sensor Networks",
  "ECE 234":"Signals & Systems",     "ECE 235":"Signal Processing & Analysis",
  "ECE 321":"Communication Networks","ECE 332":"Neural Networks",
  "ECE 333":"Digital Image Processing",
  "ECE 334":"Pattern Recognition",
  "ECE 432":"Internet of Things (IoT)","ECE 435":"Computer Vision",
  "ARI 171":"Practical Training in AI Eng.",
  "ARI 271":"Field Training (1) in AI Eng.",
  "ARI 371":"Field Training (2) in AI Eng.",
  "ARI 381":"Project (1) in AI Eng.",
  "ARI 481":"Project (2) in AI Eng.",
  "ARI 482":"Project (3) in AI Eng.",
};
export const SCHEDULED_COURSES = [
  // ══ Sem 1 – Fall ══
  {code:"BAS 011",name:"Mathematics (1)",                       cat:"BAS",type:"Mandatory",sem:1,cr:3,pre:[]},
  {code:"BAS 021",name:"Mechanics (1)",                         cat:"BAS",type:"Mandatory",sem:1,cr:3,pre:[]},
  {code:"BAS 031",name:"Physics (1)",                           cat:"BAS",type:"Mandatory",sem:1,cr:3,pre:[]},
  {code:"BAS 041",name:"Fundamentals of Engineering Chemistry", cat:"BAS",type:"Mandatory",sem:1,cr:3,pre:[]},
  {code:"PDE 052",name:"Engineering Drawing",                   cat:"PDE",type:"Mandatory",sem:1,cr:3,pre:[]},
  {code:"UNR 061",name:"English Language (1)",                  cat:"UNR",type:"Mandatory",sem:1,cr:2,pre:[]},
  // ══ Sem 2 – Spring ══
  {code:"BAS 012",name:"Mathematics (2)",                       cat:"BAS",type:"Mandatory",sem:2,cr:3,pre:["BAS 011"]},
  {code:"BAS 022",name:"Mechanics (2)",                         cat:"BAS",type:"Mandatory",sem:2,cr:3,pre:["BAS 021"]},
  {code:"BAS 032",name:"Physics (2)",                       cat:"BAS",type:"Mandatory",sem:2,cr:3,pre:[]},
  {code:"CSE 042",name:"Intro to Computer Systems",             cat:"CSE",type:"Mandatory",sem:2,cr:3,pre:[]},
  {code:"PDE 051",name:"Principles of Manufacturing Engineering",cat:"PDE",type:"Mandatory",sem:2,cr:3,pre:[]},
  {code:"UNR 021",name:"History of Engineering & Technology",   cat:"UNR",type:"Mandatory",sem:2,cr:1,pre:[]},
  // ══ Sem 3 – Fall ══
  {code:"BAS 115",name:"Linear Algebra",                        cat:"BAS",type:"Mandatory",sem:3,cr:3,pre:["BAS 012"]},
  {code:"CSE 151",name:"Introduction to Artificial Intelligence",cat:"CSE",type:"Mandatory",sem:3,cr:3,pre:[]},
  {code:"CSE 141",name:"Digital Design",                        cat:"CSE",type:"Mandatory",sem:3,cr:3,pre:["CSE 042"]},
  {code:"UNR 181",name:"Law & Human Rights",                    cat:"UNR",type:"Mandatory",sem:3,cr:2,pre:[]},
  {code:"ECE 121",name:"Electric Circuits",                     cat:"ECE",type:"Mandatory",sem:3,cr:3,pre:["BAS 032"]},
  {code:"ENG 111",name:"Technical Report Writing",              cat:"ENG",type:"Mandatory",sem:3,cr:2,pre:["UNR 061"]},
  // ══ Sem 4 – Spring ══
  {code:"BAS 116",name:"Mathematical Methods for Engineers",    cat:"BAS",type:"Mandatory",sem:4,cr:3,pre:["BAS 115"]},
  {code:"ECE 122",name:"Electronics",                           cat:"ECE",type:"Mandatory",sem:4,cr:3,pre:["ECE 121"]},
  {code:"CSE 111",name:"Programming (1)",                       cat:"CSE",type:"Mandatory",sem:4,cr:3,pre:["CSE 141"]},
  {code:"CSE 112",name:"Algorithms & Data Structures",          cat:"CSE",type:"Mandatory",sem:4,cr:3,pre:["CSE 042"]},
  {code:"ELE 151",name:"Electric Power & Machines",             cat:"ELE",type:"Mandatory",sem:4,cr:3,pre:["ECE 121"]},
  {code:"UNR 121",name:"Research & Analysis Skills",            cat:"UNR",type:"Mandatory",sem:4,cr:2,pre:[]},
  {code:"ARI 171",name:"Practical Training in AI Engineering",  cat:"ARI",type:"Project",  sem:4,cr:0,pre:["≥ 56 credit hours completed"]},
  // ══ Sem 5 – Fall ══
  {code:"BAS 216",name:"Statistics & Data Analysis",            cat:"BAS",type:"Mandatory",sem:5,cr:2,pre:["BAS 115"]},
  {code:"ECE 234",name:"Signals & Systems",                     cat:"ECE",type:"Mandatory",sem:5,cr:3,pre:["BAS 116"]},
  {code:"UNR 241",name:"Communication & Presentation Skills",   cat:"UNR",type:"Mandatory",sem:5,cr:2,pre:[]},
  // FIX: PDF p.494 says prereq is BAS 116, not ECE 122
  {code:"ECE 223",name:"Measurements & Instruments",            cat:"ECE",type:"Mandatory",sem:5,cr:3,pre:["ECE 122"]},
  {code:"CSE 251",name:"Machine Learning",                      cat:"CSE",type:"Mandatory",sem:5,cr:3,pre:["CSE 151"]},
  {code:"CSE 221",name:"Automatic Control",                     cat:"CSE",type:"Mandatory",sem:5,cr:3,pre:["BAS 116"]},
  // ══ Sem 6 – Spring ══
  // FIX: PDF p.490 says prereq is BAS 216 (not BAS 116)
  {code:"BAS 217",name:"Discrete & Numerical Mathematics",      cat:"BAS",type:"Mandatory",sem:6,cr:3,pre:["BAS 216"]},
  {code:"ECE 224",name:"Sensors, Actuators & Sensor Networks",  cat:"ECE",type:"Mandatory",sem:6,cr:3,pre:["ECE 223"]},
  {code:"BAS 218",name:"Advanced Engineering Mathematics",      cat:"BAS",type:"Mandatory",sem:6,cr:3,pre:["BAS 216"]},
  {code:"UNR 261",name:"Professional Ethics",                   cat:"UNR",type:"Mandatory",sem:6,cr:2,pre:[]},
  {code:"CSE 212",name:"Database Systems",                      cat:"CSE",type:"Mandatory",sem:6,cr:3,pre:["CSE 112"]},
  {code:"ECE 235",name:"Signal Processing & Analysis",          cat:"ECE",type:"Mandatory",sem:6,cr:3,pre:["ECE 234"]},
  {code:"ARI 271",name:"Field Training (1) in AI Engineering",  cat:"ARI",type:"Project",  sem:6,cr:0,pre:["≥ 90 credit hours completed"]},
  // ══ Sem 7 – Fall ══
  {code:"ELEC E1",name:"Elective (1)",cat:"CSE",type:"Elective",sem:7,cr:3,pre:[],eGroup:"L300",eSlots:["E1"]},
  {code:"ECE 332",name:"Neural Networks",                       cat:"ECE",type:"Mandatory",sem:7,cr:3,pre:["BAS 218"]},
  {code:"CSE 331",name:"Programming (2)",                       cat:"CSE",type:"Mandatory",sem:7,cr:3,pre:["CSE 111"]},
  {code:"CSE 313",name:"Data Management",                       cat:"CSE",type:"Mandatory",sem:7,cr:3,pre:["CSE 212"]},
  {code:"CSE 317",name:"Computer Architecture",                 cat:"CSE",type:"Mandatory",sem:7,cr:3,pre:["CSE 141"]},
  {code:"ECE 333",name:"Digital Image Processing",              cat:"ECE",type:"Mandatory",sem:7,cr:3,pre:["ECE 235"]},
  // ══ Sem 8 – Spring ══
  {code:"CSE 351",name:"Deep Learning",                         cat:"CSE",type:"Mandatory",sem:8,cr:3,pre:["ECE 332"]},
  {code:"CSE 315",name:"Embedded Systems",                      cat:"CSE",type:"Mandatory",sem:8,cr:3,pre:["CSE 317"]},
  {code:"ELEC E2",name:"Elective (2)",cat:"CSE",type:"Elective",sem:8,cr:3,pre:[],eGroup:"L300",eSlots:["E2"]},
  // FIX: PDF p.499 says prereq is ECE 224, not ECE 234
  {code:"ECE 321",name:"Communication Networks",                cat:"ECE",type:"Mandatory",sem:8,cr:3,pre:["ECE 234"]},
  {code:"ENG 312",name:"Project Management",                    cat:"ENG",type:"Mandatory",sem:8,cr:2,pre:[]},
  {code:"ARI 381",name:"Project (1) in AI Engineering",         cat:"ARI",type:"Project",  sem:8,cr:3,pre:["≥ 96 credit hours completed"]},
  {code:"ARI 371",name:"Field Training (2) in AI Engineering",  cat:"ARI",type:"Project",  sem:8,cr:0,pre:["≥ 120 credit hours completed"]},
  // ══ Sem 9 – Fall ══
  {code:"ELEC E3",name:"Elective (3)",cat:"CSE",type:"Elective",sem:9,cr:3,pre:[],eGroup:"L400",eSlots:["E3"]},
  {code:"ELEC E4",name:"Elective (4)",cat:"CSE",type:"Elective",sem:9,cr:3,pre:[],eGroup:"L400",eSlots:["E4"]},
  {code:"CSE 423",name:"Robotics",                              cat:"CSE",type:"Mandatory",sem:9,cr:3,pre:["CSE 221"]},
  {code:"UNR 471",name:"Marketing",                             cat:"UNR",type:"Mandatory",sem:9,cr:2,pre:[]},
  {code:"ARI 481",name:"Project (2) in AI Engineering",         cat:"ARI",type:"Project",  sem:9,cr:3,pre:["≥ 116 credit hours completed"]},
  // ══ Sem 10 – Spring ══
  {code:"CSE 451",name:"Big Data Science",                      cat:"CSE",type:"Mandatory",sem:10,cr:3,pre:["CSE 313"]},
  {code:"CSE 452",name:"AI Applications",                       cat:"CSE",type:"Mandatory",sem:10,cr:3,pre:["CSE 351"]},
  {code:"ELEC E5",name:"Elective (5)",cat:"CSE",type:"Elective",sem:10,cr:3,pre:[],eGroup:"L400",eSlots:["E5"]},
  {code:"ARI 482",name:"Project (3) in AI Engineering",         cat:"ARI",type:"Project",  sem:10,cr:3,pre:["≥ 130 credit hours completed"]},
];

// ─────────────────────────────────────────────────────────────────
// ELECTIVE POOLS – full info from PDF course descriptions
// ─────────────────────────────────────────────────────────────────
export const ELECTIVE_POOLS = {
  L300: [
    {
      code:"CSE 316", name:"Decision-Making Systems", cat:"CSE", cr:3,
      pre:["BAS 218"],
      desc:"Decision making under certainty/uncertainty, linear programming, knowledge representation, decision support interfaces, guideline verification."
    },
    {
      code:"ECE 334", name:"Pattern Recognition", cat:"ECE", cr:3,
      pre:["BAS 218"],
      desc:"Pattern recognition problem formulation, signal pre-processing, feature extraction, classification methods: supervised, unsupervised, parametric, non-parametric."
    },
    {
      code:"BAS 315", name:"Optimization Methods", cat:"BAS", cr:3,
      pre:["BAS 218"],
      desc:"Linear, numerical, dynamic, and nonlinear optimization; heuristic methods."
    },
    {
      code:"CSE 319", name:"Bioinformatics", cat:"CSE", cr:3,
      pre:["BAS 216"],
      desc:"DNA/protein databases, sequence alignment, phylogenetic trees, microarray analysis, protein structure prediction, comparative genomics."
    },
    {
      code:"CSE 318", name:"Human-Computer Interaction", cat:"CSE", cr:3,
      pre:["CSE 251"],
      desc:"HCI introduction, cognitive psychology, design methods, human psychology simulation, design sensitivity, evaluation methods, error recovery."
    },
    {
      code:"BAS 311", name:"Statistical Learning", cat:"BAS", cr:3,
      pre:["BAS 216"],
      desc:"Linear/logistic/polynomial regression, linear models, LDA, classification trees, random forests, SVM, PCA, cluster analysis."
    },
    {
      code:"CSE 335", name:"Data Visualization & Analysis", cat:"CSE", cr:3,
      pre:["CSE 331","BAS 218"],
      desc:"Data analysis & visualization intro, Python/R programming, data description methods, high-dimensional data, statistical analysis, hypothesis testing, dashboard design."
    },
    {
      code:"CSE 352", name:"Cognitive Psychology", cat:"CSE", cr:3,
      pre:[],
      desc:"Human information processing & AI, perception, human memory, visual cognition, language and thought."
    },
  ],
  L400: [
    {
      code:"ECE 432", name:"Internet of Things (IoT)", cat:"ECE", cr:3,
      pre:["ECE 321"],
      desc:"IoT intro, hardware platforms & OS, wireless communication, IP-connected smart objects, embedded web services, industrial network tracking, standards & protocols."
    },
    {
      code:"CSE 454", name:"Advanced Deep Learning", cat:"CSE", cr:3,
      pre:["CSE 351"],
      desc:"Advanced DL models: image-to-image networks, GANs for various signals, transfer learning, learning from small data, deep reinforcement learning, sequence modeling."
    },
    {
      code:"CSE 455", name:"Natural Language Processing", cat:"CSE", cr:3,
      pre:["CSE 351"],
      desc:"NLP intro, information extraction, translation tools, sentiment analysis, word vector representations, probabilistic NLP, sequence models, RNN, LSTM, machine translation."
    },
    {
      code:"ECE 435", name:"Computer Vision", cat:"ECE", cr:3,
      pre:["ECE 333"],
      desc:"Image formation, camera geometry, image statistics, motion estimation, stereo, image classification, scene understanding, deep learning with neural networks, optical flow, segmentation."
    },
    {
      code:"CSE 412", name:"Soft Computing", cat:"CSE", cr:3,
      pre:["ECE 332"],
      desc:"Soft computing intro, neural networks, fuzzy sets, fuzzy logic, fuzzy classification, hybrid methods, neuro-fuzzy models, genetic algorithms."
    },
    {
      code:"CSE 413", name:"High-Performance Computing Systems", cat:"CSE", cr:3,
      pre:["CSE 313"],
      desc:"Computer architecture, multi-core, vector representation, multithreading, distributed/shared memory, parallel computing, GPU computing, client-server communication."
    },
    {
      code:"CSE 456", name:"AI Applications in Medical Systems", cat:"CSE", cr:3,
      pre:["CSE 351"],
      desc:"AI in medicine intro, medical signals & images, medical data mining, CNNs, image-to-image models, GANs – applied to tumor detection, medical image segmentation, vital signal analysis."
    },
    {
      code:"CSE 457", name:"Reinforcement Learning", cat:"CSE", cr:3,
      pre:["CSE 351"],
      desc:"RL theory, state/action/reward definition, problem formulation in RL framework, deep RL as neural networks, DRL applications in AI."
    },
    {
      code:"CSE 414", name:"Data Mining", cat:"CSE", cr:3,
      pre:["BAS 218","CSE 351"],
      desc:"Data mining concepts, reading & storing data, classification/clustering, feature extraction, statistical analysis, knowledge pattern inference, audio/text data, various ML algorithms."
    },
    {
      code:"CSE 458", name:"AI in Signal & Audio Processing", cat:"CSE", cr:3,
      pre:["CSE 151","CSE 351"],
      desc:"DL for signal processing, advanced deep neural architectures, RNN models, LSTM, sequence-to-sequence networks, GANs for audio generation."
    },
    {
      code:"CSE 459", name:"Machine Learning in Arts", cat:"CSE", cr:3,
      pre:["CSE 351"],
      desc:"AI/ML in arts intro, image-to-image learning, GANs, style-transfer networks – applied to artistic image generation, interior design, music composition, video colorization."
    },
  ]
};
