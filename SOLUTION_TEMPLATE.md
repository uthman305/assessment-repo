# Solution Report Template

Please fill out this report template detailing the design choices and system architecture of your implementation. Submit this file as `SOLUTION.md` in the root of your repository.

---

## 1. Local Setup Instructions
Detail how to run your backend, frontend, database, and mobile applications locally. Include dependency install commands, migrations, and environmental variables.

```bash
# Setup command for database:
...

# Setup command for backend:
...

# Setup command for frontend:
...
```

---

## 2. Technical Stack & Architecture Decisions
Explain the architecture of your system, focusing on:
- **ORMs/Database client choice** (e.g. raw SQL vs. TypeORM/Prisma) and reasons.
- **State management on Web** (e.g. React Context, Zustand, Redux) and reasons.
- **API validation strategy** (e.g. class-validator, zod) on NestJS.

---

## 3. Handling Business Constraints & Corner Cases
Explain how you solved:
- **Duplicate Check-Ins**: How did you enforce the "once per day per restaurant" limit?
- **Optimistic UI Updates**: How did you handle errors and state rollback when favoring a restaurant?
- **Distance Calculations**: How did you sort restaurants by location coordinates on the backend?

---

## 4. Key Limitations & Future Enhancements
State what you were unable to complete due to time constraints, and how you would design or finish them with an extra week of time.
*(Examples: production caching, Redis locks for race conditions, real-time WebSockets reservation gate, complete custom audio UI for chat).*
