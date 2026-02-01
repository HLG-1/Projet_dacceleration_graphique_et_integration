@"

# Quantum Mechanics Knowledge Scope

## ✅ INCLUDED

### Scope Definition

**All content from the collected introductory quantum mechanics documents is included by default**, as these documents already focus on fundamentals and basic concepts.

### Expected Content (Based on Typical Intro QM Texts)

- Wave-particle duality and experimental foundations
- Schrödinger equation (time-dependent and time-independent)
- Wavefunctions, probability interpretation, and normalization
- Operators, observables, and measurement
- Uncertainty principle
- One-dimensional problems (infinite well, finite well, harmonic oscillator, tunneling)
- Hydrogen atom (basic treatment)
- Angular momentum and spin (introductory)
- Basic mathematical formalism (Dirac notation, Hilbert spaces)
- Postulates of quantum mechanics

## ❌ EXCLUDED (Minimal Filtering)

### Content to Remove During Cleaning

- **Problem sets and exercises**: Remove homework problems, practice exercises, and their solutions
- **Exam materials**: Remove midterm/final exam questions
- **Administrative content**: Remove syllabi, course schedules, grading policies
- **Duplicate sections**: Remove if same content appears multiple times

### Advanced Topics (Only if Present)

- Quantum field theory
- Relativistic quantum mechanics (Dirac equation, Klein-Gordon)
- Advanced many-body theory
- Detailed group theory proofs

## 🎯 Processing Philosophy

**"Trust the documents"**: Since we're using introductory textbooks and lecture notes, the scope is naturally appropriate. Our job is to:

1. Extract text cleanly
2. Remove non-content (exercises, admin)
3. Keep all conceptual and mathematical explanations as-is

**No manual filtering of physics concepts** - if it's in an intro QM document, it belongs in our knowledge base.

## 📚 Document Sources

List your actual documents here as you add them:

- [ ] Document 1: [title/description]
- [ ] Document 2: [title/description]
- [ ] Document 3: [title/description]

"@ | Out-File -FilePath "data\scope.md" -Encoding UTF8 -Force
