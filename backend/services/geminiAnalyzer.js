const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a legal document analyzer specialized in identifying risky clauses in terms of service, privacy policies, and legal contracts.

Your task is to analyze the provided document and identify RED FLAGS across 5 critical categories:

1. **Data Sovereignty**: Does the company claim ownership of user content forever? Can they use your data without limits?
2. **Hidden Billing**: Automatic renewals, zombie subscriptions, hidden fees, price change clauses?
3. **Jurisdiction**: Unfavorable legal jurisdiction? Must users sue in a different country/state?
4. **Liability Shift**: Does the company take zero responsibility for their mistakes, errors, or data breaches?
5. **Unilateral Changes**: Can they change terms without notice? Can they terminate without cause?

For each risky clause you identify:
- Quote the EXACT text (keep it concise, max 200 characters)
- Classify into category: Privacy, Financial, Rights, Termination, Jurisdiction, Liability, or Other
- Assign risk level: LOW, MEDIUM, HIGH, or CRITICAL
- Explain the risk in plain language (2-3 sentences)
- Suggest a fairer alternative (optional, 1 sentence)
- Provide location reference (section name or paragraph number if available)

Also provide:
- Overall risk score (0-100, where 100 is extremely risky)
- Executive summary (3-4 sentences about the document's fairness)
- Boolean flags for which of the 5 red flags are present

Return your analysis in this EXACT JSON format:
{
  "overallScore": <number between 0-100 based on your risk assessment>,
  "summary": "Brief executive summary here...",
  "risks": [
    {
      "clauseText": "Exact clause text...",
      "category": "Privacy",
      "riskLevel": "HIGH",
      "explanation": "Plain language explanation...",
      "suggestedFix": "Fairer alternative...",
      "location": "Section 4.2"
    }
  ],
  "redFlags": {
    "dataSovereignty": true,
    "hiddenBilling": false,
    "jurisdiction": true,
    "liabilityShift": true,
    "unilateralChanges": false
  }
}

IMPORTANT: Calculate overallScore dynamically based on:
- Number and severity of risks found
- CRITICAL risks add 20-30 points each
- HIGH risks add 10-15 points each
- MEDIUM risks add 5-10 points each
- LOW risks add 2-5 points each
- A fair document with minimal risks should score 10-25
- A moderately risky document should score 30-60
- A highly risky document should score 60-85
- An extremely predatory document should score 85-100

Be thorough but concise. Focus on clauses that truly disadvantage users.`;

async function analyzeDocument(documentText, title = 'Untitled Document') {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // Truncate text if too long (keep under 50k words ≈ 300k characters)
    const maxLength = parseInt(process.env.MAX_TEXT_LENGTH) || 500000;
    const truncatedText = documentText.length > maxLength 
      ? documentText.substring(0, maxLength) + '\n\n[Document truncated due to length...]'
      : documentText;

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Prepare the prompt
    const prompt = `${SYSTEM_PROMPT}

Document Title: ${title}

Document Text:
${truncatedText}

Analyze this document and return ONLY valid JSON with no additional text or markdown formatting.`;

    console.log(`📄 Analyzing document: ${title} (${truncatedText.length} characters)`);

    // Generate analysis
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let analysisText = response.text();

    console.log('✅ Gemini API response received');

    // Clean up response (remove markdown code blocks if present)
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Response text:', analysisText.substring(0, 500));
      
      // Fallback: try to extract JSON from text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse Gemini API response as JSON');
      }
    }

    // Validate response structure
    if (!analysis.overallScore || !analysis.summary || !analysis.risks || !analysis.redFlags) {
      throw new Error('Invalid analysis structure from Gemini API');
    }

    console.log(`📊 Analysis complete: ${analysis.risks.length} risks identified`);

    return analysis;
  } catch (error) {
    console.error('Gemini analysis error:', error);
    
    // Return a safe error response
    return {
      error: true,
      message: error.message || 'Analysis failed',
      overallScore: 0,
      summary: 'Unable to complete analysis due to an error. Please try again.',
      risks: [],
      redFlags: {
        dataSovereignty: false,
        hiddenBilling: false,
        jurisdiction: false,
        liabilityShift: false,
        unilateralChanges: false,
      },
    };
  }
}

// Retry logic wrapper
async function analyzeDocumentWithRetry(documentText, title, maxRetries = 2) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await analyzeDocument(documentText, title);
      
      // If there's an error flag, throw to trigger retry
      if (result.error && attempt < maxRetries + 1) {
        throw new Error(result.message);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Analysis attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries + 1) {
        // Wait before retrying (exponential backoff)
        const waitTime = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // All retries failed, return error analysis
  return {
    error: true,
    message: lastError?.message || 'Analysis failed after multiple attempts',
    overallScore: 0,
    summary: 'Unable to complete analysis. Please try again later.',
    risks: [],
    redFlags: {
      dataSovereignty: false,
      hiddenBilling: false,
      jurisdiction: false,
      liabilityShift: false,
      unilateralChanges: false,
    },
  };
}

module.exports = {
  analyzeDocument: analyzeDocumentWithRetry,
};
