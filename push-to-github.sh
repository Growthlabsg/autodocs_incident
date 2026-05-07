#!/bin/bash

echo "🚀 PUSHING ALL 3 TIERS TO GITHUB!"
echo ""
echo "Please enter your GitHub Personal Access Token:"
read -s GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ No token provided!"
    exit 1
fi

echo ""
echo "📦 Configuring remote..."
git remote set-url origin https://${GITHUB_TOKEN}@github.com/Growthlabsg/autodocs_incident.git

echo "🚀 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! All 3 tiers pushed to GitHub!"
    echo ""
    echo "🔗 View at: https://github.com/Growthlabsg/autodocs_incident"
    echo ""
    echo "📊 What was pushed:"
    echo "   ✅ Tier 1: $58,000"
    echo "   ✅ Tier 2: $150,000"
    echo "   ✅ Tier 3: $120,000"
    echo "   ─────────────────"
    echo "   🎉 Total: $328,000"
else
    echo "❌ Push failed! Check your token and try again."
fi
