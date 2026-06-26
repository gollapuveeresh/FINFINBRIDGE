# FinBridge — Line-by-Line Code Explanation

> The 8 most critical files explained. Every line. Every WHY.

---

## FILE 1: `api.js` — The HTTP Client

📁 [frontend/src/services/api.js](file:///c:/Users/veere/Downloads/FinBridge_Final20/frontend/src/services/api.js)

```javascript
import axios from 'axios';
// Axios is the HTTP library. All API calls go through this single instance.
// WHY Axios over fetch? — interceptors, automatic JSON parsing, request cancellation.
```

```javascript
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {      // Check for env variable first (production override)
    return import.meta.env.VITE_API_URL;    // e.g., "https://api.finbridge.com/api"
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  // ↑ Gets current browser hostname (localhost, 192.168.x.x, or domain name)
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  // ↑ Gets http: or https:
  return `${protocol}//${hostname}:5000/api`;
  // ↑ Result: "http://localhost:5000/api" — Spring Boot runs on port 5000
};
// WHY dynamic? — Works on localhost, LAN IP (192.168.x.x for mobile testing), and production.
// If hardcoded "localhost:5000" — mobile devices on same WiFi couldn't access the API.
```

```javascript
const PUBLIC_ENDPOINTS = [
  '/auth/login',           // Login doesn't need a token (you're GETTING a token)
  '/auth/register',        // Registration is open to everyone
  '/auth/forgot-password', // No auth needed to request password reset
  '/auth/reset-password',  // Reset uses purpose token, not JWT
  '/b2b/login',           // B2B login
  '/b2b/register',        // B2B registration
  '/leads/capture',       // Website visitors submit leads without logging in
  '/health',              // Server health check
];
// WHY? — The request interceptor below checks this list.
// If URL is public → DON'T attach JWT header.
// If a stale/expired token was attached to /auth/login → backend would reject with 401,
// and the user couldn't even log in. This list prevents that bug.
```

```javascript
const api = axios.create({
  baseURL: getBaseURL(),                    // All URLs prefixed with "http://localhost:5000/api"
  headers: { 'Content-Type': 'application/json' }  // All requests send JSON
});
// Creates a SINGLE Axios instance. Every api.get(), api.post() in the entire app uses this.
// WHY single instance? — interceptors apply to ALL calls. One place to configure.
```

```javascript
function normalizeData(data) {
  if (Array.isArray(data)) return data.map(normalizeData);
  // ↑ If data is an array → normalize each element recursively

  if (data && typeof data === 'object') {
    // Spring Boot's Page object detection:
    if (Array.isArray(data.content) &&
        ('totalElements' in data || 'pageable' in data || 'number' in data)) {
      return normalizeData(data.content);
      // ↑ Spring returns: { content: [{...}, {...}], totalElements: 50, pageable: {...} }
      // Frontend expects: [{...}, {...}]
      // This UNWRAPS the Page object → returns just the content array
    }
    const out = {};
    for (const key of Object.keys(data)) out[key] = normalizeData(data[key]);
    // ↑ Recursively normalize nested objects

    if (out._id == null && out.id != null) out._id = out.id;
    // ↑ MongoDB uses _id. Spring uses id. This adds _id as alias.
    // Frontend code has 100+ places with `item._id`. This line makes them all work.
    return out;
  }
  return data;  // primitives (string, number, boolean) returned as-is
}
// WHY? — Frontend was originally built for Node.js + MongoDB backend.
// MongoDB returns _id and bare arrays. Spring Boot returns id and Page objects.
// Instead of changing 100+ files → this ONE function bridges the gap.
// IF REMOVED: every paginated list shows empty. Every item._id returns undefined.
```

```javascript
api.interceptors.response.use(
  (response) => {
    if (response && response.data != null) response.data = normalizeData(response.data);
    return response;
    // ↑ EVERY response passes through normalizeData before reaching calling code
  },
  (error) => Promise.reject(error)  // errors pass through unchanged
);
```

```javascript
api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isPublic = PUBLIC_ENDPOINTS.some(ep => url.endsWith(ep));
  // ↑ Check if this URL is a public endpoint

  if (isPublic) return config;
  // ↑ Public endpoints: send request AS-IS (no Authorization header)

  const token = sessionStorage.getItem('finbridge_token') || localStorage.getItem('finbridge_token');
  // ↑ Get token: prefer sessionStorage (tab-specific), fallback to localStorage (cross-tab)

  if (token) config.headers.Authorization = `Bearer ${token}`;
  // ↑ Attach: "Authorization: Bearer eyJhbGciOi..."
  // This header is read by JwtAuthFilter on the backend

  return config;
});
// EVERY request passes through this. Protected endpoints get JWT. Public ones don't.
```

---

## FILE 2: `AuthContext.jsx` — React Authentication State

📁 [frontend/src/context/AuthContext.jsx](file:///c:/Users/veere/Downloads/FinBridge_Final20/frontend/src/context/AuthContext.jsx)

```javascript
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
// Creates a React Context — a way to share data (user, login, logout) with ANY component
// without passing props through every level of the tree.
// null = default value before Provider wraps the tree
```

```javascript
const authErrMsg = (err, fallback) => {
  const errs = err?.response?.data?.errors;       // Spring validation errors (field-level)
  if (errs && typeof errs === 'object') {
    const first = Object.values(errs)[0];          // Get first error message
    if (first) return first;                        // e.g., "Email is required"
  }
  return err?.response?.data?.message || err?.message || fallback;
  // Fallback chain: server message → JS error message → hardcoded fallback
};
// WHY? — Displays the MOST SPECIFIC error to the user.
// Spring sends: { errors: { email: "Email is required" } }
// Without this: user would see generic "Request failed with status code 400"
```

```javascript
const TOKEN_KEY = 'finbridge_token';
const getToken  = () => sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
// ↑ Try tab-specific storage first, then cross-tab storage
const setToken  = (t) => { sessionStorage.setItem(TOKEN_KEY, t); localStorage.setItem(TOKEN_KEY, t); };
// ↑ Store in BOTH: sessionStorage for this tab, localStorage for new tabs
const clearToken = () => { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); };
// ↑ Clear from BOTH on logout

