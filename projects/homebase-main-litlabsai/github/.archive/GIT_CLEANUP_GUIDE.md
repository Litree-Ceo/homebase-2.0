# 🧹 Git Cleanup & Organization Guide

## Current Status

✅ **What's good:**
- HomeBase 2.0 is the main repository (master branch)
- EverythingHomebase has its own GitHub repo (LiTree89/EverythingHomebase)
- Both repos are properly configured

⚠️ **What needs fixing:**
- EverythingHomebase is tracked as regular files, not as a proper submodule
- Lots of uncommitted changes across both repos
- Git config needs attention for smooth multi-repo workflow

---

## Solution: 2-Part Cleanup

### **Part 1: Clean EverythingHomebase (Sub-repo)**

Run these in **PowerShell** from the **EverythingHomebase folder**:

```powershell
cd "e:\VSCode\HomeBase 2.0\EverythingHomebase"

# Step 1: Stash uncommitted changes (safe to undo later)
git stash

# Step 2: Push your commits to GitHub
git push origin Main

# Step 3: Verify clean state
git status
```

**Expected result:**
```
On branch Main
Your branch is up to date with 'origin/Main'.
nothing to commit, working tree clean
```

---

### **Part 2: Clean HomeBase 2.0 (Main Repo)**

Run these in **PowerShell** from the **HomeBase 2.0 folder**:

```powershell
cd "e:\VSCode\HomeBase 2.0"

# Step 1: Check what's different
git diff --name-only | head -20

# Step 2: If you want to keep changes, commit them
git add .
git commit -m "Update project configuration and files"

# Step 3: If you want to discard changes, use:
# git restore .

# Step 4: Verify clean state
git status
```

---

## After Cleanup: Converting to Proper Submodule

Once both repos are clean, we'll set up the submodule correctly:

```powershell
cd "e:\VSCode\HomeBase 2.0"

# Remove old reference
git rm --cached EverythingHomebase
git commit -m "Remove EverythingHomebase from index"

# Add as proper submodule
git submodule add https://github.com/LiTree89/EverythingHomebase.git EverythingHomebase

# Initialize submodule
git submodule update --init --recursive

# Commit the submodule setup
git add .gitmodules EverythingHomebase
git commit -m "Add EverythingHomebase as Git submodule"

# Verify
git submodule status
```

---

## Result: Clean Structure

After this cleanup, your Git structure will be:

```
HomeBase 2.0/              (Main repo)
├── .gitmodules           (Submodule config)
├── EverythingHomebase/   (Points to external repo)
│   └── [Website code]
├── infrastructure/
├── functions/
├── packages/
└── [other main files]
```

---

## Day-to-Day Workflow After This

```powershell
# Clone WITH submodules
git clone --recurse-submodules https://github.com/LiTree89/HomeBase2.0.git

# Update everything
git pull && git submodule update --remote

# Push changes from main repo
git add .
git commit -m "Changes to main"
git push

# Push changes from website repo
cd EverythingHomebase
git add .
git commit -m "Website changes"
git push
cd ..

# Commit submodule update in main
git add EverythingHomebase
git commit -m "Update website submodule"
git push
```

---

## Next Steps

1. **Run Part 1** (clean EverythingHomebase)
2. **Run Part 2** (clean HomeBase 2.0)
3. **Let me know when done** → I'll help convert to submodule
4. **Test the final setup** → Verify both repos work together

---

## Questions?

If any step fails:
- Paste the **exact error message**
- Run `git status` and share the output
- Let me know which step failed

Good luck! 🚀
