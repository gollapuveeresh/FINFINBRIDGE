package com.finbridge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbridge.entity.*;
import com.finbridge.exception.BadRequestException;
import com.finbridge.exception.ResourceNotFoundException;
import com.finbridge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CaseRecommendationService {

    private final CaseRecommendationRepository caseRecommendationRepository;
    private final LoanCaseRepository loanCaseRepository;
    private final DeptCaseRepository deptCaseRepository;
    private final UserRepository userRepository;
    private final FinancialProfileRepository financialProfileRepository;
    private final LeadRepository leadRepository;
    private final ApiConfigurationRepository apiConfigurationRepository;
    private final OrganizationUserRepository organizationUserRepository;

    @Transactional(readOnly = true)
    public CaseRecommendation getByCaseId(UUID caseId) {
        return caseRecommendationRepository.findByCaseId(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found for case: " + caseId));
    }

    @Transactional(readOnly = true)
    public List<CaseRecommendation> getByClient(UUID clientId) {
        return caseRecommendationRepository.findByClientId(clientId);
    }

    @Transactional(readOnly = true)
    public List<CaseRecommendation> getByOrganization(UUID orgId) {
        return caseRecommendationRepository.findByOrganizationId(orgId);
    }

    @Transactional(readOnly = true)
    public List<CaseRecommendation> getAll() {
        return caseRecommendationRepository.findByOrderByGeneratedAtDesc();
    }

    @Transactional
    public List<Map<String, Object>> generateForCase(UUID caseId, User consultant) {
        // Find Case (either LoanCase or DeptCase)
        LoanCase lc = loanCaseRepository.findById(caseId).orElse(null);
        DeptCase dc = null;
        if (lc == null) {
            dc = deptCaseRepository.findById(caseId).orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));
        }

        String department;
        UUID clientId = null;
        UUID leadId = null;

        // Check stage progression
        if (lc != null) {
            department = "loans";
            clientId = lc.getClient() != null ? lc.getClient().getId() : null;
            leadId = lc.getLead() != null ? lc.getLead().getId() : null;
            if ("document_collection".equalsIgnoreCase(lc.getStage()) || "eligibility_analysis".equalsIgnoreCase(lc.getStage())) {
                throw new BadRequestException("Eligibility Analysis must be completed first.");
            }
        } else {
            department = dc.getDepartment().toLowerCase();
            clientId = dc.getClient() != null ? dc.getClient().getId() : null;
            leadId = dc.getLead() != null ? dc.getLead().getId() : null;
            String stage = dc.getStage().toLowerCase();

            if ("tax".equals(department)) {
                if ("document_collection".equals(stage) || "tax_analysis".equals(stage)) {
                    throw new BadRequestException("Tax Analysis must be completed first.");
                }
            } else if ("investments".equals(department) || "investment".equals(department)) {
                if ("financial_assessment".equals(stage) || "risk_analysis".equals(stage)) {
                    throw new BadRequestException("Risk Analysis must be completed first.");
                }
            } else if ("insurance".equals(department)) {
                if ("need_assessment".equals(stage) || "risk_evaluation".equals(stage)) {
                    throw new BadRequestException("Risk Evaluation must be completed first.");
                }
            } else if ("wealth".equals(department)) {
                if ("financial_assessment".equals(stage) || "goal_analysis".equals(stage)) {
                    throw new BadRequestException("Goal Analysis must be completed first.");
                }
            }
        }

        // Get Recommendations from APIs
        List<ApiConfiguration> configs = apiConfigurationRepository.findByDepartmentAndActiveTrue(department);
        String sourceName = "System Fallback";
        boolean isLive = false;
        List<Map<String, Object>> recommendationsList = new ArrayList<>();

        if (!configs.isEmpty()) {
            ApiConfiguration activeConfig = configs.get(0);
            sourceName = activeConfig.getName() + " (Live API)";
            isLive = true;

            try {
                boolean isGemini = (activeConfig.getApiKey() != null && (activeConfig.getApiKey().startsWith("AIzaSy") || activeConfig.getApiKey().startsWith("AQ.")))
                        || (activeConfig.getApiUrl() != null && activeConfig.getApiUrl().contains("googleapis.com"))
                        || activeConfig.getName().toLowerCase().contains("gemini");

                if (isGemini) {
                    RestTemplate restTemplate = new RestTemplate();
                    String url = activeConfig.getApiUrl();
                    if (url == null || url.isBlank() || !url.contains("googleapis.com")) {
                        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
                    } else {
                        url = url.replace("gemini-1.5-flash", "gemini-2.5-flash")
                                 .replace("gemini-1.5-pro", "gemini-2.5-pro");
                    }

                    StringBuilder prompt = new StringBuilder();
                    prompt.append("You are an expert financial recommendation engine for a premium wealth and advising platform called FinBridge.\n");
                    prompt.append("Given the following client or lead context, generate exactly 3 highly relevant, premium, personalized financial product recommendations ");
                    prompt.append("specifically tailored for their profile in the '").append(department).append("' category.\n\n");
                    prompt.append("Target Context:\n");

                    if (clientId != null) {
                        Optional<User> clientOpt = userRepository.findById(clientId);
                        if (clientOpt.isPresent()) {
                            User client = clientOpt.get();
                            prompt.append("- Account Type: Existing Client\n");
                            prompt.append("- Name: ").append(client.getName()).append("\n");
                            prompt.append("- Email: ").append(client.getEmail()).append("\n");

                            Optional<FinancialProfile> profileOpt = financialProfileRepository.findByUserId(clientId);
                            if (profileOpt.isPresent()) {
                                FinancialProfile profile = profileOpt.get();
                                prompt.append("- Annual Income: INR ").append(profile.getAnnualIncome()).append("\n");
                                prompt.append("- Monthly Income: INR ").append(profile.getMonthlyIncome()).append("\n");
                                prompt.append("- Monthly Expenses: INR ").append(profile.getMonthlyExpenses()).append("\n");
                                prompt.append("- Credit Score: ").append(profile.getCreditScore()).append("\n");
                                prompt.append("- Risk Tolerance: ").append(profile.getRiskTolerance()).append("\n");
                                if (profile.getInvestmentGoals() != null && profile.getInvestmentGoals().length > 0) {
                                    prompt.append("- Investment Goals: ").append(String.join(", ", profile.getInvestmentGoals())).append("\n");
                                }
                                prompt.append("- Current Investments: INR ").append(profile.getCurrentInvestments()).append("\n");
                            }
                        }
                    } else if (leadId != null) {
                        Optional<Lead> leadOpt = leadRepository.findById(leadId);
                        if (leadOpt.isPresent()) {
                            Lead lead = leadOpt.get();
                            prompt.append("- Account Type: Lead (Prospect)\n");
                            prompt.append("- Name: ").append(lead.getName()).append("\n");
                            prompt.append("- Email: ").append(lead.getEmail()).append("\n");
                            if (lead.getIncome() != null) {
                                prompt.append("- Income: INR ").append(lead.getIncome()).append("\n");
                            }
                            if (lead.getBudget() != null) {
                                prompt.append("- Budget/Requested Amount: INR ").append(lead.getBudget()).append("\n");
                            }
                            if (lead.getRequirement() != null) {
                                prompt.append("- Requirement: ").append(lead.getRequirement()).append("\n");
                            }
                        }
                    }

                    // Append Case Specific details if any
                    if (lc != null) {
                        prompt.append("- Requested Loan Type: ").append(lc.getLoanType()).append("\n");
                        prompt.append("- Requested Loan Amount: INR ").append(lc.getRequestedAmount()).append("\n");
                        if (lc.getCreditScore() != null) {
                            prompt.append("- Eligibility Credit Score: ").append(lc.getCreditScore()).append("\n");
                        }
                        if (lc.getDti() != null) {
                            prompt.append("- Debt-To-Income (DTI) Ratio: ").append(lc.getDti()).append("%\n");
                        }
                    } else if (dc != null && dc.getData() != null) {
                        prompt.append("- Case Data: ").append(dc.getData().toString()).append("\n");
                    }

                    prompt.append("\nRequirements:\n");
                    prompt.append("1. Generate exactly 3 recommendations.\n");
                    prompt.append("2. The response must be a single, valid JSON object matching this schema:\n");
                    prompt.append("{\n");
                    prompt.append("  \"recommendations\": [\n");
                    prompt.append("    {\n");
                    prompt.append("      \"id\": \"unique_string\",\n");
                    prompt.append("      \"title\": \"Product/Bank Name (e.g. SBI MaxGain Home Loan, Mirae Asset ELSS Fund)\",\n");
                    prompt.append("      \"metricName\": \"Key metric label (e.g. Interest Rate, Expected Returns, Sum Assured)\",\n");
                    prompt.append("      \"metricValue\": \"Key metric value (e.g. 8.75% p.a., 22.4% CAGR, INR 1 Crore)\",\n");
                    prompt.append("      \"detail1\": \"Secondary parameter (e.g. Max Tenure: 30 years, Lock-in: 3 years)\",\n");
                    prompt.append("      \"detail2\": \"Tertiary parameter (e.g. Processing Fee: 0.5%, Expense Ratio: 0.65%)\",\n");
                    prompt.append("      \"description\": \"A personalized explanation of why this product fits this client/lead's profile.\",\n");
                    prompt.append("      \"provider\": \"The source provider name (e.g. PaisaBazaar, LIC, Moneycontrol)\"\n");
                    prompt.append("    }\n");
                    prompt.append("  ]\n");
                    prompt.append("}\n");
                    prompt.append("3. Return ONLY valid raw JSON conforming to this structure. Do not wrap in markdown code blocks.");

                    Map<String, Object> part = Map.of("text", prompt.toString());
                    Map<String, Object> content = Map.of("parts", List.of(part));
                    Map<String, Object> requestBody = Map.of(
                        "contents", List.of(content),
                        "generationConfig", Map.of("responseMimeType", "application/json")
                    );

                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

                    String finalUrl = url;
                    if (finalUrl.contains("?")) {
                        finalUrl += "&key=" + activeConfig.getApiKey();
                    } else {
                        finalUrl += "?key=" + activeConfig.getApiKey();
                    }

                    ResponseEntity<String> responseEntity = restTemplate.postForEntity(finalUrl, entity, String.class);
                    String responseBody = responseEntity.getBody();

                    ObjectMapper objectMapper = new ObjectMapper();
                    JsonNode rootNode = objectMapper.readTree(responseBody);
                    JsonNode candidates = rootNode.path("candidates");
                    if (candidates.isArray() && candidates.size() > 0) {
                        JsonNode firstCandidate = candidates.get(0);
                        JsonNode parts = firstCandidate.path("content").path("parts");
                        if (parts.isArray() && parts.size() > 0) {
                            String jsonText = parts.get(0).path("text").asText();
                            if (jsonText.contains("```json")) {
                                jsonText = jsonText.substring(jsonText.indexOf("```json") + 7);
                                if (jsonText.contains("```")) {
                                    jsonText = jsonText.substring(0, jsonText.indexOf("```"));
                                }
                            } else if (jsonText.contains("```")) {
                                jsonText = jsonText.substring(jsonText.indexOf("```") + 3);
                                if (jsonText.contains("```")) {
                                    jsonText = jsonText.substring(0, jsonText.indexOf("```"));
                                }
                            }
                            jsonText = jsonText.trim();
                            
                            JsonNode recommendationsNode = objectMapper.readTree(jsonText).path("recommendations");
                            if (recommendationsNode.isArray()) {
                                for (JsonNode node : recommendationsNode) {
                                    Map<String, Object> rec = new HashMap<>();
                                    rec.put("id", node.path("id").asText(UUID.randomUUID().toString()));
                                    rec.put("title", node.path("title").asText("Recommendation"));
                                    rec.put("metricName", node.path("metricName").asText("Value"));
                                    rec.put("metricValue", node.path("metricValue").asText("N/A"));
                                    rec.put("detail1", node.path("detail1").asText(""));
                                    rec.put("detail2", node.path("detail2").asText(""));
                                    rec.put("description", node.path("description").asText(""));
                                    rec.put("provider", node.path("provider").asText(activeConfig.getName()));
                                    recommendationsList.add(rec);
                                }
                            }
                        }
                    }
                } else {
                    RestTemplate restTemplate = new RestTemplate();
                    String url = activeConfig.getApiUrl();
                    if (url.contains("?")) {
                        url += "&apiKey=" + activeConfig.getApiKey();
                    } else {
                        url += "?apiKey=" + activeConfig.getApiKey();
                    }
                    if (clientId != null) url += "&clientId=" + clientId;
                    if (leadId != null) url += "&leadId=" + leadId;

                    Map<?, ?> response = restTemplate.getForObject(url, Map.class);
                    if (response != null) {
                        if (response.containsKey("recommendations")) {
                            Object recsObj = response.get("recommendations");
                            if (recsObj instanceof List) {
                                for (Object item : (List<?>) recsObj) {
                                    if (item instanceof Map) recommendationsList.add((Map<String, Object>) item);
                                }
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Failed fetching configuration recommendations: ", e);
                isLive = false;
            }
        }

        if (recommendationsList.isEmpty()) {
            recommendationsList = getStaticRecommendations(department);
        }

        return recommendationsList;
    }

    @Transactional
    public CaseRecommendation saveRecommendation(UUID caseId, Map<String, Object> body, User consultant) {
        LoanCase lc = loanCaseRepository.findById(caseId).orElse(null);
        DeptCase dc = null;
        if (lc == null) {
            dc = deptCaseRepository.findById(caseId).orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));
        }

        String department = lc != null ? "loans" : dc.getDepartment().toLowerCase();
        User client = lc != null ? lc.getClient() : dc.getClient();
        User cUser = lc != null ? lc.getConsultant() : dc.getConsultant();

        // Retrieve Organization
        Organization organization = null;
        if (client != null) {
            Optional<OrganizationUser> ou = organizationUserRepository.findByEmailIgnoreCase(client.getEmail());
            if (ou.isPresent()) {
                organization = ou.get().getOrganization();
            }
        }

        CaseRecommendation rec = caseRecommendationRepository.findByCaseId(caseId).orElse(new CaseRecommendation());
        rec.setCaseId(caseId);
        rec.setDepartment(department);
        rec.setClient(client);
        rec.setConsultant(cUser);
        rec.setOrganization(organization);
        
        ObjectMapper mapper = new ObjectMapper();
        try {
            rec.setRecommendationData(mapper.writeValueAsString(body.get("recommendations")));
        } catch (Exception e) {
            throw new BadRequestException("Invalid recommendations format");
        }

        rec.setRecommendationNotes((String) body.get("notes"));
        rec.setStatus("pending");

        // Sync back to specific case object for workflow compatibility
        if (lc != null) {
            lc.setRecommendationNote(rec.getRecommendationNotes());
            // Map first item details to LoanCase legacy fields if available
            List<?> list = (List<?>) body.get("recommendations");
            if (list != null && !list.isEmpty()) {
                Map<?, ?> first = (Map<?, ?>) list.get(0);
                lc.setRecommendedBank((String) first.get("title"));
                try {
                    String rateStr = ((String) first.get("metricValue")).replaceAll("[^0-9.]", "");
                    lc.setRecommendedRate(new BigDecimal(rateStr));
                } catch (Exception ex) {
                    lc.setRecommendedRate(BigDecimal.valueOf(8.5));
                }
                try {
                    String tenureStr = ((String) first.get("detail1")).replaceAll("[^0-9]", "");
                    lc.setRecommendedTenure(Integer.parseInt(tenureStr));
                } catch (Exception ex) {
                    lc.setRecommendedTenure(240);
                }
            }
            loanCaseRepository.save(lc);
        } else {
            Map<String, Object> data = new HashMap<>(dc.getData() != null ? dc.getData() : new HashMap<>());
            data.put("recommendations", body.get("recommendations"));
            data.put("recommendation_notes", rec.getRecommendationNotes());
            dc.setData(data);
            deptCaseRepository.save(dc);
        }

        return caseRecommendationRepository.save(rec);
    }

    @Transactional
    public CaseRecommendation sendToClient(UUID caseId, Map<String, Object> body, User consultant) {
        CaseRecommendation rec = saveRecommendation(caseId, body, consultant);
        
        LoanCase lc = loanCaseRepository.findById(caseId).orElse(null);
        DeptCase dc = null;
        if (lc == null) {
            dc = deptCaseRepository.findById(caseId).orElse(null);
        }

        if (lc != null) {
            lc.setSentToClient(true);
            lc.setStage("client_approval");
            loanCaseRepository.save(lc);
        } else if (dc != null) {
            dc.setStage("client_approval");
            Map<String, Object> data = new HashMap<>(dc.getData() != null ? dc.getData() : new HashMap<>());
            data.put("recommendations", body.get("recommendations"));
            data.put("recommendation_notes", rec.getRecommendationNotes());
            // This triggers the proposal creation inside DeptCaseService when stage transitions to client_approval
            dc.setData(data);
            deptCaseRepository.save(dc);
        }

        return rec;
    }

    @Transactional
    public CaseRecommendation recordDecision(UUID recId, String status, String feedback) {
        CaseRecommendation rec = caseRecommendationRepository.findById(recId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found: " + recId));
        
        String cleanStatus = "Approved".equalsIgnoreCase(status) ? "approved" : "changes_requested";
        rec.setStatus(cleanStatus);
        caseRecommendationRepository.save(rec);

        // Propagate down to cases
        LoanCase lc = loanCaseRepository.findById(rec.getCaseId()).orElse(null);
        DeptCase dc = null;
        if (lc == null) {
            dc = deptCaseRepository.findById(rec.getCaseId()).orElse(null);
        }

        if (lc != null) {
            lc.setClientDecision("approved".equals(cleanStatus) ? "Approved" : "Changes Requested");
            lc.setClientFeedback(feedback != null ? feedback : "");
            lc.setDecidedAt(Instant.now());
            loanCaseRepository.save(lc);
        } else if (dc != null) {
            Map<String, Object> data = new HashMap<>(dc.getData() != null ? dc.getData() : new HashMap<>());
            Map<String, Object> decision = new HashMap<>();
            decision.put("status", "approved".equals(cleanStatus) ? "Approved" : "Changes Requested");
            decision.put("feedback", feedback != null ? feedback : "");
            decision.put("decidedAt", Instant.now().toString());
            data.put("clientDecision", decision);
            dc.setData(data);
            deptCaseRepository.save(dc);
        }

        return rec;
    }

    private List<Map<String, Object>> getStaticRecommendations(String department) {
        List<Map<String, Object>> recs = new ArrayList<>();
        switch (department.toLowerCase()) {
            case "loans":
                recs.add(createRecommendation("L1", "HDFC Bank Personal Loan", "Interest Rate", "10.5% p.a.", "Max Tenure: 60 months", "Processing Fee: 1%", "Top pick for prime customers with credit score > 750. Zero pre-closure charges after 12 EMIs.", "PaisaBazaar"));
                recs.add(createRecommendation("L2", "SBI Express Credit Loan", "Interest Rate", "11.0% p.a.", "Max Tenure: 72 months", "Processing Fee: 0.5%", "Low processing fee, ideal for government and corporate employees.", "PaisaBazaar"));
                recs.add(createRecommendation("L3", "ICICI Instant Personal Loan", "Interest Rate", "10.75% p.a.", "Max Tenure: 60 months", "Processing Fee: ₹999 Flat", "Pre-approved instant disbursal for existing account holders. Minimal documentation.", "PaisaBazaar"));
                break;
            case "tax":
                recs.add(createRecommendation("T1", "Mirae Asset Tax Saver Fund (ELSS)", "3Y Returns", "21.4% p.a.", "Expense Ratio: 0.60%", "Min SIP: ₹500", "Offers high growth potential with a lock-in of only 3 years. Qualifies under Sec 80C.", "Mutual Funds"));
                recs.add(createRecommendation("T2", "Quant Active Fund", "3Y Returns", "28.1% p.a.", "Expense Ratio: 0.75%", "Min SIP: ₹1,000", "Aggressive multi-cap strategy with excellent performance record. High volatility.", "Mutual Funds"));
                recs.add(createRecommendation("T3", "Canara Robeco Equity Tax Saver", "3Y Returns", "18.9% p.a.", "Expense Ratio: 0.55%", "Min SIP: ₹500", "Consistent performance with lower downside volatility in the ELSS segment.", "Mutual Funds"));
                break;
            case "investments":
            case "investment":
                recs.add(createRecommendation("I1", "Reliance Industries Ltd (Equity)", "Recommendation", "BUY (Target ₹2,800)", "Current Price: ₹2,450", "Sector: Energy & Telecom", "Strong energy margins and retail growth. Preferred long-term large-cap pick.", "Moneycontrol"));
                recs.add(createRecommendation("I2", "Nippon India Small Cap Fund", "1Y Returns", "34.2%", "Category: Equity Small Cap", "Expense Ratio: 0.72%", "Exceptional performance in the small-cap segment. Suitable for high risk appetite via SIP.", "Moneycontrol"));
                recs.add(createRecommendation("I3", "HDFC Balanced Advantage Fund", "3Y Returns", "16.8% p.a.", "Category: Dynamic Asset Allocation", "Min Lumpsum: ₹5,000", "Automated asset allocation between debt and equity. Ideal for conservative equity investors.", "Moneycontrol"));
                break;
            case "insurance":
                recs.add(createRecommendation("IN1", "LIC Tech Term Plan (U854)", "Sum Assured", "₹1 Crore", "Term: 30 Years", "Annual Premium: ₹9,500", "Convenient online term insurance plan for family security with flexible payout options.", "LIC"));
                recs.add(createRecommendation("IN2", "LIC Cancer Cover (U905)", "Sum Assured", "₹20 Lakhs", "Term: 20 Years", "Annual Premium: ₹3,200", "Specialized health policy providing financial protection in case of cancer diagnosis.", "LIC"));
                recs.add(createRecommendation("IN3", "LIC Jeevan Amar (U855)", "Sum Assured", "₹50 Lakhs", "Term: 25 Years", "Annual Premium: ₹6,800", "Offline term assurance plan with special premium rates for non-smokers and female lives.", "LIC"));
                break;
            case "wealth":
                recs.add(createRecommendation("W1", "HDFC Life Click 2 Wealth", "Expected Returns", "12-15% p.a. (linked)", "Lock-in: 5 Years", "Charges: 100% Premium Allocation", "Unit Linked Insurance Plan (ULIP) with multiple fund options and return of mortality charges.", "HDFC Life"));
                recs.add(createRecommendation("W2", "HDFC Life Sanchay Plus", "Guaranteed Yield", "Up to 6.25% Tax-Free", "Premium Term: 10 Years", "Guaranteed Return: ₹1.2L / yr", "Non-linked, non-participating savings plan offering guaranteed payouts for financial security.", "HDFC Life"));
                recs.add(createRecommendation("W3", "HDFC Life Systematic Retirement Plan", "Annuity Rate", "6.8% Guaranteed for Life", "Deferment: 10 Years", "Min Purchase: ₹30,000 / yr", "Individual annuity plan allowing you to lock in guaranteed pension rates during earning years.", "HDFC Life"));
                break;
            default:
                recs.add(createRecommendation("D1", "General Recommendation", "Status", "Available", "Type: Fallback", "Cost: Free", "Please configure active department-specific APIs to receive live recommendations.", "FinBridge"));
                break;
        }
        return recs;
    }

    private Map<String, Object> createRecommendation(
            String id, String title, String metricName, String metricValue,
            String detail1, String detail2, String description, String provider) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("title", title);
        map.put("metricName", metricName);
        map.put("metricValue", metricValue);
        map.put("detail1", detail1);
        map.put("detail2", detail2);
        map.put("description", description);
        map.put("provider", provider);
        return map;
    }
}