// WHY two storages?
// sessionStorage: dies when tab closes. Each tab is independent.
// localStorage: persists across tabs and browser restarts.
// Together: you stay logged in across tabs, but each tab can switch portals independently.
```

```javascript
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // ↑ Currently logged-in user object: { id, name, email, role, department }
  // null = not logged in. When setUser(newUser) is called → ALL components re-render

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // ↑ Boolean flag. true = we have a valid user. false = not logged in.

  const [loading, setLoading] = useState(true);
  // ↑ true while checking if stored token is still valid.
  // While loading: shows a spinner. Prevents flash of login page on page refresh.

  const [hasFinancialProfile, setHasFinancialProfile] = useState(false);
  // ↑ For clients: have they completed their financial profile?
  // Used by FinancialProfileGuard to redirect clients who haven't set up their profile.
```

```javascript
  const checkProfile = async (currentUser) => {
    const activeUser = currentUser || user;
    if (!activeUser) { setHasFinancialProfile(false); return false; }
    if (activeUser.role !== 'client') { setHasFinancialProfile(true); return true; }
    // ↑ Non-clients (admin, consultant) don't need a financial profile → skip
    try {
      const res = await api.get('/financial-profile');
      const ok = !!(res.data && (res.data.status === 'success' || res.data.id || res.data._id));
      // ↑ Profile exists if response has an id (Spring) or _id (normalized) or success status
      setHasFinancialProfile(ok);
      return ok;
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        console.error('Error checking financial profile status:', err);
      }
      // ↑ 404 = no profile yet (expected for new clients). Other errors = log them.
      setHasFinancialProfile(false);
      return false;
    }
  };
```

```javascript
  useEffect(() => {
    const verifySession = async () => {
      // Skip CRM auth on B2B pages — B2B uses its own auth system
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/b2b')) {
        setLoading(false);
        return;
      }

      const token = getToken();
      if (!token) { setLoading(false); return; }
      // ↑ No stored token → user isn't logged in → stop loading, show login page

      sessionStorage.setItem(TOKEN_KEY, token);
      // ↑ Copy from localStorage to sessionStorage for this tab

      try {
        const res = await api.get('/auth/me');
        // ↑ CRITICAL: validates the stored token with the server
        // Server checks: is signature valid? Is it expired? Does user still exist?

        const userData = res.data?.user || res.data;
        // ↑ Spring returns User directly. Old Node returned { user: {...} }.

        if (userData?.role) {
          if (userData.role === 'client') {
            clearToken(); setUser(null); setIsAuthenticated(false);
            // ↑ CRM AuthContext does NOT handle client logins.
            // Clients use the client portal with a different login page.
            // If a client token is found here, discard it.
          } else {
            setUser(userData);
            setIsAuthenticated(true);
            await checkProfile(userData);
            // ↑ Valid staff user → restore session. Check financial profile.
          }
        } else {
          clearToken();  // Invalid response → clear everything
        }
      } catch {
        clearToken();
        // ↑ /auth/me returned 401 (expired/invalid token) → clear stale token
      } finally {
        setLoading(false);
        // ↑ Whether success or failure, stop showing the loading spinner
      }
    };
    verifySession();
  }, []);
  // ↑ [] = empty dependency array = runs ONCE when component mounts (page load/refresh)
  // This is the "restore session on page refresh" mechanism
