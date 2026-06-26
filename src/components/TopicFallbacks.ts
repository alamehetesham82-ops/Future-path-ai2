import { TopicData } from "./TopicAnalyzerTypes";

export const topicFallbacks: Record<string, Record<"basic" | "medium" | "advanced", TopicData>> = {
  photosynthesis: {
    basic: {
      easyExplanation: "Photosynthesis is how green plants make their own food! Think of the plant as a natural solar-powered kitchen. Plants use sunlight, water from the soil, and carbon dioxide from the air to make sugars (their food) and release oxygen for us to breathe.",
      detailedExplanation: "Photosynthesis is a clean biological process that occurs in green plants, algae, and cyanobacteria. The main reaction converts solar light energy, carbon dioxide, and water into chemical energy in the form of sugars, while releasing oxygen as a byproduct.",
      keyConcepts: [
        "Solar Energy Capture: Plants catch light using green pigments.",
        "Water Transport: Roots pull water from the soil up into leaves.",
        "Gas Exchange: Stomata under leaves take in carbon dioxide and release oxygen."
      ],
      importantPoints: [
        "Only green parts of plants containing chlorophyll can perform photosynthesis.",
        "Sunlight is the primary source of energy powering the entire cycle.",
        "Oxygen released by plants is what humans and animals need to live."
      ],
      studyNotes: "A green leaf acts as the plant's food generator. Chlorophyll inside the cells traps solar photons to initiate the chemical reaction. Water is absorbed from the soil and carbon dioxide is taken in from the air to create sugars.",
      revisionNotes: "Sunlight + Water + Carbon Dioxide -> Sugar + Oxygen. Green chlorophyll makes it possible!",
      faq: [
        { q: "Why are leaves green?", a: "They contain a green pigment called chlorophyll which reflects green light while absorbing other colors." },
        { q: "Do plants photosynthesize at night?", a: "No, because photosynthesis requires sunlight to trigger the process." }
      ],
      resources: [
        { title: "Photosynthesis for Kids: Easy Science Lessons", url: "https://www.youtube.com/watch?v=sQK3Yr4Sc_k", source: "Educational Channel" }
      ],
      overview: "Photosynthesis is the fundamental solar-powered engine of life on Earth, enabling green plants to produce food and oxygen.",
      coreConcepts: [
        { title: "Chlorophyll", desc: "The green coloring matter in plants that absorbs sunlight." },
        { title: "Solar Kitchen", desc: "How leaves act as mini solar panels converting light to food." }
      ],
      importantTerms: [
        { term: "Stomata", definition: "Tiny pores on the underside of leaves for breathing in CO2." },
        { term: "Glucose", definition: "The simple sugar plants make for energy." }
      ],
      examples: [
        "A potted houseplant growing towards a sunny window.",
        "Forests generating pure oxygen for the planet's atmosphere."
      ],
      formulas: [
        { name: "Word Equation", eq: "Carbon Dioxide + Water + Light -> Glucose + Oxygen", desc: "The simple word-based explanation of the chemical process." }
      ],
      practicalApps: [
        "Agriculture and crop growth to feed the global population.",
        "Using plants in bedrooms to freshen up the air during daytime."
      ],
      commonMistakes: [
        "Thinking plants absorb water through leaves instead of roots.",
        "Assuming photosynthesis happens at night without any light source."
      ],
      summary: "Photosynthesis is how green plants use sunlight, water, and CO2 to create sugar food and oxygen, powering Earth's life support.",
      diagram: `[ Sunlight / Photons ] 
          │
          ▼
   [ Green Leaves (Chlorophyll) ] <─── [ Carbon Dioxide from Air ]
          │
          ├───────► [ Glucose / Sugar (Food) ]
          │
          ▼
   [ Oxygen Released to Air ] ◄─── [ Water from Roots/Soil ]`,
      comparisonChart: [
        { criteria: "Energy Input", itemA: "Daytime (Sunlight Active)", itemB: "Nighttime (No Light)", diff: "Requires photons to split water" },
        { criteria: "Products", itemA: "Oxygen & Glucose", itemB: "None", diff: "Only works when solar-powered kitchen is open" }
      ],
      formulaCards: [
        { title: "Light Requirement", value: "Sunlight Required", note: "Powers photolysis of water" },
        { title: "Key Pigment", value: "Chlorophyll-A", note: "Abundant green pigment in thylakoid" }
      ]
    },
    medium: {
      easyExplanation: "Plants convert light energy, carbon dioxide, and water into chemical energy (glucose) and oxygen, happening inside chloroplasts.",
      detailedExplanation: "Photosynthesis is the multi-step biochemical process mapping as: 6CO2 + 6H2O + Light -> C6H12O6 + 6O2. It takes place in chloroplasts and consists of light-dependent reactions in the thylakoid membrane and light-independent reactions (Calvin Cycle) in the stroma.",
      keyConcepts: [
        "Light-Dependent Phase: Occurs in thylakoid membranes, producing ATP and NADPH.",
        "Calvin Cycle (Light-Independent): Occurs in the stroma, fixing CO2 into glucose.",
        "Photolysis: Splitting of water molecules to release oxygen."
      ],
      importantPoints: [
        "The primary carbon fixing enzyme is RuBisCO.",
        "Red and blue light wavelengths are absorbed most efficiently by chlorophyll.",
        "Water acts as the initial electron donor in the non-cyclic photophosphorylation pathway."
      ],
      studyNotes: "Photosynthesis is split into two phases. The light reaction converts electromagnetic solar energy into chemical currencies (ATP, NADPH). These currencies fuel the subsequent dark reaction or Calvin Cycle, where ribulose bisphosphate (RuBP) fixes CO2 molecules to assemble six-carbon hexose sugars.",
      revisionNotes: "Light phase = Thylakoids, produces ATP, NADPH, O2. Dark phase = Stroma, fixes CO2 into sugar.",
      faq: [
        { q: "What is RuBisCO?", a: "Ribulose-1,5-bisphosphate carboxylase-oxygenase, the enzyme that catalyzes the primary carbon dioxide fixation step." },
        { q: "What is the role of NADPH?", a: "It acts as a reducing agent, providing high-energy electrons to fix carbon into sugars." }
      ],
      resources: [
        { title: "Photosynthesis Light and Dark Reactions", url: "https://www.youtube.com/watch?v=0UzMaoG57m8", source: "Khan Academy" }
      ],
      overview: "An academic look at the two-stage biochemical system converting solar photons and carbon dioxide into chemical hexose sugars.",
      coreConcepts: [
        { title: "Thylakoids", desc: "Flattened sacs where light energy is harvested." },
        { title: "Stroma", desc: "Fluid-filled space where dark reactions synthesize sugars." }
      ],
      importantTerms: [
        { term: "RuBisCO", definition: "The abundant enzyme that fixes atmospheric carbon dioxide." },
        { term: "Photolysis", definition: "The light-driven splitting of water molecules." }
      ],
      examples: [
        "Chloroplasts inside spinach leaf cells synthesizing sugars.",
        "Phytoplankton in oceans conducting over 50% of global carbon fixation."
      ],
      formulas: [
        { name: "Chemical Formula", eq: "6CO2 + 6H2O + Light energy -> C6H12O6 + 6O2", desc: "The balanced molecular equation of photosynthesis." }
      ],
      practicalApps: [
        "Biofuel production from fast-growing algae pools.",
        "Increasing crop yields by optimizing greenhouse lighting."
      ],
      commonMistakes: [
        "Thinking dark reactions only happen at night. They just don't need light directly.",
        "Confusing chlorophyll with chloroplasts. Chlorophyll is the pigment inside chloroplasts."
      ],
      summary: "Photosynthesis uses a light-dependent reaction to charge ATP/NADPH, which then drives the Calvin Cycle to synthesize glucose.",
      diagram: `  [ LIGHT REACTIONS (Thylakoid) ]             [ CALVIN CYCLE (Stroma) ]
        │                                            │
   H2O ─┼───► ATP & NADPH ──────────────────────────►┼───► C6H12O6 (Glucose)
        │       (Chemical Energy Carriers)           │
   O2  ◄┼─── ADP & NADP+ ◄───────────────────────────┼─── CO2 (Carbon Dioxide)`,
      comparisonChart: [
        { criteria: "Location", itemA: "Light Reaction: Thylakoids", itemB: "Dark Reaction: Stroma", diff: "Structural partitioning inside chloroplast" },
        { criteria: "Input/Output", itemA: "H2O -> O2", itemB: "CO2 -> Glucose", diff: "Light reactions generate carriers; dark reactions consume them" }
      ],
      formulaCards: [
        { title: "Primary Reaction", value: "6CO2 + 6H2O -> C6H12O6 + 6O2", note: "Balanced chemical equation" },
        { title: "Energy Storage", value: "ATP & NADPH", note: "Formed during electron transport" }
      ]
    },
    advanced: {
      easyExplanation: "Photosynthesis uses a highly optimized molecular quantum electron cascade to synthesize hexose sugars via Photosystem II, Photosystem I, and the Calvin-Benson Cycle.",
      detailedExplanation: "At the advanced level, photosynthesis is a quantum-coherent bioenergetic transduction process. Light energy is captured by light-harvesting complex (LHC) antennas, funneling exciton energy to the reaction center chlorophylls (P680 and P700). Non-cyclic photophosphorylation drives electrons from water through Photosystem II, Plastoquinone, Cytochrome b6f, Plastocyanin, Photosystem I, and Ferredoxin, establishing a proton motive force (pmf) across the thylakoid membrane that drives rotational ATP Synthase.",
      keyConcepts: [
        "Exciton Energy Transfer: Quantum-coherent energy routing through pigment arrays.",
        "Z-Scheme: The thermodynamic pathway of electron transport from H2O to NADP+.",
        "Proton Motive Force: The electrochemical proton gradient driving ATP Synthase."
      ],
      importantPoints: [
        "P680+ of PSII is the strongest biological oxidizing agent known (E'0 ~ +1.25 V).",
        "The oxygen-evolving complex (OEC) splits water via a cluster of manganese, calcium, and oxygen.",
        "Photorespiration occurs when RuBisCO acts as an oxygenase under high-temperature/low-CO2 environments."
      ],
      studyNotes: "The light reactions operate as a solid-state electronic device inside thylakoid lipids. Excitation of P680 leads to charge separation and water-splitting at the manganese catalyst cluster. Protons are actively pumped into the thylakoid lumen by Cytochrome b6f, establishing a pH gradient of ~3 units. In the Calvin-Benson cycle, RuBisCO catalyzes the carboxylation of RuBP to form 3-phosphoglycerate (3-PGA) molecules, which are reduced using ATP and NADPH.",
      revisionNotes: "Exciton -> Charge separation -> P680/P700 -> Plastocyanin -> FNR -> NADPH. Calvin cycle: Carboxylation -> Reduction -> Regeneration.",
      faq: [
        { q: "Why is P680+ so highly oxidizing?", a: "To enable the thermodynamically demanding extraction of electrons from water molecules." },
        { q: "How do C4 plants bypass photorespiration?", a: "They partition carbon fixation spatially between mesophyll cells (using PEP Carboxylase) and bundle-sheath cells." }
      ],
      resources: [
        { title: "Advanced Quantum Photosynthesis Lectures", url: "https://www.youtube.com/watch?v=JgvyzIkgxF0", source: "MIT Biology" }
      ],
      overview: "A rigorous quantum mechanical and bioenergetic analysis of photosynthetic electron transport chains and carbon fixation pathways.",
      coreConcepts: [
        { title: "Z-Scheme Pathway", desc: "The energetic diagram of non-cyclic electron transport." },
        { title: "Proton Motive Force", desc: "Chemical potential of protons (pH) plus membrane electrical potential." }
      ],
      importantTerms: [
        { term: "Pheophytin", definition: "The primary electron acceptor in Photosystem II." },
        { term: "PEP Carboxylase", definition: "Carbon fixing enzyme with zero oxygenase activity, used in C4 pathway." }
      ],
      examples: [
        "Cyanobacteria utilizing ancestral dual-photosystem structures.",
        "Crassulacean Acid Metabolism (CAM) in pineapples optimizing temporal carbon capture."
      ],
      formulas: [
        { name: "Proton Motive Force", eq: "Δp = ΔΨ - (2.3 RT/F) ΔpH", desc: "The thermodynamic force driving rotational ATP synthesis across membranes." }
      ],
      practicalApps: [
        "Artificial Photosynthesis cells mimicking OEC manganese catalysts to produce clean hydrogen.",
        "Genetically engineering RuBisCO in major crops to minimize photorespiration losses."
      ],
      commonMistakes: [
        "Assuming ATP Synthase pumps protons. It actually channels them down-gradient to generate rotation.",
        "Confusing cyclic photophosphorylation (produces only ATP) with non-cyclic (produces ATP and NADPH)."
      ],
      summary: "Photosynthesis combines quantum exciton dynamics in the thylakoid membrane with precise enzymatic carbon fixation in the stroma.",
      diagram: `   [H2O] ──► [ P680 (PS II) ] ──► [ Plastoquinone ] ──► [ Cytochrome b6f ]
                                                             │
   [NADP+] ◄── [ Ferredoxin ] ◄── [ P700 (PS I) ] ◄─── [ Plastocyanin ]
                                       ▲
                                    [Light]`,
      comparisonChart: [
        { criteria: "Photosystem II", itemA: "Absorption: 680 nm (P680)", itemB: "Primary Donor: Water splitting (OEC)", diff: "Strongest biological oxidant" },
        { criteria: "Photosystem I", itemA: "Absorption: 700 nm (P700)", itemB: "Primary Donor: Plastocyanin", diff: "Reduces ferredoxin to NADP+" }
      ],
      formulaCards: [
        { title: "Water Splitting (OEC)", value: "2H2O -> O2 + 4H+ + 4e-", note: "Catalyzed by Mn4CaO5 cluster" },
        { title: "ATP Synthase Yield", value: "3 ATP per 12 Protons", note: "Driven by proton motive force rotation" }
      ]
    }
  },
  "artificial intelligence": {
    basic: {
      easyExplanation: "Artificial Intelligence (AI) is like teaching a computer how to learn and solve puzzles like a human! Rather than following exact rules, AI studies millions of examples and learns to recognize patterns on its own.",
      detailedExplanation: "AI is a branch of computer science focused on building smart software systems that perform human-like cognitive tasks, like recognizing images or translating text.",
      keyConcepts: [
        "Pattern Recognition: Finding structures in messy datasets.",
        "Training Data: Giving the system examples to study.",
        "Predictions: Guessing the correct response based on experience."
      ],
      importantPoints: [
        "AI does not feel or think like a human; it is a very advanced pattern spotting tool.",
        "An AI is only as good as the examples (data) it was trained on.",
        "Popular AIs like ChatGPT write sentences by guessing the next logical word."
      ],
      studyNotes: "Computers learn by scanning massive catalogs of examples. A computer starts by making random guesses, gets corrected by mathematical formulas, and adjusts its internal configurations until it starts guessing correctly.",
      revisionNotes: "AI = Teaching computers to spot patterns. It relies on massive training examples to make highly accurate predictions.",
      faq: [
        { q: "Can AI feel emotions?", a: "No, AI has no consciousness. It simply uses advanced statistics to mimic human text, speech, or actions." },
        { q: "What is training data?", a: "The massive collection of pictures, articles, or numbers used to teach an AI." }
      ],
      resources: [
        { title: "How AI Works for Beginners", url: "https://www.youtube.com/watch?v=aircAruvnKk", source: "Tech 101" }
      ],
      overview: "An introduction to the science of programming computer systems to learn, adapt, and solve problems like humans.",
      coreConcepts: [
        { title: "Neural Mimicry", desc: "Designing computer nodes that connect like neurons in our brain." },
        { title: "Statistical Learning", desc: "Using numbers and probability to make smart decisions." }
      ],
      importantTerms: [
        { term: "Algorithm", definition: "A set of step-by-step rules a computer follows to solve a problem." },
        { term: "Dataset", definition: "A large collection of data organized for AI analysis." }
      ],
      examples: [
        "Email spam filters automatically moving junk out of your inbox.",
        "Streaming platforms recommending songs you might enjoy."
      ],
      formulas: [
        { name: "Predictive Output", eq: "Prediction = f(Input Data)", desc: "The core functional relationship of AI predicting outputs from inputs." }
      ],
      practicalApps: [
        "Automated voice assistants like Siri and Google Assistant answering queries.",
        "Filtering harmful content off social media pages instantly."
      ],
      commonMistakes: [
        "Believing AI knows everything. It actually hallucinates when data is missing.",
        "Thinking AI is an active conscious robot that will take over immediately."
      ],
      summary: "Artificial Intelligence uses statistical pattern recognition to teach computers how to perform human-like tasks.",
      diagram: `   [ Raw Input Data ] ──► [ AI Model / Pattern Spotter ] ──► [ Smart Prediction ]
                                      ▲
                                      │
                         [ Training & Correction Loops ]`,
      comparisonChart: [
        { criteria: "Approach", itemA: "Traditional Programming", itemB: "Artificial Intelligence", diff: "Rules are hand-coded vs Rules are learned from data" },
        { criteria: "Flexibility", itemA: "Strict and rigid", itemB: "Highly adaptive to new data", diff: "AI generalizes to unseen examples" }
      ],
      formulaCards: [
        { title: "Basic Model", value: "Y = f(X)", note: "X is features, Y is target" },
        { title: "Error Rate", value: "Loss -> 0", note: "Goal of training iterations" }
      ]
    },
    medium: {
      easyExplanation: "AI is built on Machine Learning algorithms that optimize numerical weights inside neural networks to approximate functions from data.",
      detailedExplanation: "Artificial Intelligence utilizes statistical Machine Learning (ML) models. Rather than hardcoding if-else statements, ML models represent parameter weights optimized using gradient descent. Deep Learning, a subset of ML, uses multilayer neural networks to progressively extract higher-level features from raw dimensional inputs.",
      keyConcepts: [
        "Supervised Learning: Training a model on labeled inputs (X) and ground truth targets (Y).",
        "Neural Networks: Multi-layered computational nodes that mimic biological brain systems.",
        "Gradient Descent: Optimization algorithm used to minimize model prediction errors."
      ],
      importantPoints: [
        "Artificial neural networks represent combinations of weights, biases, and non-linear activation functions.",
        "Overfitting occurs when a model learns training data perfectly but fails to generalize to test data.",
        "Backpropagation uses the calculus chain rule to distribute errors and update network weights."
      ],
      studyNotes: "A standard neural network takes an input vector, multiplies it by a weight matrix, adds a bias vector, and passes the result through a non-linear activation function (like ReLU or Sigmoid). During training, the error is calculated using a loss function, and backpropagation propagates this error backwards to nudge the weights in the opposite direction of the gradient.",
      revisionNotes: "Neural node = w*x + b -> Activation Function. Backpropagation = Calculus chain rule updates weights.",
      faq: [
        { q: "What is a loss function?", a: "A mathematical formula that measures how far the model's predictions are from the actual correct answers." },
        { q: "What does activation functions do?", a: "They introduce non-linearities, allowing the network to learn complex non-linear patterns." }
      ],
      resources: [
        { title: "But what is a neural network?", url: "https://www.youtube.com/watch?v=aircAruvnKk", source: "3Blue1Brown" }
      ],
      overview: "An academic exploration of neural network architectures, optimization algorithms, and statistical pattern classification.",
      coreConcepts: [
        { title: "Backpropagation", desc: "The primary method of training multi-layer neural networks using gradients." },
        { title: "Feature Extraction", desc: "How deep layers combine basic pixels into complex representations." }
      ],
      importantTerms: [
        { term: "Weights", definition: "Adjustable numerical parameters multiplied by inputs to control node activation." },
        { term: "Activation Function", definition: "Mathematical gate (e.g., ReLU) determining node output intensity." }
      ],
      examples: [
        "Computer vision models classifying medical scans for tumor presence.",
        "Autonomous driving systems detecting lanes and pedestrian bounding boxes."
      ],
      formulas: [
        { name: "Node Activation", eq: "a = f( ∑ w_i * x_i + b )", desc: "Single neuron calculation using weights (w), inputs (x), bias (b), and activation (f)." }
      ],
      practicalApps: [
        "Language translation services instantly converting full documents.",
        "Predictive maintenance models forecasting factory equipment failures."
      ],
      commonMistakes: [
        "Failing to clean the dataset before training, leading to 'garbage-in, garbage-out' results.",
        "Assuming a model that achieves 100% training accuracy is perfect. It is likely overfitted."
      ],
      summary: "Machine Learning models use backpropagation and gradient descent to continuously optimize weights and minimize prediction loss.",
      diagram: `   Input (x) ───► [ Weight (w) ] ───► ( Sum: ∑ wx + b ) ───► [ Activation (ReLU) ] ───► Output (y)
                        ▲
                        └─────── [ Corrective Backprop (Error Derivative) ] ───────┘`,
      comparisonChart: [
        { criteria: "Optimization", itemA: "Gradient Descent", itemB: "Stochastic Gradient", diff: "Processes full dataset vs single sample per step" },
        { criteria: "Activation", itemA: "Sigmoid (0 to 1)", itemB: "ReLU (0 or x)", diff: "Bridges logistic curves vs prevents gradient saturation" }
      ],
      formulaCards: [
        { title: "Neuron Formula", value: "y = σ(w·x + b)", note: "σ represents activation gate" },
        { title: "Loss Function", value: "MSE = (1/n) ∑ (y_pred - y_true)²", note: "Standard mean squared error" }
      ]
    },
    advanced: {
      easyExplanation: "Advanced AI explores high-parameter multi-head self-attention transformer architectures and optimization in non-convex loss surfaces.",
      detailedExplanation: "At the frontier of cognitive computation, modern AI is dominated by Transformer architectures utilizing multi-head self-attention mechanisms. These structures project input tokens into query (Q), key (K), and value (V) matrices, calculating attention scores as softmax(QK^T / √d_k)V. Optimization operates over hyper-dimensional non-convex manifolds using AdamW optimizer with cosine learning rate decays, leveraging residual connections to prevent vanishing gradients during backpropagation.",
      keyConcepts: [
        "Self-Attention Mechanism: Quantifying semantic relationships between all tokens in a sequence.",
        "Non-Convex Manifolds: Multi-billion parameter landscapes containing localized saddles and minima.",
        "Generative Pre-trained Transformers (GPT): Autoregressive language modeling optimizing cross-entropy loss."
      ],
      importantPoints: [
        "Transformers scale compute, parameters, and data according to power-law scaling metrics.",
        "Attention mechanisms avoid sequential constraints of RNNs, enabling massive parallelization.",
        "Reinforcement Learning from Human Feedback (RLHF) aligns model outputs via reward modeling and PPO."
      ],
      studyNotes: "The foundational breakthrough of modern AI is the Attention block. Rather than processing text sequentially, the model computes pairwise contextual correlations across all inputs simultaneously using dot-product attention scaled by vector dimensions. This represents a dynamic routing system where words are continuously contextualized based on their surrounding token sequence before MLP projections.",
      revisionNotes: "Transformer step: Embedding -> Positional Encoding -> Multi-Head Attention -> LayerNorm -> FeedForward -> Softmax probabilities.",
      faq: [
        { q: "What is scaling law in AI?", a: "The empirical law showing that model loss decreases predictably as parameters, compute, and dataset size scale together." },
        { q: "Why do we divide by √d_k in self-attention?", a: "To scale the dot products so the softmax function doesn't saturate in high dimensions, preventing vanishing gradients." }
      ],
      resources: [
        { title: "Stanford CS224N: Natural Language Processing with Deep Learning", url: "https://www.youtube.com/watch?v=JgvyzIkgxF0", source: "Stanford Lecture" }
      ],
      overview: "A deep dive into hyper-parameter architectures, attention equations, convergence proofs, and self-supervised transformers.",
      coreConcepts: [
        { title: "Multi-Head Attention", desc: "Combining multiple self-attention views to capture complex syntactic relationships." },
        { title: "Latent Spaces", desc: "High-dimensional manifold structures representing semantic conceptual similarities." }
      ],
      importantTerms: [
        { term: "Softmax Gate", definition: "A mathematical operator transforming real-number logit vectors into probability distributions." },
        { term: "Transformer Block", definition: "Unified layer stacking multi-head attention, layer normalization, and MLPs." }
      ],
      examples: [
        "AlphaFold predicting 3D protein structures through evolutionary attention maps.",
        "Large Language Models (LLMs) executing zero-shot reasoning across mathematical and logical tasks."
      ],
      formulas: [
        { name: "Scaled Dot-Product Attention", eq: "Attention(Q, K, V) = softmax( QK^T / √d_k ) V", desc: "The core mathematical equation of modern transformer architectures." }
      ],
      practicalApps: [
        "Deploying massive multi-modal pipelines for autonomous diagnostic screening.",
        "Real-time code synthesis and logical compilation systems in software development."
      ],
      commonMistakes: [
        "Confusing self-attention with cross-attention. Cross-attention connects encoder to decoder layers.",
        "Ignoring GPU tensor cores alignment, resulting in unoptimized memory layout pipelines."
      ],
      summary: "Modern AI harnesses multi-head self-attention and hyper-dimensional optimization to build models capable of multi-modal generalization.",
      diagram: `   [ Token Embeddings + Positional Encodings ]
                       │
                       ▼
       ┌─► [ Multi-Head Self-Attention ] ──► [ LayerNorm ]
       │                 │                      │
       │                 ▼                      ▼
       └─────────► [ Feed-Forward MLP ] ────► [ LayerNorm ] ──► [ Softmax Logits ]`,
      comparisonChart: [
        { criteria: "Architecture", itemA: "RNN / LSTM", itemB: "Transformer", diff: "Sequential token processing vs parallelized attention matrix" },
        { criteria: "Scaling Limit", itemA: "Bottlenecked by sequential steps", itemB: "Highly scalable over clusters", diff: "O(n) dependencies vs O(1) step paths during training" }
      ],
      formulaCards: [
        { title: "Attention Equation", value: "softmax(QKᵀ / √d_k)V", note: "Computes semantic token affinity matrix" },
        { title: "AdamW Update Rule", value: "θ_t = θ_{t-1} - η_t (m̂_t / (√v̂_t + ε) + λ θ_{t-1})", note: "Adam optimizer with decoupled weight decay" }
      ]
    }
  },
  trigonometry: {
    basic: {
      easyExplanation: "Trigonometry is the mathematical study of triangles and how their sides and angles relate! It uses basic ratios like Sine, Cosine, and Tangent (Sin, Cos, Tan) to solve heights and distances we can't measure with a ruler.",
      detailedExplanation: "Trigonometry explores the relationships between the angles and sides of right-angled triangles, laying the foundation for advanced geometry, physics, and vector math.",
      keyConcepts: [
        "Right-Angled Triangles: Triangles with one 90-degree angle.",
        "Trig Ratios: Core functions (Sine, Cosine, Tangent) linking angles to side ratios.",
        "SOH-CAH-TOA: A handy shortcut for remembering the ratio formulas."
      ],
      importantPoints: [
        "Sine represents the ratio of the opposite side to the hypotenuse.",
        "Cosine represents the ratio of the adjacent side to the hypotenuse.",
        "Tangent is simply the ratio of opposite side to adjacent side (or Sin / Cos)."
      ],
      studyNotes: "Think of a right-angled triangle. If you know one acute angle and one side length, trigonometry lets you instantly compute all other angles and side lengths. It's like having a magical scientific calculator for geometric shapes.",
      revisionNotes: "Sin = Opp/Hyp. Cos = Adj/Hyp. Tan = Opp/Adj. Combined they unlock any right-angled triangle!",
      faq: [
        { q: "What is the hypotenuse?", a: "The longest side of a right-angled triangle, located opposite to the 90-degree angle." },
        { q: "What is SohCahToa?", a: "A mnemonic helper: Sin=Opp/Hyp, Cos=Adj/Hyp, Tan=Opp/Adj." }
      ],
      resources: [
        { title: "Trigonometry Basics for Beginners", url: "https://www.youtube.com/watch?v=F21S9Wpi0y8", source: "Math Antics" }
      ],
      overview: "An introduction to using Sine, Cosine, and Tangent to compute angles and sides in right-angled triangles.",
      coreConcepts: [
        { title: "The Triad Ratios", desc: "Sine, Cosine, and Tangent as foundational mathematical coordinates." },
        { title: "SOH CAH TOA", desc: "The standard memory key for side ratio calculations." }
      ],
      importantTerms: [
        { term: "Hypotenuse", definition: "The longest side of a right-angled triangle, always opposite the 90° corner." },
        { term: "Theta (θ)", definition: "The standard Greek letter symbol used to denote an angle." }
      ],
      examples: [
        "Using the length of a shadow and angle of the sun to find the height of a flagpole.",
        "Calculating the ramp angle needed for a wheelchair entrance to rise 1 meter."
      ],
      formulas: [
        { name: "Sine Formula", eq: "sin(θ) = Opposite / Hypotenuse", desc: "Relates an angle to its opposite height ratio." },
        { name: "Cosine Formula", eq: "cos(θ) = Adjacent / Hypotenuse", desc: "Relates an angle to its bottom base ratio." },
        { name: "Tangent Formula", eq: "tan(θ) = Opposite / Adjacent", desc: "Relates base to height ratio." }
      ],
      practicalApps: [
        "Constructing safe support beams for house roof trusses.",
        "Aviation navigation mapping flights between coordinate points."
      ],
      commonMistakes: [
        "Applying Sine and Cosine formulas to non-right triangles without adjusting rules.",
        "Confusing which side is 'Opposite' and which is 'Adjacent' relative to the angle θ."
      ],
      summary: "Trigonometry utilizes Sine, Cosine, and Tangent ratios to solve unknown sides and angles in right-angled structures.",
      diagram: `       /|
      / |
     /  |  Opposite (Opp)
    /θ  |
   /────|
  Adjacent (Adj)`,
      comparisonChart: [
        { criteria: "Value at 0°", itemA: "sin(0) = 0", itemB: "cos(0) = 1", diff: "Sine starts at zero, Cosine starts at peak" },
        { criteria: "Focus", itemA: "Vertical component", itemB: "Horizontal component", diff: "Opposite over Hypotenuse vs Adjacent over Hypotenuse" }
      ],
      formulaCards: [
        { title: "SOH Rule", value: "sin(θ) = O / H", note: "Opposite over Hypotenuse" },
        { title: "CAH Rule", value: "cos(θ) = A / H", note: "Adjacent over Hypotenuse" },
        { title: "TOA Rule", value: "tan(θ) = O / A", note: "Opposite over Adjacent" }
      ]
    },
    medium: {
      easyExplanation: "Trigonometry maps angles to continuous cyclical wave projections defined by coordinate circles.",
      detailedExplanation: "Trigonometry defines circular functions using the unit circle model (x^2 + y^2 = 1) in the Cartesian plane. For any angle θ in standard position, coordinates are expressed as (cos θ, sin θ). Key properties include cyclic periodicity, phase displacement, and pythagorean identity frameworks.",
      keyConcepts: [
        "Unit Circle Framework: Defining trig functions for angles beyond 90 degrees using coordinate rotations.",
        "Pythagorean Identities: Fundamental trigonometric relationships like sin²θ + cos²θ = 1.",
        "Radians Measure: Angular size based on arc length, where 360° equals 2π radians."
      ],
      importantPoints: [
        "Trig functions are continuous waves; Sine and Cosine waves are out of phase by 90 degrees (π/2).",
        "The Law of Sines and Law of Cosines allow solving for any arbitrary non-right triangle.",
        "The reciprocal ratios are Secant (1/Cos), Cosecant (1/Sin), and Cotangent (1/Tan)."
      ],
      studyNotes: "By extending trigonometry beyond right triangles to the unit circle, we unlock circular coordinate systems. The Sine and Cosine functions become continuous waves mapping periodic oscillations. This enables the calculation of wave metrics, acoustics, alternating electrical currents, and structural engineering stresses.",
      revisionNotes: "sin²x + cos²x = 1. sec²x - tan²x = 1. cosec²x - cot²x = 1. 2π radians = 360°.",
      faq: [
        { q: "Why does tan(90°) not exist?", a: "Because at 90°, the Adjacent side (x-coordinate) equals 0, making the Opp/Adj division undefined." },
        { q: "What is the Law of Cosines?", a: "An extension of the Pythagorean theorem: c² = a² + b² - 2ab cos(C), valid for all triangles." }
      ],
      resources: [
        { title: "Unit Circle and Trigonometric Ratios Lectures", url: "https://www.youtube.com/watch?v=pubb8G_A1g4", source: "Khan Academy" }
      ],
      overview: "An academic review of unit circles, reciprocal functions, periodic wave properties, and trigonometric equations.",
      coreConcepts: [
        { title: "Unit Circle", desc: "A circle of radius 1 centered at the origin, representing periodic angular coordinates." },
        { title: "Periodicity", desc: "The cyclical pattern of trig functions repeating every 2π radians." }
      ],
      importantTerms: [
        { term: "Radian", definition: "Standard unit of angular measure, defined by arc length divided by radius." },
        { term: "Secant (sec)", definition: "The reciprocal of the Cosine function (1 / cos θ)." }
      ],
      examples: [
        "Graphing the continuous rise and fall of oceanic tides using sine wave curves.",
        "Solving an oblique triangle using the Law of Sines (a/sin A = b/sin B)."
      ],
      formulas: [
        { name: "Pythagorean Identity", eq: "sin²(θ) + cos²(θ) = 1", desc: "The primary trigonometric identity derived from the unit circle circle." },
        { name: "Law of Cosines", eq: "c² = a² + b² - 2ab * cos(C)", desc: "Solves non-right triangles when given two sides and their included angle." }
      ],
      practicalApps: [
        "Acoustics and sound editing, filtering frequencies using wave formulas.",
        "Electrical grid mapping, analyzing periodic alternating voltage waveforms."
      ],
      commonMistakes: [
        "Leaving calculators in Radian mode when attempting Degree calculations, yielding wrong outputs.",
        "Dividing by zero when evaluating tangent or secant at odd multiples of 90° (π/2)."
      ],
      summary: "Trigonometry establishes periodic unit circle equations and identities to solve complex geometric, wave, and vector oscillations.",
      diagram: `        Y
        │       (cos θ, sin θ)
        │         * 
        │        /|
        │       / |  sin θ
        │    1 /  |
        │     /θ  |
  ──────┼─────┴─────► X
        │   cos θ
        │`,
      comparisonChart: [
        { criteria: "Function Type", itemA: "Sine Wave (sin θ)", itemB: "Cosine Wave (cos θ)", diff: "Odd function (symmetric about origin) vs Even function (symmetric about y-axis)" },
        { criteria: "Reciprocal", itemA: "Cosecant (csc θ = 1/sin)", itemB: "Secant (sec θ = 1/cos)", diff: "Undefined where sine is zero vs Undefined where cosine is zero" }
      ],
      formulaCards: [
        { title: "Base Identity", value: "sin²θ + cos²θ = 1", note: "Derived from unit circle radius" },
        { title: "Law of Sines", value: "a/sinA = b/sinB = c/sinC", note: "Solves oblique triangles" },
        { title: "Double Angle", value: "sin(2θ) = 2sinθcosθ", note: "Crucial identity for integration" }
      ]
    },
    advanced: {
      easyExplanation: "Advanced Trigonometry centers on complex exponential mappings via Euler's Formula and spectral decomposition.",
      detailedExplanation: "At the advanced level, trigonometric functions are defined analytically via infinite power series (e.g., sin z = ∑ (-1)^n z^(2n+1)/(2n+1)!) or complex exponentials. Applying Euler's Formula, e^(iθ) = cos θ + i sin θ, maps trigonometric relationships into the complex plane, unlocking polar coordinates, Euler's identity, and Fourier analysis for harmonic signal representation.",
      keyConcepts: [
        "Euler's Formula: Integrating trigonometry and complex analysis via e^(iθ).",
        "Power Series Representations: Defining trigonometric ratios analytically without geometry.",
        "Fourier Series: Decomposing any periodic function into a sum of infinite sine and cosine harmonics."
      ],
      importantPoints: [
        "Trigonometric functions can be extended to complex variables, linking to hyperbolic functions (e.g., sin(ix) = i sinh(x)).",
        "The orthogonality of Sine and Cosine waves forms the mathematical foundation of digital signal processing.",
        "De Moivre's Theorem allows computing powers of complex numbers using angular multiplications."
      ],
      studyNotes: "Analytic trigonometry replaces traditional triangle geometry with algebra over complex exponential spaces. Using Euler's formula, trigonometric functions are mapped as projections of rotational vectors on the complex unit circle. This framework is crucial for solving linear differential equations and conducting Fourier Transforms to analyze sound, imagery, and electrical signals in the frequency domain.",
      revisionNotes: "e^(iθ) = cos θ + i sin θ. cos θ = (e^(iθ) + e^(-iθ))/2. sin θ = (e^(iθ) - e^(-iθ))/(2i).",
      faq: [
        { q: "What is the relation between trig and hyperbolic functions?", a: "sinh(z) = -i sin(iz) and cosh(z) = cos(iz), showing they are geometric rotations in real vs imaginary coordinate systems." },
        { q: "What is Fourier Transform?", a: "A mathematical transform that decomposes a function of time into its constituent frequencies of sine and cosine waves." }
      ],
      resources: [
        { title: "Fourier Analysis and Complex Trigonometry", url: "https://www.youtube.com/watch?v=F21S9Wpi0y8", source: "MIT Mathematics" }
      ],
      overview: "A rigorous mathematical exploration of trigonometric functions via power series, complex exponentials, and spectral analysis.",
      coreConcepts: [
        { title: "Euler's Identity", desc: "The profound equation e^(iπ) + 1 = 0, connecting five fundamental mathematical constants." },
        { title: "Fourier Harmonics", desc: "Expressing arbitrary signals as combinations of sine and cosine wave coordinates." }
      ],
      importantTerms: [
        { term: "Euler's Formula", definition: "The formula e^(iθ) = cos θ + i sin θ mapping circles inside the complex plane." },
        { term: "Orthogonality", definition: "The product of different sine/cosine waves integrating to zero over a full period." }
      ],
      examples: [
        "Decomposing a complex audio stream into discrete frequency channels for MP3 compression.",
        "Using complex polar exponentials to solve voltage current loads in electrical systems."
      ],
      formulas: [
        { name: "Euler's Formula", eq: "e^(iθ) = cos(θ) + i * sin(θ)", desc: "Bridges trigonometric coordinates and complex exponential functions." },
        { name: "De Moivre's Theorem", eq: "(cos θ + i sin θ)^n = cos(nθ) + i sin(nθ)", desc: "Enables fast calculations of powers of complex numbers." }
      ],
      practicalApps: [
        "Digital audio engineering, filtering noise frequencies using Fourier transform algorithms.",
        "Quantum mechanics modeling, solving wave equations using complex wavefunctions."
      ],
      commonMistakes: [
        "Assuming e^(iθ) is a spiral. It is a perfect circular rotation with constant radius of 1.",
        "Forgetting the imaginary unit 'i' in the denominator of the exponential sine formula."
      ],
      summary: "Advanced trigonometry utilizes Euler's complex plane formulas and Fourier series to analyze wave equations, quantum mechanics, and signals.",
      diagram: `        Imaginary (i)
         ▲
         │       e^(iθ) = cos θ + i sin θ
         │        * 
         │       /|
         │    1 / |  i * sin θ
         │     /θ |
   ──────┼─────┴─────► Real
         │   cos θ
         │`,
      comparisonChart: [
        { criteria: "Domain", itemA: "Trigonometric Functions", itemB: "Hyperbolic Functions", diff: "Maps angles along unit circle vs unit hyperbola" },
        { criteria: "Complex link", itemA: "cos θ = cosh(iθ)", itemB: "cosh θ = cos(iθ)", diff: "Rotates coordinates between real and imaginary dimensions" }
      ],
      formulaCards: [
        { title: "Euler's Key", value: "e^(iθ) = cosθ + i sinθ", note: "Bridges trig and exponentials" },
        { title: "De Moivre", value: "(cosθ + isinθ)ⁿ = cos(nθ) + isin(nθ)", note: "Fast polar coordinates powers" },
        { title: "Cos Series", value: "∑ (-1)ⁿ x²ⁿ / (2n)!", note: "Taylor expansion definition of cosine" }
      ]
    }
  }
};
