## Instructions

Intelligently handle development tasks with appropriate workflow based on complexity.

1. **Analyze task complexity**:
   - Simple: Single file, clear scope, straightforward implementation
   - Complex: Multiple files, unclear scope, architectural decisions needed

2. **For SIMPLE tasks** (< 3 files, clear scope):
   - Read relevant files
   - Understand the change needed
   - Implement the solution
   - Test if applicable
   - Report completion

3. **For COMPLEX tasks** (multiple files, unclear scope):
   - Use investigator agent to find related code
   - Use code-flow-mapper to understand data/control flow
   - Use planner agent to create detailed plan
   - Present plan to user for approval
   - Execute with user confirmation

4. **Task Guidelines**:
   - Check what infrastructure exists before using it
   - If dependencies are missing, install them first
   - Follow project conventions in CLAUDE.md
   - Write clean, maintainable code
   - Include error handling where appropriate
   - Backwards compatibility and fallbacks are acceptable when needed
   - Code comments are acceptable for complex logic

5. **After completion**:
   - Summarize what was changed
   - List files modified
   - Suggest next steps if applicable
   - Offer to run tests if configured

**Problem**: $ARGUMENTS