```

```javascript
  const login = async (email, password) => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      // ↑ Clear stale tokens BEFORE login. A leftover expired token in the request
      // interceptor would get attached to the login request → backend would reject.

      const res = await api.post('/auth/login', { email, password });
      // ↑ POST http://localhost:5000/api/auth/login { email, password }

      const data = res.data;
      const user = data.user || { id: data.id, name: data.name, email: data.email,
                                   role: data.role, department: data.department };
      // ↑ Normalize response: Spring returns flat object, old Node returned nested { user: {...} }

      const token = data.token;
      if (!token) throw new Error(data.message || 'Login failed');
      // ↑ No token in response = login failed

      setToken(token);          // Save to sessionStorage + localStorage
      setUser(user);            // Update React state → triggers re-render
      setIsAuthenticated(true); // All ProtectedRoute guards now pass
      await checkProfile(user); // Check if client has financial profile
      return user;              // Return to calling component (for navigation)
    } catch (err) {
      throw new Error(authErrMsg(err, 'Login failed'));
      // ↑ Re-throw with user-friendly message
    }
  };
```

```javascript
  const logout = () => {
    clearToken();                   // Remove from both storages
    setUser(null);                  // Clear user state
    setIsAuthenticated(false);      // Revoke auth flag
    setHasFinancialProfile(false);  // Reset profile flag
    // NO server call — JWT is stateless. Token simply expires after 24h.
  };
```

```javascript
  // While loading, show a full-screen spinner (prevents flash of login page)
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-body-md text-text-muted mt-4 font-semibold">Securing connection...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register,
                                    hasFinancialProfile, checkProfile }}>
      {children}
    </AuthContext.Provider>
  );
  // ↑ Provides these values to ALL child components via useAuth() hook
}

export function useAuth() {
  return useContext(AuthContext);
}
// ↑ Custom hook. Any component calls: const { user, login, logout } = useAuth();
```

---

## FILE 3: `SecurityConfig.java` — Spring Security Setup

📁 [backend/config/SecurityConfig.java](file:///c:/Users/veere/Downloads/FinBridge_Final20/backend-springboot/src/main/java/com/finbridge/config/SecurityConfig.java)

```java
@Configuration          // Tells Spring this class provides beans (config)
@EnableWebSecurity      // Activates Spring Security's filter chain
@EnableMethodSecurity   // Enables @PreAuthorize annotations on methods
@RequiredArgsConstructor // Lombok: generates constructor for final fields (DI)
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    // ↑ Injected by Spring. Our custom JWT validation filter.

    @Value("${app.cors.allowed-origins:http://localhost:5173,...}")
    private String allowedOriginsRaw;
    // ↑ Reads from application.yml. Default: localhost ports 5173-5177.
    // In production: set to your actual domain.
```

```java
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    // ↑ BCrypt: industry-standard password hashing.
    // Automatically adds random salt. Cost factor 10 (default).
    // Same password → different hash each time (salt differs).
    // @Bean = Spring manages this instance, injects wherever PasswordEncoder is needed.
```

```java
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            // ↑ CSRF disabled. WHY? We use JWT in Authorization headers, not cookies.
            // CSRF attacks exploit cookies. No cookies = no CSRF risk.
            // IF ENABLED: every POST/PATCH/DELETE would need a CSRF token → breaks frontend.

            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // ↑ CORS: allow frontend (localhost:5173) to call backend (localhost:5000).
            // Browsers block cross-origin requests by default. This explicitly allows them.

            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // ↑ STATELESS: Spring will NEVER create HttpSession.
            // Every request authenticated independently via JWT.
            // WHY? Sessions use server memory. Stateless = horizontally scalable.

            .headers(headers -> headers
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true).maxAgeInSeconds(31536000))
                // ↑ HSTS: browser must use HTTPS for 1 year. Prevents downgrade attacks.

                .frameOptions(frame -> frame.deny())
                // ↑ X-Frame-Options: DENY. Prevents clickjacking (loading site in iframe).

                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'none'; frame-ancestors 'none'"))
                // ↑ CSP: no resources loaded by default. Extra clickjacking protection.

                .referrerPolicy(rp -> rp.policy(
                    ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)))
                // ↑ Referrer: only send origin (not full URL) to other sites.
