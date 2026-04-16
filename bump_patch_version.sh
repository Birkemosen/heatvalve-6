#!/bin/bash
# Increment semantic version in version.yaml
# Usage: ./bump_patch_version.sh [patch|minor|major]
# Default: patch

VERSION_FILE="version.yaml"
PART=${1:-patch}

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

# Increment according to requested part
case "$PART" in
    patch)
        NEW_MAJOR=$MAJOR
        NEW_MINOR=$MINOR
        NEW_PATCH=$((PATCH + 1))
        ;;
    minor)
        NEW_MAJOR=$MAJOR
        NEW_MINOR=$((MINOR + 1))
        NEW_PATCH=0
        ;;
    major)
        NEW_MAJOR=$((MAJOR + 1))
        NEW_MINOR=0
        NEW_PATCH=0
        ;;
    *)
        echo "Error: invalid bump part '$PART' (use patch, minor, or major)"
        exit 1
        ;;
esac

NEW_VERSION="v${NEW_MAJOR}.${NEW_MINOR}.${NEW_PATCH}"

# Update version.yaml (using -i '' for macOS compatibility)
sed -i '' "s/firmware_version: \"[^\"]*\"/firmware_version: \"$NEW_VERSION\"/" "$VERSION_FILE"

echo "Version bumped ($PART): $CURRENT → $NEW_VERSION"
