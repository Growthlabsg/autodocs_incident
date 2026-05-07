#!/bin/bash

echo "🚀 Pushing AutoDocs + AutoIncident to GitHub..."
echo ""
echo "📍 Repository: https://github.com/Growthlabsg/autodocs_incident"
echo ""
echo "⚠️  You'll need to authenticate with GitHub"
echo "   Use your Personal Access Token (PAT) as password"
echo ""
read -p "Press Enter to continue..."

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🎉 View your code at: https://github.com/Growthlabsg/autodocs_incident"
else
    echo ""
    echo "❌ Push failed. Make sure you:"
    echo "   1. Have internet connection"
    echo "   2. Have access to the repository"
    echo "   3. Used correct credentials (PAT as password)"
fi