```

```java
            .authorizeHttpRequests(auth -> auth
                // Public Authentication APIs — no JWT needed
                .requestMatchers(
                    "/api/auth/login",
                    "/api/auth/register",
                    "/api/auth/forgot-password",
                    "/api/auth/reset-password",
                    "/api/auth/verify-email",
                    "/api/b2b/login",
                    "/api/b2b/register"
                ).permitAll()
                // ↑ These URLs are accessible WITHOUT any authentication.

                .requestMatchers("/api/leads/capture", "/api/health").permitAll()
                // ↑ Lead capture is public (website visitors). Health check is public.

                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", ...).permitAll()
                // ↑ Swagger API documentation accessible without login.

                .anyRequest().authenticated()
                // ↑ EVERYTHING ELSE requires a valid JWT in the Authorization header.
                // If no JWT → Spring returns 401 Unauthorized.
            )

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
            // ↑ CRITICAL: Insert our JwtAuthFilter BEFORE Spring's default auth filter.
            // Order: Request → CORS → JwtAuthFilter → Authorization check → Controller
            // Our filter runs FIRST, sets SecurityContext, then Spring checks permissions.

        return http.build();
    }
```

---

## FILE 4: `JwtAuthFilter.java` — Token Validation

📁 [backend/security/JwtAuthFilter.java](file:///c:/Users/veere/Downloads/FinBridge_Final20/backend-springboot/src/main/java/com/finbridge/security/JwtAuthFilter.java)

```java
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    // ↑ OncePerRequestFilter: guaranteed to run ONCE per HTTP request (not per dispatch).

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final OrganizationUserRepository organizationUserRepository;
    // ↑ Two repositories because we have TWO user tables (CRM + B2B).

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ... {

        String header = request.getHeader("Authorization");
        // ↑ Get the "Authorization" header from the HTTP request

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        // ↑ No auth header? → pass request through WITHOUT authentication.
        // Spring Security will then check: is this a permitAll() endpoint?
        // If yes → request proceeds. If no → 401 Unauthorized.
        // WHY not reject here? → Public endpoints (login, register) have no token.

        String token = header.substring(7);
        // ↑ "Bearer eyJhbGciOi..." → extract "eyJhbGciOi..." (skip "Bearer " = 7 chars)

        if (jwtService.isTokenValid(token)) {
            // ↑ Validates: signature (not tampered), expiry (not expired)
            if (jwtService.isB2BToken(token)) {
                authenticateB2B(token);
                // ↑ B2B token: has "type": "b2b" claim → load from organization_users
            } else {
                authenticateCrm(token);
                // ↑ CRM token: no type claim → load from users table
            }
        }
        // ↑ If token is INVALID (expired, tampered) → don't authenticate.
        // SecurityContext stays empty → protected endpoints return 401.
        // WHY not throw exception? → A stale token shouldn't break public endpoints.

        filterChain.doFilter(request, response);
        // ↑ Continue to next filter in chain → eventually reaches controller
    }
```

```java
    private void authenticateCrm(String token) {
        String userId = jwtService.extractUserId(token);
        // ↑ JWT "sub" (subject) claim = user UUID

        Optional<User> userOpt = userRepository.findById(UUID.fromString(userId));
        // ↑ SELECT * FROM users WHERE id = 'uuid-here'

        if (userOpt.isPresent() && userOpt.get().isActive()) {
            // ↑ User must exist AND be active (not deactivated)
            User user = userOpt.get();

            var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            // ↑ Creates an Authentication object:
            //   principal = User entity (accessible via @AuthenticationPrincipal in controllers)
            //   credentials = null (already authenticated via JWT)
            //   authorities = user.getAuthorities() → e.g., ROLE_ADMIN, ROLE_CONSULTANT

            SecurityContextHolder.getContext().setAuthentication(auth);
            // ↑ CRITICAL: sets the authenticated user for this request.
            // Now @PreAuthorize("hasRole('ADMIN')") will check this context.
            // @AuthenticationPrincipal User user will inject this User into controllers.
        }
    }
