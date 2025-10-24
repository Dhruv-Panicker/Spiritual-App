#!/bin/bash
# Fix for expo-constants PhaseScriptExecution error
# Ensure clean shell environment for iOS builds

# Remove any problematic shell configurations that might cause non-zero exit codes
export PS1="> "
unset BASH_ENV
unset ENV

# Ensure node and npm are available
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

# Exit successfully
exit 0