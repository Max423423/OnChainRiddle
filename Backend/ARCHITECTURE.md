# OnchainRiddle Backend - DDD Architecture

## Overview

The OnchainRiddle backend follows **Domain-Driven Design (DDD)** and **Clean Architecture** principles to ensure clear separation of responsibilities and optimal maintainability.

## Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│ Controllers │ Routes │ Middleware │ DTOs                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│ Use Cases │ Services │ Orchestration                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                            │
├─────────────────────────────────────────────────────────────┤
│ Entities │ Value Objects │ Domain Services │ Repositories   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                        │
├─────────────────────────────────────────────────────────────┤
│ Blockchain │ AI Services │ Logging │ External APIs          │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
Backend/
├── src/
│   ├── domain/                    # Domain Layer
│   │   ├── entities/
│   │   │   └── riddle.js         # Riddle Entity
│   │   ├── value-objects/
│   │   │   └── riddle-id.js      # RiddleId Value Object
│   │   └── repositories/
│   │       └── riddle-repository.js # Repository Interface
│   │
│   ├── application/               # Application Layer
│   │   ├── use-cases/
│   │   │   ├── generate-riddle-use-case.js
│   │   │   └── handle-winner-use-case.js
│   │   └── dto/
│   │       └── riddle-dto.js     # Data Transfer Objects
│   │
│   ├── infrastructure/            # Infrastructure Layer
│   │   ├── blockchain/
│   │   │   └── ethereum-riddle-repository.js
│   │   ├── ai/
│   │   │   └── openai-ai-service.js
│   │   └── logging/
│   │       └── winston-logger.js
│   │
│   └── presentation/              # Presentation Layer
│       ├── controllers/
│       │   └── riddle-controller.js
│       ├── routes/
│       │   └── riddle-routes.js
│       └── middleware/
│           └── error-handler.js
│
├── test/                          # Tests
│   ├── domain/
│   │   └── riddle.test.js
│   └── infrastructure/
│       └── ai-service.test.js
│
└── main.js                        # Main entry point
```

## Applied DDD Principles

### 1. Entities
- **Riddle** : Main entity with identity and lifecycle
- Business rules encapsulation
- State change methods (activate, deactivate, setWinner)

### 2. Value Objects
- **RiddleId** : Immutable identifier with validation
- No own identity, defined by their values
- Immutable and side-effect free

### 3. Repositories
- **RiddleRepository** : Interface for persistence
- **EthereumRiddleRepository** : Blockchain implementation
- Data layer abstraction

### 4. Use Cases
- **GenerateRiddleUseCase** : Generation orchestration
- **HandleWinnerUseCase** : Winner management
- Application-level business logic

### 5. Domain Services
- Business logic that cannot be in entities
- Coordination between multiple entities

## Data Flow

### Riddle Generation
```
1. Controller receives request
2. Use Case orchestrates operation
3. AI Service generates content
4. Entity validates data
5. Repository persists to blockchain
6. Response DTO returns result
```

### Winner Management
```
1. Blockchain event detected
2. Use Case processes event
3. Entity updates its state
4. Repository synchronizes
5. New riddle automatically generated
```

## Advantages of this Architecture

### ✅ Separation of Responsibilities
- Each layer has a specific role
- Dependencies point inward
- Facilitates testing and maintenance

### ✅ Framework Independence
- Isolated business logic
- Ability to change infrastructure
- Simplified unit tests

### ✅ Scalability
- Easy addition of new features
- Implementation replacement
- Domain extension

### ✅ Testability
- Unit tests for each layer
- Easy to implement mocks
- Optimal code coverage

## Used Patterns

### Repository Pattern
```javascript
// Interface
class RiddleRepository {
  async save(riddle) { /* ... */ }
  async findActive() { /* ... */ }
}

// Implementation
class EthereumRiddleRepository extends RiddleRepository {
  // Ethereum-specific implementation
}
```

### Use Case Pattern
```javascript
class GenerateRiddleUseCase {
  constructor(riddleRepository, aiService) {
    this._riddleRepository = riddleRepository;
    this._aiService = aiService;
  }

  async execute() {
    // Business logic orchestration
  }
}
```

### DTO Pattern
```javascript
class RiddleDTO {
  static fromEntity(riddle) {
    return new RiddleDTO({
      id: riddle.id,
      question: riddle.question,
      // ...
    });
  }
}
```

## Configuration and Deployment

### Environment Variables
```env
# Blockchain
PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=your_contract_address
RPC_URL=your_rpc_url

# AI
OPENAI_API_KEY=your_openai_key

# Server
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

### Startup
```bash
# Installation
npm install

# Configuration
npm run setup

# Development
npm run dev

# Production
npm start
```

## Monitoring and Observability

### Structured Logs
- Winston for logging
- Enriched metadata
- Configurable log levels

### Metrics
- Automatic health checks
- Service status
- Operation performance

### API Endpoints
- `/api/health` - Service status
- `/api/status` - Current riddle status
- `/api/generate-riddle` - Manual generation
- `/api/riddle-history` - Riddle history

## Future Evolutions

### Possible Extensions
1. **Database** : Local riddle persistence
2. **Redis Cache** : Performance improvement
3. **Microservices** : Responsibility separation
4. **Event Sourcing** : Complete traceability
5. **CQRS** : Read/write separation

### Improvements
1. **Validation** : DTO validation middleware
2. **Authentication** : JWT for APIs
3. **Rate Limiting** : Abuse protection
4. **Documentation** : OpenAPI/Swagger
5. **E2E Tests** : Complete integration tests 