```

```java
    private void authenticateB2B(String token) {
        String orgUserId = jwtService.extractUserId(token);
        Optional<OrganizationUser> orgUserOpt = organizationUserRepository.findById(UUID.fromString(orgUserId));
        // ↑ B2B tokens resolve to organization_users table, NOT users table

        if (orgUserOpt.isPresent() && orgUserOpt.get().isActive()) {
            OrganizationUser orgUser = orgUserOpt.get();

            var authorities = List.of(
                new SimpleGrantedAuthority("ROLE_ORG_USER"),
                // ↑ Generic B2B authority — all org users have this
                new SimpleGrantedAuthority("ROLE_" + orgUser.getRole().toUpperCase()));
                // ↑ Specific role: ROLE_COMPANY_ADMIN, ROLE_FINANCE_MANAGER, etc.

            var auth = new UsernamePasswordAuthenticationToken(orgUser, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);
            // ↑ Now @AuthenticationPrincipal returns OrganizationUser (not User)
            // B2BController casts principal to OrganizationUser
        }
    }
}
```

---

## FILE 5: `JwtService.java` — Token Creation & Validation

📁 [backend/security/JwtService.java](file:///c:/Users/veere/Downloads/FinBridge_Final20/backend-springboot/src/main/java/com/finbridge/security/JwtService.java)

```java
@Component
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;
    // ↑ Secret key from application.yml (minimum 32 characters for HMAC-SHA256)

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;
    // ↑ Token TTL: 86400000ms = 24 hours

    private SecretKey key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
    // ↑ Converts the string secret into a cryptographic key object.
    // HMAC-SHA256 = Hash-based Message Authentication Code. Both signs AND verifies.

    public String generateToken(User user) {
        return Jwts.builder()
            .subject(user.getId().toString())         // "sub": "a1b2c3d4-uuid"
            .claim("email", user.getEmail())          // "email": "admin@finbridge.com"
            .claim("role", user.getRole())            // "role": "admin"
            .claim("name", user.getName())            // "name": "Super Admin"
            .issuedAt(new Date())                     // "iat": current timestamp
            .expiration(new Date(System.currentTimeMillis() + expirationMs))  // "exp": now+24h
            .signWith(key())                          // Sign with HMAC-SHA256
            .compact();                               // Build the final JWT string
    }
    // Output: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhMWIyYz..." (3 base64 parts: header.payload.signature)
```

```java
    public String generateB2BToken(String orgUserId, String organizationId) {
        return Jwts.builder()
            .subject(orgUserId)                              // org user UUID
            .claim("organizationId", organizationId)         // which org they belong to
            .claim("type", "b2b")                            // ← THIS differentiates B2B from CRM
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(key())
            .compact();
    }
    // B2B tokens have "type": "b2b". CRM tokens don't have a "type" claim.
    // JwtAuthFilter checks: isB2BToken(token) → "b2b".equals(claims.get("type"))

    public boolean isB2BToken(String token) {
        return "b2b".equals(extractClaims(token).get("type"));
    }
```

```java
    public String generatePurposeToken(String userId, String purpose, long ttlMs) {
        return Jwts.builder()
            .subject(userId)
            .claim("purpose", purpose)     // "reset-password" or "verify-email"
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + ttlMs))  // shorter TTL (1h for reset)
            .signWith(key())
            .compact();
    }
    // PURPOSE TOKENS: same JWT mechanism but with a "purpose" claim.
    // Used for: password reset links, email verification links.
    // WHY separate? Different TTL (1h vs 24h) and verified against expected purpose.

    public String verifyPurposeToken(String token, String purpose) {
        try {
            Claims claims = extractClaims(token);           // validates signature + expiry
            if (!purpose.equals(claims.get("purpose"))) return null;  // wrong purpose → reject
            return claims.getSubject();                     // return userId if valid
        } catch (Exception e) {
            return null;                                    // expired/invalid → null
        }
    }
```

---

## FILE 6: `AuthService.java` — Login/Register Business Logic

📁 [backend/service/AuthService.java](file:///c:/Users/veere/Downloads/FinBridge_Final20/backend-springboot/src/main/java/com/finbridge/service/AuthService.java)

```java
@Slf4j                  // Lombok: creates a `log` variable for logging
@Service                // Spring: this is a service bean, inject anywhere
@RequiredArgsConstructor // Lombok: constructor injection for final fields
public class AuthService {

