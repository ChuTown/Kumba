import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Button from './components/Button';
import { preloadImages } from './components/ImageAssets';
import './App.css';
import { Line } from 'rc-progress';
import { Tweet } from 'react-tweet'
import Poll from './components/Poll';


function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [backendMessage, setBackendMessage] = useState('');
  const [solAmount, setSolAmount] = useState(0);
  const [tweetIds, setTweetIds] = useState([]); //useState(["1927873790513442919", "1927426728588132647", "1927069267859509623", "1926056883246264542", "1925758056559792195"]);
  const [goalAmount, setGoalAmount] = useState(10);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // 1️⃣ Carousel ref + scroll helper
  const carouselRef = useRef(null);
  const scroll = (dir) => {
    if (!carouselRef.current) return;
    const { clientWidth } = carouselRef.current;
    const distance = clientWidth * 0.8 * (dir === 'left' ? -1 : 1);
    carouselRef.current.scrollBy({ left: distance, behavior: 'smooth' });
  };

  // Will Uncomment later
  useEffect(() => {
    async function getTweets() {
      try {
        const res = await fetch('http://localhost:5000/api/latest_tweets_alt');
        const { tweets } = await res.json();
        setTweetIds(tweets);
      } catch (err) {
        console.error("Failed to load tweets", err);
      }
    }
    getTweets();
  }, []);

  useEffect(() => {
    // Preload all button images
    preloadImages();

    // Header scroll effect with throttling
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const pingBackend = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/hello');
        const txt = await res.text();
        setBackendMessage(txt);
      } catch (err) {
        console.error(err);
      }
    };

    pingBackend();
  }, []);

  useEffect(() => {
    const retrieveSolAmount = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/wallet_balance');
        const data = await res.json();
        const sol = data["sol"]
        const goal = data["goalAmount"];

        setSolAmount(sol);
        setGoalAmount(goal);
        console.log(data);
        console.log(sol);
      }
      catch (err) {
        console.error(err);
      }
    };
    retrieveSolAmount();
  }, []);



  // Stats animation with Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '50px'
    };

    const animateNumber = (element, start, end, originalText) => {
      if (element.dataset.animated === 'true') return;
      element.dataset.animated = 'true';

      const duration = 2000;
      const startTime = performance.now();

      const updateNumber = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);

        if (originalText.includes('M')) {
          element.textContent = '$' + (current / 1000000).toFixed(1) + 'M';
        } else if (originalText.includes('K')) {
          element.textContent = (current / 1000).toFixed(0) + 'K+';
        } else if (originalText.includes('+')) {
          element.textContent = current.toLocaleString() + '+';
        } else {
          element.textContent = current.toLocaleString();
        }

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        }
      };

      requestAnimationFrame(updateNumber);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const statNumbers = entry.target.querySelectorAll('.stat-number');
          statNumbers.forEach(stat => {
            const finalValue = stat.textContent;
            const numericValue = parseInt(finalValue.replace(/[^0-9]/g, ''));
            animateNumber(stat, 0, numericValue, finalValue);
          });
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const statsSection = document.querySelector('.stats');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="top-video-section">
        <video
          className="kumba-video"
          src="/videos/kumbaSwinging.mp4"
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
        />
      </section>

      <header style={{ background: isScrolled ? 'rgba(74, 74, 74, 0.95)' : 'rgba(74, 74, 74, 0.8)' }}>
        <nav className="container">
          <div className="logo">
            <div className="dodo-icon">🦕</div>
            <span>KUMBA</span>
          </div>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#impact">Impact</a></li>
            <li><a href="#partners">Partners</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="container">
            <div className="hero-content">
              <h1>KUMBA Charity</h1>
              <p>Carving a better future in stone. Join the prehistoric revolution of giving.</p>

              {backendMessage && <p className="backend-echo">{backendMessage}</p>}

              {/* progress bar: max = 10 */}
              <Line
                percent={Math.min((solAmount / goalAmount) * 100, 100)}
                strokeWidth={4}
                strokeColor="#d15400"
              />
              <p>
                {solAmount} SOL / {goalAmount} SOL
              </p>

              <Poll />



            </div>
          </div>
        </section>

        <section className="tweets-section" id="tweets">
          <Container fluid>

            <h2 className="text-center mb-4">Latest from @KumbaOnsol</h2>

            <div className="carousel-container">
              <button
                className="arrow-btn left"
                onClick={() => scroll('left')}
                aria-label="Scroll left"
              >
                &#9664;
              </button>

              <div className="tweet-carousel" ref={carouselRef}>
                <Row className="flex-nowrap g-3">
                  {tweetIds.map(id => (
                    <Col key={id} xs="auto">
                      <div className="tweet-wrapper">
                        <Tweet id={id} options={{ width: 550 }} />
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>

              <button
                className="arrow-btn right"
                onClick={() => scroll('right')}
                aria-label="Scroll right"
              >
                &#9654;
              </button>
            </div>

          </Container>
        </section>

        <section className="stats" id="impact">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">$2.4M</div>
                <div className="stat-label">Total Donated</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">15,847</div>
                <div className="stat-label">Lives Changed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">250K+</div>
                <div className="stat-label">Stone Age NFTs</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">50+</div>
                <div className="stat-label">Cave Partners</div>
              </div>
            </div>
          </div>
        </section>

        <section className="features" id="about">
          <div className="container">
            <h2>How KUMBA Works</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🦕</div>
                <h3>Prehistoric Giving</h3>
                <p>Every KUMBA transaction carves out a piece for charity. Simple as drawing on cave walls - no extra steps needed.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🦖</div>
                <h3>Dino-mite Impact</h3>
                <p>Watch your impact grow like a T-Rex! Track every donation and see the real-world changes you're making.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🗿</div>
                <h3>Stone-Solid Security</h3>
                <p>Your transactions are carved in stone. Our prehistoric-grade security ensures every donation reaches its destination.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="partners" id="partners">
          <div className="container">
            <h2>Our Cave Partners</h2>
            <div className="partners-grid">
              <div className="partner-card">
                <h4>Clean Water Caverns</h4>
                <p>Bringing crystal-clear water to communities, one cave spring at a time.</p>
              </div>
              <div className="partner-card">
                <h4>Prehistoric Education</h4>
                <p>Teaching the next generation to draw their own future on the walls of possibility.</p>
              </div>
              <div className="partner-card">
                <h4>Dino Health Initiative</h4>
                <p>Making healthcare as strong as a Stegosaurus's plates.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>About KUMBA</h4>
              <p>KUMBA is more than crypto - it's a prehistoric force for good, turning digital assets into real-world impact.</p>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <div className="social-buttons">
                <Button type="twitter" onClick={() => window.open('https://twitter.com')} />
                <Button type="wallet" onClick={() => window.open('https://wallet.connect')} />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
