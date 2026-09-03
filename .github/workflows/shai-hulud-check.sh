DIRECTORY="$1"

escape_file () {
    # Read each pattern from the patterns file
    while IFS= read -r pattern; do
        # Escape special characters in the pattern for sed
        escaped_pattern=$(printf '%s\n' "$pattern" | sed -e 's|[\/&]|\\&|g')
        escaped_pattern=$(printf '%s\n' "$escaped_pattern" | sed -e 's|[][]|\\&|g')
        # Use sed to replace the pattern with an empty string
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i "" -e "s/$escaped_pattern//g" "$1"
        else
            # other OS
            sed -i -e "s/$escaped_pattern//g" "$1"
        fi
    done < "$DIRECTORY/.github/workflows/shai-hulud-allowed-patterns.txt"
}

# file to escape before scanning (the patterns listed in shai-hulud-allowed-patterns.txt will be removed)
escape_file "$DIRECTORY/src/config/env.ts"
escape_file "$DIRECTORY/src/db/config.ts"

# file to remove before scanning (a comment must be provided to explain why)
rm -rf "$DIRECTORY/.github/workflows/shai-hulud.yml" # remove current workflow to avoid scanning itself
rm -rf "$DIRECTORY/.github/workflows/shai-hulud-allowed-patterns.txt" # remove allowed patterns file
rm -rf "$DIRECTORY/.github/workflows/check_pull_request.yml" # remove allowed github action
rm -rf "$DIRECTORY/.github/workflows/publish_with_semver_tag.yml" # remove allowed github action
rm -rf "$DIRECTORY/.github/workflows/publish_with_sha.yml" # remove allowed github action
rm -rf "$DIRECTORY/.github/workflows/trivy-scan.yml" # remove allowed github action

# call shai-hulud scan-project.sh
curl -s https://raw.githubusercontent.com/sngular/shai-hulud-integrity-scanner/refs/heads/main/scan-project.sh | bash /dev/stdin "$DIRECTORY"