    private final UserRepository userRepository;      // database access
    private final PasswordEncoder passwordEncoder;    // BCrypt
    private final JwtService jwtService;              // JWT creation
    private final EmailService emailService;          // send emails (password reset)

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;
    // ↑ Used to build password reset links: "http://localhost:5173/reset-password?token=..."

    private static final long VERIFY_TTL_MS = 24 * 60 * 60 * 1000L;  // 24 hours
    private static final long RESET_TTL_MS  = 60 * 60 * 1000L;        // 1 hour
```

```java
    @Transactional   // ← All DB operations in this method run in ONE transaction.
                     // If anything fails → ALL changes are rolled back. No partial state.
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Email already registered: " + request.email());
        }
        // ↑ Check duplicate BEFORE creating. existsBy = SELECT COUNT, not full SELECT.

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        // ↑ BCrypt hash: "admin123" → "$2a$10$N9qo8uLOickgx2ZMRZoMye..." (60 chars)
        // Each call produces a DIFFERENT hash (random salt). Even "admin123" twice → different hashes.

        user.setRole(request.role() != null ? request.role() : "client");
        // ↑ Default role is "client" if not specified

        user.setDepartment(request.department());
        user.setPhone(request.phone());
        user.setCompanyName(request.companyName());

        User saved = userRepository.save(user);
        // ↑ Hibernate: INSERT INTO users (id, name, email, password, role, ...) VALUES (...)
        // UUID is auto-generated by @GeneratedValue or Hibernate.

        log.info("User registered: {} role={}", saved.getEmail(), saved.getRole());
        return toLoginResponse(saved);  // generate JWT and return
    }
```

```java
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        // ↑ Case-insensitive email lookup.
        // "Admin@FinBridge.com" matches "admin@finbridge.com".
        // If not found → "Invalid email or password" (NOT "email not found" → prevents enumeration)

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        // ↑ BCrypt.matches("admin123", "$2a$10$N9qo8u...")
        // Extracts salt from stored hash, hashes input with same salt, compares.
        // SAME ERROR MESSAGE as above → attacker can't tell if email or password was wrong.

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is deactivated");
        }
        // ↑ Deactivated users can't login even with correct credentials.

        log.info("User logged in: {}", user.getEmail());
        return toLoginResponse(user);
    }

    private LoginResponse toLoginResponse(User user) {
        String token = jwtService.generateToken(user);   // Create JWT
        return new LoginResponse(token, user.getId(), user.getName(),
                user.getEmail(), user.getRole(), user.getDepartment());
        // ↑ Returns: { token, id, name, email, role, department }
    }
```

```java
    public String forgotPassword(String email) {
        return userRepository.findByEmailIgnoreCase(email).map(user -> {
            String token = jwtService.generatePurposeToken(
                user.getId().toString(), "reset-password", RESET_TTL_MS);
            // ↑ Purpose token: userId as subject, purpose="reset-password", expires in 1h

            String link = frontendUrl + "/reset-password?token=" + token;
            // ↑ "http://localhost:5173/reset-password?token=eyJ..."

            emailService.sendPasswordReset(user.getEmail(), link);
            // ↑ Sends email asynchronously (won't block this request)

            return link;  // returned for dev preview when SMTP isn't configured
        }).orElse(null);
        // ↑ If email not found → return null. Controller STILL returns success message.
        // WHY? → Prevents account enumeration. Attacker can't tell if email exists.
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        String userId = jwtService.verifyPurposeToken(token, "reset-password");
        // ↑ Validates: signature, expiry, purpose claim matches "reset-password"
        if (userId == null) throw new BadRequestException("Invalid or expired reset link");
        if (newPassword == null || newPassword.length() < 6)
            throw new BadRequestException("Password must be at least 6 characters");

        User user = userRepository.findById(UUID.fromString(userId))
            .orElseThrow(() -> new BadRequestException("Account not found"));
        user.setPassword(passwordEncoder.encode(newPassword));  // New BCrypt hash
        userRepository.save(user);
        // ↑ UPDATE users SET password = '$2a$10$...' WHERE id = 'uuid'
    }
}
```

---

## FILE 7: `AuthController.java` — REST Endpoints

📁 [backend/controller/AuthController.java](file:///c:/Users/veere/Downloads/FinBridge_Final20/backend-springboot/src/main/java/com/finbridge/controller/AuthController.java)

```java
@Slf4j                                    // Logger
@RestController                            // Returns JSON (not HTML views)
@RequestMapping("/api/auth")               // All endpoints start with /api/auth
@RequiredArgsConstructor                   // Constructor injection
@Tag(name = "Auth", description = "...")   // Swagger documentation group
public class AuthController {

