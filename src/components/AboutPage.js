import React from 'react';
import '../styles/AboutPage.css';

const AboutPage = () => {
  React.useEffect(() => {
    // Load Space Mono font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="about-page">
      <header className="about-header">
        <h1>For you and I, the common people</h1>
      </header>

      <div className="about-content">
        <p className="intro-text">
          Imagine a trading platform that not only automates your investment decisions but also learns 
          from every market shift, news update, and social media trend—tailoring your portfolio to your unique needs.
        </p>

        <p>
          Click is our groundbreaking platform designed especially for everyday investors in the USA and India. 
          It takes the confusion and complexity out of investing by handling the heavy lifting for you. Simply answer 
          a few straightforward questions, and our custom-built AI will build and manage your portfolio automatically.
        </p>

        <h2>What Can You Do with Click?</h2>
        
        <div className="features">
          <div className="feature">
            <h3>Trust Us with Your Money</h3>
            <p>You decide how much you want to start with—and whether you&apos;d like to invest a part or the whole of your available funds.</p>
          </div>

          <div className="feature">
            <h3>Automated and Adaptive Portfolio Management</h3>
            <p>Our intelligent system continuously monitors the markets. It automatically reallocates and readjusts your investments based on real-time data, ensuring your portfolio stays aligned with current market trends.</p>
          </div>

          <div className="feature">
            <h3>Personalized to Your Life</h3>
            <p>Our process is designed around you. Whether you prefer weekly deposits or a one-time input, we build a portfolio that matches your risk preferences, spending habits, and financial goals.</p>
          </div>

          <div className="feature">
            <h3>Learn from the Market</h3>
            <p>Click isn&apos;t a static robot—it actively learns from the market. We integrate insights from news, social media trends, and other non-traditional data sources so that your portfolio can catch fleeting opportunities that others might miss.</p>
          </div>
        </div>

        <h2>The Vision</h2>
        <p>
          Traditional trading bots rely on preset rules that often mimic outdated models. In contrast, 
          Click is built on advanced reinforcement learning that continuously evolves. Our AI isn&apos;t just 
          hosted from a generic model; it is developed, trained, and backtested from scratch—tailored 
          specifically for individual wealth management.
        </p>
        <p>
          Our mission is simple: empower you to invest confidently—even if you have no background in 
          finance or technology. By personalizing trading strategies based on who you are, where you live, 
          and what your goals are, we transform generic automation into intelligent, adaptive decision-making.
        </p>

        <h2>Why Click is Different</h2>
        <div className="features">
          <div className="feature">
            <h3>Continuous Learning</h3>
            <p>Our AI constantly adapts using real-time data, so your investments can respond quickly to market changes.</p>
          </div>

          <div className="feature">
            <h3>Informed by Social Sentiment</h3>
            <p>In today&apos;s market, numbers tell only part of the story. Click also learns from the collective mood on social media, capturing those trends before they become obvious.</p>
          </div>

          <div className="feature">
            <h3>User-Centric</h3>
            <p>You answer a few simple questions about how you spend and save, and our system builds a portfolio just for you. No financial jargon—just clear, guided steps that put you in control.</p>
          </div>
        </div>

        <h2>Market Opportunity & Our Vision for Growth</h2>
        <p>
          Millions of everyday investors are overlooked by current automated trading systems, which are 
          designed for institutional players or tech-savvy individuals. With a growing middle class and 
          increasing digital literacy in the USA and India, Click aims to level the playing field.
        </p>

        <p className="founder-note">
          Founded by Gauri Vaidya and Fowzan Malik, our platform transforms generic automation into 
          personalized, intelligent, and adaptive portfolio management, capturing fleeting opportunities 
          to generate market beating alpha! - See you on the other side ~ G & F
        </p>
      </div>
    </div>
  );
}

export default AboutPage; 