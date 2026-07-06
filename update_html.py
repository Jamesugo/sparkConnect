import sys

new_html = """
    <!-- Overlapping Service Cards -->
    <section class="overlap-cards-section">
      <div class="container">
        <div class="overlap-cards-grid">
          <div class="overlap-card">
            <div class="overlap-card-img" style="background-image: url('assets/images/wiring_work.png')"></div>
            <div class="overlap-card-content">
              <h3 style="color: #0066cc;">HOUSE WIRING</h3>
              <p>Professional residential and commercial electrical wiring setups to highest standards.</p>
              <button class="overlap-btn" onclick="window.location.href='electricians.html?q=Wiring'">View details</button>
            </div>
          </div>
          <div class="overlap-card">
            <div class="overlap-card-img" style="background-image: url('assets/images/solar_panel.png')"></div>
            <div class="overlap-card-content">
              <h3 style="color: #ff9900;">SOLAR & INVERTER</h3>
              <p>Energy efficient solar setups to maximize power retention and reduce reliance on fuel.</p>
              <button class="overlap-btn" onclick="window.location.href='electricians.html?q=Solar'">View details</button>
            </div>
          </div>
          <div class="overlap-card">
            <div class="overlap-card-img" style="background-image: url('assets/images/generator_service.png')"></div>
            <div class="overlap-card-content">
              <h3 style="color: #0066cc;">GENERATOR SERVICE</h3>
              <p>Expert installation, maintenance, and repair of all industrial and residential generators.</p>
              <button class="overlap-btn" onclick="window.location.href='electricians.html?q=Generator'">View details</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Fresher Than Ever Section (Power Your World) -->
    <section class="power-world-section">
      <div class="container">
        <div class="power-world-grid">
          <div class="power-world-left">
            <h4 style="color: #0066cc; font-weight: 700; margin-bottom: 8px;">We are</h4>
            <h2 style="font-size: 2.5rem; font-weight: 800; color: #1a1a1a; line-height: 1.1; margin-bottom: 1rem;">
              LET'S POWER YOUR WORLD<br/>
              <span style="color: #ff9900;">SAFER THAN EVER</span>
            </h2>
            <p style="color: #666; font-size: 0.95rem; line-height: 1.7; margin-bottom: 2rem;">
              Electrical work isn't just about making things turn on—it's about safety, efficiency, and future-proofing your home. SparkConnect connects you with top-tier professionals seamlessly.
            </p>
            <div class="power-features">
              <div class="power-feature">
                <div class="pf-icon">🛡️</div>
                <div class="pf-text">
                  <h5>Verified Professionals</h5>
                  <p>Every electrician is vetted through past project reviews and checks.</p>
                </div>
              </div>
              <div class="power-feature">
                <div class="pf-icon">⚡</div>
                <div class="pf-text">
                  <h5>Rapid Response</h5>
                  <p>Filter by your state and connect instantly via WhatsApp or Phone call.</p>
                </div>
              </div>
              <div class="power-feature">
                <div class="pf-icon">💰</div>
                <div class="pf-text">
                  <h5>No Hidden Fees</h5>
                  <p>Zero booking commissions. Connect directly with the professional.</p>
                </div>
              </div>
              <div class="power-feature">
                <div class="pf-icon">📱</div>
                <div class="pf-text">
                  <h5>Direct Communication</h5>
                  <p>Chat and negotiate rates safely with verified experts.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="power-world-right">
            <img src="assets/images/electrician_work.png" alt="Professional Electrician" style="width: 100%; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);"/>
          </div>
        </div>
      </div>
    </section>

    <!-- Blue Stats Banner -->
    <section class="blue-stats-banner">
      <div class="container">
        <div class="blue-stats-grid">
          <div class="b-stat">
            <div class="b-stat-icon">👷</div>
            <div class="b-stat-info">
              <div class="b-stat-num">500+</div>
              <div class="b-stat-label">VERIFIED PROS</div>
            </div>
          </div>
          <div class="b-stat">
            <div class="b-stat-icon">📈</div>
            <div class="b-stat-info">
              <div class="b-stat-num">10k+</div>
              <div class="b-stat-label">PROJECTS</div>
            </div>
          </div>
          <div class="b-stat">
            <div class="b-stat-icon">🗺️</div>
            <div class="b-stat-info">
              <div class="b-stat-num">36</div>
              <div class="b-stat-label">STATES COVERED</div>
            </div>
          </div>
          <div class="b-stat">
            <div class="b-stat-icon">⭐</div>
            <div class="b-stat-info">
              <div class="b-stat-num">4.9</div>
              <div class="b-stat-label">AVG RATING</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Portfolio / Featured Section -->
    <section class="portfolio-section">
      <div class="container">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h2 style="font-size: 2rem; font-weight: 800; color: #1a1a1a;">
            <span style="color: #ff9900;">OUR</span> PORTFOLIO
          </h2>
          <p style="color: #666; max-width: 600px; margin: 10px auto;">Browse profiles of our top-rated electricians available across Nigeria.</p>
        </div>
        
        <div class="portfolio-filter-bar">
          <button class="pf-btn active" data-filter="All">All</button>
          <button class="pf-btn" data-filter="Wiring">Wiring</button>
          <button class="pf-btn" data-filter="Solar">Solar</button>
          <button class="pf-btn" data-filter="Generator">Generator</button>
          <button class="pf-btn" data-filter="Commercial">Commercial</button>
        </div>
        
        <div class="portfolio-grid" id="portfolio-grid">
          <!-- Populated by JS -->
        </div>

        <div class="portfolio-nav">
          <button class="p-nav-btn">❮</button>
          <button class="p-nav-btn active">❯</button>
        </div>
      </div>
    </section>
"""

with open('public/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, l in enumerate(lines):
    if '<!-- How It Works -->' in l:
        start_idx = i
        break

end_idx = -1
for i, l in enumerate(lines):
    if '<!-- Footer -->' in l:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.writelines(lines[:start_idx])
        f.write(new_html)
        f.writelines(lines[end_idx:])
    print('Updated index.html successfully')
else:
    print('Indices not found:', start_idx, end_idx)