    private final AuthService authService;  // Business logic
    private final UserService userService;  // User CRUD
    private final DtoMapper mapper;         // Entity → DTO conversion

    @PostMapping("/login")
    // ↑ Handles POST /api/auth/login
    @Operation(summary = "Login and receive JWT token")  // Swagger docs
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        // @Valid: triggers Bean Validation (@NotBlank email, @NotBlank password)
        //   If validation fails → 400 Bad Request with field errors
        // @RequestBody: deserializes JSON body → LoginRequest record
        // LoginRequest is: record LoginRequest(@NotBlank String email, @NotBlank String password) {}

        return ResponseEntity.ok(authService.login(request));
        // ↑ 200 OK + { token, id, name, email, role, department }
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal User user) {
        // @AuthenticationPrincipal: Spring injects the User from SecurityContext
        // (set by JwtAuthFilter after validating the JWT)
        // If no valid JWT → user is null → Spring returns 401 before reaching this

        return ResponseEntity.ok(mapper.toUserResponse(user));
        // ↑ DtoMapper strips password hash, lazy proxies, and circular references
    }
```

```java
    @GetMapping("/consultants")
    @PreAuthorize(SecurityRoles.STAFF)
    // ↑ SecurityRoles.STAFF = "hasAnyRole('SUPER_ADMIN','ADMIN','CRM_ADMIN','DEPARTMENT_ADMIN','CONSULTANT')"
    // Only staff can list consultants. Clients cannot.
    // If unauthorized → 403 Forbidden

    public ResponseEntity<Map<String, Object>> consultants(
            @RequestParam(required = false) String department) {
        // @RequestParam: reads ?department=loans from URL query string
        // required=false: parameter is optional

        List<User> list = department != null
            ? userService.getConsultantsByDepartment(department)
            : userService.getConsultants();
        return ResponseEntity.ok(Map.of("consultants",
            list.stream().map(mapper::toStaffResponse).toList()));
        // ↑ Returns: { "consultants": [{ id, name, email, department, ... }, ...] }
    }

    @PostMapping("/{id}/convert")
    public ResponseEntity<Map<String, Object>> convert(@PathVariable UUID id) {
        // @PathVariable: extracts {id} from URL → POST /api/leads/abc-123/convert

        LeadService.ConversionResult result = leadService.convertToClient(id);
        Map<String, Object> resp = new HashMap<>();
        resp.put("isNewClient", result.isNewClient());      // true if new account created
        resp.put("tempPassword", result.tempPassword());    // "FBa1b2c3d4" (if new)
        resp.put("client", mapper.toStaffResponse(result.client()));  // client data
        return ResponseEntity.ok(resp);
    }
}
```

---

## FILE 8: `LeadService.java` — CRM Pipeline Logic (KEY Business Logic)

📁 [backend/service/LeadService.java](file:///c:/Users/veere/Downloads/FinBridge_Final20/backend-springboot/src/main/java/com/finbridge/service/LeadService.java)

```java
    @Transactional
    public Lead create(Lead lead) {
        lead.setLeadId(sequenceGenerator.next(SequenceGenerator.Seq.LEAD));
        // ↑ SELECT nextval('lead_seq') → formats as "LEAD-00001"
        // PostgreSQL sequence = atomic. No race conditions.
        // Old approach: count() + 1 → two requests both read count=5 → both create LEAD-006 → CRASH

        lead.setScore(calculateScore(lead));
        // ↑ Auto-score based on income + budget + completeness

        lead.setPriority(scoreToPriority(lead.getScore()));
        // ↑ score >= 65 → "hot", >= 35 → "warm", else → "cold"

        Lead saved = leadRepository.save(lead);
        // ↑ INSERT INTO leads (id, lead_id, name, email, score, priority, status, ...)
        return saved;
    }
