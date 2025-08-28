import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSubmitted(true)
        setEmail('') // Clear the form
      } else {
        setError(data.message || 'Failed to join waitlist. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting email:', error)
      setError('Network error. Please check your connection and try again.')
    }
    
    setIsLoading(false)
  }

  return (
    <>
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="floating-orb orb1"></div>
        <div className="floating-orb orb2"></div>
        <div className="floating-orb orb3"></div>
      </div>

      {/* Header */}
      <header>
        <div className="container">
          <div className="logo">PrepPal.ai</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="badge">🚀 Coming Soon</div>
          
          <h1>Train Like a Pro.<br />Interview Like a Champion.</h1>
          
          <p className="subtitle">
            Step into the room with the confidence of someone who's already been there a hundred times. 
            PrepPal transforms nervous energy into unstoppable momentum.
          </p>

          {/* Waitlist Form */}
          <div className="waitlist-form">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="form-container">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email to join the waitlist"
                  className="email-input"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-btn"
                >
                  {isLoading ? (
                    <div className="loading"></div>
                  ) : (
                    <span className="btn-text">Get Early Access</span>
                  )}
                </button>
              </form>
            ) : (
              <div className="success-message">
                🎉 You're on the list! We'll be in touch soon with your exclusive early access.
              </div>
            )}
            
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="value-props">
        <div className="container">
          <div className="value-card">
            <span className="value-icon">🎯</span>
            <h3 className="value-title">Face Real Executives</h3>
            <p className="value-description">
              Practice with AI personas modeled after actual executives from your target companies. 
              Experience the pressure, the questions, the atmosphere—before it counts.
            </p>
          </div>

          <div className="value-card">
            <span className="value-icon">🎬</span>
            <h3 className="value-title">Watch Your Game Film</h3>
            <p className="value-description">
              Just like elite athletes review their performance, analyze every moment of your interview. 
              See what works, what doesn't, and exactly how to level up.
            </p>
          </div>

          <div className="value-card">
            <span className="value-icon">🤝</span>
            <h3 className="value-title">Join Your Squad</h3>
            <p className="value-description">
              Surround yourself with ambitious professionals who share your goals. 
              Practice together, push each other, and celebrate wins as a community.
            </p>
          </div>
        </div>
      </section>



      {/* Testimonial Section */}
      <section className="testimonial">
        <div className="container">
          <p className="quote">
            The difference between landing your dream job and missing out isn't talent—it's preparation. 
            PrepPal gives you the reps you need to perform when it matters most.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <p className="footer-text">
            © 2024 PrepPal.ai. Transforming interviews, one practice at a time.
          </p>
        </div>
      </footer>
    </>
  )
}

export default App