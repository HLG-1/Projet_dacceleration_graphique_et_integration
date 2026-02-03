#!/bin/bash

# Script de test pour Book Analyzer
# Usage: ./test.sh [book_title]

echo "======================================"
echo "📚 Book Analyzer - Test Script"
echo "======================================"
echo ""

# Configuration
MCP_URL="http://localhost:3000"
BOOK_TITLE="${1:-Atomic Habits}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "Test 1: Health Check"
echo "-------------------------------------"
HEALTH=$(curl -s "$MCP_URL/health")
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "$HEALTH"
    exit 1
fi
echo ""

# Test 2: List Tools
echo "Test 2: List Available Tools"
echo "-------------------------------------"
TOOLS=$(curl -s "$MCP_URL/tools")
TOOL_COUNT=$(echo "$TOOLS" | grep -o '"name"' | wc -l)
if [ "$TOOL_COUNT" -eq 4 ]; then
    echo -e "${GREEN}✓ All 4 tools available${NC}"
    echo "$TOOLS" | grep -o '"name":"[^"]*"' | sed 's/"name":"/  - /' | sed 's/"$//'
else
    echo -e "${RED}✗ Expected 4 tools, found $TOOL_COUNT${NC}"
fi
echo ""

# Test 3: Analyze Book
echo "Test 3: Analyze Book - \"$BOOK_TITLE\""
echo "-------------------------------------"
echo -e "${YELLOW}This may take 15-30 seconds...${NC}"
echo ""

START_TIME=$(date +%s)

RESULT=$(curl -s -X POST "$MCP_URL/analyze" \
    -H "Content-Type: application/json" \
    -d "{\"bookTitle\": \"$BOOK_TITLE\"}")

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Check if successful
if echo "$RESULT" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Analysis completed in ${DURATION}s${NC}"
    echo ""
    
    # Extract and display info
    TITLE=$(echo "$RESULT" | grep -o '"title":"[^"]*"' | head -1 | sed 's/"title":"//' | sed 's/"$//')
    AUTHORS=$(echo "$RESULT" | grep -o '"authors":\[[^]]*\]' | head -1)
    KEY_IDEAS_COUNT=$(echo "$RESULT" | grep -o '"keyIdeas":\[[^]]*\]' | grep -o '","' | wc -l)
    KEY_IDEAS_COUNT=$((KEY_IDEAS_COUNT + 1))
    AUDIO_FILE=$(echo "$RESULT" | grep -o '"filename":"[^"]*"' | sed 's/"filename":"//' | sed 's/"$//')
    
    echo "📖 Book: $TITLE"
    echo "👤 Authors: $AUTHORS"
    echo "💡 Key Ideas: $KEY_IDEAS_COUNT"
    echo "🔊 Audio: $AUDIO_FILE"
    
    # Validate 7 key ideas
    if [ "$KEY_IDEAS_COUNT" -eq 7 ]; then
        echo -e "${GREEN}✓ Exactly 7 key ideas extracted${NC}"
    else
        echo -e "${YELLOW}⚠ Expected 7 key ideas, got $KEY_IDEAS_COUNT${NC}"
    fi
    
    # Check if audio exists
    if [ -n "$AUDIO_FILE" ] && [ "$AUDIO_FILE" != "null" ]; then
        echo -e "${GREEN}✓ Audio file generated${NC}"
        
        # Try to download audio
        echo ""
        echo "Downloading audio..."
        curl -s -o "/tmp/$AUDIO_FILE" "$MCP_URL/audio/$AUDIO_FILE"
        
        if [ -f "/tmp/$AUDIO_FILE" ]; then
            SIZE=$(ls -lh "/tmp/$AUDIO_FILE" | awk '{print $5}')
            echo -e "${GREEN}✓ Audio downloaded: $SIZE${NC}"
            echo "   Location: /tmp/$AUDIO_FILE"
        fi
    fi
    
else
    echo -e "${RED}✗ Analysis failed${NC}"
    echo "$RESULT" | grep -o '"error":"[^"]*"'
fi

echo ""
echo "======================================"
echo "Test completed in ${DURATION}s"
echo "======================================"