```

```java
    private int calculateScore(Lead lead) {
        int score = 0;
        if (lead.getIncome() != null) {
            double income = lead.getIncome().doubleValue();
            if (income >= 1500000) score += 35;       // High income: ₹15L+ → 35 points
            else if (income >= 600000) score += 20;   // Medium income: ₹6L+ → 20 points
        }
        if (lead.getBudget() != null) {
            double budget = lead.getBudget().doubleValue();
            if (budget >= 10000000) score += 35;      // Big budget: ₹1Cr+ → 35 points
            else if (budget >= 3000000) score += 20;  // Medium budget: ₹30L+ → 20 points
        }
        if (lead.getRequirement() != null && !lead.getRequirement().isBlank())
            score += 15;                               // Has requirement → 15 points
        if (lead.getPhone() != null && !lead.getPhone().isBlank())
            score += 10;                               // Has phone → 10 points
        if (lead.getEmail() != null && !lead.getEmail().isBlank())
            score += 5;                                // Has email → 5 points
        return Math.min(score, 100);                   // Cap at 100
    }
    // Max possible: 35 + 35 + 15 + 10 + 5 = 100
    // Example: income ₹20L, budget ₹50L, has requirement, phone, email → score = 100 → "hot"
```

```java
    @Transactional
    public ConversionResult convertToClient(UUID id) {
        Lead lead = getById(id);
        lead.setStatus("won");
        // ↑ Mark lead as won (converted)

        // If lead matches a B2B organization → activate that org
        organizationUserRepository.findByEmailIgnoreCase(lead.getEmail()).ifPresent(orgUser -> {
            Organization org = orgUser.getOrganization();
            if (org != null) {
                org.setStatus("active");              // Activate B2B org
                organizationRepository.save(org);
            }
        });

        User existing = userRepository.findByEmailIgnoreCase(lead.getEmail()).orElse(null);
        if (existing != null) {
            lead.setConvertedClient(existing);
            leadRepository.save(lead);
            return new ConversionResult(false, null, existing);
            // ↑ User already exists (re-engagement) → link lead → no new account
        }

        // Create NEW client account
        String tempPassword = "FB" + UUID.randomUUID().toString().substring(0, 8);
        // ↑ e.g., "FBa1b2c3d4" — 10 chars, prefixed with "FB"

        User client = new User();
        client.setName(lead.getName());
        client.setEmail(lead.getEmail());
        client.setPhone(lead.getPhone());
        client.setRole("client");
        client.setDepartment(lead.getDepartment());
        client.setPassword(passwordEncoder.encode(tempPassword));
        // ↑ BCrypt hash the temp password

        User savedClient = userRepository.save(client);
        // ↑ INSERT INTO users (name, email, password, role, ...) VALUES (...)

        lead.setConvertedClient(savedClient);       // Link lead → client
        leadRepository.save(lead);                  // UPDATE leads SET status='won', converted_client_id=?

        return new ConversionResult(true, tempPassword, savedClient);
        // ↑ Returns temp password so admin can share with the client
        // true = new client was created
    }
```

```java
    @Transactional
    public Lead sendToDepartment(UUID id, String department, String notes, String actorName) {
        Lead lead = getById(id);
        lead.setDepartment(department);               // Set department: "loans"
        if (!"won".equals(lead.getStatus()))
            lead.setStatus("assigned");               // Update pipeline stage

        if (notes != null && !notes.isBlank()) {
            LeadNote note = new LeadNote();
            note.setLead(lead);
            note.setText("Routed to " + department + ": " + notes);
            note.setAddedBy(actorName != null ? actorName : "CRM");
            note.setAddedAt(Instant.now());
            lead.getNotes().add(note);
            // ↑ Cascade: saving the lead also saves the new note
        }

        Lead saved = leadRepository.save(lead);

        // Notify every department admin for this department
        for (User admin : userRepository.findByRoleAndDepartmentAndActiveTrue("department-admin", department)) {
            notificationService.create(admin, "lead",
                "New lead routed to " + department,
                "Lead " + lead.getName() + " (" + lead.getLeadId() + ") has been assigned.");
        }
        // ↑ Creates in-app notifications for dept admins → they see it in their dashboard

        return saved;
    }
}
```

---

> **These 8 files are the backbone of FinBridge.** If you understand every line above, you can explain:
> - How the frontend talks to the backend (api.js)
> - How authentication state is managed (AuthContext.jsx)
> - How security is configured (SecurityConfig.java)
> - How every request is validated (JwtAuthFilter.java)
> - How tokens are created and verified (JwtService.java)
> - How login/register works (AuthService.java)
> - How REST endpoints are structured (AuthController.java)
> - How the core CRM pipeline works (LeadService.java)
