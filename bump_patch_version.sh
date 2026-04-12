#!/bin/bash
# Increment patch version in version.yaml
# E.g., v0.1.1 → v0.1.2

VERSION_FILE="version.yaml"

if [ ! -f "$VERSION_FILE" ]; then
    echo "Error: $VERSION_FILE not found"
    exit 1
fi

# Extract current version (e.g., "v0.1.1" from the YAML file)
# Compatible with both GNU and BSD grep/sed
CURRENT=$(grep 'firmware_version:' "$VERSION_FILE" | sed 's/.*"\([^"]*\)".*/\1/')

if [ -z "$CURRENT" ]; then
    echo "Error: Could not parse firmware_version from $VERSION_FILE"
    exit 1
fi

# Parse version: split by . and handle v prefix
# E.g., "v0.1.1" → MAJOR=0, MINOR=1, PATCH=1
MAJOR=$(echo "$CURRENT" | cut -d. -f1 | sed 's/v//')
MINOR=$(echo "$CURRENT" | cut -d. -f2)
PATCH=$(echo "$CURRENT" | cut -d. -f3)

# Increment patch
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="v${MAJOR}.${MINOR}.${NEW_PATCH}"

# Update version.yaml (using -i '' for macOS compatibility)
sed -i '' "s/firmware_version: \"[^\"]*\"/firmware_version: \"$NEW_VERSION\"/" "$VERSION_FILE"

echo "Version bumped: $CURRENT → $NEW_VERSION"
