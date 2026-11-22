# klip-dergi-api

Klip Dergi REST API

## Technology Selection

### 1. ORM – Drizzle ORM

| ORM       | Main Characteristics                                    |
| --------- | ------------------------------------------------------- |
| Prisma    | Mature ecosystem, developer-friendly, hides SQL details |
| Drizzle   | Lightweight, SQL-like, TypeScript support               |
| TypeORM   | Entity-based, Repository pattern                        |
| Sequelize | Model-based, supports multiple databases                |

**Why Drizzle?**

- Existing SQL knowledge can be directly applied.
- Strong TypeScript support.
- Zero core dependencies.
- More control over SQL queries.
- Suitable for serverless environments.

### 2. Backend Framework – Fastify

| Framework  | Main Characteristics                                        |
| ---------- | ----------------------------------------------------------- |
| Express.js | Beginner-friendly, flexible, extensive resources            |
| Fastify    | Performance-oriented, plugin-based                          |
| NestJS     | Modular architecture, suitable for large-scale applications |

**Why Fastify?**

Express was also considered because it is easier to learn and has a larger community with more learning resources. However, Fastify was selected for its performance-oriented architecture, TypeScript support and plugin system.

### 3. Other Technologies

- **Node.js + TypeScript:** Backend runtime and programming language.
- **PostgreSQL:** Relational database.
- **Zod:** Runtime data validation and type inference.
- **OpenAPI:** API contract and documentation.
- **Drizzle Kit:** Database migrations.
- **Vitest + Testcontainers:** Automated tests with real PostgreSQL.
- **GitHub Actions:** CI automation.
