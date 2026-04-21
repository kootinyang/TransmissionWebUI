#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Refactor the New Design overlay CSS.
Key transformations:
1. Merge repeated .popup.X selectors for dialogs
2. Remove unnecessary !important (rely on cascade order and specificity)
3. Replace toolbar icon display:none+::before with direct SVG styling
4. Extract hardcoded colors to CSS variables
"""

import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Read overlay
overlay = read_file('scripts/overlay.css')

# ============================================================
# TRANSFORMATION 1: Add new CSS variables for hover colors
# ============================================================

# Find the :root block and add new variables
new_vars = """  /* Hover colors - extracted from hardcoded values */
  --primary-hover: #e67700;
  --destructive-hover: #e04e2a;
  --secondary-hover: #3a3a3a;
  --icon-color-primary: #111111;
  --icon-color-secondary: #ffffff;
  --icon-color-muted: #b8b9b6;
"""

# Insert after --destructive-foreground or similar
root_end_marker = '--destructive-foreground:'
if root_end_marker in overlay:
    # Find the line with --destructive-foreground
    lines = overlay.split('\n')
    for i, line in enumerate(lines):
        if '--destructive-foreground:' in line:
            # Insert after this line
            lines.insert(i+1, new_vars.rstrip())
            break
    overlay = '\n'.join(lines)

# ============================================================
# TRANSFORMATION 2: Toolbar icon refactoring
# Replace display:none svg + ::before with direct SVG color control
# ============================================================

# Remove the "Hide default SVG icons" rule and br rule
overlay = re.sub(
    r'/\* Hide default SVG icons.*?\*/\n#mainwin-toolbar button svg,\n\.mainwin-toolbar button svg \{\n\s*display: none;\n\}',
    '/* Toolbar icons use direct SVG color control */',
    overlay,
    flags=re.DOTALL
)

overlay = re.sub(
    r'/\* Hide unexpected <br> elements.*?\*/\n#mainwin-toolbar button br,\n\.mainwin-toolbar button br \{\n\s*display: none;\n\}',
    '',
    overlay,
    flags=re.DOTALL
)

# Replace toolbar button ::before icons with svg color styling
# For #toolbar-open: remove ::before, add svg color rule
# Pattern: selector::before { content:''; display:inline-block; width:16px; height:16px; background-image:url(...); ... }
# We need to replace these with: selector svg { color: var(--icon-color-primary); }

# Replace #toolbar-open::before and [data-action="open-torrent"]::before
overlay = re.sub(
    r'(#toolbar-open::before,\n\[data-action="open-torrent"\]::before \{)[^}]+(\})',
    r'#toolbar-open svg,\n[data-action="open-torrent"] svg {\n  color: var(--icon-color-primary);\n}',
    overlay,
    flags=re.DOTALL
)

# Replace #toolbar-delete::before
overlay = re.sub(
    r'(#toolbar-delete::before,\n\[data-action="remove-selected-torrents"\]::before \{)[^}]+(\})',
    r'#toolbar-delete svg,\n[data-action="remove-selected-torrents"] svg {\n  color: var(--icon-color-primary);\n}',
    overlay,
    flags=re.DOTALL
)

# Replace #toolbar-start::before
overlay = re.sub(
    r'(#toolbar-start::before,\n\[data-action="resume-selected-torrents"\]::before \{)[^}]+(\})',
    r'#toolbar-start svg,\n[data-action="resume-selected-torrents"] svg {\n  color: var(--icon-color-secondary);\n}',
    overlay,
    flags=re.DOTALL
)

# Replace #toolbar-pause::before
overlay = re.sub(
    r'(#toolbar-pause::before,\n\[data-action="pause-selected-torrents"\]::before \{)[^}]+(\})',
    r'#toolbar-pause svg,\n[data-action="pause-selected-torrents"] svg {\n  color: var(--icon-color-secondary);\n}',
    overlay,
    flags=re.DOTALL
)

# Replace #toolbar-inspector::before
overlay = re.sub(
    r'(#toolbar-inspector::before,\n\[data-action="show-inspector"\]::before \{)[^}]+(\})',
    r'#toolbar-inspector svg,\n[data-action="show-inspector"] svg {\n  color: var(--icon-color-secondary);\n}',
    overlay,
    flags=re.DOTALL
)

# Replace #toolbar-overflow::before
overlay = re.sub(
    r'(/\* Overflow Button - Lucide ellipsis-vertical icon.*?\*/\n)?#toolbar-overflow::before,\n\[data-action="show-overflow-menu"\]::before \{[^}]+\}',
    r'/* Overflow button uses direct icon styling */\n#toolbar-overflow svg,\n[data-action="show-overflow-menu"] svg {\n  color: var(--icon-color-secondary);\n}',
    overlay,
    flags=re.DOTALL
)

# ============================================================
# TRANSFORMATION 3: Replace hardcoded hover colors with variables
# ============================================================

overlay = overlay.replace('background-color: #e67700;', 'background-color: var(--primary-hover);')
overlay = overlay.replace('background-color: #e04e2a;', 'background-color: var(--destructive-hover);')
overlay = overlay.replace('background-color: #3a3a3a;', 'background-color: var(--secondary-hover);')

# ============================================================
# TRANSFORMATION 4: Dialog popup selector merging
# Merge repeated .popup.X .dialog-* selectors
# ============================================================

# Pattern for finding 8+ .popup.X classes in a selector
# We'll replace specific patterns with simplified ones

# 4a. Merge popup overlay rules
overlay = re.sub(
    r'\.popup\.about-dialog,\n\.popup\.confirm-dialog,\n\.popup\.move-dialog,\n\.popup\.shortcuts-dialog,\n\.popup\.statistics-dialog,\n\.popup\.rename-dialog,\n\.popup\.labels-dialog,\n\.popup\.add-dialog,\n\.popup\.open-torrent,\n\.popup\.remove-dialog \{',
    '.popup {',
    overlay
)

# 4b. Merge .popup.X .dialog-window (all 10)
overlay = re.sub(
    r'\.popup\.about-dialog \.dialog-window,\n\.popup\.confirm-dialog \.dialog-window,\n\.popup\.move-dialog \.dialog-window,\n\.popup\.shortcuts-dialog \.dialog-window,\n\.popup\.statistics-dialog \.dialog-window,\n\.popup\.rename-dialog \.dialog-window,\n\.popup\.labels-dialog \.dialog-window,\n\.popup\.add-dialog \.dialog-window,\n\.popup\.open-torrent \.dialog-window,\n\.popup\.remove-dialog \.dialog-window \{',
    '.popup .dialog-window {',
    overlay
)

# 4c. Merge .popup.X .dialog-window (narrow - 6 dialogs)
overlay = re.sub(
    r'\.popup\.rename-dialog \.dialog-window,\n\.popup\.confirm-dialog \.dialog-window,\n\.popup\.move-dialog \.dialog-window,\n\.popup\.labels-dialog \.dialog-window,\n\.popup\.remove-dialog \.dialog-window,\n\.popup\.about-dialog \.dialog-window \{',
    '.popup.narrow .dialog-window,\n.popup.confirm-dialog .dialog-window,\n.popup.move-dialog .dialog-window,\n.popup.labels-dialog .dialog-window,\n.popup.remove-dialog .dialog-window,\n.popup.about-dialog .dialog-window,\n.popup.rename-dialog .dialog-window {',
    overlay
)
# Actually, let's keep the width rules separate but simplify the main ones

# 4d. Merge .popup.X .dialog-logo
overlay = re.sub(
    r'\.popup\.about-dialog \.dialog-logo,\n\.popup\.confirm-dialog \.dialog-logo,\n\.popup\.move-dialog \.dialog-logo,\n\.popup\.shortcuts-dialog \.dialog-logo,\n\.popup\.statistics-dialog \.dialog-logo,\n\.popup\.rename-dialog \.dialog-logo,\n\.popup\.labels-dialog \.dialog-logo,\n\.popup\.add-dialog \.dialog-logo,\n\.popup\.open-torrent \.dialog-logo,\n\.popup\.remove-dialog \.dialog-logo \{',
    '.popup .dialog-logo {',
    overlay
)

# 4e. Merge .popup.X .dialog-heading
overlay = re.sub(
    r'\.popup\.about-dialog \.dialog-heading,\n\.popup\.confirm-dialog \.dialog-heading,\n\.popup\.move-dialog \.dialog-heading,\n\.popup\.shortcuts-dialog \.dialog-heading,\n\.popup\.statistics-dialog \.dialog-heading,\n\.popup\.rename-dialog \.dialog-heading,\n\.popup\.labels-dialog \.dialog-heading,\n\.popup\.add-dialog \.dialog-heading,\n\.popup\.open-torrent \.dialog-heading,\n\.popup\.remove-dialog \.dialog-heading \{',
    '.popup .dialog-heading {',
    overlay
)

# 4f. Merge .popup.X .dialog-message
overlay = re.sub(
    r'\.popup\.about-dialog \.dialog-message,\n\.popup\.confirm-dialog \.dialog-message,\n\.popup\.move-dialog \.dialog-message,\n\.popup\.shortcuts-dialog \.dialog-message,\n\.popup\.statistics-dialog \.dialog-message,\n\.popup\.rename-dialog \.dialog-message,\n\.popup\.labels-dialog \.dialog-message,\n\.popup\.add-dialog \.dialog-message,\n\.popup\.open-torrent \.dialog-message,\n\.popup\.remove-dialog \.dialog-message \{',
    '.popup .dialog-message {',
    overlay
)

# 4g. Merge .popup.X .dialog-workarea
overlay = re.sub(
    r'\.popup\.about-dialog \.dialog-workarea,\n\.popup\.confirm-dialog \.dialog-workarea,\n\.popup\.move-dialog \.dialog-workarea,\n\.popup\.shortcuts-dialog \.dialog-workarea,\n\.popup\.statistics-dialog \.dialog-workarea,\n\.popup\.rename-dialog \.dialog-workarea,\n\.popup\.labels-dialog \.dialog-workarea,\n\.popup\.add-dialog \.dialog-workarea,\n\.popup\.open-torrent \.dialog-workarea,\n\.popup\.remove-dialog \.dialog-workarea \{',
    '.popup .dialog-workarea {',
    overlay
)

# 4h. Merge .popup.X .dialog-buttons
overlay = re.sub(
    r'\.popup\.about-dialog \.dialog-buttons,\n\.popup\.confirm-dialog \.dialog-buttons,\n\.popup\.move-dialog \.dialog-buttons,\n\.popup\.shortcuts-dialog \.dialog-buttons,\n\.popup\.statistics-dialog \.dialog-buttons,\n\.popup\.rename-dialog \.dialog-buttons,\n\.popup\.labels-dialog \.dialog-buttons,\n\.popup\.add-dialog \.dialog-buttons,\n\.popup\.open-torrent \.dialog-buttons,\n\.popup\.remove-dialog \.dialog-buttons \{',
    '.popup .dialog-buttons {',
    overlay
)

# 4i. Merge .popup.X .dialog-buttons .flexible-space
overlay = re.sub(
    r'\.popup\.about-dialog \.dialog-buttons \.flexible-space,\n\.popup\.confirm-dialog \.dialog-buttons \.flexible-space,\n\.popup\.move-dialog \.dialog-buttons \.flexible-space,\n\.popup\.shortcuts-dialog \.dialog-buttons \.flexible-space,\n\.popup\.statistics-dialog \.dialog-buttons \.flexible-space,\n\.popup\.rename-dialog \.dialog-buttons \.flexible-space,\n\.popup\.labels-dialog \.dialog-buttons \.flexible-space,\n\.popup\.add-dialog \.dialog-buttons \.flexible-space,\n\.popup\.open-torrent \.dialog-buttons \.flexible-space,\n\.popup\.remove-dialog \.dialog-buttons \.flexible-space \{',
    '.popup .dialog-buttons .flexible-space {',
    overlay
)

# 4j. Merge .popup.X .dialog-buttons button
overlay = re.sub(
    r'\.popup\.about-dialog \.dialog-buttons button,\n\.popup\.confirm-dialog \.dialog-buttons button,\n\.popup\.move-dialog \.dialog-buttons button,\n\.popup\.shortcuts-dialog \.dialog-buttons button,\n\.popup\.statistics-dialog \.dialog-buttons button,\n\.popup\.rename-dialog \.dialog-buttons button,\n\.popup\.labels-dialog \.dialog-buttons button,\n\.popup\.add-dialog \.dialog-buttons button,\n\.popup\.open-torrent \.dialog-buttons button,\n\.popup\.remove-dialog \.dialog-buttons button \{',
    '.popup .dialog-buttons button {',
    overlay
)

# 4k. Merge .popup.X .dialog-buttons button:hover
overlay = re.sub(
    r'\.popup\.about-dialog \.dialog-buttons button:hover,\n\.popup\.confirm-dialog \.dialog-buttons button:hover,\n\.popup\.move-dialog \.dialog-buttons button:hover,\n\.popup\.shortcuts-dialog \.dialog-buttons button:hover,\n\.popup\.statistics-dialog \.dialog-buttons button:hover,\n\.popup\.rename-dialog \.dialog-buttons button:hover,\n\.popup\.labels-dialog \.dialog-buttons button:hover,\n\.popup\.add-dialog \.dialog-buttons button:hover,\n\.popup\.open-torrent \.dialog-buttons button:hover,\n\.popup\.remove-dialog \.dialog-buttons button:hover \{',
    '.popup .dialog-buttons button:hover {',
    overlay
)

# 4l. Merge .popup.X .dialog-buttons button:focus-visible
overlay = re.sub(
    r'\.popup\.about-dialog \.dialog-buttons button:focus-visible,\n\.popup\.confirm-dialog \.dialog-buttons button:focus-visible,\n\.popup\.move-dialog \.dialog-buttons button:focus-visible,\n\.popup\.shortcuts-dialog \.dialog-buttons button:focus-visible,\n\.popup\.statistics-dialog \.dialog-buttons button:focus-visible,\n\.popup\.rename-dialog \.dialog-buttons button:focus-visible,\n\.popup\.labels-dialog \.dialog-buttons button:focus-visible,\n\.popup\.add-dialog \.dialog-buttons button:focus-visible,\n\.popup\.open-torrent \.dialog-buttons button:focus-visible,\n\.popup\.remove-dialog \.dialog-buttons button:focus-visible \{',
    '.popup .dialog-buttons button:focus-visible {',
    overlay
)

# 4m. Merge .popup.X .dialog-buttons .dialog-dismiss-button
overlay = re.sub(
    r'\.popup\.about-dialog \.dialog-buttons \.dialog-dismiss-button,\n\.popup\.confirm-dialog \.dialog-buttons \.dialog-dismiss-button,\n\.popup\.move-dialog \.dialog-buttons \.dialog-dismiss-button,\n\.popup\.shortcuts-dialog \.dialog-buttons \.dialog-dismiss-button,\n\.popup\.statistics-dialog \.dialog-buttons \.dialog-dismiss-button,\n\.popup\.rename-dialog \.dialog-buttons \.dialog-dismiss-button,\n\.popup\.labels-dialog \.dialog-buttons \.dialog-dismiss-button,\n\.popup\.add-dialog \.dialog-buttons \.dialog-dismiss-button,\n\.popup\.open-torrent \.dialog-buttons \.dialog-dismiss-button,\n\.popup\.remove-dialog \.dialog-buttons \.dialog-dismiss-button \{',
    '.popup .dialog-buttons .dialog-dismiss-button {',
    overlay
)

# ============================================================
# TRANSFORMATION 5: Selective !important removal
# ============================================================

# For rules that target IDs or highly specific selectors,
# !important is often unnecessary since New Design layer comes after vendor.
# We'll do conservative removals:

# 5a. Toolbar rules with IDs - remove !important
overlay = re.sub(
    r'(#toolbar-open\s*\{[^}]+?)!important',
    r'\1',
    overlay,
    flags=re.DOTALL
)
overlay = re.sub(
    r'(#toolbar-delete\s*\{[^}]+?)!important',
    r'\1',
    overlay,
    flags=re.DOTALL
)
overlay = re.sub(
    r'(#toolbar-start\s*\{[^}]+?)!important',
    r'\1',
    overlay,
    flags=re.DOTALL
)
overlay = re.sub(
    r'(#toolbar-pause\s*\{[^}]+?)!important',
    r'\1',
    overlay,
    flags=re.DOTALL
)
overlay = re.sub(
    r'(#toolbar-inspector\s*\{[^}]+?)!important',
    r'\1',
    overlay,
    flags=re.DOTALL
)

# 5b. For #mainwin-toolbar and #mainwin-statusbar base rules
overlay = re.sub(
    r'(#mainwin-toolbar,\n\.mainwin-toolbar \{[^}]+?)!important',
    r'\1',
    overlay,
    flags=re.DOTALL
)
overlay = re.sub(
    r'(#mainwin-statusbar,\n\.mainwin-statusbar \{[^}]+?)!important',
    r'\1',
    overlay,
    flags=re.DOTALL
)

# 5c. For .tabs-container - this is already very specific
overlay = re.sub(
    r'(\.tabs-container\s*\{[^}]+?)!important',
    r'\1',
    overlay,
    flags=re.DOTALL
)

# 5d. For #prefs-dialog specific rules
overlay = re.sub(
    r'(#prefs-dialog\.tabs-container\s*\{[^}]+?)!important',
    r'\1',
    overlay,
    flags=re.DOTALL
)

# ============================================================
# Write output
# ============================================================

write_file('scripts/overlay_refactored.css', overlay)

# Stats
imp_after = overlay.count('!important')
print(f"Overlay refactored!")
print(f"!important remaining: {imp_after}")
print(f"Output: scripts/overlay_refactored.css")
