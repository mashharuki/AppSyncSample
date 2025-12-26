# Kiro Spec-Driven Development Workflow

## Overview
This project uses Kiro-style Spec-Driven Development with AI-DLC (AI Development Life Cycle).

## Directory Structure
- **Steering**: `.kiro/steering/` - Project-wide rules and context
  - `product.md` - Product vision and goals
  - `structure.md` - Project structure and conventions
  - `tech.md` - Technology stack and patterns
  
- **Specs**: `.kiro/specs/` - Individual feature specifications
  - Each spec has: `spec.json`, `requirements.md`, `design.md`, `tasks.md`, `research.md`

## Development Phases

### Phase 0: Steering (Optional)
```bash
/kiro:steering              # Manage steering documents
/kiro:steering-custom       # Create custom steering for specialized contexts
```

### Phase 1: Specification
```bash
# 1. Initialize spec
/kiro:spec-init "description"

# 2. Generate requirements
/kiro:spec-requirements {feature}

# 3. (Optional) Analyze gap for existing codebase
/kiro:validate-gap {feature}

# 4. Create technical design
/kiro:spec-design {feature} [-y]

# 5. (Optional) Review design quality
/kiro:validate-design {feature}

# 6. Generate implementation tasks
/kiro:spec-tasks {feature} [-y]
```

### Phase 2: Implementation
```bash
# Execute specific tasks
/kiro:spec-impl {feature} [task-numbers]

# Example: /kiro:spec-impl appsync-multi-table-dashboard 1.1

# (Optional) Validate implementation
/kiro:validate-impl {feature}
```

### Progress Tracking
```bash
# Check specification status anytime
/kiro:spec-status {feature}
```

## Workflow Rules
1. **3-Phase Approval**: Requirements → Design → Tasks → Implementation
2. **Human Review**: Required at each phase (use `-y` only for intentional fast-track)
3. **Steering Alignment**: Keep steering current, verify with `/kiro:spec-status`
4. **Language**: 
   - Think in English
   - Generate responses in Japanese
   - Write all Markdown files in target language (configured in spec.json)

## Current Active Spec
- **Feature**: `appsync-multi-table-dashboard`
- **Location**: `.kiro/specs/appsync-multi-table-dashboard/`
- **Status**: Check with `/kiro:spec-status appsync-multi-table-dashboard`

## Best Practices
- Always check if spec exists before starting work
- Use steering documents as persistent project knowledge
- Update steering when project patterns/decisions change
- Follow the spec's requirements and design closely during implementation
- Validate implementation against requirements after completion
- Ask questions only when essential info is missing or instructions are ambiguous
- Within scope, act autonomously to complete work end-to-end

## Common Commands
```bash
# Check what specs exist
ls .kiro/specs/

# View spec status
/kiro:spec-status {feature-name}

# Continue implementation (specify task numbers)
/kiro:spec-impl {feature-name} {task-number}

# Example workflow for new feature
/kiro:spec-init "Add real-time dashboard updates"
/kiro:spec-requirements dashboard-realtime
/kiro:spec-design dashboard-realtime
/kiro:spec-tasks dashboard-realtime
/kiro:spec-impl dashboard-realtime 1.1
```
