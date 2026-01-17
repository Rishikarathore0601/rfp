import Proposal from '../models/Proposal.model.js';
import { callOllama } from './ollama.service.js';
import { extractJson } from '../utils/jsonExtractor.js';

/**
 * Compare all proposals for an RFP
 * @param {string} rfpId - RFP ID
 * @returns {Promise<object>} - Comparison data with AI recommendation
 */
export async function compareProposals(rfpId) {
  // Get all proposals for this RFP
  const proposals = await Proposal.find({ rfp: rfpId, status: { $ne: 'REJECTED' } })
    .populate('vendor', 'name company email')
    .populate('rfp', 'title structuredData');
  
  if (proposals.length === 0) {
    throw new Error('No proposals found for this RFP');
  }
  
  // Calculate scores for each proposal
  const scoredProposals = proposals.map(proposal => {
    const scores = calculateProposalScores(proposal, proposals[0].rfp);
    return {
      proposalId: proposal._id,
      vendor: proposal.vendor,
      parsedData: proposal.parsedData,
      scores,
      totalScore: scores.priceScore + scores.deliveryScore + scores.completenessScore
    };
  });
  
  // Sort by total score (descending)
  scoredProposals.sort((a, b) => b.totalScore - a.totalScore);
  
  // Generate AI recommendation
  const aiRecommendation = await generateAIRecommendation(scoredProposals, proposals[0].rfp);
  
  return {
    rfp: proposals[0].rfp,
    proposalCount: proposals.length,
    proposals: scoredProposals,
    recommendation: aiRecommendation
  };
}

/**
 * Calculate scores for a proposal
 */
function calculateProposalScores(proposal, rfp) {
  const scores = {
    priceScore: 0,
    deliveryScore: 0,
    completenessScore: 0
  };
  
  // Price score (0-40 points) - lower is better
  if (proposal.parsedData?.totalPrice && rfp.structuredData?.budget) {
    const priceRatio = proposal.parsedData.totalPrice / rfp.structuredData.budget;
    if (priceRatio <= 0.8) scores.priceScore = 40; // 20% under budget
    else if (priceRatio <= 0.9) scores.priceScore = 35;
    else if (priceRatio <= 1.0) scores.priceScore = 30;
    else if (priceRatio <= 1.1) scores.priceScore = 20;
    else scores.priceScore = 10;
  }
  
  // Delivery score (0-30 points) - faster is better
  if (proposal.parsedData?.deliveryDays && rfp.structuredData?.delivery_days) {
    const deliveryRatio = proposal.parsedData.deliveryDays / rfp.structuredData.delivery_days;
    if (deliveryRatio <= 0.7) scores.deliveryScore = 30; // 30% faster
    else if (deliveryRatio <= 0.9) scores.deliveryScore = 25;
    else if (deliveryRatio <= 1.0) scores.deliveryScore = 20;
    else if (deliveryRatio <= 1.2) scores.deliveryScore = 10;
    else scores.deliveryScore = 5;
  }
  
  // Completeness score (0-30 points)
  let completeness = 0;
  if (proposal.parsedData?.totalPrice) completeness += 10;
  if (proposal.parsedData?.deliveryDays) completeness += 5;
  if (proposal.parsedData?.paymentTerms) completeness += 5;
  if (proposal.parsedData?.warranty) completeness += 5;
  if (proposal.parsedData?.itemPrices?.length > 0) completeness += 5;
  scores.completenessScore = completeness;
  
  return scores;
}

/**
 * Generate AI-powered recommendation
 */
async function generateAIRecommendation(scoredProposals, rfp) {
  const prompt = `Analyze these vendor proposals and provide a JSON recommendation.
Items: ${JSON.stringify(rfp.structuredData.items)}

PROPOSALS:
${scoredProposals.map((p, i) => `Vendor ${i + 1} (${p.vendor.company}): Price ${p.parsedData?.totalPrice}, Delivery ${p.parsedData?.deliveryDays}d, Score ${p.totalScore}`).join('\n')}

Format:
{
  "recommendedVendor": "company",
  "reasoning": "2 sentences why",
  "pros": ["list"],
  "cons": ["list"],
  "alternativeOption": "second best"
}`;

  try {
    const raw = await callOllama(prompt);
    const recommendation = extractJson(raw);
    return recommendation;
  } catch (error) {
    console.error('❌ AI recommendation failed:', error.message);
    // Fallback to simple recommendation
    return {
      recommendedVendor: scoredProposals[0].vendor.company,
      reasoning: `${scoredProposals[0].vendor.company} has the highest overall score based on price, delivery time, and completeness of proposal.`,
      pros: ['Highest score', 'Complete proposal'],
      cons: ['AI analysis unavailable'],
      alternativeOption: scoredProposals.length > 1 ? scoredProposals[1].vendor.company : null
    };
  }
}
